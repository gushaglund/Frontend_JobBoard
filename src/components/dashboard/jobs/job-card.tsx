'use client';

import * as React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareOut as ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUp as CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { MapPin as MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export interface Job {
  id: string;
  jobPostingId: string;
  companyName: string;
  jobTitle: string;
  idealStartDate: string;
  anticipatedEndDate: string;
  remoteInPerson: string;
  location?: string;
  hoursPerWeek: number;
  paidUnpaid: string;
  jobPostingURL: string;
  companyLogo?: {
    thumbnails: {
      small: {
        url: string;
      };
    };
  }[];
  companyType: string;
  companyDescription: string;
  ats: string;
  externalLink?: string;
  status: string;
  created_At: string;
  jobType: string[];
  jobDescription: string;
}

interface JobCardProps {
  job: Job;
}

const MotionCard = motion(Card);

// Utility to preprocess job description for markdown
function preprocessJobDescription(desc: string) {
  return desc ? desc.replace(/^●\s?/gm, '- ').replace(/\n{2,}/g, '\n\n') : '';
}

export function JobCard({ job }: JobCardProps): React.JSX.Element {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleDescription = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when toggling description
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const toggleJobDescription = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when toggling description
    setIsJobDescriptionExpanded(!isJobDescriptionExpanded);
  };

  const handleCardClick = () => {
    if (job.jobPostingURL) {
      window.open(job.jobPostingURL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        border: '2px solid var(--mui-palette-divider)',
        borderRadius: '16px',
        backgroundColor: 'var(--mui-palette-background-paper)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer',
          borderColor: 'var(--mui-palette-primary-main)',
          transform: 'translateY(-8px)',
        },
      }}
    >
      <CardHeader
        avatar={
          <Box
            component="img"
            src={job.companyLogo?.[0]?.thumbnails?.small.url || '/assets/company-avatar-1.png'}
            sx={{
              height: '48px',
              width: '48px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '2px solid var(--mui-palette-divider)',
              backgroundColor: 'var(--mui-palette-background-default)',
              padding: '2px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            alt={`${job.companyName} logo`}
          />
        }
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--mui-palette-text-primary)' }}>
              {job.companyName}
            </Typography>
            {job.status === 'Approved' ? (
              <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" />
            ) : null}
          </Stack>
        }
        subheader={
          <>
            {job.companyType ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                <Chip
                  label={job.companyType}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--mui-palette-primary-50)',
                    color: 'var(--mui-palette-primary-main)',
                    fontWeight: 500,
                    height: '24px',
                  }}
                />
              </Stack>
            ) : null}
          </>
        }
        sx={{
          '& .MuiCardHeader-content': {
            overflow: 'hidden',
          },
          padding: '24px 24px 16px',
        }}
      />
      <CardContent sx={{ flexGrow: 1, padding: '0 24px 24px' }}>
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: 'var(--mui-palette-text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: isDescriptionExpanded ? 'none' : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              lineHeight: 1.6,
            }}
          >
            {job.companyDescription}
          </Typography>
          {job.companyDescription ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 1,
              }}
            >
              <Typography
                component="button"
                onClick={toggleDescription}
                sx={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mui-palette-primary-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {isDescriptionExpanded ? (
                  <>
                    Show less
                    <CaretUpIcon fontSize="var(--icon-fontSize-md)" />
                  </>
                ) : (
                  <>
                    See more
                    <CaretDownIcon fontSize="var(--icon-fontSize-md)" />
                  </>
                )}
              </Typography>
            </Box>
          ) : null}
        </Box>
        <Divider sx={{ mb: 2, borderColor: 'var(--mui-palette-divider)' }} />
        <Stack spacing={2}>
          <Box>
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={1}
              sx={{ alignItems: isMobile ? 'flex-start' : 'center', mb: 1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {job.jobTitle}
              </Typography>
              {job.jobType?.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--mui-palette-success-50)',
                    color: '#219bc5',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>
            <Box>
              {isJobDescriptionExpanded ? (
                <Box
                  sx={{
                    mb: 2,
                    color: 'var(--mui-palette-text-secondary)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    '& ul': { pl: 3, mb: 1 },
                    '& li': { mb: 0.5 },
                    '& strong': { fontWeight: 700 },
                    '& a': { color: 'var(--mui-palette-primary-main)' },
                  }}
                >
                  <ReactMarkdown>{preprocessJobDescription(job.jobDescription)}</ReactMarkdown>
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    color: 'var(--mui-palette-text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'all 0.3s ease',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                  }}
                >
                  {job.jobDescription}
                </Typography>
              )}
              {job.jobDescription ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 1,
                  }}
                >
                  <Typography
                    component="button"
                    onClick={toggleJobDescription}
                    sx={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--mui-palette-primary-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {isJobDescriptionExpanded ? (
                      <>
                        Show less
                        <CaretUpIcon fontSize="var(--icon-fontSize-md)" />
                      </>
                    ) : (
                      <>
                        See more
                        <CaretDownIcon fontSize="var(--icon-fontSize-md)" />
                      </>
                    )}
                  </Typography>
                </Box>
              ) : null}
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`${job.remoteInPerson} • ${job.paidUnpaid} • ${job.hoursPerWeek} hours/week`}
                size="small"
                sx={{
                  backgroundColor: 'var(--mui-palette-neutral-50)',
                  color: 'var(--mui-palette-neutral-700)',
                  fontWeight: 500,
                  height: '28px',
                  border: '1px solid var(--mui-palette-divider)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: 'var(--mui-palette-neutral-100)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
                  },
                }}
              />
              {job.location ? (
                <Chip
                  icon={<MapPinIcon fontSize="var(--icon-fontSize-md)" />}
                  label={job.location}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--mui-palette-neutral-50)',
                    color: 'var(--mui-palette-neutral-700)',
                    fontWeight: 500,
                  }}
                />
              ) : null}
              <Chip
                label={`Posted on: ${dayjs(job.created_At).format('MMM D, YYYY')}`}
                size="small"
                sx={{
                  backgroundColor: 'var(--mui-palette-neutral-50)',
                  color: 'var(--mui-palette-neutral-700)',
                  fontWeight: 500,
                }}
              />
              <Chip
                label={`Start: ${dayjs(job.idealStartDate).format('MMM D, YYYY')}`}
                size="small"
                sx={{
                  backgroundColor: 'var(--mui-palette-neutral-50)',
                  color: 'var(--mui-palette-neutral-700)',
                  fontWeight: 500,
                }}
              />
              <Chip
                label={`End: ${dayjs(job.anticipatedEndDate).format('MMM D, YYYY')}`}
                size="small"
                sx={{
                  backgroundColor: 'var(--mui-palette-neutral-50)',
                  color: 'var(--mui-palette-neutral-700)',
                  fontWeight: 500,
                }}
              />
            </Stack>
            <Box sx={{ mt: 2 }}>
              {job.jobPostingURL && (
                <Typography
                  variant="body2"
                  component={motion.div}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when clicking the link
                    window.open(job.jobPostingURL, '_blank', 'noopener,noreferrer');
                  }}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'var(--mui-palette-primary-main)',
                    fontWeight: 500,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  whileHover={{ x: 2 }}
                >
                  View Job Posting
                  <ArrowSquareOutIcon fontSize="var(--icon-fontSize-md)" />
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </MotionCard>
  );
}
