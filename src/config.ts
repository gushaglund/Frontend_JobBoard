import { AuthStrategy } from '@/lib/auth/strategy';
import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';
import type { PrimaryColor } from '@/styles/theme/types';

export interface Config {
  site: {
    name: string;
    description: string;
    language: string;
    themeColor: string;
    primaryColor: PrimaryColor;
    url: string;
    version: string;
  };
  logLevel: keyof typeof LogLevel;
  auth: { strategy: keyof typeof AuthStrategy };
  auth0: { secret?: string; baseUrl?: string; issuerBaseUrl?: string; clientId?: string; clientSecret?: string };
  cognito: { identityPoolId?: string; userPoolClientId?: string; userPoolId?: string };
  firebase: {
    apiKey?: string;
    appId?: string;
    authDomain?: string;
    messagingSenderId?: string;
    projectId?: string;
    storageBucket?: string;
  };
  supabase: { url?: string; anonKey?: string; roleKey?: string };
  airtable: { apiKey?: string; baseId?: string };
  mapbox: { apiKey?: string };
  gtm?: { id?: string };
}

export const config = {
  site: {
    name: 'Search Fund Fellows',
    description: '',
    language: 'en',
    themeColor: '#090a0b',
    primaryColor: 'neonBlue',
    url: getSiteURL(),
    version: process.env.NEXT_PUBLIC_SITE_VERSION || '0.0.0',
  },
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) || LogLevel.ALL,
  auth: { strategy: (process.env.NEXT_PUBLIC_AUTH_STRATEGY as keyof typeof AuthStrategy) || AuthStrategy.CUSTOM },
  auth0: {
    secret: process.env.AUTH0_SECRET,
    baseUrl: process.env.AUTH0_BASE_URL,
    issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
  },
  cognito: {
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  },
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    roleKey: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  },
  airtable: {
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
    baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
  },
  mapbox: { apiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY },
  gtm: { id: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID },
} satisfies Config;
