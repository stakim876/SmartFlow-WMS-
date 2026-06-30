import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  createPartner,
  deletePartner,
  fetchPartners,
  Partner,
  PartnerInput,
  PartnerType,
  updatePartner,
} from '@/features/partners/api/partners';
import { PartnerFormModal } from '@/features/partners/components/PartnerFormModal';
import { COMMON, ERRORS, NAV, PARTNER_TYPE, PARTNERS } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './PartnersPage.module.css';
export function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'' | PartnerType>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadPartners = async (
    page = 1,
    keyword = search,
    selectedType: '' | PartnerType = type,
  ) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchPartners({
        page,
        limit: 20,
        search: keyword || undefined,
        type: selectedType || undefined,
      });
      setPartners(result.items);
      setMeta({
        page: result.meta.page,
        totalPages: result.meta.totalPages,
        total: result.meta.total,
      });
    } catch {
      setError(ERRORS.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPartners(1, search, type);
  };

  const handleSave = async (input: PartnerInput) => {
    if (editingPartner) {
      await updatePartner(editingPartner.id, input);
    } else {
      await createPartner(input);
    }
    setModalOpen(false);
    setEditingPartner(null);
    await loadPartners(meta.page, search, type);
  };

  const handleDelete = async (partner: Partner) => {
    if (!window.confirm(PARTNERS.deleteConfirm(partner.name))) {
      return;
    }
    await deletePartner(partner.id);
    await loadPartners(meta.page, search, type);
  };

  return (
    <div>
      <PageHeader
        title={NAV.partners}
        description={PARTNERS.description(meta.total)}
        action={
          <Button
            onClick={() => {
              setEditingPartner(null);
              setModalOpen(true);
            }}
          >
            {PARTNERS.add}
          </Button>
        }
      />

      <form onSubmit={handleSearch} className={tableStyles.searchBar}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={PARTNERS.searchPlaceholder}
          className={tableStyles.searchInput}
        />        <select
          value={type}
          onChange={(e) => setType(e.target.value as '' | PartnerType)}
          className={styles.typeSelect}
        >
          <option value="">{PARTNERS.allTypes}</option>
          {Object.entries(PARTNER_TYPE).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          {COMMON.search}
        </Button>
      </form>

      {error && <div className={tableStyles.error}>{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>            <thead>
              <tr>
                <th>{COMMON.partnerCode}</th>
                <th>{COMMON.partnerName}</th>
                <th>{COMMON.partnerType}</th>
                <th>{COMMON.contactName}</th>
                <th>{COMMON.phone}</th>
                <th>{COMMON.email}</th>
                <th>{COMMON.status}</th>
                <th>{COMMON.actions}</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={8} className={tableStyles.empty}>                    {PARTNERS.empty}
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id}>
                    <td>{partner.code}</td>
                    <td>{partner.name}</td>
                    <td>
                      <span className={styles.typeBadge}>
                        {PARTNER_TYPE[partner.type] ?? partner.type}
                      </span>
                    </td>
                    <td>{partner.contactName ?? '-'}</td>
                    <td>{partner.phone ?? '-'}</td>
                    <td>{partner.email ?? '-'}</td>
                    <td>
                      <span
                        className={
                          partner.isActive ? styles.badgeActive : styles.badgeInactive
                        }
                      >
                        {partner.isActive ? COMMON.active : COMMON.inactive}
                      </span>
                    </td>
                    <td>
                      <div className={tableStyles.actions}>                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPartner(partner);
                            setModalOpen(true);
                          }}
                        >
                          {COMMON.edit}
                        </Button>
                        {partner.isActive && (
                          <Button
                            variant="ghostDanger"
                            size="sm"
                            onClick={() => handleDelete(partner)}
                          >
                            {COMMON.delete}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className={tableStyles.pagination}>          <Button
            variant="secondary"
            disabled={meta.page <= 1}
            onClick={() => loadPartners(meta.page - 1, search, type)}
          >
            {COMMON.prev}
          </Button>
          <span>
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={meta.page >= meta.totalPages}
            onClick={() => loadPartners(meta.page + 1, search, type)}
          >
            {COMMON.next}
          </Button>
        </div>
      )}

      {modalOpen && (
        <PartnerFormModal
          partner={editingPartner}
          onClose={() => {
            setModalOpen(false);
            setEditingPartner(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
