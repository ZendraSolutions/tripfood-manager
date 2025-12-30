/**
 * @fileoverview Implementación del repositorio de Consumption usando IndexedDB/Dexie.
 *
 * Este repositorio implementa IConsumptionRepository del dominio, proporcionando
 * persistencia de consumos en IndexedDB a través de Dexie.js con manejo
 * robusto de errores y documentación completa.
 *
 * @module infrastructure/persistence/indexeddb/ConsumptionRepository
 * @version 1.0.0
 */

import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import type { Consumption } from '@domain/entities/Consumption';
import { TripFoodDatabase, type ConsumptionRecord } from './database';
import { ConsumptionMapper, type ConsumptionProps, type MealType } from '../mappers/ConsumptionMapper';
import { DatabaseError } from '../../errors/DatabaseError';

/**
 * Repositorio de Consumption implementado con IndexedDB a través de Dexie.js.
 *
 * Proporciona operaciones CRUD completas para la entidad Consumption,
 * con métodos específicos para consultas por viaje, participante, producto,
 * fecha y comida, optimizados con índices compuestos.
 *
 * @class IndexedDBConsumptionRepository
 * @implements {IConsumptionRepository}
 *
 * @example
 * ```typescript
 * const consumptionRepo = new IndexedDBConsumptionRepository(database, consumptionFactory);
 *
 * // Registrar un consumo
 * const consumption = Consumption.create({
 *   tripId: 'trip-1',
 *   participantId: 'part-1',
 *   productId: 'prod-1',
 *   meal: 'lunch',
 *   quantity: 2
 * });
 * await consumptionRepo.save(consumption);
 *
 * // Obtener consumos de un viaje en una fecha
 * const consumptions = await consumptionRepo.findByTripIdAndDate('trip-1', new Date());
 * ```
 */
export class IndexedDBConsumptionRepository implements IConsumptionRepository {
  /**
   * Instancia de la base de datos Dexie.
   * @private
   * @readonly
   */
  private readonly db: TripFoodDatabase;

  /**
   * Factory function para crear entidades Consumption desde props.
   * Se inyecta para mantener la separación de capas.
   * @private
   * @readonly
   */
  private readonly consumptionFactory: (props: ConsumptionProps) => Consumption;

  /**
   * Crea una nueva instancia del repositorio.
   *
   * @param database - Instancia de TripFoodDatabase
   * @param consumptionFactory - Factory function para crear entidades Consumption
   */
  constructor(
    database: TripFoodDatabase,
    consumptionFactory: (props: ConsumptionProps) => Consumption
  ) {
    this.db = database;
    this.consumptionFactory = consumptionFactory;
  }

