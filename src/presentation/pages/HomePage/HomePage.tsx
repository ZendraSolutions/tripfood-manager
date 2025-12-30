/**
 * HomePage - Landing page with trip selector, quick actions, and general statistics
 */
import { useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import { Button, Card, Loading, EmptyState } from '../../components/common';
import { useTrips } from '../../hooks';
import styles from './HomePage.module.css';

/**
 * Statistics interface for dashboard display
 */
interface DashboardStats {
  totalTrips: number;
  totalParticipants: number;
  upcomingTrips: number;
  pastTrips: number;
}

export const HomePage: FC = () => {
  const { trips, isLoading, error } = useTrips();

  // Get recent trips (last 3)
  const recentTrips = trips.slice(0, 3);

  // Calculate general statistics
  // Note: Trip entity doesn't have participantCount, would need to be fetched separately per trip
  const stats = useMemo<DashboardStats>(() => {
    const now = new Date();
    const upcoming = trips.filter((trip) => new Date(trip.startDate) > now).length;
    const past = trips.filter((trip) => new Date(trip.endDate) < now).length;
    // ParticipantCount is not available on Trip entity
    const totalParticipants = 0;

    return {
      totalTrips: trips.length,
      totalParticipants,
      upcomingTrips: upcoming,
      pastTrips: past,
    };
  }, [trips]);

  const renderContent = () => {
    if (isLoading) {
      return <Loading message="Cargando viajes..." />;
    }

    if (error) {
      return (
        <div className={styles.error}>
          <p>{error.message}</p>
        </div>
      );
    }

    return (
      <>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>TripFood Manager</h1>
            <p className={styles.heroSubtitle}>
              Organiza las compras de comida y bebida para tus viajes en grupo de manera facil y colaborativa
            </p>
            <div className={styles.heroActions}>
              <Link to="/trips">
                <Button variant="primary" size="lg">
                  Ver mis viajes
                </Button>
              </Link>
              <Link to="/trips/new">
                <Button variant="secondary" size="lg">
                  Crear nuevo viaje
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImage} aria-hidden="true">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="var(--color-primary-100)" />
              <path
                d="M60 80h80v60a10 10 0 01-10 10H70a10 10 0 01-10-10V80z"
                fill="var(--color-primary-500)"
              />
              <rect x="70" y="60" width="60" height="20" rx="5" fill="var(--color-primary-600)" />
              <circle cx="85" cy="110" r="8" fill="white" />
              <circle cx="115" cy="110" r="8" fill="white" />
              <rect x="90" y="125" width="20" height="5" rx="2" fill="white" />
            </svg>
          </div>
        </section>

        {/* Statistics Section */}
        {trips.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Estadisticas generales</h2>
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.totalTrips}</span>
                    <span className={styles.statLabel}>Viajes totales</span>
                  </div>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.totalParticipants}</span>
                    <span className={styles.statLabel}>Participantes totales</span>
                  </div>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.upcomingTrips}</span>
                    <span className={styles.statLabel}>Viajes proximos</span>
                  </div>
                </div>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon} style={{ background: 'var(--color-gray-100)', color: 'var(--color-gray-600)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stats.pastTrips}</span>
                    <span className={styles.statLabel}>Viajes completados</span>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Recent Trips Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Viajes recientes</h2>
            <Link to="/trips" className={styles.sectionLink}>
              Ver todos
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <EmptyState
              title="No tienes viajes todavia"
              description="Crea tu primer viaje para empezar a organizar las compras del grupo"
              action={
                <Link to="/trips/new">
                  <Button variant="primary">Crear viaje</Button>
                </Link>
              }
            />
          ) : (
            <div className={styles.tripGrid}>
              {recentTrips.map((trip) => (
                <Link key={trip.id} to={`/trips/${trip.id}`} className={styles.tripLink}>
                  <Card
                    title={trip.name}
                    subtitle={trip.description}
                    interactive
                    className={styles.tripCard}
                  >
                    <div className={styles.tripInfo}>
                      <div className={styles.tripDate}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>
                          {new Date(trip.startDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })} - {new Date(trip.endDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className={styles.tripParticipants}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                        <span>{trip.getDurationInDays()} dias</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Funcionalidades</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Gestion de participantes</h3>
              <p className={styles.featureDescription}>
                Anade y gestiona los participantes del viaje facilmente
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Catalogo de productos</h3>
              <p className={styles.featureDescription}>
                Crea una lista completa de productos necesarios para el viaje
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Matriz de disponibilidad</h3>
              <p className={styles.featureDescription}>
                Cada participante indica que productos puede conseguir
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Lista de compras</h3>
              <p className={styles.featureDescription}>
                Genera automaticamente la lista de compras optimizada
              </p>
            </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <MainLayout showNav>
      <div className={styles.page}>
        {renderContent()}
      </div>
    </MainLayout>
  );
};
