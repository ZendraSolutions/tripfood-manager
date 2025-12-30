/**
 * @fileoverview Mapper bidireccional para Availability (Domain) <-> AvailabilityRecord (Persistence).
 *
 * Convierte entre la entidad de dominio Availability y el registro de persistencia
 * AvailabilityRecord, manejando la serialización/deserialización de fechas y arrays.
 *
 * @module infrastructure/persistence/mappers/AvailabilityMapper
 * @version 1.0.0
 */

import type { Availability } from '@domain/entities/Availability';
import type { AvailabilityRecord } from '../indexeddb/database';
import type { MealType } from './ConsumptionMapper';

/**
 * Props necesarias para crear una entidad Availability desde el dominio.
 */
export interface AvailabilityProps {
  id: string;
  participantId: string;
  tripId: string;
  date: Date;
  meals: MealType[];
}

/**
 * Mapper estático para conversión bidireccional Availability <-> AvailabilityRecord.
 *
 * @class AvailabilityMapper
 *
 * @example
 * ```typescript
 * // Domain -> Record
 * const record = AvailabilityMapper.toRecord(availabilityEntity);
 *
 * // Record -> Domain Props
 * const props = AvailabilityMapper.toDomainProps(record);
 * ```
 */
export class AvailabilityMapper {
  /**
   * Comidas válidas del día.
   */
  private static readonly VALID_MEALS: readonly MealType[] = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  /**
   * Constructor privado - clase estática.
   */
  private constructor() {
    // No instanciar
  }

  /**
   * Valida que el tipo de comida sea válido.
   *
   * @param meal - Tipo de comida a validar
   * @returns true si es un tipo válido
   */
  private static isValidMealType(meal: string): meal is MealType {
    return AvailabilityMapper.VALID_MEALS.includes(meal as MealType);
  }

  /**
   * Valida y convierte un array de strings a MealType[].
   *
   * @param meals - Array de strings de comidas
   * @returns Array de MealType validados
   * @throws Error si alguna comida no es válida
   */
  private static validateMeals(meals: string[]): MealType[] {
    const validatedMeals: MealType[] = [];

    for (const meal of meals) {
      if (!AvailabilityMapper.isValidMealType(meal)) {
        throw new Error(
          `Invalid meal type: ${meal}. Expected one of: ${AvailabilityMapper.VALID_MEALS.join(', ')}.`
        );
      }
      validatedMeals.push(meal);
    }

    return validatedMeals;
  }

  /**
   * Convierte una entidad de dominio Availability a un registro de persistencia.
   *
   * @param availability - Entidad de dominio Availability
   * @returns Registro de persistencia AvailabilityRecord
   */
  public static toRecord(availability: Availability): AvailabilityRecord {
    return {
      id: availability.id,
      participantId: availability.participantId,
      tripId: availability.tripId,
      date: availability.date.toISOString(),
      meals: [...availability.meals], // Copia defensiva del array
    };
  }

  /**
   * Convierte un registro de persistencia a las props de dominio.
   *
   * @param record - Registro de persistencia AvailabilityRecord
   * @returns Props para crear una entidad Availability
   * @throws Error si alguna comida no es válida
   */
  public static toDomainProps(record: AvailabilityRecord): AvailabilityProps {
    return {
      id: record.id,
      participantId: record.participantId,
      tripId: record.tripId,
      date: new Date(record.date),
      meals: AvailabilityMapper.validateMeals(record.meals),
    };
  }

  /**
   * Convierte un array de registros a array de props de dominio.
   *
   * @param records - Array de registros de persistencia
   * @returns Array de props para crear entidades Availability
   */
  public static toDomainPropsList(records: AvailabilityRecord[]): AvailabilityProps[] {
    return records.map((record) => AvailabilityMapper.toDomainProps(record));
  }

  /**
   * Convierte un array de entidades a array de registros.
   *
   * @param availabilities - Array de entidades Availability
   * @returns Array de registros de persistencia
   */
  public static toRecordList(availabilities: Availability[]): AvailabilityRecord[] {
    return availabilities.map((availability) => AvailabilityMapper.toRecord(availability));
  }

  /**
   * Crea un registro parcial para actualizaciones.
   *
   * @param updates - Campos a actualizar
   * @returns Registro parcial para update
   */
  public static toPartialRecord(
    updates: Partial<Omit<AvailabilityProps, 'id' | 'participantId' | 'tripId'>>
  ): Partial<AvailabilityRecord> {
    const record: Partial<AvailabilityRecord> = {};

    if (updates.date !== undefined) {
      record.date = updates.date.toISOString();
    }

    if (updates.meals !== undefined) {
      record.meals = [...updates.meals];
    }

    return record;
  }

  /**
   * Convierte una fecha a formato de solo fecha (YYYY-MM-DD) para comparaciones.
   *
   * @param date - Fecha a convertir
   * @returns String en formato YYYY-MM-DD
   */
  public static toDateOnlyString(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }

  /**
   * Crea una clave compuesta para identificar disponibilidad única.
   *
   * @param participantId - ID del participante
   * @param tripId - ID del viaje
   * @param date - Fecha de disponibilidad
   * @returns Clave compuesta única
   */
  public static createCompositeKey(participantId: string, tripId: string, date: Date): string {
    const dateStr = AvailabilityMapper.toDateOnlyString(date);
    return `${participantId}:${tripId}:${dateStr}`;
  }
}
