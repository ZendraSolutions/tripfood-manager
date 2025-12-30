/**
 * TripsPage - List of trips with CRUD operations
 */
import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import {
  Button,
  Card,
  Input,
  Modal,
  Loading,
  EmptyState,
  ErrorDisplay,
  ConfirmDialog,
} from '../../components/common';
import { useTrips, useModal } from '../../hooks';
import styles from './TripsPage.module.css';

/**
 * Form data for creating a trip (uses string dates for HTML inputs)
 */
interface TripFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export const TripsPage: FC = () => {
  const navigate = useNavigate();
  const { trips, isLoading, error, createTrip, deleteTrip, clearError } = useTrips();

  // Modal states
  const createModal = useModal();
  const deleteModal = useModal();

  // Form state
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    if (!formData.startDate) {
      errors.startDate = 'La fecha de inicio es obligatoria';
    }
    if (!formData.endDate) {
      errors.endDate = 'La fecha de fin es obligatoria';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Convert string dates to Date objects for the DTO
      const newTrip = await createTrip({
        name: formData.name,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
      createModal.close();
      resetForm();
      navigate(`/trips/${newTrip.id}`);
    } catch (err) {
      // Error is handled by useTrips hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (tripId: string) => {
    setTripToDelete(tripId);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;

    try {
      await deleteTrip(tripToDelete);
      deleteModal.close();
      setTripToDelete(null);
    } catch (err) {
      // Error is handled by useTrips hook
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    createModal.open();
  };

  const renderContent = () => {
    if (isLoading && trips.length === 0) {
      return <Loading message="Cargando viajes..." />;
    }

    if (error) {
      return (
        <ErrorDisplay
          title="Error al cargar viajes"
          message={error.message}
          onRetry={clearError}
        />
      );
    }

    if (trips.length === 0) {
      return (
        <EmptyState
          title="No tienes viajes todavia"
          description="Crea tu primer viaje para empezar a organizar las compras del grupo"
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Crear viaje
            </Button>
          }
        />
      );
    }

    return (
      <div className={styles.tripGrid}>
        {trips.map((trip) => (
          <Card
            key={trip.id}
            title={trip.name}
            className={styles.tripCard}
            headerActions={
              <button
                type="button"
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(trip.id);
                }}
                aria-label={`Eliminar ${trip.name}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            }
          >
            <div className={styles.tripContent}>
              {trip.description && (
                <p className={styles.tripDescription}>{trip.description}</p>
              )}
              <div className={styles.tripMeta}>
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
                      year: 'numeric',
                    })} - {new Date(trip.endDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <Link to={`/trips/${trip.id}`} className={styles.viewLink}>
                <Button variant="primary" fullWidth>
                  Ver viaje
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainLayout showNav>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mis Viajes</h1>
          <Button variant="primary" onClick={handleOpenCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo viaje
          </Button>
        </div>

        {renderContent()}

        {/* Create Trip Modal */}
        <Modal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          title="Crear nuevo viaje"
          size="md"
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Nombre del viaje"
              placeholder="Ej: Viaje a la playa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              required
              fullWidth
            />
            <Input
              label="Descripcion"
              placeholder="Describe brevemente el viaje"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
            />
            <div className={styles.dateRow}>
              <Input
                type="date"
                label="Fecha de inicio"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                error={formErrors.startDate}
                required
                fullWidth
              />
              <Input
                type="date"
                label="Fecha de fin"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                error={formErrors.endDate}
                required
                fullWidth
              />
            </div>
            <div className={styles.formActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={createModal.close}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Crear viaje
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          onConfirm={handleConfirmDelete}
          title="Eliminar viaje"
          message="Estas seguro de que quieres eliminar este viaje? Esta accion no se puede deshacer y se eliminaran todos los datos asociados."
          confirmText="Eliminar"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};
