/**
 * @fileoverview Implementación del repositorio de Participant usando IndexedDB/Dexie.
 *
 * Este repositorio implementa IParticipantRepository del dominio, proporcionando
 * persistencia de participantes en IndexedDB a través de Dexie.js con manejo
 * robusto de errores y documentación completa.
 *
 * @module infrastructure/persistence/indexeddb/ParticipantRepository
 * @version 1.0.0
 */

import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import type { Participant } from '@domain/entities/Participant';
import { TripFoodDatabase, type ParticipantRecord } from './database';
import { ParticipantMapper, type ParticipantProps } from '../mappers/ParticipantMapper';
import { DatabaseError } from '../../errors/DatabaseError';

/**
 * Repositorio de Participant implementado con IndexedDB a través de Dexie.js.
 *
 * Proporciona operaciones CRUD completas para la entidad Participant,
 * con métodos específicos para consultas por viaje y manejo de errores
 * enterprise-grade.
 *
 * @class IndexedDBParticipantRepository
 * @implements {IParticipantRepository}
 *
 * @example
 * ```typescript
 * const participantRepo = new IndexedDBParticipantRepository(database, participantFactory);
 *
 * // Crear un participante
 * const participant = Participant.create({ name: 'John', tripId: 'trip-1', ... });
 * await participantRepo.save(participant);
 *
 * // Obtener participantes de un viaje
 * const participants = await participantRepo.findByTripId('trip-1');
 * ```
 */
export class IndexedDBParticipantRepository implements IParticipantRepository {
  /**
   * Instancia de la base de datos Dexie.
   * @private
   * @readonly
   */
  private readonly db: TripFoodDatabase;

  /**
   * Factory function para crear entidades Participant desde props.
   * Se inyecta para mantener la separación de capas.
   * @private
   * @readonly
   */
  private readonly participantFactory: (props: ParticipantProps) => Participant;

  /**
   * Crea una nueva instancia del repositorio.
   *
   * @param database - Instancia de TripFoodDatabase
   * @param participantFactory - Factory function para crear entidades Participant
   */
  constructor(
    database: TripFoodDatabase,
    participantFactory: (props: ParticipantProps) => Participant
  ) {
    this.db = database;
    this.participantFactory = participantFactory;
  }

