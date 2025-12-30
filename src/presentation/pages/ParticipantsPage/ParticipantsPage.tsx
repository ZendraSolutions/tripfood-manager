/**
 * ParticipantsPage - Manage trip participants
 */
import { useState, type FC, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import {
  Button,
  Input,
  Table,
  Modal,
  Loading,
  EmptyState,
  ErrorDisplay,
  ConfirmDialog,
  type TableColumn,
} from '../../components/common';
import { useParticipants, useModal, type Participant, type IParticipantUpdateDTO } from '../../hooks';
import styles from './ParticipantsPage.module.css';

export const ParticipantsPage: FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const {
    participants,
    isLoading,
    error,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    clearError,
  } = useParticipants(tripId || '');

  // Modal states
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Form state - using domain DTO compatible structure
  interface ParticipantFormData {
    name: string;
    email: string;
    notes: string;
  }
  const [formData, setFormData] = useState<ParticipantFormData>({
    name: '',
    email: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);

  const resetForm = () => {
    setFormData({ name: '', email: '', notes: '' });
    setFormErrors({});
    setEditingParticipant(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es valido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createParticipant({
        name: formData.name,
        email: formData.email || undefined,
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
    if (!validateForm() || !editingParticipant) return;

    setIsSubmitting(true);
    try {
      const updateData: IParticipantUpdateDTO = {
        name: formData.name,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
      };
      await updateParticipant(editingParticipant.id, updateData);
      editModal.close();
      resetForm();
    } catch (_err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({
      name: participant.name,
      email: participant.email || '',
      notes: participant.notes || '',
    });
    editModal.open();
  };

  const handleOpenDelete = (participant: Participant) => {
    setParticipantToDelete(participant);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!participantToDelete) return;

    try {
      await deleteParticipant(participantToDelete.id);
      deleteModal.close();
      setParticipantToDelete(null);
    } catch (_err) {
      // Error handled by hook
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    createModal.open();
  };

  const columns: TableColumn<Participant>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (participant) => (
        <div className={styles.nameCell}>
          <div className={styles.avatar}>
            {participant.name.charAt(0).toUpperCase()}
          </div>
          <span>{participant.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (participant) => participant.email || '-',
    },
    {
      key: 'notes',
      header: 'Notas',
      render: (participant) => participant.notes || '-',
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (participant) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => handleOpenEdit(participant)}
            aria-label={`Editar ${participant.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={() => handleOpenDelete(participant)}
            aria-label={`Eliminar ${participant.name}`}
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
    if (isLoading && participants.length === 0) {
      return <Loading message="Cargando participantes..." />;
    }

    if (error) {
      return (
        <ErrorDisplay
          title="Error al cargar participantes"
          message={error.message}
          onRetry={clearError}
        />
      );
    }

    if (participants.length === 0) {
      return (
        <EmptyState
          title="No hay participantes"
          description="Anade participantes al viaje para empezar a organizar las compras"
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Anadir participante
            </Button>
          }
        />
      );
    }

    return (
      <Table
        data={participants}
        columns={columns}
        getRowKey={(p) => p.id}
      />
    );
  };

  const renderForm = (onSubmit: (e: FormEvent) => void, isEdit = false) => (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        label="Nombre"
        placeholder="Nombre del participante"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={formErrors.name}
        required
        fullWidth
      />
      <Input
        type="email"
        label="Email"
        placeholder="email@ejemplo.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={formErrors.email}
        fullWidth
      />
      <Input
        label="Notas"
        placeholder="Notas adicionales (alergias, preferencias...)"
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

  return (
    <MainLayout showSidebar tripName="Viaje">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Participantes</h1>
            <p className={styles.subtitle}>
              {participants.length} participantes en total
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Anadir participante
          </Button>
        </div>

        {renderContent()}

        {/* Create Modal */}
        <Modal
          isOpen={createModal.isOpen}
          onClose={() => { createModal.close(); resetForm(); }}
          title="Anadir participante"
          size="sm"
        >
          {renderForm(handleCreate)}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => { editModal.close(); resetForm(); }}
          title="Editar participante"
          size="sm"
        >
          {renderForm(handleEdit, true)}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          onClose={() => { deleteModal.close(); setParticipantToDelete(null); }}
          onConfirm={handleConfirmDelete}
          title="Eliminar participante"
          message={`Estas seguro de que quieres eliminar a "${participantToDelete?.name}"? Esta accion no se puede deshacer.`}
          confirmText="Eliminar"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};
