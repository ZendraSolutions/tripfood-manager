/**
 * ShoppingListPage - Planning shopping list with CSV export
 * Shows products to be purchased for the trip based on consumption planning
 */
import { type FC } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import { Card, Button, Loading, EmptyState, ErrorDisplay } from '../../components/common';
import { useShoppingList, useParticipants } from '../../hooks';
import styles from './ShoppingListPage.module.css';

export const ShoppingListPage: FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const {
    shoppingList,
    isLoading: shoppingLoading,
    error: shoppingError,
    downloadCSV
  } = useShoppingList(tripId || '');
  const { participants, isLoading: participantsLoading } = useParticipants(tripId || '');

  const isLoading = shoppingLoading || participantsLoading;
  const error = shoppingError;

  // Group items by category
  const itemsByCategory = shoppingList?.items.reduce<Record<string, typeof shoppingList.items>>((acc, item) => {
    const category = item.product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {}) || {};

  const categoryLabels: Record<string, string> = {
    food: 'Comida',
    beverage: 'Bebidas',
    other: 'Otros',
  };

  const categoryOrder = ['food', 'beverage', 'other'];

  /**
   * Handle CSV export
   */
  const handleExportCSV = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      await downloadCSV(`lista-compras-${date}.csv`);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Calculate totals
  const totalItems = shoppingList?.items.length || 0;
  const participantCount = participants.length;

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
          message={error.message}
        />
      </MainLayout>
    );
  }

  if (!shoppingList || shoppingList.items.length === 0) {
    return (
      <MainLayout showSidebar tripName="Viaje">
        <div className={styles.page}>
          <div className={styles.header}>
            <h1 className={styles.title}>Lista de Compras Planificada</h1>
          </div>
          <EmptyState
            title="No hay productos planificados"
            description="Registra consumos planificados para generar la lista de compras"
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
            <h1 className={styles.title}>Lista de Compras Planificada</h1>
            <p className={styles.subtitle}>
              {totalItems} productos planificados para {participantCount} participantes
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              aria-label="Exportar lista de compras como CSV"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className={styles.progressCard}>
          <div className={styles.progressContent}>
            <div className={styles.progressHeader}>
              <span className={styles.progressTitle}>Resumen de planificacion</span>
            </div>
            <div className={styles.progressStats}>
              <div className={styles.progressStat}>
                <span className={styles.statValue}>{totalItems}</span>
                <span className={styles.statLabel}>Productos</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.statValue}>{participantCount}</span>
                <span className={styles.statLabel}>Participantes</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.statValue}>{Object.keys(itemsByCategory).length}</span>
                <span className={styles.statLabel}>Categorias</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Shopping Lists by Category */}
        <div className={styles.listsContainer}>
          {categoryOrder.map((category) => {
            const categoryItems = itemsByCategory[category];
            if (!categoryItems || categoryItems.length === 0) return null;

            return (
              <Card
                key={category}
                title={categoryLabels[category] || category}
                subtitle={`${categoryItems.length} productos`}
                className={styles.categoryCard}
              >
                <ul className={styles.productList}>
                  {categoryItems.map((item) => (
                    <li
                      key={item.product.id}
                      className={styles.productItem}
                    >
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{item.product.name}</span>
                        <span className={styles.productQuantity}>
                          {item.totalQuantity} {item.unit}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Participants Summary */}
        {participants.length > 0 && (
          <Card title="Participantes del viaje" className={styles.costCard}>
            <div className={styles.costContent}>
              <div className={styles.participantsList}>
                {participants.map((participant) => (
                  <div key={participant.id} className={styles.participantCost}>
                    <div className={styles.participantInfo}>
                      <div className={styles.avatar}>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{participant.name}</span>
                    </div>
                    {participant.email && (
                      <span className={styles.participantAmount}>
                        {participant.email}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
