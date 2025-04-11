import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { AuthGuard } from '@/components/auth/auth-guard';
import { SplitLayout } from '@/components/auth/split-layout';
import { UpdatePasswordForm } from '@/components/auth/supabase/update-password-form';

export const metadata = { title: `Update password | Supabase | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <AuthGuard>
      <SplitLayout>
        <UpdatePasswordForm />
      </SplitLayout>
    </AuthGuard>
  );
}
