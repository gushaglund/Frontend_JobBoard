import React, { useState } from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { FaGraduationCap, FaMapMarkerAlt, FaBriefcase, FaStar, FaLink, FaRegClock } from "react-icons/fa";
import { MdLocationOn, MdWork, MdPerson, MdSchool } from "react-icons/md";
import { CandidateProfile, updateCandidateStatus, hideCandidate } from "../../../utils/airtable";
import Airtable from "airtable";
import { config } from "@/config";
import { toast } from "@/components/core/toaster";
import { useRouter } from "next/navigation";

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

type RecommendationType = 'Top Choice' | 'Strong Candidate' | 'Good Candidate';

type ColorConfig = {
  color: string;
  bgColor: string;
  hoverColor: string;
  hoverBgColor: string;
};

const recommendationColors: Record<RecommendationType, ColorConfig> = {
  'Good Candidate': {
    color: '#059669', // Emerald
    bgColor: '#ECFDF5',
    hoverColor: '#047857',
    hoverBgColor: '#D1FAE5'
  },
  'Strong Candidate': {
    color: '#2563EB', // Blue
    bgColor: '#EFF6FF',
    hoverColor: '#1D4ED8',
    hoverBgColor: '#DBEAFE'
  },
  'Top Choice': {
    color: '#DC2626', // Red
    bgColor: '#FEF2F2',
    hoverColor: '#B91C1C',
    hoverBgColor: '#FECACA'
  }
};

