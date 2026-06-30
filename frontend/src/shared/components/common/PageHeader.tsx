import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, eyebrow = 'WMS', action }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
