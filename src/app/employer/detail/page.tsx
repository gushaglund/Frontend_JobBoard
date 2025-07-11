'use client'

import React, { ReactNode, ReactElement, useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Chip,
  Stack,
  Link,
  Divider,
  Grid,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { FaLinkedin, FaRegFilePdf, FaUserTie, FaGraduationCap, FaUserCheck, FaBuilding, FaMapMarkerAlt, FaGlobe, FaVideo, FaStickyNote, FaStar, FaPhone, FaEnvelope, FaUser, FaBriefcase, FaMapPin, FaTruck, FaUniversity, FaBook, FaCalendarAlt, FaUserGraduate, FaClipboardCheck, FaHashtag, FaInfoCircle, FaCalendarDay, FaCalendarWeek, FaLink, FaRegClock } from "react-icons/fa";
import { MdEmail, MdPhone, MdOutlineInfo, MdOutlineStar, MdOutlineWorkOutline, MdPerson } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import Airtable, { Attachment } from "airtable";
import { config } from "@/config";
import { toast } from "@/components/core/toaster";
import { hideCandidate } from "@/utils/airtable";

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode | string;
};

type ContactChipProps = {
  icon: ReactNode;
  label: string;
  sx?: any;
  onClick?: () => void;
};

interface CandidateData {
  id: string;
  headshot?: Attachment[];
  resume?: Attachment[];
  notesLookup?: string;
  linkedin?: string;
  videoInterviewUrl?: string;
  about?: string;
  evaluation?: string;
  phone?: string;
  email?: string;
  candidateName?: string;
  companyName?: string;
  recommendationLevel?: string;
  availabilityDetails?: string;
  undergraduateUniversity?: string;
  undergraduateMajorMinor?: string;
  graduationYear?: string;
  oneLiner?: string;
  candidateQualities?: string[];
  overallEvaluationToClient?: string;
  orderId?: string;
  showHide?: string;
  candidateTypeLookup?: string;
  reviewerRecommendationLookup?: string;
  resumeLookup?: string;
  grade?: string;
  client?: string;
  videoInstruction?: Attachment[];
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack 
      direction={isMobile ? "column" : "row"} 
      spacing={isMobile ? 0.5 : 1.5} 
      alignItems={isMobile ? "flex-start" : "flex-start"} 
      sx={{ width: '100%' }}
    >
      <Box sx={{ 
        color: '#3B82F6', 
        fontSize: isMobile ? 16 : 20, 
        minWidth: isMobile ? 18 : 24, 
        display: 'flex', 
        alignItems: 'center',
        mt: isMobile ? 0.5 : 0
      }}>
        {icon}
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          minWidth: isMobile ? 'auto' : 160, 
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          fontSize: isMobile ? 13 : 16,
          mb: isMobile ? 0.25 : 0
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, pl: isMobile ? 0 : 1 }}>
        {typeof value === 'string' ? (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.primary',
              fontSize: isMobile ? 13 : 16,
              wordBreak: 'break-word',
              lineHeight: isMobile ? 1.4 : 1.6
            }}
          >
            {value}
          </Typography>
        ) : value}
      </Box>
    </Stack>
  );
}

function ContactChip({ icon, label, sx, onClick }: ContactChipProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const validIcon = React.isValidElement(icon) ? icon : undefined;
  return (
    <Chip
      icon={validIcon}
      label={label}
      variant="outlined"
      sx={{
        fontSize: isMobile ? 12 : 16,
        px: isMobile ? 1 : 2,
        py: isMobile ? 0.5 : 1,
        bgcolor: 'background.paper',
        boxShadow: 1,
        borderRadius: 2,
        '& .MuiChip-icon': { fontSize: isMobile ? 16 : 22 },
        '& .MuiChip-label': {
          fontSize: isMobile ? 12 : 16,
          wordBreak: 'break-word'
        },
        ...sx,
      }}
      onClick={onClick}
    />
  );
}

