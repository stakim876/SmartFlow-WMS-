import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { fetchProducts, Product } from '@/features/products/api/products';
import { fetchActivePartners, Partner } from '@/features/partners/api/partners';
import { fetchLocations, LocationOption } from '@/features/inventory/api/inventory';
import { CreateOrderItem } from '@/features/inbound/api/inbound';
import { COMMON, INBOUND } from '@/shared/constants/labels';
import styles from './InboundFormModal.module.css';

interface InboundFormModalProps {
  onClose: () => void;
  onSave: (input: {
    partnerId?: string;
    note?: string;
    items: CreateOrderItem[];
  }) => Promise<void>;
}

interface FormItem extends CreateOrderItem {
  key: string;
}

export function InboundFormModal({ onClose, onSave }: InboundFormModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<FormItem[]>([
    { key: '1', productId: '', quantity: 1, locationId: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchProducts({ limit: 100 }),
      fetchActivePartners(),
      fetchLocations(),
    ]).then(([p, pt, l]) => {
      setProducts(p.items);
      setPartners(pt);
      setLocations(l);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({
        partnerId: partnerId || undefined,
        note: note || undefined,
        items: items.map(({ productId, quantity, locationId }) => ({
          productId,
          quantity,
          locationId: locationId || undefined,
        })),
      });
    } catch {
      setError(INBOUND.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{INBOUND.formTitle}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {INBOUND.partnerOptional}
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className={styles.input}
            >
              <option value="">{COMMON.none}</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            {COMMON.note}
            <input value={note} onChange={(e) => setNote(e.target.value)} className={styles.input} />
          </label>
          <div className={styles.itemsHeader}>
            <span>{INBOUND.items}</span>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  { key: String(Date.now()), productId: '', quantity: 1, locationId: '' },
                ])
              }
            >
              {INBOUND.addItem}
            </button>
          </div>
          {items.map((item, index) => (
            <div key={item.key} className={styles.itemRow}>
              <select
                value={item.productId}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, productId: e.target.value } : row,
                    ),
                  )
                }
                className={styles.input}
                required
              >
                <option value="">{INBOUND.selectProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, quantity: Number(e.target.value) } : row,
                    ),
                  )
                }
                className={styles.qtyInput}
                required
              />
              <select
                value={item.locationId ?? ''}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, locationId: e.target.value } : row,
                    ),
                  )
                }
                className={styles.input}
              >
                <option value="">{INBOUND.locationOnComplete}</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              {items.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  {COMMON.delete}
                </button>
              )}
            </div>
          ))}
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {COMMON.cancel}
            </Button>
            <Button type="submit" loading={loading}>
              {COMMON.register}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
