import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  Product,
  ProductInput,
  updateProduct,
} from '@/features/products/api/products';
import { ProductFormModal } from '@/features/products/components/ProductFormModal';
import { ProductImportModal } from '@/features/products/components/ProductImportModal';
import { exportProductsExcel } from '@/shared/api/export';
import { COMMON, ERRORS, NAV, PRODUCTS, ADVANCED } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './ProductsPage.module.css';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'sku' | 'name' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadProducts = async (
    page = 1,
    keyword = search,
    selectedSortBy = sortBy,
    selectedSortOrder = sortOrder,
  ) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchProducts({
        page,
        limit: 20,
        search: keyword || undefined,
        sortBy: selectedSortBy,
        sortOrder: selectedSortOrder,
      });
      setProducts(result.items);
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
    loadProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(1, search, sortBy, sortOrder);
  };

  const handleExport = async () => {
    try {
      await exportProductsExcel();
    } catch {
      setError(ERRORS.actionFailed);
    }
  };

  const handleSave = async (input: ProductInput) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, input);
    } else {
      await createProduct(input);
    }
    setModalOpen(false);
    setEditingProduct(null);
    await loadProducts(meta.page, search);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(PRODUCTS.deleteConfirm(product.name))) {
      return;
    }
    await deleteProduct(product.id);
    await loadProducts(meta.page, search);
  };

  return (
    <div>
      <PageHeader
        title={NAV.products}
        description={PRODUCTS.description(meta.total)}
        action={
          <div className={styles.headerActions}>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              {ADVANCED.exportExcel}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
              {ADVANCED.importExcel}
            </Button>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setModalOpen(true);
              }}
            >
              {PRODUCTS.add}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSearch} className={tableStyles.searchBar}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={PRODUCTS.searchPlaceholder}
          className={tableStyles.searchInput}
        />
        <Button type="submit" variant="secondary" size="sm">
          {COMMON.search}
        </Button>
        <select
          value={sortBy}
          onChange={(e) => {
            const next = e.target.value as typeof sortBy;
            setSortBy(next);
            loadProducts(1, search, next, sortOrder);
          }}
          className={styles.sortSelect}
        >
          <option value="createdAt">{ADVANCED.sortNewest}</option>
          <option value="sku">{ADVANCED.sortSku}</option>
          <option value="name">{ADVANCED.sortName}</option>
          <option value="price">{ADVANCED.sortPrice}</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => {
            const next = e.target.value as typeof sortOrder;
            setSortOrder(next);
            loadProducts(1, search, sortBy, next);
          }}
          className={styles.sortSelect}
        >
          <option value="desc">{ADVANCED.desc}</option>
          <option value="asc">{ADVANCED.asc}</option>
        </select>
      </form>

      {error && <div className={tableStyles.error}>{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>{COMMON.name}</th>
                <th>{COMMON.unit}</th>
                <th>{COMMON.price}</th>
                <th>{COMMON.status}</th>
                <th>{COMMON.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className={tableStyles.empty}>
                    {PRODUCTS.empty}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>
                      <div className={styles.productName}>
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt="" className={styles.thumb} />
                        )}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.unit}</td>
                    <td>
                      {product.price.toLocaleString()}
                      {COMMON.currency}
                    </td>
                    <td>
                      <span
                        className={
                          product.isActive ? styles.badgeActive : styles.badgeInactive
                        }
                      >
                        {product.isActive ? COMMON.active : COMMON.inactive}
                      </span>
                    </td>
                    <td>
                      <div className={tableStyles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setModalOpen(true);
                          }}
                        >
                          {COMMON.edit}
                        </Button>
                        <Button
                          variant="ghostDanger"
                          size="sm"
                          onClick={() => handleDelete(product)}
                        >
                          {COMMON.delete}
                        </Button>
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
        <div className={tableStyles.pagination}>
          <Button
            variant="secondary"
            disabled={meta.page <= 1}
            onClick={() => loadProducts(meta.page - 1, search)}
          >
            {COMMON.prev}
          </Button>
          <span>
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={meta.page >= meta.totalPages}
            onClick={() => loadProducts(meta.page + 1, search)}
          >
            {COMMON.next}
          </Button>
        </div>
      )}

      {importOpen && (
        <ProductImportModal
          onClose={() => setImportOpen(false)}
          onComplete={async () => loadProducts(meta.page, search, sortBy, sortOrder)}
        />
      )}

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
