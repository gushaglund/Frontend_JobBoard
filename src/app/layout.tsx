import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import '@/styles/global.css';

import { config } from '@/config';
import { applyDefaultSettings } from '@/lib/settings/apply-default-settings';
import { getSettings as getPersistedSettings } from '@/lib/settings/get-settings';
import { UserProvider } from '@/contexts/auth/user-context';
import { SettingsProvider } from '@/contexts/settings';
import { Analytics } from '@/components/core/analytics';
import { I18nProvider } from '@/components/core/i18n-provider';
import { LocalizationProvider } from '@/components/core/localization-provider';
// import { SettingsButton } from '@/components/core/settings/settings-button';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { Toaster } from '@/components/core/toaster';

export const metadata = { title: config.site.name } satisfies Metadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: config.site.themeColor,
} satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps): Promise<React.JSX.Element> {
  const settings = applyDefaultSettings(await getPersistedSettings());

  return (
    <html lang={settings.language} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <Analytics>
          <LocalizationProvider>
            <UserProvider>
              <SettingsProvider settings={settings}>
                <I18nProvider lng={settings.language}>
                  <ThemeProvider>
                    {children}
                    <Toaster
                      position="top-center"
                      offset="100px"
                      toastOptions={{
                        className: 'custom-toast',
                        style: {
                          borderRadius: '15px',
                          padding: '16px',
                          fontSize: '16px',
                        },
                      }}
                    />
                  </ThemeProvider>
                </I18nProvider>
              </SettingsProvider>
            </UserProvider>
          </LocalizationProvider>
        </Analytics>
      </body>
    </html>
  );
}
