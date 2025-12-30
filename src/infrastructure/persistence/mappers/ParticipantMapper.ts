/**
 * @fileoverview Mapper bidireccional para Participant (Domain) <-> ParticipantRecord (Persistence).
 *
 * Convierte entre la entidad de dominio Participant y el registro de persistencia
 * ParticipantRecord, manejando la serialización/deserialización de fechas.
 *
 * @module infrastructure/persistence/mappers/ParticipantMapper
 * @version 1.0.0
 */

import type { Participant } from '@domain/entities/Participant';
import type { ParticipantRecord } from '../indexeddb/database';

/**
 * Props necesarias para crear una entidad Participant desde el dominio.
 */
export interface ParticipantProps {
  id: string;
  tripId: string;
  name: string;
  email?: string | undefined;
  notes?: string | undefined;
  createdAt: Date;
}

/**
 * Mapper estático para conversión bidireccional Participant <-> ParticipantRecord.
 *
 * @class ParticipantMapper
 *
 * @example
 * ```typescript
 * // Domain -> Record
 * const record = ParticipantMapper.toRecord(participantEntity);
 *
 * // Record -> Domain Props
 * const props = ParticipantMapper.toDomainProps(record);
 * ```
 */
export class ParticipantMapper {
  /**
   * Constructor privado - clase estática.
   */
  private constructor() {
    // No instanciar
  }

  /**
   * Convierte una entidad de dominio Participant a un registro de persistencia.
   *
   * @param participant - Entidad de dominio Participant
   * @returns Registro de persistencia ParticipantRecord
   */
  public static toRecord(participant: Participant): ParticipantRecord {
    return {
      id: participant.id,
      tripId: participant.tripId,
      name: participant.name,
      email: participant.email,
      notes: participant.notes,
      createdAt: participant.createdAt.toISOString(),
    };
  }

  /**
   * Convierte un registro de persistencia a las props de dominio.
   *
   * @param record - Registro de persistencia ParticipantRecord
   * @returns Props para crear una entidad Participant
   */
  public static toDomainProps(record: ParticipantRecord): ParticipantProps {
    return {
      id: record.id,
      tripId: record.tripId,
      name: record.name,
      email: record.email,
      notes: record.notes,
      createdAt: new Date(record.createdAt),
    };
  }

  /**
   * Convierte un array de registros a array de props de dominio.
   *
   * @param records - Array de registros de persistencia
   * @returns Array de props para crear entidades Participant
   */
  public static toDomainPropsList(records: ParticipantRecord[]): ParticipantProps[] {
    return records.map((record) => ParticipantMapper.toDomainProps(record));
  }

  /**
   * Convierte un array de entidades a array de registros.
   *
   * @param participants - Array de entidades Participant
   * @returns Array de registros de persistencia
   */
  public static toRecordList(participants: Participant[]): ParticipantRecord[] {
    return participants.map((participant) => ParticipantMapper.toRecord(participant));
  }

  /**
   * Crea un registro parcial para actualizaciones.
   *
   * @param updates - Campos a actualizar
   * @returns Registro parcial para update
   */
  public static toPartialRecord(
    updates: Partial<Omit<ParticipantProps, 'id' | 'tripId' | 'createdAt'>>
  ): Partial<ParticipantRecord> {
    const record: Partial<ParticipantRecord> = {};

    if (updates.name !== undefined) {
      record.name = updates.name;
    }

    if (updates.email !== undefined) {
      record.email = updates.email;
    }

    if (updates.notes !== undefined) {
      record.notes = updates.notes;
    }

    return record;
  }
}
