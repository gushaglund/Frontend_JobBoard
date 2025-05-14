'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { type Job } from '../../../components/dashboard/jobs/job-card';
import JobPosting from '../../../components/dashboard/jobs/job-posting';

export default function JobPostingPage() {
  const searchParams = useSearchParams();
  const idRaw = searchParams.get('id');
  const id = idRaw === null ? undefined : idRaw;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/jobs/jobs/${id}`)
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

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found.</div>;

  return <JobPosting job={job} />;
}
