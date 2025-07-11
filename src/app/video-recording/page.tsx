'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  FormControl,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createClient } from '@supabase/supabase-js';
import Airtable, { FieldSet } from 'airtable';
import {
  MdCenterFocusStrong,
  MdCloudUpload,
  MdLightbulb,
  MdMic,
  MdPlayArrow,
  MdStop,
  MdTimer,
  MdVideocam,
  MdCheckCircle,
  MdOpenInNew,
} from 'react-icons/md';

import { config } from '@/config';

import { RecordingTimer } from './components/RecordingTimer';

const supabase = createClient(config.supabase.url || '', config.supabase.roleKey || '');
const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export default function VideoRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const recordId = searchParams?.get('id') || '';

  const bestPractices = [
    'Find a quiet, well-lit location',
    'Position yourself in the center of the frame',
    'Look directly at the camera',
    'Speak clearly and at a moderate pace',
    'Keep your video to 2 minutes or less',
  ];

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setMediaStream(null);
    setIsStreamActive(false);
  };

  const cleanupConnectionCheck = () => {
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
      connectionCheckRef.current = null;
    }
  };

  // Handle component unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      cleanupConnectionCheck();
    };
  }, []);

  // Handle video element mounting
  useEffect(() => {
    if (videoRef.current) {
      setIsVideoMounted(true);
      console.log('Video Preview State:', {
        timestamp: new Date().toISOString(),
        isVideoMounted: true,
        hasCameraAccess,
        isStreamActive,
        mediaStream: mediaStream ? 'Stream exists' : 'No stream',
        showInstructions,
        isRecording,
      });
    }
    return () => {
      if (videoRef.current) {
        setIsVideoMounted(false);
        console.log('Video Preview State:', {
          timestamp: new Date().toISOString(),
          isVideoMounted: false,
          hasCameraAccess,
          isStreamActive,
          mediaStream: mediaStream ? 'Stream exists' : 'No stream',
          showInstructions,
          isRecording,
        });
      }
    };
  }, []);

  // Handle stream connection to video element
  useEffect(() => {
    if (!videoRef.current || !mediaStream || showInstructions) {
      console.log('Video Preview Setup Skipped:', {
        timestamp: new Date().toISOString(),
        hasVideoElement: !!videoRef.current,
        hasMediaStream: !!mediaStream,
        showInstructions,
        isRecording,
      });
      return;
    }

    const video = videoRef.current;
    let animationFrameId: number;
    let lastPlayAttempt = 0;
    const PLAY_ATTEMPT_INTERVAL = 100; // Minimum time between play attempts in ms

    console.log('Video Preview Setup:', {
      timestamp: new Date().toISOString(),
      isRecording,
      videoState: {
        paused: video.paused,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error,
        srcObject: video.srcObject ? 'Stream present' : 'No stream',
      },
      streamState: {
        active: mediaStream.active,
        tracks: mediaStream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
        })),
      },
    });

    try {
      // Clean up any existing connection check
      cleanupConnectionCheck();

      // Set up video element with specific attributes
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      video.setAttribute('x5-video-player-type', 'h5');
      video.setAttribute('x5-video-player-fullscreen', 'true');
      video.setAttribute('autoplay', 'true');
      video.setAttribute('muted', 'true');

      // Ensure stream is properly connected
      if (video.srcObject !== mediaStream) {
        video.srcObject = mediaStream;
        console.log('Video stream connected to video element', {
          timestamp: new Date().toISOString(),
        });
      }

      // Ensure video is playing using requestAnimationFrame
      const ensurePlaying = async () => {
        const now = Date.now();
        if (video.paused && isRecording && now - lastPlayAttempt >= PLAY_ATTEMPT_INTERVAL) {
          lastPlayAttempt = now;
          try {
            // Check if stream is still active
            if (!mediaStream.active) {
              console.error('Stream is no longer active');
              setPreviewError('Camera stream disconnected. Please refresh the page.');
              return;
            }

            // Check if video element is ready
            if (video.readyState < 2) {
              console.log('Video not ready, waiting...');
              return;
            }

            await video.play();
            console.log('Video playback maintained', {
              timestamp: new Date().toISOString(),
              videoState: {
                paused: video.paused,
                readyState: video.readyState,
                networkState: video.networkState,
              },
            });
          } catch (err) {
            console.error('Failed to maintain video playback:', {
              timestamp: new Date().toISOString(),
              error: err,
            });
            // Try to recover by reconnecting the stream
            if (mediaStream.active) {
              video.srcObject = mediaStream;
              try {
                await video.play();
              } catch (recoveryErr) {
                console.error('Failed to recover video playback:', recoveryErr);
                setPreviewError('Video playback failed. Please refresh the page.');
              }
            }
          }
        }
      };

      // Set up continuous playback monitoring using requestAnimationFrame
      const monitorPlayback = () => {
        if (isRecording) {
          console.log('Monitoring playback');
          ensurePlaying();
          animationFrameId = requestAnimationFrame(monitorPlayback);
        }
      };

      // Start monitoring if recording
      if (isRecording) {
        monitorPlayback();
      }

      const handleCanPlay = async () => {
        console.log('Video Preview Events:', {
          timestamp: new Date().toISOString(),
          event: 'canplay',
        });
        if (isRecording) {
          console.log('Ensuring playback2');
          await ensurePlaying();
        }
      };

      const handlePlay = () => {
        console.log('Video Preview Events:', {
          timestamp: new Date().toISOString(),
          event: 'play',
        });
        setIsStreamActive(true);
      };

      const handlePause = (e: Event) => {
        // Prevent default pause behavior during recording
        if (isRecording) {
          e.preventDefault();
          console.log('Pause event prevented during recording', {
            timestamp: new Date().toISOString(),
          });
          console.log('Ensuring playback3');
          ensurePlaying();
          return;
        }

        console.log('Video Preview Events:', {
          timestamp: new Date().toISOString(),
          event: 'pause',
          recordingState: {
            isRecording,
            streamActive: streamRef.current?.active,
            mediaRecorderState: mediaRecorderRef.current?.state,
          },
        });
      };

      const handleError = (e: Event) => {
        console.error('Video element error:', {
          timestamp: new Date().toISOString(),
          error: e,
        });
        setPreviewError('Video playback error occurred');
      };

      if (!video.hasAttribute('data-listeners-attached')) {
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('error', handleError);
        video.setAttribute('data-listeners-attached', 'true');
      }

      // Initial play attempt
      console.log('Ensuring playback4');
      ensurePlaying();

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        cleanupConnectionCheck();
        if (video.hasAttribute('data-listeners-attached')) {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('error', handleError);
          video.removeAttribute('data-listeners-attached');
        }
      };
    } catch (err) {
      console.error('Video setup error:', err);
      setPreviewError('Camera setup failed. Please refresh and try again.');
    }
  }, [mediaStream, showInstructions, isRecording]);

  // Camera initialization
  const startCamera = async () => {
    console.log('Starting camera initialization...', {
      timestamp: new Date().toISOString(),
    });
    setIsCameraLoading(true);
    setPreviewError(null);

    cleanupStream();
    cleanupConnectionCheck();

    try {
      if (!navigator.mediaDevices) (navigator as any).mediaDevices = {};

      if (!navigator.mediaDevices.getUserMedia) {
        const getUserMedia =
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).msGetUserMedia;

        if (!getUserMedia) {
          throw new Error('Your browser does not support video recording.');
        }

        navigator.mediaDevices.getUserMedia = function (constraints) {
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }

      const constraints = {
        video: {
          width: { ideal: videoQuality === '1080p' ? 1920 : 1280 },
          height: { ideal: videoQuality === '1080p' ? 1080 : 720 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Camera access request timed out')), 10000)
      );

      const stream = (await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        timeoutPromise,
      ])) as MediaStream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack.readyState === 'live') {
        streamRef.current = stream;
        setMediaStream(stream);
        setHasCameraAccess(true);
        setShowInstructions(false);
        setIsStreamActive(true);
      } else {
        throw new Error('Camera stream is not active');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access was denied.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found.');
        } else if (err.message === 'Camera access request timed out') {
          setError('Camera access timed out.');
        } else {
          setError('Unable to access camera.');
        }
      } else {
        setError('Unexpected error accessing camera.');
      }
      cleanupStream();
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    const stream = streamRef.current;
    if (!stream) {
      setError('No camera stream found.');
      return;
    }

    try {
      console.log('Starting recording using existing stream');

      // Clean up connection check during recording
      cleanupConnectionCheck();

      // Get fresh stream for recording to prevent interference
      const freshStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: videoQuality === '1080p' ? 1920 : 1280 },
          height: { ideal: videoQuality === '1080p' ? 1080 : 720 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      // Configure MediaRecorder with specific settings
      const mediaRecorder = new MediaRecorder(freshStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: videoQuality === '1080p' ? 2500000 : 1500000,
      });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      // Set up data handling
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log('Chunk size:', {
            timestamp: new Date().toISOString(),
            size: e.data.size,
          });
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setShowPreview(true);
        console.log('Recording stopped, blob created:', {
          timestamp: new Date().toISOString(),
          size: blob.size,
        });

        // Clean up the recording stream
        freshStream.getTracks().forEach((track) => track.stop());
      };

      // Ensure video preview is playing before starting recording
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Failed to ensure video is playing before recording:', err);
        }
      }

      // Start recording with smaller timeslice for more frequent data
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start error:', err);
      setError('Failed to start recording.');
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...', {
      timestamp: new Date().toISOString(),
    });
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped', {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const uploadVideo = async (blob: Blob) => {
    console.log('Starting video upload process...', {
      timestamp: new Date().toISOString(),
    });
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Create a unique filename for the video
      const filename = `video-${recordId}-${Date.now()}.webm`;

      // Create a FormData object to handle the upload
      const formData = new FormData();
      formData.append('file', blob, filename);

      // Create a custom XMLHttpRequest to handle the upload with progress
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progressPercentage = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progressPercentage));
          console.log('Upload progress:', {
            timestamp: new Date().toISOString(),
            progress: Math.round(progressPercentage),
            loaded: event.loaded,
            total: event.total,
          });
        }
      };

      // Create a promise to handle the upload
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      // Get the upload URL from Supabase
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('video')
        .createSignedUploadUrl(filename);

      if (signedUrlError || !signedUrlData) {
        throw signedUrlError || new Error('Failed to get signed upload URL');
      }

      // Start the upload
      xhr.open('PUT', signedUrlData.signedUrl);
      xhr.send(blob);

      // Wait for the upload to complete
      await uploadPromise;

      // Get the public URL for the uploaded video
      const {
        data: { publicUrl },
      } = supabase.storage.from('video').getPublicUrl(filename);

      console.log('Supabase upload successful:', {
        timestamp: new Date().toISOString(),
        url: publicUrl,
      });
      console.log(publicUrl, 'publicUrl');

      await base('SFF Candidate Database').update([
        {
          id: recordId,
          fields: {
            'Video Instruction': [
              {
                url: publicUrl,
              } as any,
            ],
          },
        },
      ]);
      setTimeout(() => {
        supabase.storage.from('video').remove([filename]);
      }, 1000);
      setError(null);
      setShowSuccess(true);
      // Clean up recording state
      setRecordedBlob(null);
      setShowPreview(false);
      cleanupStream();
    } catch (err) {
      console.error('Upload error:', {
        timestamp: new Date().toISOString(),
        error: err,
      });
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      console.log('Upload process completed', {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleQualityChange = async (event: any) => {
    setVideoQuality(event.target.value);
    // Only reinitialize if we already have camera access
    if (hasCameraAccess) {
      await startCamera();
    }
  };

  const handlePreviewConfirm = () => {
    if (recordedBlob) {
      uploadVideo(recordedBlob);
      setShowPreview(false);
    }
  };

  const handlePreviewCancel = async () => {
    setShowPreview(false);
    setRecordedBlob(null);
    // Reinitialize camera stream
    await startCamera();
  };

  const handleDownloadVideo = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!recordId) {
    return (
      <Typography color="error" variant="h6" align="center">
        Missing recordId parameter
      </Typography>
    );
  }

  const VideoPreview = styled('video')(({ theme }) => ({
    width: '100%',
    maxWidth: '640px',
    height: '360px', // 16:9 aspect ratio
    borderRadius: '16px',
    marginBottom: '1rem',
    boxShadow: theme.shadows[4],
    backgroundColor: 'transparent',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror the video for selfie view
  }));

  const PreviewContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    height: '360px',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: alpha('#000000', 0.8),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));

  const RecordingButton = styled(Button)(({ theme }) => ({
    borderRadius: '50px',
    padding: '16px 48px',
    textTransform: 'none',
    fontSize: '1.2rem',
    fontWeight: 600,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
  }));

  const InstructionCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6),
    borderRadius: '24px',
    background: `linear-gradient(145deg, rgba(25, 118, 210, 0.08), rgba(255, 255, 255, 0.95))`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
    backdropFilter: 'blur(8px)',
    maxWidth: '800px',
    margin: '0 auto',
    transform: 'translateY(0)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
  }));

  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 2,
        }}
      >
        {error && (
          <Fade in={!!error}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: 2,
              }}
            >
              <Typography color="error" variant="body1">
                {error}
              </Typography>
            </Paper>
          </Fade>
        )}

        {showSuccess ? (
          <Fade in={showSuccess}>
            <InstructionCard elevation={0}>
              <Stack spacing={4} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <MdCheckCircle color={theme.palette.success.main} size={48} />
                  </Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.success.main}, #2E7D32)`,
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center',
                      mb: 2,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    Thank You!
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    color: '#082439',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    maxWidth: 600,
                  }}
                >
                  Thank you for submitting your video interview! Our team will review it and get back to you shortly.
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: '#3B82F6',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    maxWidth: 600,
                  }}
                >
                  In the meantime, you should explore our resources page to learn more about search funds.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <Button
                    size="large"
                    href="https://searchfundfellows.com/resources"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#2563EB',
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                    }}
                    startIcon={<MdOpenInNew size={24} />}
                  >
                    Explore Resources
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      setShowSuccess(false);
                      setShowInstructions(true);
                      setError(null);
                    }}
                    sx={{
                      border: '2px solid #3B82F6',
                      color: '#3B82F6',
                      px: 4,
                      py: 1.5,
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        border: '2px solid #2563EB',
                        color: '#2563EB',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Record Another Video
                  </Button>
                </Stack>
              </Stack>
            </InstructionCard>
          </Fade>
        ) : showInstructions ? (
          <Fade in={showInstructions}>
            <InstructionCard elevation={0}>
              <Stack spacing={4} alignItems="center">
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(45deg, #3B82F6, #000000)`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center',
                    mb: 2,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  Before You Record
                </Typography>

                <List sx={{ width: '100%', maxWidth: 700 }}>
                  {bestPractices.map((practice, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        py: 2,
                        px: 3,
                        borderRadius: 3,
                        mb: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha('#3B82F6', 0.08),
                          transform: 'translateX(8px)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        {index === 0 && <MdMic color="#3B82F6" size={28} />}
                        {index === 1 && <MdCenterFocusStrong color="#3B82F6" size={28} />}
                        {index === 2 && <MdVideocam color="#3B82F6" size={28} />}
                        {index === 3 && <MdLightbulb color="#3B82F6" size={28} />}
                        {index === 4 && <MdTimer color="#3B82F6" size={28} />}
                      </ListItemIcon>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 500,
                          color: '#082439',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                        }}
                      >
                        {practice}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                <RecordingButton
                  size="large"
                  sx={{
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#3B82F6',
                    },
                  }}
                  onClick={startCamera}
                  startIcon={<MdVideocam color="#ffffff" size={28} />}
                >
                  Start Recording
                </RecordingButton>

                <Paper
                  elevation={3}
                  sx={{
                    mt: 4,
                    p: { xs: 2, md: 4 },
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.grey[100], 0.7),
                    border: `1px solid ${alpha(theme.palette.grey[300], 0.7)}`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    textAlign: 'center',
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <MdLightbulb color={theme.palette.warning.main} size={28} style={{ marginBottom: 2 }} />
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.warning.dark,
                          fontWeight: 700,
                          fontSize: { xs: '1.05rem', md: '1.15rem' },
                        }}
                      >
                        Video or microphone not working? Enable it on your browser as shown{' '}
                        <a
                          href="https://dtzdijrozqripmzhdshm.supabase.co/storage/v1/object/public/internal//video_troubleshoot.png"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#3B82F6',
                            textDecoration: 'underline',
                            fontWeight: 700,
                          }}
                        >
                          here
                        </a>
                      </Typography>
                    </Stack>
                    <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.grey[400], 0.3)}`, width: '100%', my: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.grey[700],
                        fontSize: '0.98rem',
                      }}
                    >
                      Having trouble with the video interview portal? Email us at{' '}
                      <a
                        href="mailto:applications@searchfundfellows.com"
                        style={{
                          color: '#3B82F6',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        applications@searchfundfellows.com
                      </a>
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </InstructionCard>
          </Fade>
        ) : (
          <Fade in={!showInstructions}>
            <Stack spacing={3} alignItems="center">
              {hasCameraAccess && !showPreview && (
                <PreviewContainer>
                  {isCameraLoading ? (
                    <Stack spacing={2} alignItems="center">
                      <CircularProgress size={40} />
                      <Typography variant="body1" color="white">
                        Initializing camera...
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          transform: 'scaleX(-1)', // selfie mirror
                          backgroundColor: '#000',
                        }}
                      />
                      {previewError && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: alpha(theme.palette.error.main, 0.9),
                            color: 'white',
                            padding: 2,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1">{previewError}</Typography>
                        </Box>
                      )}
                    </>
                  )}
                  {isRecording && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: alpha(theme.palette.error.main, 0.9),
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          animation: 'pulse 1s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.4 },
                            '100%': { opacity: 1 },
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Recording
                      </Typography>
                    </Box>
                  )}
                </PreviewContainer>
              )}

              {showPreview && recordedBlob && (
                <PreviewContainer>
                  <video
                    src={URL.createObjectURL(recordedBlob)}
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '16px',
                    }}
                  />
                </PreviewContainer>
              )}

              {showPreview && recordedBlob && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={handlePreviewCancel}
                    sx={{
                      backgroundColor: 'transparent',
                      border: '1px solid #3B82F6',
                      color: '#3B82F6',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        border: '1px solid #3B82F6',
                      },
                    }}
                  >
                    Record Again
                  </Button>
                  <Button
                    onClick={handlePreviewConfirm}
                    sx={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#3B82F6',
                      },
                    }}
                  >
                    Upload Video
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      backgroundColor: 'transparent',
                      border: '1px solid #082439',
                      color: '#082439',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        border: '1px solid #082439',
                      },
                    }}
                    onClick={handleDownloadVideo}
                    startIcon={<MdCloudUpload />}
                  >
                    Download Locally
                  </Button>
                </Stack>
              )}

              {!isRecording && !showPreview && (
                <Stack spacing={2} alignItems="center">
                  <RecordingButton
                    size="large"
                    sx={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#3B82F6',
                      },
                    }}
                    onClick={startRecording}
                    disabled={isUploading || !hasCameraAccess}
                    startIcon={<MdPlayArrow color="#ffffff" size={24} />}
                  >
                    Start Recording
                  </RecordingButton>
                </Stack>
              )}

              {isRecording && (
                <Stack spacing={2} alignItems="center">
                  <RecordingTimer
                    isRecording={isRecording}
                    onTimeUpdate={(time) => {
                      if (time >= 120) {
                        stopRecording();
                      }
                    }}
                  />
                  <RecordingButton
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={stopRecording}
                    startIcon={<MdStop color="#ffffff" size={24} />}
                  >
                    Stop Recording
                  </RecordingButton>
                </Stack>
              )}

              {isUploading && (
                <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ backgroundColor: '#3B82F6' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#3B82F6' }}>
                    Uploading your video... {Math.round(uploadProgress)}%
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </Container>
  );
}
