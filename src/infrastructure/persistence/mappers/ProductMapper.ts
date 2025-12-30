/**
 * @fileoverview Mapper bidireccional para Product (Domain) <-> ProductRecord (Persistence).
 *
 * Convierte entre la entidad de dominio Product y el registro de persistencia
 * ProductRecord, manejando la serialización/deserialización de tipos.
 *
 * @module infrastructure/persistence/mappers/ProductMapper
 * @version 1.0.0
 */

import type { Product } from '@domain/entities/Product';
import type { ProductRecord } from '../indexeddb/database';

/**
 * Tipo de producto: comida o bebida.
 */
export type ProductType = 'food' | 'beverage';

/**
 * Props necesarias para crear una entidad Product desde el dominio.
 */
export interface ProductProps {
  id: string;
  name: string;
  category: string;
  type: ProductType;
  unit: string;
  defaultQuantityPerPerson?: number;
  notes?: string;
  createdAt: Date;
}

/**
 * Mapper estático para conversión bidireccional Product <-> ProductRecord.
 *
 * @class ProductMapper
 *
 * @example
 * ```typescript
 * // Domain -> Record
 * const record = ProductMapper.toRecord(productEntity);
 *
 * // Record -> Domain Props
 * const props = ProductMapper.toDomainProps(record);
 * ```
 */
export class ProductMapper {
  /**
   * Constructor privado - clase estática.
   */
  private constructor() {
    // No instanciar
  }

  /**
   * Valida que el tipo de producto sea válido.
   *
   * @param type - Tipo a validar
   * @returns true si es un tipo válido
   */
  private static isValidProductType(type: string): type is ProductType {
    return type === 'food' || type === 'beverage';
  }

  /**
   * Convierte una entidad de dominio Product a un registro de persistencia.
   *
   * @param product - Entidad de dominio Product
   * @returns Registro de persistencia ProductRecord
   */
  public static toRecord(product: Product): ProductRecord {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      unit: product.unit,
      defaultQuantityPerPerson: product.defaultQuantityPerPerson,
      notes: product.notes,
      createdAt: product.createdAt.toISOString(),
    };
  }

  /**
   * Convierte un registro de persistencia a las props de dominio.
   *
   * @param record - Registro de persistencia ProductRecord
   * @returns Props para crear una entidad Product
   * @throws Error si el tipo de producto no es válido
   */
  public static toDomainProps(record: ProductRecord): ProductProps {
    if (!ProductMapper.isValidProductType(record.type)) {
      throw new Error(`Invalid product type: ${record.type}. Expected 'food' or 'beverage'.`);
    }

    return {
      id: record.id,
      name: record.name,
      category: record.category,
      type: record.type,
      unit: record.unit,
      defaultQuantityPerPerson: record.defaultQuantityPerPerson,
      notes: record.notes,
      createdAt: new Date(record.createdAt),
    };
  }

  /**
   * Convierte un array de registros a array de props de dominio.
   *
   * @param records - Array de registros de persistencia
   * @returns Array de props para crear entidades Product
   */
  public static toDomainPropsList(records: ProductRecord[]): ProductProps[] {
    return records.map((record) => ProductMapper.toDomainProps(record));
  }

  /**
   * Convierte un array de entidades a array de registros.
   *
   * @param products - Array de entidades Product
   * @returns Array de registros de persistencia
   */
  public static toRecordList(products: Product[]): ProductRecord[] {
    return products.map((product) => ProductMapper.toRecord(product));
  }

  /**
   * Crea un registro parcial para actualizaciones.
   *
   * @param updates - Campos a actualizar
   * @returns Registro parcial para update
   */
  public static toPartialRecord(
    updates: Partial<Omit<ProductProps, 'id' | 'createdAt'>>
  ): Partial<ProductRecord> {
    const record: Partial<ProductRecord> = {};

    if (updates.name !== undefined) {
      record.name = updates.name;
    }

    if (updates.category !== undefined) {
      record.category = updates.category;
    }

    if (updates.type !== undefined) {
      record.type = updates.type;
    }

    if (updates.unit !== undefined) {
      record.unit = updates.unit;
    }

    if (updates.defaultQuantityPerPerson !== undefined) {
      record.defaultQuantityPerPerson = updates.defaultQuantityPerPerson;
    }

    if (updates.notes !== undefined) {
      record.notes = updates.notes;
    }

    return record;
  }
}
