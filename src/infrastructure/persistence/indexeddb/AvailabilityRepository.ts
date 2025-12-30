/**
 * @fileoverview Implementación del repositorio de Availability usando IndexedDB/Dexie.
 *
 * Este repositorio implementa IAvailabilityRepository del dominio, proporcionando
 * persistencia de disponibilidades de participantes en IndexedDB a través de
 * Dexie.js con manejo robusto de errores y documentación completa.
 *
 * @module infrastructure/persistence/indexeddb/AvailabilityRepository
 * @version 1.0.0
 */

import type { IAvailabilityRepository } from '@domain/interfaces/repositories/IAvailabilityRepository';
import type { Availability } from '@domain/entities/Availability';
import { TripFoodDatabase, type AvailabilityRecord } from './database';
import { AvailabilityMapper, type AvailabilityProps } from '../mappers/AvailabilityMapper';
import type { MealType } from '../mappers/ConsumptionMapper';
import { DatabaseError } from '../../errors/DatabaseError';

/**
 * Repositorio de Availability implementado con IndexedDB a través de Dexie.js.
 *
 * Proporciona operaciones CRUD completas para la entidad Availability,
 * con métodos específicos para consultas por viaje, participante y fecha,
 * optimizados con índices compuestos.
 *
 * @class IndexedDBAvailabilityRepository
 * @implements {IAvailabilityRepository}
 *
 * @example
 * ```typescript
 * const availabilityRepo = new IndexedDBAvailabilityRepository(database, availabilityFactory);
 *
 * // Registrar disponibilidad
 * const availability = Availability.create({
 *   participantId: 'part-1',
 *   tripId: 'trip-1',
 *   date: new Date('2025-07-15'),
 *   meals: ['breakfast', 'lunch', 'dinner']
 * });
 * await availabilityRepo.save(availability);
 *
 * // Obtener disponibilidad de un viaje en una fecha
 * const availabilities = await availabilityRepo.findByTripIdAndDate('trip-1', new Date());
 * ```
 */
export class IndexedDBAvailabilityRepository implements IAvailabilityRepository {
  /**
   * Instancia de la base de datos Dexie.
   * @private
   * @readonly
   */
  private readonly db: TripFoodDatabase;

  /**
   * Factory function para crear entidades Availability desde props.
   * Se inyecta para mantener la separación de capas.
   * @private
   * @readonly
   */
  private readonly availabilityFactory: (props: AvailabilityProps) => Availability;

  /**
   * Crea una nueva instancia del repositorio.
   *
   * @param database - Instancia de TripFoodDatabase
   * @param availabilityFactory - Factory function para crear entidades Availability
   */
  constructor(
    database: TripFoodDatabase,
    availabilityFactory: (props: AvailabilityProps) => Availability
  ) {
    this.db = database;
    this.availabilityFactory = availabilityFactory;
  }

