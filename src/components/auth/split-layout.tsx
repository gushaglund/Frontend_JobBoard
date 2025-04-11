import * as React from 'react';
import RouterLink from 'next/link';
import { Container, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';

import { paths } from '@/paths';

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
            bgcolor: '#f5f5f5',
            color: '#143066',
            left: 0,
            position: 'sticky',
            right: 0,
            top: 0,
            zIndex: 'var(--MainNav-zIndex)',
          }}
        >
          <Container maxWidth="lg" sx={{ display: 'flex', minHeight: 'var(--MainNav-height)', py: '15px', ml: '-5px' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
              {/* <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
                <Logo color="light" height={50} width={50} />
              </Box> */}
              <Box component="nav" sx={{ display: { xs: 'none', md: 'block' } }}>
                <Stack component="ul" direction="row" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  <Box sx={{ display: 'inline-flex', textDecoration: 'none' }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      fontFamily="'Mollen Personal Use', sans-serif"
                      color="#143066"
                    >
                      Search Fund Fellows
                    </Typography>
                  </Box>
                </Stack>
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
        }}
      >
        <Box
          sx={{
            boxShadow: 'var(--mui-shadows-8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '420px',
            width: '100%',
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
