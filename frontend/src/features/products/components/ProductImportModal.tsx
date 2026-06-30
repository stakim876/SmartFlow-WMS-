import { useRef, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { importProductsExcel } from '@/shared/api/import';
import { ADVANCED, COMMON, ERRORS } from '@/shared/constants/labels';
import formStyles from '@/shared/styles/form.shared.module.css';

interface ProductImportModalProps {
  onClose: () => void;
  onComplete: () => Promise<void>;
}

export function ProductImportModal({ onClose, onComplete }: ProductImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    try {
      const importResult = await importProductsExcel(file);
      setResult(ADVANCED.importResult(importResult.created, importResult.skipped));
      if (importResult.errors.length > 0) {
        setError(importResult.errors.slice(0, 3).join('\n'));
      }
      await onComplete();
    } catch {
      setError(ERRORS.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={formStyles.overlay} onClick={onClose}>
      <div className={formStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={formStyles.title}>{ADVANCED.importTitle}</h2>
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <p className={formStyles.hint}>{ADVANCED.importHint}</p>
          {error && <div className={formStyles.error}>{error}</div>}
          {result && <div className={formStyles.success}>{result}</div>}
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className={formStyles.file} />
          <div className={formStyles.actions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {COMMON.cancel}
            </Button>
            <Button type="submit" loading={loading}>
              {ADVANCED.importExcel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
