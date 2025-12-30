/**
 * @fileoverview Implementación del repositorio de Trip usando IndexedDB/Dexie.
 *
 * Este repositorio implementa ITripRepository del dominio, proporcionando
 * persistencia de viajes en IndexedDB a través de Dexie.js.
 *
 * @module infrastructure/persistence/indexeddb/TripRepository
 * @version 1.0.0
 */

import type { ITripRepository } from '@domain/interfaces/repositories/ITripRepository';
import type { Trip } from '@domain/entities/Trip';
import { TripFoodDatabase, type TripRecord } from './database';
import { TripMapper, type TripProps } from '../mappers/TripMapper';
import { DatabaseError } from '../../errors/DatabaseError';

/**
 * Repositorio de Trip implementado con IndexedDB a través de Dexie.js.
 *
 * Proporciona operaciones CRUD completas para la entidad Trip,
 * con manejo de errores apropiado y conversión entre formatos
 * de dominio y persistencia.
 *
 * @class IndexedDBTripRepository
 * @implements {ITripRepository}
 *
 * @example
 * ```typescript
 * const tripRepo = new IndexedDBTripRepository(database);
 *
 * // Crear un viaje
 * const trip = Trip.create({ name: 'Beach Trip', ... });
 * await tripRepo.save(trip);
 *
 * // Buscar por ID
 * const found = await tripRepo.findById(trip.id);
 *
 * // Obtener todos
 * const allTrips = await tripRepo.findAll();
 * ```
 */
export class IndexedDBTripRepository implements ITripRepository {
  /**
   * Instancia de la base de datos Dexie.
   * @private
   * @readonly
   */
  private readonly db: TripFoodDatabase;

  /**
   * Factory function para crear entidades Trip desde props.
   * Se inyecta para mantener la separación de capas.
   * @private
   * @readonly
   */
  private readonly tripFactory: (props: TripProps) => Trip;

  /**
   * Crea una nueva instancia del repositorio.
   *
   * @param database - Instancia de TripFoodDatabase
   * @param tripFactory - Factory function para crear entidades Trip
   */
  constructor(database: TripFoodDatabase, tripFactory: (props: TripProps) => Trip) {
    this.db = database;
    this.tripFactory = tripFactory;
  }

  /**
   * Busca un viaje por su ID.
   *
   * @param id - ID único del viaje
   * @returns Promise con el Trip encontrado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findById(id: string): Promise<Trip | null> {
    try {
      const record = await this.db.trips.get(id);

      if (!record) {
        return null;
      }

      const props = TripMapper.toDomainProps(record);
      return this.tripFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'findById',
        'trips',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Obtiene todos los viajes.
   *
   * @returns Promise con array de todos los Trip
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAll(): Promise<Trip[]> {
    try {
      const records = await this.db.trips.toArray();
      const propsList = TripMapper.toDomainPropsList(records);
      return propsList.map((props) => this.tripFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'trips', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda un viaje (crea nuevo o actualiza existente).
   *
   * Utiliza put() de Dexie que hace upsert automático basado en la PK.
   *
   * @param trip - Entidad Trip a guardar
   * @returns Promise con el Trip guardado
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async save(trip: Trip): Promise<Trip> {
    try {
      const record = TripMapper.toRecord(trip);
      await this.db.trips.put(record);
      return trip;
    } catch (error) {
      throw new DatabaseError(
        'create',
        'trips',
        error instanceof Error ? error : undefined,
        trip.id
      );
    }
  }

  /**
   * Elimina un viaje por su ID.
   *
   * @param id - ID del viaje a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async delete(id: string): Promise<void> {
    try {
      await this.db.trips.delete(id);
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'trips',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Busca viajes por nombre (búsqueda parcial, case-insensitive).
   *
   * @param name - Nombre o parte del nombre a buscar
   * @returns Promise con array de Trip que coinciden
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByName(name: string): Promise<Trip[]> {
    try {
      const searchTerm = name.toLowerCase();
      const records = await this.db.trips
        .filter((trip) => trip.name.toLowerCase().includes(searchTerm))
        .toArray();

      const propsList = TripMapper.toDomainPropsList(records);
      return propsList.map((props) => this.tripFactory(props));
    } catch (error) {
      throw new DatabaseError('find', 'trips', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Busca viajes activos en una fecha específica.
   *
   * Un viaje está activo si la fecha cae entre startDate y endDate.
   *
   * @param date - Fecha a verificar
   * @returns Promise con array de Trip activos en esa fecha
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByDate(date: Date): Promise<Trip[]> {
    try {
      const dateStr = date.toISOString();
      const records = await this.db.trips
        .filter((trip) => trip.startDate <= dateStr && trip.endDate >= dateStr)
        .toArray();

      const propsList = TripMapper.toDomainPropsList(records);
      return propsList.map((props) => this.tripFactory(props));
    } catch (error) {
      throw new DatabaseError('find', 'trips', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Busca viajes en un rango de fechas.
   *
   * Retorna viajes que se solapan con el rango especificado.
   *
   * @param startDate - Fecha de inicio del rango
   * @param endDate - Fecha de fin del rango
   * @returns Promise con array de Trip en el rango
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByDateRange(startDate: Date, endDate: Date): Promise<Trip[]> {
    try {
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      const records = await this.db.trips
        .filter((trip) => trip.startDate <= endStr && trip.endDate >= startStr)
        .toArray();

      const propsList = TripMapper.toDomainPropsList(records);
      return propsList.map((props) => this.tripFactory(props));
    } catch (error) {
      throw new DatabaseError('find', 'trips', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Obtiene todos los viajes ordenados por fecha de inicio (descendente).
   *
   * Útil para mostrar viajes recientes primero.
   *
   * @returns Promise con array de Trip ordenados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAllOrderedByStartDate(): Promise<Trip[]> {
    try {
      const records = await this.db.trips.orderBy('startDate').reverse().toArray();

      const propsList = TripMapper.toDomainPropsList(records);
      return propsList.map((props) => this.tripFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'trips', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta el número total de viajes.
   *
   * @returns Promise con el conteo de viajes
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async count(): Promise<number> {
    try {
      return await this.db.trips.count();
    } catch (error) {
      throw new DatabaseError('count', 'trips', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Verifica si existe un viaje con el ID dado.
   *
   * @param id - ID a verificar
   * @returns Promise que resuelve a true si existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const count = await this.db.trips.where('id').equals(id).count();
      return count > 0;
    } catch (error) {
      throw new DatabaseError(
        'find',
        'trips',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Actualiza campos específicos de un viaje.
   *
   * @param id - ID del viaje a actualizar
   * @param updates - Objeto con los campos a actualizar
   * @returns Promise con el Trip actualizado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async update(
    id: string,
    updates: Partial<Pick<TripRecord, 'name' | 'description' | 'startDate' | 'endDate'>>
  ): Promise<Trip | null> {
    try {
      const existingRecord = await this.db.trips.get(id);

      if (!existingRecord) {
        return null;
      }

      const updatedRecord: TripRecord = {
        ...existingRecord,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.db.trips.put(updatedRecord);

      const props = TripMapper.toDomainProps(updatedRecord);
      return this.tripFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'update',
        'trips',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Elimina múltiples viajes por sus IDs.
   *
   * @param ids - Array de IDs a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.db.trips.bulkDelete(ids);
    } catch (error) {
      throw new DatabaseError('delete', 'trips', error instanceof Error ? error : undefined);
    }
  }
}
