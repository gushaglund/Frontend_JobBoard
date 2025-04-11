import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

// NOTE: We did not use React Components for Icons, because
//  you may one to get the config from the server.

// NOTE: First level elements are groups.

export interface LayoutConfig {
  navItems: NavItemConfig[];
}

export const layoutConfig = {
  navItems: [
    {
      key: 'dashboards',
      title: 'Dashboards',
      items: [
        { key: 'Calculator', title: 'Calculator', href: paths.dashboard.overview, icon: 'calculator' },
        {
          key: 'Smart Adjustments',
          title: 'Smart Adjustments',
          href: paths.dashboard.analytics,
          icon: 'smart_adjustment',
        },
        {
          key: 'Progress Tracking Chart',
          title: 'Tracking Chart',
          href: paths.dashboard.track,
          icon: 'tracking_chart',
        },
        {
          key: 'Periodization References',
          title: 'Periodization References',
          href: paths.dashboard.academy.details('1'),
          icon: 'graduation-cap',
        },
      ],
    },
  ],
} satisfies LayoutConfig;
