import * as React from 'react';
import RouterLink from 'next/link';
import { Container, Stack } from '@mui/material';
import Box from '@mui/material/Box';

import { Logo } from '../core/logo';

export interface SplitLayoutProps {
  children: React.ReactNode;
}

export function SplitLayout({ children }: SplitLayoutProps): React.JSX.Element {
  return (
    <Box>
      <div>
        <Box
          component="header"
          sx={{
            bgcolor: '#F4F8FF',
            color: '#143066',
            left: 0,
            position: 'sticky',
            right: 0,
            top: 0,
            zIndex: 'var(--MainNav-zIndex)',
          }}
        >
          <Container maxWidth="lg" sx={{ display: 'flex', minHeight: 'var(--MainNav-height)', py: '15px', ml: 20 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
              <Box component={RouterLink} href="https://jobs.searchfundfellows.com" sx={{ display: 'inline-flex' }}>
                <Logo color="light" height={30} width={180} />
              </Box>
            </Stack>
          </Container>
        </Box>
      </div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#082439',
        }}
      >
        <Box
          sx={{
            bgcolor: '#ffffff',
            boxShadow: 'var(--mui-shadows-8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '420px',
            width: '100%',
            p: 3,
            borderRadius: '20px',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
