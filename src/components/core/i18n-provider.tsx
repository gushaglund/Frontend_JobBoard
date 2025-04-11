'use client';

import * as React from 'react';
import { use } from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { logger } from '@/lib/default-logger';
import { de } from '@/locales/de';
import { en } from '@/locales/en';
import { es } from '@/locales/es';

use(initReactI18next)
  .init({
    debug: false,
    ns: Object.keys(en),
    defaultNS: 'common',
    fallbackNS: 'common',
    fallbackLng: 'en',
    resources: {
      de,
      en,
      es,
    },
  })
  .catch((err: unknown) => {
    logger.error('Failed to initialize i18n', err);
  });

export interface I18nProviderProps {
  children: React.ReactNode;
  lng?: string;
}

export function I18nProvider({ children, lng = 'en' }: I18nProviderProps): React.JSX.Element {
  const { i18n } = useTranslation();

  if (typeof window === 'undefined') {
    i18n.changeLanguage(lng).catch(() => {
      logger.error(`Failed to change language to ${lng}`);
    });
  }

  React.useEffect(() => {
    i18n.changeLanguage(lng).catch(() => {
      logger.error(`Failed to change language to ${lng}`);
    });
  }, [i18n, lng]);

  return <React.Fragment>{children}</React.Fragment>;
}
