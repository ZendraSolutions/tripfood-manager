/**
 * AvailabilityPage - Matrix showing which participants can bring which products
 */
import { useState, useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import { Card, Loading, EmptyState, ErrorDisplay } from '../../components/common';
import { useParticipants, useProducts } from '../../hooks';
import styles from './AvailabilityPage.module.css';

interface AvailabilityMatrix {
  [participantId: string]: {
    [productId: string]: boolean;
  };
}

export const AvailabilityPage: FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { participants, isLoading: participantsLoading, error: participantsError } = useParticipants(tripId || '');
  const { products, isLoading: productsLoading, error: productsError } = useProducts();

  const [availability, setAvailability] = useState<AvailabilityMatrix>({});

  const isLoading = participantsLoading || productsLoading;
  const error = participantsError || productsError;

  // Initialize availability matrix
  useEffect(() => {
    const initialMatrix: AvailabilityMatrix = {};
    participants.forEach((p) => {
      const participantProducts: { [productId: string]: boolean } = {};
      products.forEach((prod) => {
        participantProducts[prod.id] = false;
      });
      initialMatrix[p.id] = participantProducts;
    });
    setAvailability(initialMatrix);
  }, [participants, products]);

  const toggleAvailability = (participantId: string, productId: string) => {
    setAvailability((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [productId]: !prev[participantId]?.[productId],
      },
    }));
  };

  // Calculate statistics
  const getProductAvailabilityCount = (productId: string): number => {
    return Object.values(availability).filter((p) => p[productId]).length;
  };

  const getParticipantAvailabilityCount = (participantId: string): number => {
    return Object.values(availability[participantId] || {}).filter(Boolean).length;
  };

  // All participants are considered active (no isActive property in domain)
  const activeParticipants = participants;

  if (isLoading) {
    return (
      <MainLayout showSidebar tripName="Viaje">
        <Loading message="Cargando matriz de disponibilidad..." />
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

  if (activeParticipants.length === 0 || products.length === 0) {
    return (
      <MainLayout showSidebar tripName="Viaje">
        <div className={styles.page}>
          <div className={styles.header}>
            <h1 className={styles.title}>Disponibilidad</h1>
            <p className={styles.subtitle}>
              Indica que productos puede traer cada participante
            </p>
          </div>
          <EmptyState
            title={activeParticipants.length === 0 ? 'No hay participantes' : 'No hay productos'}
            description={
              activeParticipants.length === 0
                ? 'Anade participantes al viaje para crear la matriz de disponibilidad'
                : 'Anade productos al catalogo para crear la matriz de disponibilidad'
            }
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
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
            <h1 className={styles.title}>Disponibilidad</h1>
            <p className={styles.subtitle}>
              Marca las casillas para indicar que productos puede traer cada participante
            </p>
          </div>
        </div>

        {/* Legend */}
        <Card className={styles.legend}>
          <div className={styles.legendContent}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.available}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Puede traer</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.unavailable}`} />
              <span>No disponible</span>
            </div>
          </div>
        </Card>

        {/* Matrix */}
        <div className={styles.matrixWrapper}>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th className={styles.cornerCell}>Producto / Participante</th>
                {activeParticipants.map((participant) => (
                  <th key={participant.id} className={styles.participantHeader}>
                    <div className={styles.participantInfo}>
                      <div className={styles.avatar}>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.participantName}>{participant.name}</span>
                      <span className={styles.participantCount}>
                        {getParticipantAvailabilityCount(participant.id)}
                      </span>
                    </div>
                  </th>
                ))}
                <th className={styles.totalHeader}>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const availabilityCount = getProductAvailabilityCount(product.id);
                const hasNoAvailability = availabilityCount === 0;

                return (
                  <tr
                    key={product.id}
                    className={hasNoAvailability ? styles.warningRow : ''}
                  >
                    <td className={styles.productCell}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productUnit}>
                        {product.unit}
                      </span>
                    </td>
                    {activeParticipants.map((participant) => {
                      const isAvailable = availability[participant.id]?.[product.id] || false;

                      return (
                        <td key={participant.id} className={styles.checkCell}>
                          <button
                            type="button"
                            className={`${styles.checkButton} ${isAvailable ? styles.checked : ''}`}
                            onClick={() => toggleAvailability(participant.id, product.id)}
                            aria-label={`${participant.name} ${isAvailable ? 'puede' : 'no puede'} traer ${product.name}`}
                            aria-pressed={isAvailable}
                          >
                            {isAvailable && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className={`${styles.totalCell} ${hasNoAvailability ? styles.warning : ''}`}>
                      {availabilityCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <Card title="Resumen" className={styles.summary}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{products.length}</span>
              <span className={styles.summaryLabel}>Productos totales</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{activeParticipants.length}</span>
              <span className={styles.summaryLabel}>Participantes</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={`${styles.summaryValue} ${products.filter((p) => getProductAvailabilityCount(p.id) === 0).length > 0 ? styles.warning : ''}`}>
                {products.filter((p) => getProductAvailabilityCount(p.id) === 0).length}
              </span>
              <span className={styles.summaryLabel}>Sin asignar</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>
                {products.filter((p) => getProductAvailabilityCount(p.id) > 0).length}
              </span>
              <span className={styles.summaryLabel}>Asignados</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
