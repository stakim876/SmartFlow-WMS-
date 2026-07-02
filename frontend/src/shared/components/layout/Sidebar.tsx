import { NavLink } from 'react-router-dom';
import { NAV, NAV_SECTIONS } from '@/shared/constants/labels';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { NavIcon, NavIconName } from '@/shared/components/layout/NavIcons';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: NavIconName;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: NAV_SECTIONS.overview,
    items: [
      { to: '/dashboard', label: NAV.dashboard, icon: 'dashboard' },
      { to: '/reports', label: NAV.reports, icon: 'reports' },
    ],
  },
  {
    title: NAV_SECTIONS.logistics,
    items: [
      { to: '/products', label: NAV.products, icon: 'products' },
      { to: '/inventory', label: NAV.inventory, icon: 'inventory' },
      { to: '/warehouses', label: NAV.warehouses, icon: 'warehouses' },
      { to: '/inbound', label: NAV.inbound, icon: 'inbound' },
      { to: '/outbound', label: NAV.outbound, icon: 'outbound' },
    ],
  },
  {
    title: NAV_SECTIONS.trade,
    items: [
      { to: '/partners', label: NAV.partners, icon: 'partners' },
      { to: '/purchase-orders', label: NAV.purchaseOrders, icon: 'purchaseOrders' },
      { to: '/shop-integration', label: NAV.shopIntegration, icon: 'shopIntegration' },
    ],
  },
  {
    title: NAV_SECTIONS.system,
    items: [
      { to: '/users', label: NAV.users, icon: 'users', adminOnly: true },
      { to: '/notices', label: NAV.notices, icon: 'notices' },
    ],
  },
];

export function Sidebar() {
  const isAdmin = useAuthStore((s) => s.user?.role.name === 'ADMIN');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>SF</div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>SmartFlow</span>
          <span className={styles.logoSub}>Warehouse</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navSections.map((section) => {
          const items = section.items.filter((item) => !item.adminOnly || isAdmin);
          if (items.length === 0) return null;

          return (
            <div key={section.title} className={styles.section}>
              <div className={styles.sectionTitle}>{section.title}</div>
              <div className={styles.sectionItems}>
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                  >
                    <span className={styles.icon}>
                      <NavIcon name={item.icon} />
                    </span>
                    <span className={styles.label}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <span className={styles.footerBadge}>WMS</span>
        <span className={styles.footerText}>v0.1</span>
      </div>
    </aside>
  );
}
