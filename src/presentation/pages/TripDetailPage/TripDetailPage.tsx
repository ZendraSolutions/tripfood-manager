/**
 * TripDetailPage - Dashboard for a specific trip
 */
import type { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import { Card, Button, Loading, EmptyState, ErrorDisplay } from '../../components/common';
import { useTrips, useParticipants, useProducts } from '../../hooks';
import styles from './TripDetailPage.module.css';

export const TripDetailPage: FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const { participants, isLoading: participantsLoading } = useParticipants(tripId || '');
  const { products, isLoading: productsLoading } = useProducts(tripId || '');

  const trip = trips.find((t) => t.id === tripId);
  const isLoading = tripsLoading || participantsLoading || productsLoading;

  // Calculate statistics
  const activeParticipants = participants.filter((p) => p.isActive).length;
  const purchasedProducts = products.filter((p) => p.isPurchased).length;
  const pendingProducts = products.length - purchasedProducts;
  const estimatedTotal = products.reduce((sum, p) => sum + (p.estimatedPrice ?? 0) * p.quantity, 0);
  const completionPercentage = products.length > 0
    ? Math.round((purchasedProducts / products.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <MainLayout showSidebar tripName="Cargando...">
        <Loading message="Cargando viaje..." />
      </MainLayout>
    );
  }

  if (tripsError) {
    return (
      <MainLayout showSidebar>
        <ErrorDisplay
          title="Error al cargar el viaje"
          message={tripsError}
        />
      </MainLayout>
    );
  }

  if (!trip) {
    return (
      <MainLayout showSidebar>
        <EmptyState
          title="Viaje no encontrado"
          description="El viaje que buscas no existe o ha sido eliminado"
          action={
            <Link to="/trips">
              <Button variant="primary">Volver a viajes</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar tripName={trip.name}>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{trip.name}</h1>
            {trip.description && (
              <p className={styles.description}>{trip.description}</p>
            )}
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {new Date(trip.startDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })} - {new Date(trip.endDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {trip.location && (
                <span className={styles.metaItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {trip.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{activeParticipants}</span>
                <span className={styles.statLabel}>Participantes activos</span>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{products.length}</span>
                <span className={styles.statLabel}>Productos totales</span>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{pendingProducts}</span>
                <span className={styles.statLabel}>Por comprar</span>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ background: 'var(--color-gray-100)', color: 'var(--color-gray-600)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{estimatedTotal.toFixed(2)}EUR</span>
                <span className={styles.statLabel}>Coste estimado</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress */}
        <Card title="Progreso de compras" className={styles.progressCard}>
          <div className={styles.progressContent}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className={styles.progressInfo}>
              <span>{purchasedProducts} de {products.length} productos comprados</span>
              <span className={styles.progressPercentage}>{completionPercentage}%</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className={styles.actionsGrid}>
          <Link to={`/trips/${tripId}/participants`} className={styles.actionLink}>
            <Card interactive className={styles.actionCard}>
              <div className={styles.actionContent}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h3>Participantes</h3>
                  <p>Gestiona los miembros del viaje</p>
                </div>
                <svg className={styles.actionArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Card>
          </Link>

          <Link to={`/trips/${tripId}/products`} className={styles.actionLink}>
            <Card interactive className={styles.actionCard}>
              <div className={styles.actionContent}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h3>Productos</h3>
                  <p>Gestiona el catalogo de productos</p>
                </div>
                <svg className={styles.actionArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Card>
          </Link>

          <Link to={`/trips/${tripId}/availability`} className={styles.actionLink}>
            <Card interactive className={styles.actionCard}>
              <div className={styles.actionContent}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h3>Disponibilidad</h3>
                  <p>Matriz de quien trae que</p>
                </div>
                <svg className={styles.actionArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Card>
          </Link>

          <Link to={`/trips/${tripId}/shopping`} className={styles.actionLink}>
            <Card interactive className={styles.actionCard}>
              <div className={styles.actionContent}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h3>Lista de compras</h3>
                  <p>Ver y gestionar la lista final</p>
                </div>
                <svg className={styles.actionArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};
