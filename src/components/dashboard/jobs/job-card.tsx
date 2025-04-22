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

export function JobCard({ job }: JobCardProps): React.JSX.Element {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleDescription = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when toggling description
    setIsDescriptionExpanded(!isDescriptionExpanded);
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
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer',
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
              border: '1px solid var(--mui-palette-divider)',
            }}
            alt={`${job.companyName} logo`}
          />
        }
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Chip
                  label={job.companyType}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--mui-palette-primary-50)',
                    color: 'var(--mui-palette-primary-main)',
                    fontWeight: 500,
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
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
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
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                {job.jobTitle}
              </Typography>
              {job.jobType.map((type) => (
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
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  color: 'var(--mui-palette-text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {job.jobDescription}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`${job.remoteInPerson} • ${job.paidUnpaid} • ${job.hoursPerWeek} hours/week`}
                size="small"
                sx={{
                  backgroundColor: 'var(--mui-palette-neutral-50)',
                  color: 'var(--mui-palette-neutral-700)',
                  fontWeight: 500,
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