export function CandidateCard({ 
  candidate, 
  expanded, 
  onExpand,
  onCandidateUpdate 
}: { 
  candidate: CandidateProfile, 
  expanded: boolean, 
  onExpand: () => void,
  onCandidateUpdate?: () => void
}) {
  const router = useRouter();
  const [isDeclining, setIsDeclining] = useState(false);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState('');
  const [availability, setAvailability] = useState('');
  const [formError, setFormError] = useState('');
  const [calendlyError, setCalendlyError] = useState('');
  const headshotUrl = candidate.headshot?.[0]?.thumbnails?.full?.url || candidate.headshot?.[0]?.url;

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/employer/detail?candidateId=${candidate.id}`, '_blank');
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeclining(true);
    
    try {
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
        onCandidateUpdate?.();
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

  const validateCalendly = (url: string) => {
    if (!url) return '';
    if (!/^https:\/\/calendly\.com\//.test(url.trim())) {
      return 'Please enter a valid Calendly link (must start with https://calendly.com/)';
    }
    return '';
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
      onCandidateUpdate?.();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setIsInterviewing(false);
    }
  };

  const getRecommendationColor = (recommendation: string): ColorConfig => {
    const recommendationKey = recommendation as RecommendationType;
    return recommendationColors[recommendationKey] || recommendationColors['Good Candidate'];
  };

  return (
    <Card 
      sx={{ 
        mb: { xs: 2, sm: 3 },
        border: expanded ? '2px solid' : '1px solid',
        borderColor: expanded ? '#3B82F6' : '#E5E7EB',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.06)',
          borderColor: '#3B82F6',
        },
        boxShadow: '0 4px 12px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)',
        borderRadius: { xs: '12px', sm: '16px' },
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, sm: 3, md: 4 }
      }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexDirection: { xs: 'column', sm: 'row' },
            '&:hover': {
              opacity: 0.9
            }
          }} 
          onClick={onExpand}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            flex: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            gap: { xs: 2, sm: 0 },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            {headshotUrl ? (
              <Avatar 
                src={headshotUrl} 
                alt={candidate.name} 
                sx={{ 
                  width: { xs: 60, sm: 72 }, 
                  height: { xs: 60, sm: 72 }, 
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 0, sm: 0 },
                  alignSelf: { xs: 'center', sm: 'flex-start' },
                  border: '4px solid #fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
                  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                }}
              />
            ) : (
              <Avatar 
                sx={{ 
                  width: { xs: 60, sm: 72 }, 
                  height: { xs: 60, sm: 72 }, 
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 0, sm: 0 },
                  alignSelf: { xs: 'center', sm: 'flex-start' },
                  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  fontWeight: 600,
                  border: '4px solid #fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
                }}
              >
                <MdPerson style={{ fontSize: '1.75rem', color: '#fff' }} />
              </Avatar>
            )}
            <Box sx={{ 
              flex: 1, 
              textAlign: { xs: 'center', sm: 'left' },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, sm: 0.5 },
              alignItems: { xs: 'center', sm: 'flex-start' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              {/* Name */}
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{ 
                  color: '#1F2937', 
                  fontSize: { xs: 18, sm: 20 },
                  mb: 0.5,
                  letterSpacing: '-0.025em'
                }}
              >
                {candidate.name}
              </Typography>
              
              {/* Grade @ Undergraduate University */}
              <Typography 
                variant="subtitle1" 
                fontWeight={600} 
                sx={{ 
                  color: '#3B82F6', 
                  fontSize: { xs: 14, sm: 16 },
                  letterSpacing: '-0.01em',
                  textAlign: { xs: 'center', sm: 'left' },
                  mb: 1
                }}
              >
                {candidate.grade} @ {candidate.undergraduateUniversity}
              </Typography>

              {/* Undergraduate Major / Minor */}
              {candidate.undergraduateMajor && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6B7280', 
                    mb: 1.5,
                    fontSize: { xs: 13, sm: 14 },
                    lineHeight: 1.5,
                    fontWeight: 500,
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  {candidate.undergraduateMajor}
                </Typography>
              )}

              {/* One Liner */}
              {candidate.oneLiner && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6366F1', 
                    mb: 1.5,
                    fontSize: { xs: 13, sm: 14 },
                    lineHeight: 1.5,
                    fontWeight: 500,
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  {candidate.oneLiner}
                </Typography>
              )}

              {/* Reviewer Recommendation */}
              {candidate.reviewRecommendation && (
                <Box sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  <Chip 
                    icon={<FaStar style={{ fontSize: 12 }} />}
                    label={candidate.reviewRecommendation}
                    size="small"
                    sx={{ 
                      bgcolor: getRecommendationColor(candidate.reviewRecommendation).bgColor,
                      color: getRecommendationColor(candidate.reviewRecommendation).color,
                      fontWeight: 600,
                      fontSize: { xs: 11, sm: 12 },
                      height: { xs: 24, sm: 28 },
                      '&:hover': {
                        bgcolor: getRecommendationColor(candidate.reviewRecommendation).hoverBgColor,
                        color: getRecommendationColor(candidate.reviewRecommendation).hoverColor,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease'
                    }} 
                  />
                </Box>
              )}

              {/* Candidate Qualities */}
              {candidate.candidateQualities && candidate.candidateQualities.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: { xs: 0.5, sm: 1 },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  mb: { xs: 1, sm: 0 }
                }}>
                  {candidate.candidateQualities?.map((quality, idx) => (
                    <Chip 
                      key={idx} 
                      label={quality.trim()} 
                      size="small"
                      sx={{ 
                        bgcolor: '#FEF3C7',
                        color: '#92400E',
                        fontWeight: 600,
                        fontSize: { xs: 11, sm: 12 },
                        height: { xs: 20, sm: 24 },
                        '&:hover': {
                          bgcolor: '#FDE68A',
                          color: '#78350F',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease'
                      }} 
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 2, sm: 3 }, borderColor: '#E5E7EB' }} />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: { xs: 2, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            variant="outlined"
            onClick={handleOpenProfile}
            startIcon={<MdPerson style={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 600, 
              fontSize: { xs: 13, sm: 14 }, 
              px: { xs: 2, sm: 3 }, 
              py: { xs: 1, sm: 1.5 },
              color: '#374151', 
              borderColor: '#D1D5DB',
              borderWidth: 2,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                borderColor: '#9CA3AF',
                bgcolor: '#F9FAFB',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            View Profile
          </Button>
          
          {/* Group Decline and Interview together */}
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              justifyContent: { xs: 'center', sm: 'flex-end' },
              alignItems: 'center',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '18px',
              boxShadow: '0 4px 16px rgba(59,130,246,0.10)',
              p: 0.5,
              gap: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 420 },
              maxWidth: { xs: '100%', sm: 420 },
              flexDirection: { xs: 'column', sm: 'row' },
              mx: { xs: 'auto', sm: 0 }
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleDecline}
              sx={{
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: { xs: 13, sm: 14 },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1.5 },
                borderColor: '#FCA5A5',
                color: '#DC2626',
                borderWidth: 2,
                flex: 1,
                minWidth: { xs: '100%', sm: 220 },
                background: 'white',
                boxShadow: 'none',
                zIndex: 1,
                '&:hover': {
                  borderColor: '#F87171',
                  bgcolor: '#FFF1F2',
                  color: '#B91C1C',
                  boxShadow: '0 2px 8px rgba(252,165,165,0.10)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                height: 48,
              }}
              disabled={isDeclining}
            >
              {isDeclining ? <CircularProgress size={20} /> : 'Decline'}
            </Button>
            <Button
              variant="contained"
              endIcon={<span style={{ display: 'inline-block', fontSize: 20, marginLeft: 6 }}>→</span>}
              sx={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#fff',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: { xs: 13, sm: 14 },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1.5 },
                flex: 1,
                minWidth: { xs: '100%', sm: 220 },
                boxShadow: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.15)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                height: 48,
              }}
              onClick={handleOpenDialog}
              disabled={isInterviewing}
            >
              {isInterviewing ? <CircularProgress size={20} /> : 'Interview Candidate'}
            </Button>
          </Box>
        </Box>
      </CardContent>
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
    </Card>
  );
} 