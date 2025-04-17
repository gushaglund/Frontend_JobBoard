'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareOut as ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
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
}

interface JobCardProps {
  job: Job;
}

const MotionCard = motion(Card);

export function JobCard({ job }: JobCardProps): React.JSX.Element {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
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
        }
        sx={{
          '& .MuiCardHeader-content': {
            overflow: 'hidden',
          },
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            color: 'var(--mui-palette-text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {job.companyDescription}
        </Typography>
        <Divider sx={{ mb: 2, borderColor: 'var(--mui-palette-divider)' }} />
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
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
              {job.remoteInPerson === 'Remote' ? (
                <Chip
                  label="Remote"
                  size="small"
                  sx={{
                    backgroundColor: 'var(--mui-palette-success-50)',
                    color: 'var(--mui-palette-success-main)',
                    fontWeight: 500,
                  }}
                />
              ) : (
                <Chip
                  label="In person"
                  size="small"
                  sx={{
                    backgroundColor: 'var(--mui-palette-success-50)',
                    color: 'var(--mui-palette-success-main)',
                    fontWeight: 500,
                  }}
                />
              )}
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
                {job.companyDescription}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`${job.paidUnpaid} • ${job.hoursPerWeek} hours/week`}
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
                  component={motion.a}
                  href={job.jobPostingURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'var(--mui-palette-primary-main)',
                    fontWeight: 500,
                    textDecoration: 'none',
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