export default function CandidateDetailPage() {
  const searchParams = useSearchParams();
  const candidateId = searchParams?.get('candidateId');
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState('');
  const [availability, setAvailability] = useState('');
  const [formError, setFormError] = useState('');
  const [calendlyError, setCalendlyError] = useState('');
  console.log(candidate?.videoInstruction, 'videoInstruction');
  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!candidateId) {
        setError("No candidate ID provided");
        setLoading(false);
        return;
      }

      try {
        const record = await base('Candidate-Client Profile')
          .find(candidateId);
        
        if (record) {
          setCandidate({
            id: record.id,
            headshot: record.get('Headshot') as Attachment[],
            resume: record.get('Resume Lookup') as Attachment[],
            notesLookup: record.get('Notes Lookup') as string,
            linkedin: record.get('LinkedIn') as string,
            videoInterviewUrl: record.get('Video Interview URL') as string,
            about: record.get('About yourself') as string,
            evaluation: record.get('Overall Evaluation (to client)') as string,
            phone: record.get('Phone') as string,
            email: record.get('Email') as string,
            candidateName: record.get('Candidate Name') as string,
            companyName: record.get('Company Name') as string,
            recommendationLevel: record.get('Recommendation Level') as string,
            availabilityDetails: record.get('Availability Details') as string,
            undergraduateUniversity: record.get('Undergraduate University') as string,
            undergraduateMajorMinor: record.get('Undergraduate Major / Minor') as string,
            graduationYear: record.get('Graduation Year') as string,
            oneLiner: record.get('One Liner') as string,
            candidateQualities: record.get('Candidate Qualities') as string[],
            overallEvaluationToClient: record.get('Overall Evaluation (to client)') as string,
            orderId: record.get('Order ID') as string,
            showHide: record.get('Show/Hide') as string,
            candidateTypeLookup: record.get('Candidate Type Lookup') as string,
            reviewerRecommendationLookup: record.get('Reviewer Recommendation Lookup') as string,
            resumeLookup: record.get('Resume Lookup') as string,
            grade: record.get('Grade') as string,
            client: record.get('Client') as string,
            videoInstruction: record.get('Video Instruction') as Attachment[],
          });
        }
      } catch (err) {
        console.error('Error fetching candidate data:', err);
        setError("Failed to fetch candidate data");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [candidateId]);
  const fetchCandidateData = async () => {
    if (!candidateId) {
      setError("No candidate ID provided");
      setLoading(false);
      return;
    }

    try {
      const record = await base('Candidate-Client Profile')
        .find(candidateId);
      
      if (record) {
        setCandidate({
          id: record.id,
          headshot: record.get('Headshot') as Attachment[],
          resume: record.get('Resume Lookup') as Attachment[],
          notesLookup: record.get('Notes Lookup') as string,
          linkedin: record.get('LinkedIn') as string,
          videoInterviewUrl: record.get('Video Interview URL') as string,
          about: record.get('About yourself') as string,
          evaluation: record.get('Overall Evaluation (to client)') as string,
          phone: record.get('Phone') as string,
          email: record.get('Email') as string,
          candidateName: record.get('Candidate Name') as string,
          companyName: record.get('Company Name') as string,
          recommendationLevel: record.get('Recommendation Level') as string,
          availabilityDetails: record.get('Availability Details') as string,
          undergraduateUniversity: record.get('Undergraduate University') as string,
          undergraduateMajorMinor: record.get('Undergraduate Major / Minor') as string,
          graduationYear: record.get('Graduation Year') as string,
          oneLiner: record.get('One Liner') as string,
            candidateQualities: record.get('Candidate Qualities') as string[],
            overallEvaluationToClient: record.get('Overall Evaluation (to client)') as string,
            orderId: record.get('Order ID') as string,
            showHide: record.get('Show/Hide') as string,
            candidateTypeLookup: record.get('Candidate Type Lookup') as string,
            reviewerRecommendationLookup: record.get('Reviewer Recommendation Lookup') as string,
            resumeLookup: record.get('Resume Lookup') as string,
            grade: record.get('Grade') as string,
            client: record.get('Client') as string,
            videoInstruction: record.get('Video Instruction') as Attachment[],
        });
      }
    } catch (err) {
      console.error('Error fetching candidate data:', err);
      setError("Failed to fetch candidate data");
    } finally {
      setLoading(false);
    }
  };
  const handleCandidateUpdate = useCallback(() => {
    fetchCandidateData();
  }, [fetchCandidateData]); 

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeclining(true);
    
    try {
      if (!candidate) {
        console.error('Candidate not found');
        return;
      }

      const record = await base('Candidate-Client Profile').find(candidate.id);
      console.log('Original record:', record);
      console.log('Candidate ID:', candidate.id);
      

      const filterFormula = `AND({Candidate-Client} = '${record.fields["Candidate Name"]}-${record.fields["Company Name"]}')`;
      console.log('Filter formula:', filterFormula);
      
      // Check if a record already exists in Candidate-Client Feedback
      const existingRecords = await base('Candidate-Client Feedback')
        .select({
          filterByFormula: filterFormula,
          maxRecords: 10, // Increased to see all potential matches
          view: 'Grid view',
        })
        .all();

      const feedbackData = {
        "Candidate": record.fields.Candidate,
        "Client": record.fields.Client,
        "Order ID": record.fields["Order ID"],
        "Would you like to interview this candidate?": 'Deny',
      };

      if (existingRecords.length > 0) {
        // Update the first existing record
        const updatedRecord = await base('Candidate-Client Feedback').update(existingRecords[0].id, feedbackData);
        toast.success('Interview request updated successfully');
      } else {
        // Create new record only if none exists
        const newRecord = await base('Candidate-Client Feedback').create(feedbackData);
        console.log('Created new feedback record:', newRecord);
        toast.success('Interview request sent successfully');
      }

      const hideSuccess = await hideCandidate(candidate.id);
      
      if (hideSuccess) {
        toast.success('Candidate declined successfully');
        handleCandidateUpdate?.();
      } else {
        toast.error('Failed to hide candidate');
      }
    } catch (error) {
      console.error('Error declining candidate:', error);
      toast.error('Failed to decline candidate');
    } finally {
      setIsDeclining(false);
    }
  };

  const validateCalendly = (url: string) => {
    if (!url) return '';
    if (!/^https:\/\/calendly\.com\//.test(url.trim())) {
      return 'Please enter a valid Calendly link (must start with https://calendly.com/)';
    }
    return '';
  };

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCalendlyLink('');
    setAvailability('');
    setFormError('');
    setCalendlyError('');
  };

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const calendlyErr = validateCalendly(calendlyLink);
    setCalendlyError(calendlyErr);
    if (calendlyErr) return;
    if (!calendlyLink && !availability) {
      setFormError('Please provide a Calendly link or availability.');
      return;
    }
    setDialogOpen(false);
    await handleInterviewWithExtraFields(calendlyLink, availability);
  };

  const handleInterviewWithExtraFields = async (calendly: string, avail: string) => {
    setIsInterviewing(true);
    try {
      if (!candidate) {
        console.error('Candidate not found');
        return;
      }
      const record = await base('Candidate-Client Profile').find(candidate.id);
      const filterFormula = `AND({Candidate-Client} = '${record.fields["Candidate Name"]}-${record.fields["Company Name"]}')`;
      const existingRecords = await base('Candidate-Client Feedback')
        .select({
          filterByFormula: filterFormula,
          maxRecords: 10,
          view: 'Grid view',
        })
        .all();
      const feedbackData: { [key: string]: any } = {
        "Candidate": record.fields.Candidate,
        "Client": record.fields.Client,
        "Order ID": record.fields["Order ID"],
        "Would you like to interview this candidate?": 'Interview',
      };
      if (calendly) {
        (feedbackData as any)["Do you have a calendly invite we can include?"] = calendly;
      }
      if (avail) {
        (feedbackData as any)["If you don't have any calendly link, please type availablity that we can share to student."] = avail;
      }
      if (existingRecords.length > 0) {
        await base('Candidate-Client Feedback').update(existingRecords[0].id, feedbackData);
        toast.success('Interview request updated successfully');
      } else {
        await base('Candidate-Client Feedback').create(feedbackData);
        toast.success('Interview request sent successfully');
      }
      handleCandidateUpdate?.();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setIsInterviewing(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !candidate) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || "Candidate not found"}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      py: { xs: 0.5, sm: 3, md: 6 },
      px: { xs: 0.5, sm: 2 },
      marginTop: { xs: 4, sm: 6, md: 1 }
    }}>
      <Card
        sx={{
          maxWidth: 800,
          mx: 'auto',
          borderRadius: { xs: 1, sm: 4 },
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          p: { xs: 1.5, sm: 3, md: 5 },
          overflow: 'visible',
          bgcolor: 'background.paper',
          mt: { xs: 1, sm: 3, md: 5 },
        }}
      >
        {/* Profile Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            mb: { xs: 2, sm: 4 },
            mt: { xs: -6, sm: -10, md: -12 },
          }}
        >
          {candidate.headshot?.[0]?.url ? (
            <Avatar
              src={candidate.headshot?.[0]?.url}
              alt={candidate.candidateName}
              sx={{
              width: { xs: 70, sm: 100, md: 120 },
              height: { xs: 70, sm: 100, md: 120 },
              border: `4px solid #3B82F6`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              mb: { xs: 1.5, sm: 2 },
              bgcolor: 'background.paper',
            }}
          />
          ) : (
            <Avatar
              sx={{
                width: { xs: 70, sm: 100, md: 120 },
                height: { xs: 70, sm: 100, md: 120 },
                border: `4px solid #3B82F6`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <MdPerson style={{ fontSize: '1.5rem', color: '#fff' }} />
            </Avatar>
          )}
          <Typography 
            variant={isMobile ? "h6" : "h4"} 
            fontWeight={700} 
            gutterBottom
            sx={{ 
              textAlign: 'center',
              fontSize: { xs: '1.25rem', sm: '2rem', md: '2.125rem' },
              px: { xs: 1, sm: 0 },
              lineHeight: { xs: 1.3, sm: 1.4 }
            }}
          >
            {candidate.candidateName}
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 }, 
              textAlign: 'center',
              fontSize: { xs: 12, sm: 16 },
              px: { xs: 1, sm: 0 },
              lineHeight: { xs: 1.4, sm: 1.5 }
            }}
          >
            {candidate.oneLiner}
          </Typography>
          <Stack 
            direction="row" 
            spacing={0.5} 
            flexWrap="wrap" 
            justifyContent="center"
            sx={{ gap: { xs: 0.25, sm: 1 } }}
          >
            {candidate.candidateQualities?.map((qualification) => (
              <Chip 
                icon={<FaClipboardCheck />} 
                key={qualification} 
                label={qualification} 
                variant="outlined" 
                size={isMobile ? "small" : "medium"}
                sx={{
                  color:"#3B82F6",
                  borderColor: "#3B82F6",
                  mb: { xs: 0.5, sm: 1 },
                  '& .MuiChip-icon': { fontSize: { xs: 12, sm: 18 } },
                  '& .MuiChip-label': { 
                    fontSize: { xs: 10, sm: 14 }, 
                    fontWeight: 500,
                    px: { xs: 0.5, sm: 1 }
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: { xs: 2, sm: 4 } }} />

        {/* Red Section - Basic Info */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'grey.50', 
            p: { xs: 1.5, sm: 3 }, 
            borderRadius: { xs: 1.5, sm: 3 }, 
            mb: { xs: 2, sm: 4 },
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 2.5 }}>
            <InfoRow icon={<FaUser />} label="Name" value={candidate.candidateName || '-'} />
            <InfoRow icon={<FaGraduationCap />} label="Grade" value={candidate.grade || '-'} />
            <InfoRow icon={<FaUniversity />} label="University" value={candidate.undergraduateUniversity || '-'} />
            <InfoRow icon={<FaUserTie />} label="Candidate Type" value={candidate.candidateTypeLookup || '-'} />
          </Stack>
          
          {candidate.candidateQualities && candidate.candidateQualities.length > 0 && (
            <Box sx={{ mt: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  minWidth: isMobile ? 'auto' : 160, 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: isMobile ? 13 : 16,
                  mb: { xs: 0.75, sm: 1 }
                }}
              >
                Candidate Qualities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.25, sm: 1 } }}>
                {candidate.candidateQualities.map((quality, index) => (
                  <Chip 
                    key={index} 
                    label={quality} 
                    size={isMobile ? "small" : "small"} 
                    variant="outlined" 
                    sx={{
                      fontSize: { xs: 10, sm: 14 },
                      mb: { xs: 0.25, sm: 0 },
                      borderColor: '#3B82F6',
                      color: '#3B82F6',
                      '& .MuiChip-label': {
                        px: { xs: 0.5, sm: 1 }
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Blue Section - Documents & Actions */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'grey.50', 
            p: { xs: 1.5, sm: 3 }, 
            borderRadius: { xs: 1.5, sm: 3 }, 
            mb: { xs: 2, sm: 4 },
           
          }}
        >
          
          <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            {candidate.linkedin && (
              <InfoRow 
                icon={<FaLinkedin />} 
                label="LinkedIn" 
                value={
                  <Link href={candidate.linkedin} target="_blank" rel="noopener" sx={{ color: '#2563EB', textDecoration: 'none' }}>
                    View Profile
                  </Link>
                } 
              />
            )}
            {candidate.resume && (
              <InfoRow 
                icon={<FaRegFilePdf />} 
                label="Resume" 
                value={
                  <Link href={candidate.resume[0]?.url} target="_blank" rel="noopener" sx={{ color: '#2563EB', textDecoration: 'none' }}>
                    View Resume
                  </Link>
                } 
              />
            )}
            {candidate.videoInstruction && (
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    minWidth: isMobile ? 'auto' : 160, 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: isMobile ? 13 : 16,
                    mb: { xs: 0.75, sm: 1 }
                  }}
                >
                  <FaVideo style={{ marginRight: 8, color: '#3B82F6' }} />
                  Video Instruction
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  borderRadius: { xs: 1, sm: 2 }, 
                  overflow: 'hidden',
                  boxShadow: 2,
                  bgcolor: 'black'
                }}>
                  <video 
                    controls 
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      maxHeight: isMobile ? '250px' : '400px',
                      display: 'block'
                    }}
                    preload="metadata"
                  >
                    <source src={candidate.videoInstruction[0]?.url} type="video/webm" />
                    <source src={candidate.videoInstruction[0]?.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              </Box>
            )}
          </Stack>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1, sm: 2 }} 
            justifyContent="center" 
            alignItems="center"
          >
            <Button
              onClick={handleOpenDialog}
              sx={{ 
                bgcolor: '#3B82F6',
                color: '#fff',
                minWidth: { xs: '100%', sm: 150 }, 
                fontWeight: 600, 
                boxShadow: 2,
                py: { xs: 1, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: 13, sm: 16 },
                '&:hover': {
                  boxShadow: 4
                }
              }}
              disabled={isInterviewing}
            >
              {isInterviewing ? <CircularProgress size={20} /> : 'Interview Candidate'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleDecline}
              sx={{ 
                color: '#DC2626',
                borderColor: '#DC2626',
                minWidth: { xs: '100%', sm: 150 }, 
                fontWeight: 600, 
                boxShadow: 1,
                py: { xs: 1, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: 13, sm: 16 },
                '&:hover': {
                  color: '#fff',
                  boxShadow: 2
                }
              }}
            >
              Decline
            </Button>
          </Stack>
        </Paper>

        {/* Green Section - Academic & Evaluation */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'grey.50',  
            p: { xs: 1.5, sm: 3 }, 
            borderRadius: { xs: 1.5, sm: 3 }, 
            mb: { xs: 2, sm: 4 },
         
          }}
        >
          
          <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            <InfoRow icon={<FaBook />} label="Major / Minor" value={candidate.undergraduateMajorMinor || '-'} />
            {candidate.graduationYear && (
              <InfoRow icon={<FaCalendarAlt />} label="Graduation Year" value={candidate.graduationYear} />
            )}
          </Stack>

          {candidate.evaluation && (
            <Box>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  minWidth: isMobile ? 'auto' : 160, 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: isMobile ? 13 : 16,
                  mb: { xs: 0.75, sm: 1 }
                }}
              >
                Candidate Evaluation
              </Typography>
              <Typography 
                color="text.secondary" 
                fontSize={{ xs: 13, sm: 16 }} 
                sx={{ 
                  lineHeight: { xs: 1.4, sm: 1.7 },
                  textAlign: { xs: 'left', sm: 'left' }
                }}
              >
                {candidate.evaluation}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Orange Section - About & Contact */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'grey.50' ,
            p: { xs: 1.5, sm: 3 }, 
            borderRadius: { xs: 1.5, sm: 3 }, 
            mb: { xs: 2, sm: 4 },
           
          }}
        >
          {candidate.about && (
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  minWidth: isMobile ? 'auto' : 160, 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: isMobile ? 13 : 16,
                  mb: { xs: 0.75, sm: 1 }
                }}
              >
                About Yourself
              </Typography>
              <Typography 
                color="text.secondary" 
                fontSize={{ xs: 13, sm: 16 }} 
                sx={{ 
                  lineHeight: { xs: 1.4, sm: 1.7 },
                  textAlign: { xs: 'left', sm: 'left' }
                }}
              >
                {candidate.about}
              </Typography>
            </Box>
          )}

          <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            <InfoRow icon={<FaCalendarDay />} label="Availability Details" value={candidate.availabilityDetails || '-'} />
            {candidate.phone && (
              <InfoRow icon={<FaPhone />} label="Phone" value={candidate.phone} />
            )}
            {candidate.email && (
              <InfoRow icon={<FaEnvelope />} label="Email" value={candidate.email} />
            )}
          </Stack>
        </Paper>

      </Card>
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
            boxShadow: '0 8px 32px rgba(59,130,246,0.10)',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
          },
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: { xs: 22, sm: 24 },
          textAlign: 'center',
          pb: 0,
          color: '#1D4ED8',
          letterSpacing: '-0.01em',
        }}>
          Interview Availability
        </DialogTitle>
        <form onSubmit={handleDialogSubmit}>
          <DialogContent sx={{ pt: 2, pb: 1 }}>
            <TextField
              label="Calendly Link (optional)"
              fullWidth
              margin="normal"
              value={calendlyLink}
              onChange={e => {
                setCalendlyLink(e.target.value);
                setCalendlyError('');
              }}
              placeholder="https://calendly.com/your-link"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5, pr: 1 }}>
                    <FaLink style={{ color: '#3B82F6', fontSize: 18 }} />
                  </Box>
                ),
              }}
              helperText={calendlyError || 'Paste your Calendly link if you have one.'}
              error={!!calendlyError}
              sx={{ mb: 2, background: 'transparent', borderRadius: 1 }}
            />
            <TextField
              label="Availability (if no Calendly)"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              placeholder="e.g. 04/02/2025 4pm ET, 04/10/2025 9am ET"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5, pr: 1 }}>
                    <FaRegClock style={{ color: '#3B82F6', fontSize: 18 }} />
                  </Box>
                ),
              }}
              helperText="Type your available times if you don't have a Calendly link."
              sx={{ mb: 2, background: 'transparent', borderRadius: 1 }}
            />
            {formError && (
              <Box color="error.main" mt={1} fontSize={14} textAlign="center">{formError}</Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 0 }}>
            <Button onClick={handleCloseDialog} color="secondary" sx={{ borderRadius: 3, px: 3, fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isInterviewing}
              sx={{
                borderRadius: 3,
                px: 4,
                fontWeight: 700,
                background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 2px 8px rgba(59,130,246,0.10)',
                textTransform: 'none',
              }}
            >
              {isInterviewing ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

