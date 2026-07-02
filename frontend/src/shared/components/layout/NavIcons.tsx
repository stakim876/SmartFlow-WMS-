import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="13" width="7" height="8" rx="1.5" />
    </IconBase>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
      <path d="M12 12v9" />
    </IconBase>
  );
}

export function IconBoxes(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="M12 12 20 7.5" />
      <path d="M12 12v9" />
      <path d="M12 12 4 7.5" />
    </IconBase>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="m5 12 7 7 7-7" />
    </IconBase>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </IconBase>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 21V5a1 1 0 0 1 1-1h5v17" />
      <path d="M10 8h2" />
      <path d="M10 12h2" />
      <path d="M10 16h2" />
      <path d="M14 21V9a1 1 0 0 1 1-1h5v13" />
      <path d="M17 12h2" />
      <path d="M17 16h2" />
    </IconBase>
  );
}

export function IconClipboard(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="7" y="4" width="10" height="4" rx="1" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <rect x="5" y="8" width="14" height="13" rx="2" />
    </IconBase>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function IconBell(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.3 21a1.7 1.7 0 0 0 3.4 0" />
      <path d="M4 8a8 8 0 0 1 16 0c0 7 3 9 3 9H1s3-2 3-9" />
    </IconBase>
  );
}

export function IconLink(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </IconBase>
  );
}

export function IconWarehouse(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 9 12 4l9 5v11H3V9Z" />
      <path d="M9 22V12h6v10" />
      <path d="M3 9h18" />
    </IconBase>
  );
}

export function IconReport(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3h9l3 3v15H6V3Z" />
      <path d="M15 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M9 9h3" />
    </IconBase>
  );
}

export type NavIconName =
  | 'dashboard'
  | 'reports'
  | 'products'
  | 'inventory'
  | 'warehouses'
  | 'inbound'
  | 'outbound'
  | 'partners'
  | 'purchaseOrders'
  | 'users'
  | 'notices'
  | 'shopIntegration';

const iconMap = {
  dashboard: IconDashboard,
  reports: IconReport,
  products: IconPackage,
  inventory: IconBoxes,
  warehouses: IconWarehouse,
  inbound: IconArrowDown,
  outbound: IconArrowUp,
  partners: IconBuilding,
  purchaseOrders: IconClipboard,
  users: IconUsers,
  notices: IconBell,
  shopIntegration: IconLink,
} as const;

export function NavIcon({ name, ...props }: { name: NavIconName } & IconProps) {
  const Icon = iconMap[name];
  return <Icon {...props} />;
}
