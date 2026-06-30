import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { fetchProducts, Product } from '@/features/products/api/products';
import { fetchActivePartners, Partner } from '@/features/partners/api/partners';
import { CreatePurchaseOrderItem } from '@/features/purchase-orders/api/purchaseOrders';
import { COMMON, PURCHASE_ORDERS } from '@/shared/constants/labels';
import styles from './PurchaseOrderFormModal.module.css';

interface PurchaseOrderFormModalProps {
  onClose: () => void;
  onSave: (input: {
    partnerId: string;
    note?: string;
    items: CreatePurchaseOrderItem[];
  }) => Promise<void>;
}

interface FormItem extends CreatePurchaseOrderItem {
  key: string;
}

export function PurchaseOrderFormModal({ onClose, onSave }: PurchaseOrderFormModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<FormItem[]>([
    { key: '1', productId: '', quantity: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchProducts({ limit: 100 }), fetchActivePartners()]).then(([p, pt]) => {
      setProducts(p.items);
      setPartners(pt);
    });
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({
        partnerId,
        note: note || undefined,
        items: items.map(({ productId, quantity, unitPrice }) => ({
          productId,
          quantity,
          unitPrice,
        })),
      });
    } catch {
      setError(PURCHASE_ORDERS.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              productId,
              unitPrice: product ? product.price : row.unitPrice,
            }
          : row,
      ),
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{PURCHASE_ORDERS.formTitle}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {PURCHASE_ORDERS.partnerRequired}
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className={styles.input}
              required
            >
              <option value="">{PURCHASE_ORDERS.selectPartner}</option>
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
            <span>{PURCHASE_ORDERS.items}</span>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  { key: String(Date.now()), productId: '', quantity: 1, unitPrice: 0 },
                ])
              }
            >
              {PURCHASE_ORDERS.addItem}
            </button>
          </div>
          {items.map((item, index) => (
            <div key={item.key} className={styles.itemRow}>
              <select
                value={item.productId}
                onChange={(e) => handleProductChange(index, e.target.value)}
                className={styles.input}
                required
              >
                <option value="">{PURCHASE_ORDERS.selectProduct}</option>
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
              <input
                type="number"
                min={0}
                value={item.unitPrice}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, unitPrice: Number(e.target.value) } : row,
                    ),
                  )
                }
                className={styles.priceInput}
                required
              />
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
          <div className={styles.totalRow}>
            {PURCHASE_ORDERS.totalAmount}: {totalAmount.toLocaleString()}
            {COMMON.currency}
          </div>
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
