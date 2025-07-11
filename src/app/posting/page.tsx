'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

import { type Job } from '@/components/dashboard/jobs/job-card';
import JobPosting from '@/components/dashboard/jobs/job-posting';

export default function JobPostingPage() {
  const searchParams = useSearchParams();
  const idRaw = searchParams.get('id');
  const id = idRaw === null ? undefined : idRaw;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`https://backend.searchfundfellows.com/api/jobs/jobs/${id}`)
      .then((res) => res.json())
      .then((data: Job) => {
        setJob(data);
      })
      .catch(() => {
        setJob(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  if (!job)
    return (
      <Box sx={{ textAlign: 'center', color: 'error.main', py: 6 }}>
        <Typography variant="h6">Job not found.</Typography>
      </Box>
    );

  return <JobPosting job={job} />;
}
