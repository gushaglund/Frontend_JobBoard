import * as React from 'react';
import type { Metadata } from 'next';


import { config } from '@/config';
import { JobsList } from '@/components/dashboard/jobs/jobs-list';

export const metadata = { title: config.site.name, description: config.site.description } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <JobsList />;
}
