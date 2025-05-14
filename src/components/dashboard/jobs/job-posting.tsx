import React from 'react';
import { Avatar, Box, Button, Grid, Link as MuiLink, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaFacebookF,
  FaGraduationCap,
  FaHourglassHalf,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTwitter,
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

import { type Job } from './job-card';

function CompanyInfoCard({
  logo,
  name,
  category,
  location,
  email,
  socials,
  website,
}: {
  logo?: string;
  name: string;
  category?: string;
  location?: string;
  phone?: string;
  email?: string;
  socials?: { type: string; url: string }[];
  website?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 3,
        bgcolor: '#f7fafd',
        boxShadow: '0 2px 12px 0 rgba(16,30,54,.08)',
        textAlign: 'center',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={logo}
          alt={name}
          sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: 'grey.100' }}
          variant="rounded"
        />
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {name}
          </Typography>
          <MuiLink target="_blank" rel="noopener" sx={{ display: 'block', mb: 1, color: '#3b82f6' }}>
            View Company Profile
          </MuiLink>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'left', mt: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="text.secondary">categories:</Typography>
          <Typography>{category}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="text.secondary">Location:</Typography>
          <Typography>{location}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="text.secondary">Email:</Typography>
          <MuiLink href={`mailto:${email}`} color="#3b82f6">
            {email}
          </MuiLink>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="text.secondary">Socials:</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {socials?.map((s, idx) => {
              if (s.type === 'facebook')
                return (
                  <MuiLink key={idx} href={s.url} color="#3b82f6">
                    <FaFacebookF />
                  </MuiLink>
                );
              if (s.type === 'twitter')
                return (
                  <MuiLink key={idx} href={s.url} color="#3b82f6">
                    <FaTwitter />
                  </MuiLink>
                );
              if (s.type === 'linkedin')
                return (
                  <MuiLink key={idx} href={s.url} color="#3b82f6">
                    <FaLinkedinIn />
                  </MuiLink>
                );
              if (s.type === 'instagram')
                return (
                  <MuiLink key={idx} href={s.url} color="#3b82f6">
                    <FaInstagram />
                  </MuiLink>
                );
              return null;
            })}
          </Box>
        </Box>
      </Box>
      {website ? (
        <Box
          sx={{
            bgcolor: 'rgba(59, 130, 246, 0.08)',
            borderRadius: 2,
            py: 1,
            mt: 2,
          }}
        >
          <MuiLink href={website} target="_blank" rel="noopener" sx={{ color: '#3b82f6', fontWeight: 500 }}>
            {website}
          </MuiLink>
        </Box>
      ) : null}
    </Paper>
  );
}