  /**
   * Busca una disponibilidad por su ID.
   *
   * @param id - ID único de la disponibilidad
   * @returns Promise con el Availability encontrado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findById(id: string): Promise<Availability | null> {
    try {
      const record = await this.db.availabilities.get(id);

      if (!record) {
        return null;
      }

      const props = AvailabilityMapper.toDomainProps(record);
      return this.availabilityFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'findById',
        'availabilities',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Obtiene todas las disponibilidades.
   *
   * @returns Promise con array de todas las Availability
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAll(): Promise<Availability[]> {
    try {
      const records = await this.db.availabilities.toArray();
      const propsList = AvailabilityMapper.toDomainPropsList(records);
      return propsList.map((props) => this.availabilityFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'availabilities', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda una disponibilidad (crea nueva o actualiza existente).
   *
   * Utiliza put() de Dexie que hace upsert automático basado en la PK.
   *
   * @param availability - Entidad Availability a guardar
   * @returns Promise con el Availability guardado
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async save(availability: Availability): Promise<Availability> {
    try {
      const record = AvailabilityMapper.toRecord(availability);
      await this.db.availabilities.put(record);
      return availability;
    } catch (error) {
      throw new DatabaseError(
        'create',
        'availabilities',
        error instanceof Error ? error : undefined,
        availability.id
      );
    }
  }

  /**
   * Elimina una disponibilidad por su ID.
   *
   * @param id - ID de la disponibilidad a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async delete(id: string): Promise<void> {
    try {
      await this.db.availabilities.delete(id);
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'availabilities',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Busca todas las disponibilidades de un viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con array de Availability del viaje
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripId(tripId: string): Promise<Availability[]> {
    try {
      const records = await this.db.availabilities.where('tripId').equals(tripId).toArray();

      const propsList = AvailabilityMapper.toDomainPropsList(records);
      return propsList.map((props) => this.availabilityFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'availabilities',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Busca todas las disponibilidades de un participante.
   *
   * @param participantId - ID del participante
   * @returns Promise con array de Availability del participante
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByParticipantId(participantId: string): Promise<Availability[]> {
    try {
      const records = await this.db.availabilities
        .where('participantId')
        .equals(participantId)
        .toArray();

      const propsList = AvailabilityMapper.toDomainPropsList(records);
      return propsList.map((props) => this.availabilityFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'availabilities',
        error instanceof Error ? error : undefined,
        participantId
      );
    }
  }

  /**
   * Busca disponibilidades de un viaje en una fecha específica.
   *
   * Utiliza el índice compuesto [tripId+date] para búsqueda eficiente.
   *
   * @param tripId - ID del viaje
   * @param date - Fecha a buscar
   * @returns Promise con array de Availability en esa fecha
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]> {
    try {
      const dateStr = AvailabilityMapper.toDateOnlyString(date);

      // Usar filtro para búsqueda por fecha (solo parte de fecha, sin hora)
      const records = await this.db.availabilities
        .where('tripId')
        .equals(tripId)
        .filter((record) => record.date.startsWith(dateStr))
        .toArray();

      const propsList = AvailabilityMapper.toDomainPropsList(records);
      return propsList.map((props) => this.availabilityFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'availabilities',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Busca la disponibilidad de un participante en una fecha específica.
   *
   * Utiliza el índice compuesto [participantId+date].
   *
   * @param participantId - ID del participante
   * @param date - Fecha a buscar
   * @returns Promise con el Availability encontrado o null
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByParticipantIdAndDate(
    participantId: string,
    date: Date
  ): Promise<Availability | null> {
    try {
      const dateStr = AvailabilityMapper.toDateOnlyString(date);

      const record = await this.db.availabilities
        .where('participantId')
        .equals(participantId)
        .filter((r) => r.date.startsWith(dateStr))
        .first();

      if (!record) {
        return null;
      }

      const props = AvailabilityMapper.toDomainProps(record);
      return this.availabilityFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'availabilities',
        error instanceof Error ? error : undefined,
        participantId
      );
    }
  }

  /**
   * Busca disponibilidad de un participante en un viaje específico.
   *
   * @param participantId - ID del participante
   * @param tripId - ID del viaje
   * @returns Promise con array de Availability del participante en ese viaje
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByParticipantIdAndTripId(
    participantId: string,
    tripId: string
  ): Promise<Availability[]> {
    try {
      const records = await this.db.availabilities
        .where('[participantId+tripId]')
        .equals([participantId, tripId])
        .toArray();

      const propsList = AvailabilityMapper.toDomainPropsList(records);
      return propsList.map((props) => this.availabilityFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'availabilities',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Busca disponibilidades en un rango de fechas para un viaje.
   *
   * @param tripId - ID del viaje
   * @param startDate - Fecha de inicio del rango
   * @param endDate - Fecha de fin del rango
   * @returns Promise con array de Availability en el rango
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndDateRange(
    tripId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Availability[]> {
    try {
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      const records = await this.db.availabilities
        .where('tripId')
        .equals(tripId)
        .filter((record) => record.date >= startStr && record.date <= endStr)
        .toArray();

      const propsList = AvailabilityMapper.toDomainPropsList(records);
      return propsList.map((props) => this.availabilityFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'availabilities',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Busca participantes disponibles para una comida específica en una fecha.
   *
   * @param tripId - ID del viaje
   * @param date - Fecha a buscar
   * @param meal - Tipo de comida
   * @returns Promise con array de Availability que incluyen esa comida
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdDateAndMeal(
    tripId: string,
    date: Date,
    meal: MealType
  ): Promise<Availability[]> {
    try {
      const dateStr = AvailabilityMapper.toDateOnlyString(date);

      const records = await this.db.availabilities
        .where('tripId')
        .equals(tripId)
        .filter((record) => record.date.startsWith(dateStr) && record.meals.includes(meal))
        .toArray();

      const propsList = AvailabilityMapper.toDomainPropsList(records);
      return propsList.map((props) => this.availabilityFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'availabilities',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Verifica si existe una disponibilidad con el ID dado.
   *
   * @param id - ID a verificar
   * @returns Promise que resuelve a true si existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const count = await this.db.availabilities.where('id').equals(id).count();
      return count > 0;
    } catch (error) {
      throw new DatabaseError(
        'find',
        'availabilities',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Actualiza campos específicos de una disponibilidad.
   *
   * @param id - ID de la disponibilidad a actualizar
   * @param updates - Objeto con los campos a actualizar
   * @returns Promise con el Availability actualizado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async update(
    id: string,
    updates: Partial<Pick<AvailabilityRecord, 'date' | 'meals'>>
  ): Promise<Availability | null> {
    try {
      const existingRecord = await this.db.availabilities.get(id);

      if (!existingRecord) {
        return null;
      }

      const updatedRecord: AvailabilityRecord = {
        ...existingRecord,
        ...updates,
      };

      await this.db.availabilities.put(updatedRecord);

      const props = AvailabilityMapper.toDomainProps(updatedRecord);
      return this.availabilityFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'update',
        'availabilities',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Actualiza las comidas de una disponibilidad existente.
   *
   * @param id - ID de la disponibilidad
   * @param meals - Nuevo array de comidas
   * @returns Promise con el Availability actualizado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async updateMeals(id: string, meals: MealType[]): Promise<Availability | null> {
    return this.update(id, { meals });
  }

  /**
   * Elimina todas las disponibilidades de un participante.
   *
   * Útil para limpieza en cascada cuando se elimina un participante.
   *
   * @param participantId - ID del participante
   * @returns Promise con el número de registros eliminados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteByParticipantId(participantId: string): Promise<number> {
    try {
      return await this.db.availabilities.where('participantId').equals(participantId).delete();
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'availabilities',
        error instanceof Error ? error : undefined,
        participantId
      );
    }
  }

  /**
   * Elimina todas las disponibilidades de un viaje.
   *
   * Útil para limpieza en cascada cuando se elimina un viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con el número de registros eliminados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteByTripId(tripId: string): Promise<number> {
    try {
      return await this.db.availabilities.where('tripId').equals(tripId).delete();
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'availabilities',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Cuenta el número total de disponibilidades.
   *
   * @returns Promise con el conteo total
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async count(): Promise<number> {
    try {
      return await this.db.availabilities.count();
    } catch (error) {
      throw new DatabaseError('count', 'availabilities', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta disponibilidades por viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con el conteo
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async countByTripId(tripId: string): Promise<number> {
    try {
      return await this.db.availabilities.where('tripId').equals(tripId).count();
    } catch (error) {
      throw new DatabaseError('count', 'availabilities', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta disponibilidades por participante.
   *
   * @param participantId - ID del participante
   * @returns Promise con el conteo
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async countByParticipantId(participantId: string): Promise<number> {
    try {
      return await this.db.availabilities.where('participantId').equals(participantId).count();
    } catch (error) {
      throw new DatabaseError('count', 'availabilities', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Elimina múltiples disponibilidades por sus IDs.
   *
   * @param ids - Array de IDs a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.db.availabilities.bulkDelete(ids);
    } catch (error) {
      throw new DatabaseError('delete', 'availabilities', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda múltiples disponibilidades en una sola transacción.
   *
   * @param availabilities - Array de entidades Availability a guardar
   * @returns Promise con el array de Availability guardados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async saveMany(availabilities: Availability[]): Promise<Availability[]> {
    try {
      const records = AvailabilityMapper.toRecordList(availabilities);
      await this.db.availabilities.bulkPut(records);
      return availabilities;
    } catch (error) {
      throw new DatabaseError('create', 'availabilities', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Crea o actualiza la disponibilidad de un participante para una fecha.
   *
   * Si ya existe una disponibilidad para esa combinación participante+viaje+fecha,
   * la actualiza. Si no, crea una nueva.
   *
   * @param availability - Entidad Availability a guardar/actualizar
   * @returns Promise con el Availability guardado/actualizado
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async upsertByParticipantAndDate(availability: Availability): Promise<Availability> {
    try {
      const existing = await this.findByParticipantIdAndDate(
        availability.participantId,
        availability.date
      );

      if (existing) {
        // Actualizar existente
        await this.update(existing.id, { meals: [...availability.meals] });
        return availability;
      }

      // Crear nuevo
      return this.save(availability);
    } catch (error) {
      throw new DatabaseError(
        'create',
        'availabilities',
        error instanceof Error ? error : undefined,
        availability.id
      );
    }
  }
}
