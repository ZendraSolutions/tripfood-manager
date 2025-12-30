/**
 * @fileoverview Mapper bidireccional para Trip (Domain) <-> TripRecord (Persistence).
 *
 * Convierte entre la entidad de dominio Trip y el registro de persistencia
 * TripRecord, manejando la serialización/deserialización de fechas y
 * asegurando la integridad de los datos.
 *
 * @module infrastructure/persistence/mappers/TripMapper
 * @version 1.0.0
 */

import type { Trip } from '@domain/entities/Trip';
import type { TripRecord } from '../indexeddb/database';

/**
 * Props necesarias para crear una entidad Trip desde el dominio.
 * Se usa cuando el mapper necesita crear una nueva instancia de Trip.
 */
export interface TripProps {
  id: string;
  name: string;
  description?: string | undefined;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mapper estático para conversión bidireccional Trip <-> TripRecord.
 *
 * Proporciona métodos para convertir entre la representación de dominio
 * (Trip entity con objetos Date) y la representación de persistencia
 * (TripRecord con strings ISO).
 *
 * @class TripMapper
 *
 * @example
 * ```typescript
 * // Domain -> Record (para guardar)
 * const record = TripMapper.toRecord(tripEntity);
 * await db.trips.put(record);
 *
 * // Record -> Domain (para leer)
 * const record = await db.trips.get(id);
 * const trip = TripMapper.toDomain(record);
 * ```
 */
export class TripMapper {
  /**
   * Constructor privado para prevenir instanciación.
   * Esta clase solo contiene métodos estáticos.
   */
  private constructor() {
    // Clase estática - no instanciar
  }

  /**
   * Convierte una entidad de dominio Trip a un registro de persistencia.
   *
   * Transforma los objetos Date a strings ISO 8601 para almacenamiento
   * en IndexedDB, preservando toda la información de la entidad.
   *
   * @param trip - Entidad de dominio Trip
   * @returns Registro de persistencia TripRecord
   *
   * @example
   * ```typescript
   * const trip = Trip.create({ name: 'Beach Trip', ... });
   * const record = TripMapper.toRecord(trip);
   * // record.startDate es "2025-07-15T00:00:00.000Z"
   * ```
   */
  public static toRecord(trip: Trip): TripRecord {
    return {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      createdAt: trip.createdAt.toISOString(),
      updatedAt: (trip.updatedAt ?? trip.createdAt).toISOString(),
    };
  }

  /**
   * Convierte un registro de persistencia a las props de dominio.
   *
   * Transforma los strings ISO 8601 de vuelta a objetos Date,
   * preparando los datos para crear una entidad Trip.
   *
   * @param record - Registro de persistencia TripRecord
   * @returns Props para crear una entidad Trip
   *
   * @example
   * ```typescript
   * const record = await db.trips.get(id);
   * const props = TripMapper.toDomainProps(record);
   * // props.startDate es un objeto Date
   * ```
   */
  public static toDomainProps(record: TripRecord): TripProps {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      startDate: new Date(record.startDate),
      endDate: new Date(record.endDate),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    };
  }

  /**
   * Convierte un array de registros a array de props de dominio.
   *
   * Útil para operaciones bulk como findAll().
   *
   * @param records - Array de registros de persistencia
   * @returns Array de props para crear entidades Trip
   */
  public static toDomainPropsList(records: TripRecord[]): TripProps[] {
    return records.map((record) => TripMapper.toDomainProps(record));
  }

  /**
   * Convierte un array de entidades a array de registros.
   *
   * Útil para operaciones bulk de guardado.
   *
   * @param trips - Array de entidades Trip
   * @returns Array de registros de persistencia
   */
  public static toRecordList(trips: Trip[]): TripRecord[] {
    return trips.map((trip) => TripMapper.toRecord(trip));
  }

  /**
   * Crea un registro parcial para actualizaciones.
   *
   * Solo incluye los campos que se van a actualizar,
   * siempre actualizando el timestamp updatedAt.
   *
   * @param updates - Campos a actualizar
   * @returns Registro parcial para update
   */
  public static toPartialRecord(
    updates: Partial<Omit<TripProps, 'id' | 'createdAt'>>
  ): Partial<TripRecord> {
    const record: Partial<TripRecord> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.name !== undefined) {
      record.name = updates.name;
    }

    if (updates.description !== undefined) {
      record.description = updates.description;
    }

    if (updates.startDate !== undefined) {
      record.startDate = updates.startDate.toISOString();
    }

    if (updates.endDate !== undefined) {
      record.endDate = updates.endDate.toISOString();
    }

    return record;
  }
}
