import type { Settings } from '@/types/settings';
import { config } from '@/config';

export function applyDefaultSettings(settings: Partial<Settings>): Settings {
  return {
    primaryColor: config.site.primaryColor,
    direction: 'ltr',
    navColor: 'evident',
    layout: 'vertical',
    language: config.site.language,
    ...settings,
  };
}
