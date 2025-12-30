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
import type { ProductCategory, ProductType as DomainProductType, ProductUnit } from '@domain/types';
import type { ProductRecord } from '../indexeddb/database';

/**
 * Tipo de producto legacy: comida o bebida.
 * @deprecated Use domain ProductType instead
 */
export type ProductType = 'food' | 'beverage';

/**
 * Props necesarias para crear una entidad Product desde el dominio.
 * Mirrors IProductProps from domain for compatibility.
 */
export interface ProductProps {
  id: string;
  name: string;
  category: ProductCategory;
  type: DomainProductType;
  unit: ProductUnit;
  defaultQuantityPerPerson?: number | undefined;
  notes?: string | undefined;
  createdAt: Date;
  updatedAt?: Date | undefined;
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
   */
  public static toDomainProps(record: ProductRecord): ProductProps {
    return {
      id: record.id,
      name: record.name,
      category: record.category as ProductCategory,
      type: record.type as DomainProductType,
      unit: record.unit as ProductUnit,
      defaultQuantityPerPerson: record.defaultQuantityPerPerson,
      notes: record.notes,
      createdAt: new Date(record.createdAt),
      updatedAt: undefined,
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
