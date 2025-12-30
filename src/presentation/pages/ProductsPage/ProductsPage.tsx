/**
 * ProductsPage - Manage trip products catalog
 * Simplified version matching domain entity structure
 */
import { useState, type FC, type FormEvent } from 'react';
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
import { useProducts, useModal, type Product, type IProductUpdateDTO } from '../../hooks';
import type { ProductCategory, ProductType, ProductUnit } from '@domain/types';
import styles from './ProductsPage.module.css';

const categoryOptions: SelectOption[] = [
  { value: 'beverage', label: 'Bebida' },
  { value: 'food', label: 'Comida' },
];

const typeOptions: SelectOption[] = [
  { value: 'water', label: 'Agua' },
  { value: 'soda', label: 'Refresco' },
  { value: 'juice', label: 'Zumo' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'meat', label: 'Carne' },
  { value: 'dairy', label: 'Lacteos' },
  { value: 'grains', label: 'Cereales' },
  { value: 'vegetables', label: 'Verduras' },
  { value: 'fruits', label: 'Frutas' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'other', label: 'Otro' },
];

const unitOptions: SelectOption[] = [
  { value: 'unit', label: 'Unidad' },
  { value: 'bottle', label: 'Botella' },
  { value: 'can', label: 'Lata' },
  { value: 'pack', label: 'Paquete' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'liter', label: 'Litro' },
];

const categoryLabels: Record<ProductCategory, string> = {
  beverage: 'Bebida',
  food: 'Comida',
  other: 'Otro',
};

interface ProductFormData {
  name: string;
  category: ProductCategory;
  type: ProductType;
  unit: ProductUnit;
  defaultQuantityPerPerson: number;
  notes: string;
}

export const ProductsPage: FC = () => {
  const {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
  } = useProducts();

  // Modal states
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: 'food',
    type: 'miscellaneous',
    unit: 'unit',
    defaultQuantityPerPerson: 1,
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
      category: 'food',
      type: 'miscellaneous',
      unit: 'unit',
      defaultQuantityPerPerson: 1,
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createProduct({
        name: formData.name,
        category: formData.category,
        type: formData.type,
        unit: formData.unit,
        defaultQuantityPerPerson: formData.defaultQuantityPerPerson,
        notes: formData.notes || undefined,
      });
      createModal.close();
      resetForm();
    } catch (_err) {
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
      const updateData: IProductUpdateDTO = {
        name: formData.name,
        category: formData.category,
        type: formData.type,
        unit: formData.unit,
        defaultQuantityPerPerson: formData.defaultQuantityPerPerson,
        notes: formData.notes || null,
      };
      await updateProduct(editingProduct.id, updateData);
      editModal.close();
      resetForm();
    } catch (_err) {
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
      type: product.type,
      unit: product.unit,
      defaultQuantityPerPerson: product.defaultQuantityPerPerson ?? 1,
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
    } catch (_err) {
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
      key: 'unit',
      header: 'Unidad',
      align: 'center',
      render: (product) => <span>{product.unit}</span>,
    },
    {
      key: 'defaultQuantity',
      header: 'Cantidad/Persona',
      align: 'center',
      render: (product) => <span>{product.defaultQuantityPerPerson ?? '-'}</span>,
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
          message={error.message}
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
      <Select
        label="Tipo"
        options={typeOptions}
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
        required
        fullWidth
      />
      <div className={styles.row}>
        <Input
          type="number"
          label="Cantidad por persona"
          value={formData.defaultQuantityPerPerson.toString()}
          onChange={(e) => setFormData({ ...formData, defaultQuantityPerPerson: parseInt(e.target.value) || 1 })}
          required
          fullWidth
        />
        <Select
          label="Unidad"
          options={unitOptions}
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
          required
          fullWidth
        />
      </div>
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

  const totalProducts = products.length;

  return (
    <MainLayout showSidebar tripName="Viaje">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Productos</h1>
            <p className={styles.subtitle}>
              {totalProducts} productos en el catalogo
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
