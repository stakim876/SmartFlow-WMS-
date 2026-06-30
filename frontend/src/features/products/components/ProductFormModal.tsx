import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { Product, ProductInput } from '@/features/products/api/products';
import { uploadImage } from '@/shared/api/upload';
import { COMMON, ERRORS, PRODUCTS, ADVANCED } from '@/shared/constants/labels';
import styles from './ProductFormModal.module.css';
interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (input: ProductInput) => Promise<void>;
}

const emptyForm: ProductInput = {
  sku: '',
  name: '',
  description: '',
  imageUrl: '',
  unit: 'EA',
  price: 0,
};

export function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        unit: product.unit,
        price: product.price,
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const handleChange = (field: keyof ProductInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const result = await uploadImage(file);
      handleChange('imageUrl', result.url);
    } catch {
      setError(ERRORS.saveFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        ...form,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
      });
    } catch {
      setError(ERRORS.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{product ? PRODUCTS.editTitle : PRODUCTS.addTitle}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            SKU
            <input
              value={form.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            {COMMON.name}
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            {COMMON.description}
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </label>
          <label className={styles.label}>
            {COMMON.imageUrl}
            <div className={styles.imageRow}>
              <input
                value={form.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                className={styles.input}
                placeholder="https://"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUpload(file);
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {ADVANCED.uploadImage}
              </Button>
            </div>
          </label>          <div className={styles.row}>
            <label className={styles.label}>
              {COMMON.unit}
              <input
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              {COMMON.price}
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                className={styles.input}
                required
              />
            </label>
          </div>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {COMMON.cancel}
            </Button>
            <Button type="submit" loading={loading}>
              {COMMON.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
