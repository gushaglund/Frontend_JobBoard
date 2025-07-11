import * as React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { DynamicLayout } from '@/components/dashboard/layout/dynamic-layout';
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <React.Fragment>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '72px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': '280px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <DynamicLayout>
        <main>{children}</main>
      </DynamicLayout>
    </React.Fragment>
  );
}