export default function JobPosting({ job }: { job: Job }) {
  if (!job) return <Typography>No job data found.</Typography>;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          bgcolor: 'white',
          borderRadius: 3,
          px: { xs: 2, sm: 3, md: 5, lg: 10 },
          py: { xs: 2, sm: 3, md: 5 },
          boxShadow: 1,
          mb: 4,
          gap: { xs: 2, md: 0 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar
            src={job.companyLogo?.[0]?.url || job.companyLogo?.[0]?.thumbnails?.small?.url}
            alt={job.companyName}
            sx={{
              width: { xs: 60, sm: 80, md: 100 },
              height: { xs: 60, sm: 80, md: 100 },
              borderRadius: 2,
              bgcolor: 'grey.100',
              mb: { xs: 2, md: 0 },
            }}
            variant="rounded"
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1, fontSize: { xs: 18, sm: 22, md: 28 } }}>
              {job.jobTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaBriefcase size={16} />
                <Typography variant="body2" color="text.secondary">
                  {job.jobType?.join(', ') || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaMapMarkerAlt size={16} />
                <Typography variant="body2" color="text.secondary">
                  {job.location || job.remoteInPerson}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaCalendarAlt size={16} />
                <Typography variant="body2" color="text.secondary">
                  {dayjs(job.created_At).format('MMM D, YYYY')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FaMoneyBillWave size={16} />
                <Typography variant="body2" color="text.secondary">
                  {job.paidUnpaid}
                </Typography>
              </Box>
              {job.hoursPerWeek ? (
                <Typography variant="body2" color="text.secondary">
                  {job.hoursPerWeek} hrs/week
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>
        {/* Right: Deadline + Apply */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-end' },
            gap: 2,
            width: { xs: '100%', md: 'auto' },
            mt: { xs: 2, md: 0 },
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, textAlign: { xs: 'center', md: 'left' } }}>
            Application ends: <b style={{ color: 'red' }}>{dayjs(job.anticipatedEndDate).format('MMM D, YYYY')}</b>
          </Typography>
          {job.applicationLink ? (
            <MuiLink href={job.applicationLink} target="_blank" rel="noopener noreferrer" underline="none">
              <Button
                size="large"
                sx={{ minWidth: { xs: '100%', md: 215 }, backgroundColor: '#52cab1', color: 'white', hover: 'none' }}
              >
                Apply Now
              </Button>
            </MuiLink>
          ) : (
            <Button
              size="large"
              sx={{ minWidth: { xs: '100%', md: 215 }, backgroundColor: '#52cab1', color: 'white', hover: 'none' }}
            >
              Apply Now
            </Button>
          )}
        </Box>
      </Box>
      {/* DETAILS */}
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
          <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3, border: '0px' }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Job Description
            </Typography>
            <ReactMarkdown>{job.jobDescription}</ReactMarkdown>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} order={{ xs: 1, md: 2 }}>
          <CompanyInfoCard
            logo={job.companyLogo?.[0]?.url}
            name={job.companyName}
            category={job.companyType}
            location={job.location}
            email={job.email}
            socials={[
              { type: 'facebook', url: '#' },
              { type: 'twitter', url: '#' },
              { type: 'linkedin', url: '#' },
              { type: 'instagram', url: '#' },
            ]}
            website={job.website}
          />
          <Paper elevation={0} sx={{ p: { xs: 3, md: 3 }, borderRadius: 3, mb: 3, bgcolor: '#f7fafd' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Job Overview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <FaCalendarAlt color="#2563eb" size={22} style={{ marginTop: 2 }} />
              <Box>
                <Typography fontWeight={600} color="text.primary">
                  Date Posted
                </Typography>
                <Typography color="text.secondary">{dayjs(job.created_At).format('MMM D, YYYY')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <FaMapMarkerAlt color="#2563eb" size={22} style={{ marginTop: 2 }} />
              <Box>
                <Typography fontWeight={600} color="text.primary">
                  Location
                </Typography>
                <Typography color="text.secondary">{job.location || job.remoteInPerson}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <FaMoneyBillWave color="#2563eb" size={22} style={{ marginTop: 2 }} />
              <Box>
                <Typography fontWeight={600} color="text.primary">
                  Compensation
                </Typography>
                <Typography color="text.secondary">
                  {job.paidUnpaid} {job.hoursPerWeek ? `(${job.hoursPerWeek} hrs/week)` : ''}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <FaHourglassHalf color="#2563eb" size={22} style={{ marginTop: 2 }} />
              <Box>
                <Typography fontWeight={600} color="text.primary">
                  Ideal Start Date
                </Typography>
                <Typography color="text.secondary">{dayjs(job.idealStartDate).format('MMM D, YYYY')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <FaHourglassHalf color="#2563eb" size={22} style={{ marginTop: 2 }} />
              <Box>
                <Typography fontWeight={600} color="text.primary">
                  Anticipated end date
                </Typography>
                <Typography color="text.secondary">{dayjs(job.anticipatedEndDate).format('MMM D, YYYY')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <FaGraduationCap color="#2563eb" size={22} style={{ marginTop: 2 }} />
              <Box>
                <Typography fontWeight={600} color="text.primary">
                  Candidate Type
                </Typography>
                <Typography color="text.secondary">{job.jobType?.join(', ') || '-'}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