  /**
   * Busca un participante por su ID.
   *
   * @param id - ID único del participante
   * @returns Promise con el Participant encontrado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findById(id: string): Promise<Participant | null> {
    try {
      const record = await this.db.participants.get(id);

      if (!record) {
        return null;
      }

      const props = ParticipantMapper.toDomainProps(record);
      return this.participantFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'findById',
        'participants',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Obtiene todos los participantes.
   *
   * @returns Promise con array de todos los Participant
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAll(): Promise<Participant[]> {
    try {
      const records = await this.db.participants.toArray();
      const propsList = ParticipantMapper.toDomainPropsList(records);
      return propsList.map((props) => this.participantFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'participants', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda un participante (crea nuevo o actualiza existente).
   *
   * Utiliza put() de Dexie que hace upsert automático basado en la PK.
   *
   * @param participant - Entidad Participant a guardar
   * @returns Promise con el Participant guardado
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async save(participant: Participant): Promise<Participant> {
    try {
      const record = ParticipantMapper.toRecord(participant);
      await this.db.participants.put(record);
      return participant;
    } catch (error) {
      throw new DatabaseError(
        'create',
        'participants',
        error instanceof Error ? error : undefined,
        participant.id
      );
    }
  }

  /**
   * Elimina un participante por su ID.
   *
   * @param id - ID del participante a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async delete(id: string): Promise<void> {
    try {
      await this.db.participants.delete(id);
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'participants',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Busca todos los participantes de un viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con array de Participant del viaje
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripId(tripId: string): Promise<Participant[]> {
    try {
      const records = await this.db.participants.where('tripId').equals(tripId).toArray();

      const propsList = ParticipantMapper.toDomainPropsList(records);
      return propsList.map((props) => this.participantFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'participants',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Busca participantes por nombre (búsqueda parcial, case-insensitive).
   *
   * @param name - Nombre o parte del nombre a buscar
   * @returns Promise con array de Participant que coinciden
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByName(name: string): Promise<Participant[]> {
    try {
      const searchTerm = name.toLowerCase();
      const records = await this.db.participants
        .filter((participant) => participant.name.toLowerCase().includes(searchTerm))
        .toArray();

      const propsList = ParticipantMapper.toDomainPropsList(records);
      return propsList.map((props) => this.participantFactory(props));
    } catch (error) {
      throw new DatabaseError('find', 'participants', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Busca un participante por nombre exacto en un viaje específico.
   *
   * Útil para validar duplicados de nombre por viaje.
   *
   * @param tripId - ID del viaje
   * @param name - Nombre exacto a buscar
   * @returns Promise con el Participant encontrado o null
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndName(tripId: string, name: string): Promise<Participant | null> {
    try {
      const record = await this.db.participants
        .where('tripId')
        .equals(tripId)
        .filter((p) => p.name.toLowerCase() === name.toLowerCase())
        .first();

      if (!record) {
        return null;
      }

      const props = ParticipantMapper.toDomainProps(record);
      return this.participantFactory(props);
    } catch (error) {
      throw new DatabaseError('find', 'participants', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Busca participantes por email (búsqueda parcial, case-insensitive).
   *
   * @param email - Email o parte del email a buscar
   * @returns Promise con array de Participant que coinciden
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByEmail(email: string): Promise<Participant[]> {
    try {
      const searchTerm = email.toLowerCase();
      const records = await this.db.participants
        .filter((participant) =>
          participant.email ? participant.email.toLowerCase().includes(searchTerm) : false
        )
        .toArray();

      const propsList = ParticipantMapper.toDomainPropsList(records);
      return propsList.map((props) => this.participantFactory(props));
    } catch (error) {
      throw new DatabaseError('find', 'participants', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta el número de participantes en un viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con el conteo de participantes
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async countByTripId(tripId: string): Promise<number> {
    try {
      return await this.db.participants.where('tripId').equals(tripId).count();
    } catch (error) {
      throw new DatabaseError('count', 'participants', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Verifica si existe un participante con el ID dado.
   *
   * @param id - ID a verificar
   * @returns Promise que resuelve a true si existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const count = await this.db.participants.where('id').equals(id).count();
      return count > 0;
    } catch (error) {
      throw new DatabaseError(
        'find',
        'participants',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Actualiza campos específicos de un participante.
   *
   * @param id - ID del participante a actualizar
   * @param updates - Objeto con los campos a actualizar
   * @returns Promise con el Participant actualizado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async update(
    id: string,
    updates: Partial<Pick<ParticipantRecord, 'name' | 'email' | 'notes'>>
  ): Promise<Participant | null> {
    try {
      const existingRecord = await this.db.participants.get(id);

      if (!existingRecord) {
        return null;
      }

      const updatedRecord: ParticipantRecord = {
        ...existingRecord,
        ...updates,
      };

      await this.db.participants.put(updatedRecord);

      const props = ParticipantMapper.toDomainProps(updatedRecord);
      return this.participantFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'update',
        'participants',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Elimina todos los participantes de un viaje.
   *
   * Útil para limpieza en cascada cuando se elimina un viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con el número de registros eliminados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteByTripId(tripId: string): Promise<number> {
    try {
      return await this.db.participants.where('tripId').equals(tripId).delete();
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'participants',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Elimina múltiples participantes por sus IDs.
   *
   * @param ids - Array de IDs a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.db.participants.bulkDelete(ids);
    } catch (error) {
      throw new DatabaseError('delete', 'participants', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda múltiples participantes en una sola transacción.
   *
   * @param participants - Array de entidades Participant a guardar
   * @returns Promise con el array de Participant guardados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async saveMany(participants: Participant[]): Promise<Participant[]> {
    try {
      const records = ParticipantMapper.toRecordList(participants);
      await this.db.participants.bulkPut(records);
      return participants;
    } catch (error) {
      throw new DatabaseError('create', 'participants', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta el número total de participantes.
   *
   * @returns Promise con el conteo total
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async count(): Promise<number> {
    try {
      return await this.db.participants.count();
    } catch (error) {
      throw new DatabaseError('count', 'participants', error instanceof Error ? error : undefined);
    }
  }
}