  /**
   * Busca un consumo por su ID.
   *
   * @param id - ID único del consumo
   * @returns Promise con el Consumption encontrado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findById(id: string): Promise<Consumption | null> {
    try {
      const record = await this.db.consumptions.get(id);

      if (!record) {
        return null;
      }

      const props = ConsumptionMapper.toDomainProps(record);
      return this.consumptionFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'findById',
        'consumptions',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Obtiene todos los consumos.
   *
   * @returns Promise con array de todos los Consumption
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAll(): Promise<Consumption[]> {
    try {
      const records = await this.db.consumptions.toArray();
      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'consumptions', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda un consumo (crea nuevo o actualiza existente).
   *
   * Utiliza put() de Dexie que hace upsert automático basado en la PK.
   *
   * @param consumption - Entidad Consumption a guardar
   * @returns Promise con el Consumption guardado
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async save(consumption: Consumption): Promise<Consumption> {
    try {
      const record = ConsumptionMapper.toRecord(consumption);
      await this.db.consumptions.put(record);
      return consumption;
    } catch (error) {
      throw new DatabaseError(
        'create',
        'consumptions',
        error instanceof Error ? error : undefined,
        consumption.id
      );
    }
  }

  /**
   * Elimina un consumo por su ID.
   *
   * @param id - ID del consumo a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async delete(id: string): Promise<void> {
    try {
      await this.db.consumptions.delete(id);
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'consumptions',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Busca todos los consumos de un viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con array de Consumption del viaje
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripId(tripId: string): Promise<Consumption[]> {
    try {
      const records = await this.db.consumptions.where('tripId').equals(tripId).toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Busca todos los consumos de un participante.
   *
   * @param participantId - ID del participante
   * @returns Promise con array de Consumption del participante
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByParticipantId(participantId: string): Promise<Consumption[]> {
    try {
      const records = await this.db.consumptions
        .where('participantId')
        .equals(participantId)
        .toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined,
        participantId
      );
    }
  }

  /**
   * Busca todos los consumos de un producto.
   *
   * Útil para calcular totales de consumo por producto.
   *
   * @param productId - ID del producto
   * @returns Promise con array de Consumption del producto
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByProductId(productId: string): Promise<Consumption[]> {
    try {
      const records = await this.db.consumptions.where('productId').equals(productId).toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined,
        productId
      );
    }
  }

  /**
   * Busca consumos de un viaje en una fecha específica.
   *
   * Utiliza el índice compuesto [tripId+date] para búsqueda eficiente.
   *
   * @param tripId - ID del viaje
   * @param date - Fecha a buscar
   * @returns Promise con array de Consumption en esa fecha
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]> {
    try {
      const dateStr = ConsumptionMapper.toDateOnlyString(date);

      // Usar filtro en lugar de índice compuesto para mayor flexibilidad con fechas
      const records = await this.db.consumptions
        .where('tripId')
        .equals(tripId)
        .filter((record) => record.date.startsWith(dateStr))
        .toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Busca consumos de un participante en un viaje.
   *
   * Utiliza el índice compuesto [tripId+participantId].
   *
   * @param tripId - ID del viaje
   * @param participantId - ID del participante
   * @returns Promise con array de Consumption del participante en ese viaje
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndParticipantId(
    tripId: string,
    participantId: string
  ): Promise<Consumption[]> {
    try {
      const records = await this.db.consumptions
        .where('[tripId+participantId]')
        .equals([tripId, participantId])
        .toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Busca consumos de un producto en un viaje.
   *
   * Utiliza el índice compuesto [tripId+productId].
   *
   * @param tripId - ID del viaje
   * @param productId - ID del producto
   * @returns Promise con array de Consumption del producto en ese viaje
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndProductId(tripId: string, productId: string): Promise<Consumption[]> {
    try {
      const records = await this.db.consumptions
        .where('[tripId+productId]')
        .equals([tripId, productId])
        .toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Busca consumos por tipo de comida en un viaje.
   *
   * @param tripId - ID del viaje
   * @param meal - Tipo de comida: 'breakfast' | 'lunch' | 'dinner' | 'snack'
   * @returns Promise con array de Consumption de esa comida
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndMeal(tripId: string, meal: MealType): Promise<Consumption[]> {
    try {
      const records = await this.db.consumptions
        .where('tripId')
        .equals(tripId)
        .filter((record) => record.meal === meal)
        .toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Busca consumos en un rango de fechas para un viaje.
   *
   * @param tripId - ID del viaje
   * @param startDate - Fecha de inicio del rango
   * @param endDate - Fecha de fin del rango
   * @returns Promise con array de Consumption en el rango
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByTripIdAndDateRange(
    tripId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Consumption[]> {
    try {
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      const records = await this.db.consumptions
        .where('tripId')
        .equals(tripId)
        .filter((record) => record.date >= startStr && record.date <= endStr)
        .toArray();

      const propsList = ConsumptionMapper.toDomainPropsList(records);
      return propsList.map((props) => this.consumptionFactory(props));
    } catch (error) {
      throw new DatabaseError(
        'findByIndex',
        'consumptions',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Verifica si existe un consumo con el ID dado.
   *
   * @param id - ID a verificar
   * @returns Promise que resuelve a true si existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const count = await this.db.consumptions.where('id').equals(id).count();
      return count > 0;
    } catch (error) {
      throw new DatabaseError(
        'find',
        'consumptions',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Actualiza campos específicos de un consumo.
   *
   * @param id - ID del consumo a actualizar
   * @param updates - Objeto con los campos a actualizar
   * @returns Promise con el Consumption actualizado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async update(
    id: string,
    updates: Partial<Pick<ConsumptionRecord, 'participantId' | 'productId' | 'date' | 'meal' | 'quantity'>>
  ): Promise<Consumption | null> {
    try {
      const existingRecord = await this.db.consumptions.get(id);

      if (!existingRecord) {
        return null;
      }

      const updatedRecord: ConsumptionRecord = {
        ...existingRecord,
        ...updates,
      };

      await this.db.consumptions.put(updatedRecord);

      const props = ConsumptionMapper.toDomainProps(updatedRecord);
      return this.consumptionFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'update',
        'consumptions',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Elimina todos los consumos de un viaje.
   *
   * Útil para limpieza en cascada cuando se elimina un viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con el número de registros eliminados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteByTripId(tripId: string): Promise<number> {
    try {
      return await this.db.consumptions.where('tripId').equals(tripId).delete();
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'consumptions',
        error instanceof Error ? error : undefined,
        tripId
      );
    }
  }

  /**
   * Elimina todos los consumos de un participante.
   *
   * Útil para limpieza en cascada cuando se elimina un participante.
   *
   * @param participantId - ID del participante
   * @returns Promise con el número de registros eliminados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteByParticipantId(participantId: string): Promise<number> {
    try {
      return await this.db.consumptions.where('participantId').equals(participantId).delete();
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'consumptions',
        error instanceof Error ? error : undefined,
        participantId
      );
    }
  }

  /**
   * Elimina todos los consumos de un producto.
   *
   * Útil para limpieza en cascada cuando se elimina un producto.
   *
   * @param productId - ID del producto
   * @returns Promise con el número de registros eliminados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteByProductId(productId: string): Promise<number> {
    try {
      return await this.db.consumptions.where('productId').equals(productId).delete();
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'consumptions',
        error instanceof Error ? error : undefined,
        productId
      );
    }
  }

  /**
   * Cuenta el número total de consumos.
   *
   * @returns Promise con el conteo total
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async count(): Promise<number> {
    try {
      return await this.db.consumptions.count();
    } catch (error) {
      throw new DatabaseError('count', 'consumptions', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta consumos por viaje.
   *
   * @param tripId - ID del viaje
   * @returns Promise con el conteo
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async countByTripId(tripId: string): Promise<number> {
    try {
      return await this.db.consumptions.where('tripId').equals(tripId).count();
    } catch (error) {
      throw new DatabaseError('count', 'consumptions', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Elimina múltiples consumos por sus IDs.
   *
   * @param ids - Array de IDs a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.db.consumptions.bulkDelete(ids);
    } catch (error) {
      throw new DatabaseError('delete', 'consumptions', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda múltiples consumos en una sola transacción.
   *
   * @param consumptions - Array de entidades Consumption a guardar
   * @returns Promise con el array de Consumption guardados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async saveMany(consumptions: Consumption[]): Promise<Consumption[]> {
    try {
      const records = ConsumptionMapper.toRecordList(consumptions);
      await this.db.consumptions.bulkPut(records);
      return consumptions;
    } catch (error) {
      throw new DatabaseError('create', 'consumptions', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Calcula la suma de cantidades de un producto en un viaje.
   *
   * Útil para calcular totales de consumo para la lista de compras.
   *
   * @param tripId - ID del viaje
   * @param productId - ID del producto
   * @returns Promise con la suma de cantidades
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async sumQuantityByTripIdAndProductId(tripId: string, productId: string): Promise<number> {
    try {
      const records = await this.db.consumptions
        .where('[tripId+productId]')
        .equals([tripId, productId])
        .toArray();

      return records.reduce((sum, record) => sum + record.quantity, 0);
    } catch (error) {
      throw new DatabaseError('find', 'consumptions', error instanceof Error ? error : undefined);
    }
  }
}
