/**
 * @fileoverview Mapper bidireccional para Consumption (Domain) <-> ConsumptionRecord (Persistence).
 *
 * Convierte entre la entidad de dominio Consumption y el registro de persistencia
 * ConsumptionRecord, manejando la serialización/deserialización de fechas y tipos.
 *
 * @module infrastructure/persistence/mappers/ConsumptionMapper
 * @version 1.0.0
 */

import type { Consumption } from '@domain/entities/Consumption';
import type { ConsumptionRecord } from '../indexeddb/database';

/**
 * Tipo de comida del día.
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Props necesarias para crear una entidad Consumption desde el dominio.
 */
export interface ConsumptionProps {
  id: string;
  tripId: string;
  participantId: string;
  productId: string;
  date: Date;
  meal: MealType;
  quantity: number;
  createdAt: Date;
}

/**
 * Mapper estático para conversión bidireccional Consumption <-> ConsumptionRecord.
 *
 * @class ConsumptionMapper
 *
 * @example
 * ```typescript
 * // Domain -> Record
 * const record = ConsumptionMapper.toRecord(consumptionEntity);
 *
 * // Record -> Domain Props
 * const props = ConsumptionMapper.toDomainProps(record);
 * ```
 */
export class ConsumptionMapper {
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
    return ConsumptionMapper.VALID_MEALS.includes(meal as MealType);
  }

  /**
   * Convierte una entidad de dominio Consumption a un registro de persistencia.
   *
   * @param consumption - Entidad de dominio Consumption
   * @returns Registro de persistencia ConsumptionRecord
   */
  public static toRecord(consumption: Consumption): ConsumptionRecord {
    return {
      id: consumption.id,
      tripId: consumption.tripId,
      participantId: consumption.participantId,
      productId: consumption.productId,
      date: consumption.date.toISOString(),
      meal: consumption.meal,
      quantity: consumption.quantity,
      createdAt: consumption.createdAt.toISOString(),
    };
  }

  /**
   * Convierte un registro de persistencia a las props de dominio.
   *
   * @param record - Registro de persistencia ConsumptionRecord
   * @returns Props para crear una entidad Consumption
   * @throws Error si el tipo de comida no es válido
   */
  public static toDomainProps(record: ConsumptionRecord): ConsumptionProps {
    if (!ConsumptionMapper.isValidMealType(record.meal)) {
      throw new Error(
        `Invalid meal type: ${record.meal}. Expected one of: ${ConsumptionMapper.VALID_MEALS.join(', ')}.`
      );
    }

    return {
      id: record.id,
      tripId: record.tripId,
      participantId: record.participantId,
      productId: record.productId,
      date: new Date(record.date),
      meal: record.meal,
      quantity: record.quantity,
      createdAt: new Date(record.createdAt),
    };
  }

  /**
   * Convierte un array de registros a array de props de dominio.
   *
   * @param records - Array de registros de persistencia
   * @returns Array de props para crear entidades Consumption
   */
  public static toDomainPropsList(records: ConsumptionRecord[]): ConsumptionProps[] {
    return records.map((record) => ConsumptionMapper.toDomainProps(record));
  }

  /**
   * Convierte un array de entidades a array de registros.
   *
   * @param consumptions - Array de entidades Consumption
   * @returns Array de registros de persistencia
   */
  public static toRecordList(consumptions: Consumption[]): ConsumptionRecord[] {
    return consumptions.map((consumption) => ConsumptionMapper.toRecord(consumption));
  }

  /**
   * Crea un registro parcial para actualizaciones.
   *
   * @param updates - Campos a actualizar
   * @returns Registro parcial para update
   */
  public static toPartialRecord(
    updates: Partial<Omit<ConsumptionProps, 'id' | 'tripId' | 'createdAt'>>
  ): Partial<ConsumptionRecord> {
    const record: Partial<ConsumptionRecord> = {};

    if (updates.participantId !== undefined) {
      record.participantId = updates.participantId;
    }

    if (updates.productId !== undefined) {
      record.productId = updates.productId;
    }

    if (updates.date !== undefined) {
      record.date = updates.date.toISOString();
    }

    if (updates.meal !== undefined) {
      record.meal = updates.meal;
    }

    if (updates.quantity !== undefined) {
      record.quantity = updates.quantity;
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
}
