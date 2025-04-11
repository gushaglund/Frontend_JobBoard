import React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { JobsList } from '@/components/dashboard/jobs/jobs-list-common';

export const metadata = { title: `Browse | Jobs | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <JobsList />;
}
