/**
 * ProductsPage - Manage trip products catalog
 */
import { useState, type FC, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import {
  Button,
  Input,
  Select,
  Table,
  Modal,
  Loading,
  EmptyState,
  ErrorDisplay,
  ConfirmDialog,
  type TableColumn,
  type SelectOption,
} from '../../components/common';
import { useProducts, useModal, type Product, type CreateProductInput, type ProductCategory } from '../../hooks';
import styles from './ProductsPage.module.css';

const categoryOptions: SelectOption[] = [
  { value: 'bebida', label: 'Bebida' },
  { value: 'comida', label: 'Comida' },
  { value: 'snack', label: 'Snack' },
  { value: 'otro', label: 'Otro' },
];

const categoryLabels: Record<ProductCategory, string> = {
  bebida: 'Bebida',
  comida: 'Comida',
  snack: 'Snack',
  otro: 'Otro',
};

export const ProductsPage: FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    togglePurchased,
    clearError,
  } = useProducts(tripId || '');

  // Modal states
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Form state
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    category: 'comida',
    unit: '',
    quantity: 1,
    estimatedPrice: undefined,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('');

  const filteredProducts = filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products;

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'comida',
      unit: '',
      quantity: 1,
      estimatedPrice: undefined,
      notes: '',
    });
    setFormErrors({});
    setEditingProduct(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    if (!formData.unit.trim()) {
      errors.unit = 'La unidad es obligatoria';
    }
    if (formData.quantity < 1) {
      errors.quantity = 'La cantidad debe ser al menos 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createProduct(formData);
      createModal.close();
      resetForm();
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingProduct) return;

    setIsSubmitting(true);
    try {
      await updateProduct({ id: editingProduct.id, ...formData });
      editModal.close();
      resetForm();
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      quantity: product.quantity,
      estimatedPrice: product.estimatedPrice,
      notes: product.notes || '',
    });
    editModal.open();
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id);
      deleteModal.close();
      setProductToDelete(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    createModal.open();
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Producto',
      render: (product) => (
        <div className={styles.productCell}>
          <span className={styles.productName}>{product.name}</span>
          {product.notes && (
            <span className={styles.productNotes}>{product.notes}</span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (product) => (
        <span className={`${styles.categoryBadge} ${styles[product.category]}`}>
          {categoryLabels[product.category]}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      align: 'center',
      render: (product) => (
        <span>{product.quantity} {product.unit}</span>
      ),
    },
    {
      key: 'price',
      header: 'Precio Est.',
      align: 'right',
      render: (product) => (
        product.estimatedPrice
          ? `${(product.estimatedPrice * product.quantity).toFixed(2)} EUR`
          : '-'
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (product) => (
        <button
          type="button"
          className={`${styles.statusBadge} ${product.isPurchased ? styles.purchased : styles.pending}`}
          onClick={() => togglePurchased(product.id)}
          aria-label={`Marcar ${product.name} como ${product.isPurchased ? 'pendiente' : 'comprado'}`}
        >
          {product.isPurchased ? 'Comprado' : 'Pendiente'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (product) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => handleOpenEdit(product)}
            aria-label={`Editar ${product.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={() => handleOpenDelete(product)}
            aria-label={`Eliminar ${product.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const renderContent = () => {
    if (isLoading && products.length === 0) {
      return <Loading message="Cargando productos..." />;
    }

    if (error) {
      return (
        <ErrorDisplay
          title="Error al cargar productos"
          message={error}
          onRetry={clearError}
        />
      );
    }

    if (products.length === 0) {
      return (
        <EmptyState
          title="No hay productos"
          description="Anade productos al catalogo para empezar a organizar las compras"
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Anadir producto
            </Button>
          }
        />
      );
    }

    return (
      <Table
        data={filteredProducts}
        columns={columns}
        getRowKey={(p) => p.id}
        emptyMessage="No hay productos en esta categoria"
      />
    );
  };

  const renderForm = (onSubmit: (e: FormEvent) => void, isEdit = false) => (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        label="Nombre del producto"
        placeholder="Ej: Agua mineral"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={formErrors.name}
        required
        fullWidth
      />
      <Select
        label="Categoria"
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
        required
        fullWidth
      />
      <div className={styles.row}>
        <Input
          type="number"
          label="Cantidad"
          value={formData.quantity.toString()}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          error={formErrors.quantity}
          required
          fullWidth
        />
        <Input
          label="Unidad"
          placeholder="Ej: botella, paquete"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          error={formErrors.unit}
          required
          fullWidth
        />
      </div>
      <Input
        type="number"
        label="Precio estimado (por unidad)"
        placeholder="0.00"
        value={formData.estimatedPrice?.toString() || ''}
        onChange={(e) => setFormData({
          ...formData,
          estimatedPrice: e.target.value ? parseFloat(e.target.value) : undefined,
        })}
        rightAddon="EUR"
        fullWidth
      />
      <Input
        label="Notas"
        placeholder="Notas adicionales..."
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        fullWidth
      />
      <div className={styles.formActions}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            (isEdit ? editModal : createModal).close();
            resetForm();
          }}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isEdit ? 'Guardar cambios' : 'Anadir'}
        </Button>
      </div>
    </form>
  );

  // Calculate totals
  const totalProducts = products.length;
  const purchasedCount = products.filter((p) => p.isPurchased).length;
  const estimatedTotal = products.reduce((sum, p) => sum + (p.estimatedPrice ?? 0) * p.quantity, 0);

  return (
    <MainLayout showSidebar tripName="Viaje">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Productos</h1>
            <p className={styles.subtitle}>
              {purchasedCount} de {totalProducts} comprados - Total estimado: {estimatedTotal.toFixed(2)} EUR
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Anadir producto
          </Button>
        </div>

        {/* Filters */}
        {products.length > 0 && (
          <div className={styles.filters}>
            <Select
              options={[
                { value: '', label: 'Todas las categorias' },
                ...categoryOptions,
              ]}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              size="sm"
            />
          </div>
        )}

        {renderContent()}

        {/* Create Modal */}
        <Modal
          isOpen={createModal.isOpen}
          onClose={() => { createModal.close(); resetForm(); }}
          title="Anadir producto"
          size="md"
        >
          {renderForm(handleCreate)}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => { editModal.close(); resetForm(); }}
          title="Editar producto"
          size="md"
        >
          {renderForm(handleEdit, true)}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          onClose={() => { deleteModal.close(); setProductToDelete(null); }}
          onConfirm={handleConfirmDelete}
          title="Eliminar producto"
          message={`Estas seguro de que quieres eliminar "${productToDelete?.name}"? Esta accion no se puede deshacer.`}
          confirmText="Eliminar"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};
