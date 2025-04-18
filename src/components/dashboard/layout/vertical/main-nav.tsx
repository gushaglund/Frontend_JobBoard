'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';

import type { NavItemConfig } from '@/types/nav';
import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { Logo } from '@/components/core/logo';

import { MobileNav } from '../mobile-nav';
import { UserPopover } from '../user-popover/user-popover';

export interface MainNavProps {
  items: NavItemConfig[];
}

export function MainNav({ items }: MainNavProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          '--MainNav-background': 'var(--mui-palette-background-default)',
          // '--MainNav-divider': 'var(--mui-palette-divider)',
          bgcolor: '#edf9f7',
          left: 0,
          position: 'sticky',
          pt: { lg: 'var(--Layout-gap)' },
          top: 0,
          width: '100%',
          zIndex: 'var(--MainNav-zIndex)',
          height: 60,
        }}
      >
        <Box
          sx={{
            borderBottom: '1px solid var(--MainNav-divider)',
            display: 'flex',
            flex: '1 1 auto',
            minHeight: 'var(--MainNav-height)',
            px: { xs: 2, lg: 3 },
            py: 1,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              flex: '1 1 auto',
              justifyContent: 'space-between',
              width: '100%',
              px: 2,
            }}
          >
            <Stack
              component="ul"
              direction="row"
              spacing={1}
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                alignItems: 'center',
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', flex: '1 1 auto', pt: '5px', pb: '5px', ml: 20 }}
              >
                <Box component={RouterLink} href="https://jobs.searchfundfellows.com" sx={{ display: 'inline-flex' }}>
                  <Logo color="light" height={30} width={180} />
                </Box>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Divider
                flexItem
                orientation="vertical"
                sx={{ borderColor: 'var(--MainNav-divider)', display: { xs: 'none', lg: 'block' } }}
              />
              <UserButton />
            </Stack>
          </Stack>
        </Box>
      </Box>
      {/* <MobileNav
        items={items}
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      /> */}
    </React.Fragment>
  );
}

function UserButton(): React.JSX.Element {
  const popover = usePopover<HTMLButtonElement>();
  const { user } = useUser();

  return (
    <React.Fragment>
      <Box
        component="button"
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        sx={{ border: 'none', background: 'transparent', cursor: 'pointer', p: 0 }}
      >
        <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          color="success"
          sx={{
            '& .MuiBadge-dot': {
              border: '2px solid var(--MainNav-background)',
              borderRadius: '50%',
              bottom: '6px',
              height: '12px',
              right: '6px',
              width: '12px',
            },
          }}
          variant="dot"
        >
          <Avatar src={user?.avatar} />
        </Badge>
      </Box>
      <UserPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
    </React.Fragment>
  );
}
