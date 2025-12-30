/**
 * ShoppingListPage - Final shopping list with assignments
 */
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import { Card, Button, Loading, EmptyState, ErrorDisplay } from '../../components/common';
import { useParticipants, useProducts } from '../../hooks';
import styles from './ShoppingListPage.module.css';

export const ShoppingListPage: FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { participants, isLoading: participantsLoading, error: participantsError } = useParticipants(tripId || '');
  const { products, isLoading: productsLoading, error: productsError, togglePurchased } = useProducts(tripId || '');

  const isLoading = participantsLoading || productsLoading;
  const error = participantsError || productsError;

  // Group products by category
  const productsByCategory = products.reduce<Record<string, typeof products>>((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    bebida: 'Bebidas',
    comida: 'Comida',
    snack: 'Snacks',
    otro: 'Otros',
  };

  const categoryOrder = ['bebida', 'comida', 'snack', 'otro'];

  // Calculate totals
  const purchasedCount = products.filter((p) => p.isPurchased).length;
  const pendingCount = products.length - purchasedCount;
  const estimatedTotal = products.reduce((sum, p) => sum + (p.estimatedPrice ?? 0) * p.quantity, 0);
  const purchasedTotal = products
    .filter((p) => p.isPurchased)
    .reduce((sum, p) => sum + (p.estimatedPrice ?? 0) * p.quantity, 0);
  const completionPercentage = products.length > 0
    ? Math.round((purchasedCount / products.length) * 100)
    : 0;

  const activeParticipants = participants.filter((p) => p.isActive);
  const costPerPerson = activeParticipants.length > 0
    ? estimatedTotal / activeParticipants.length
    : 0;

  if (isLoading) {
    return (
      <MainLayout showSidebar tripName="Viaje">
        <Loading message="Cargando lista de compras..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout showSidebar tripName="Viaje">
        <ErrorDisplay
          title="Error al cargar datos"
          message={error}
        />
      </MainLayout>
    );
  }

  if (products.length === 0) {
    return (
      <MainLayout showSidebar tripName="Viaje">
        <div className={styles.page}>
          <div className={styles.header}>
            <h1 className={styles.title}>Lista de Compras</h1>
          </div>
          <EmptyState
            title="No hay productos"
            description="Anade productos al catalogo para generar la lista de compras"
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
            }
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar tripName="Viaje">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Lista de Compras</h1>
            <p className={styles.subtitle}>
              {pendingCount} productos pendientes de {products.length} totales
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Exportar
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className={styles.progressCard}>
          <div className={styles.progressContent}>
            <div className={styles.progressHeader}>
              <span className={styles.progressTitle}>Progreso de compras</span>
              <span className={styles.progressPercentage}>{completionPercentage}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className={styles.progressStats}>
              <div className={styles.progressStat}>
                <span className={styles.statValue}>{purchasedCount}</span>
                <span className={styles.statLabel}>Comprados</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.statValue}>{pendingCount}</span>
                <span className={styles.statLabel}>Pendientes</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.statValue}>{purchasedTotal.toFixed(2)} EUR</span>
                <span className={styles.statLabel}>Gastado</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.statValue}>{estimatedTotal.toFixed(2)} EUR</span>
                <span className={styles.statLabel}>Total Est.</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Shopping Lists by Category */}
        <div className={styles.listsContainer}>
          {categoryOrder.map((category) => {
            const categoryProducts = productsByCategory[category];
            if (!categoryProducts || categoryProducts.length === 0) return null;

            const categoryPurchased = categoryProducts.filter((p) => p.isPurchased).length;

            return (
              <Card
                key={category}
                title={categoryLabels[category]}
                subtitle={`${categoryPurchased}/${categoryProducts.length} comprados`}
                className={styles.categoryCard}
              >
                <ul className={styles.productList}>
                  {categoryProducts.map((product) => (
                    <li
                      key={product.id}
                      className={`${styles.productItem} ${product.isPurchased ? styles.purchased : ''}`}
                    >
                      <button
                        type="button"
                        className={styles.checkbox}
                        onClick={() => togglePurchased(product.id)}
                        aria-label={`Marcar ${product.name} como ${product.isPurchased ? 'pendiente' : 'comprado'}`}
                        aria-pressed={product.isPurchased}
                      >
                        {product.isPurchased && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.name}</span>
                        <span className={styles.productQuantity}>
                          {product.quantity} {product.unit}
                        </span>
                      </div>
                      {product.estimatedPrice && (
                        <span className={styles.productPrice}>
                          {(product.estimatedPrice * product.quantity).toFixed(2)} EUR
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Cost Split */}
        <Card title="Reparto de costes" className={styles.costCard}>
          <div className={styles.costContent}>
            <div className={styles.costSummary}>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>Coste total estimado</span>
                <span className={styles.costValue}>{estimatedTotal.toFixed(2)} EUR</span>
              </div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>Participantes activos</span>
                <span className={styles.costValue}>{activeParticipants.length}</span>
              </div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>Coste por persona</span>
                <span className={`${styles.costValue} ${styles.highlight}`}>
                  {costPerPerson.toFixed(2)} EUR
                </span>
              </div>
            </div>
            {activeParticipants.length > 0 && (
              <div className={styles.participantsList}>
                {activeParticipants.map((participant) => (
                  <div key={participant.id} className={styles.participantCost}>
                    <div className={styles.participantInfo}>
                      <div className={styles.avatar}>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{participant.name}</span>
                    </div>
                    <span className={styles.participantAmount}>
                      {costPerPerson.toFixed(2)} EUR
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
