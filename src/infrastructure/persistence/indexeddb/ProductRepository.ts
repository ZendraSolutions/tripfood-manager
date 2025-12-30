/**
 * @fileoverview Implementación del repositorio de Product usando IndexedDB/Dexie.
 *
 * Este repositorio implementa IProductRepository del dominio, proporcionando
 * persistencia de productos en IndexedDB a través de Dexie.js con manejo
 * robusto de errores y documentación completa.
 *
 * @module infrastructure/persistence/indexeddb/ProductRepository
 * @version 1.0.0
 */

import type { IProductRepository } from '@domain/interfaces/repositories/IProductRepository';
import type { Product } from '@domain/entities/Product';
import { TripFoodDatabase, type ProductRecord } from './database';
import { ProductMapper, type ProductProps, type ProductType } from '../mappers/ProductMapper';
import { DatabaseError } from '../../errors/DatabaseError';

/**
 * Repositorio de Product implementado con IndexedDB a través de Dexie.js.
 *
 * Proporciona operaciones CRUD completas para la entidad Product,
 * con métodos específicos para consultas por categoría y tipo,
 * y manejo de errores enterprise-grade.
 *
 * @class IndexedDBProductRepository
 * @implements {IProductRepository}
 *
 * @example
 * ```typescript
 * const productRepo = new IndexedDBProductRepository(database, productFactory);
 *
 * // Crear un producto
 * const product = Product.create({ name: 'Coca Cola', type: 'beverage', ... });
 * await productRepo.save(product);
 *
 * // Buscar por categoría
 * const beverages = await productRepo.findByType('beverage');
 * ```
 */
export class IndexedDBProductRepository implements IProductRepository {
  /**
   * Instancia de la base de datos Dexie.
   * @private
   * @readonly
   */
  private readonly db: TripFoodDatabase;

  /**
   * Factory function para crear entidades Product desde props.
   * Se inyecta para mantener la separación de capas.
   * @private
   * @readonly
   */
  private readonly productFactory: (props: ProductProps) => Product;

  /**
   * Crea una nueva instancia del repositorio.
   *
   * @param database - Instancia de TripFoodDatabase
   * @param productFactory - Factory function para crear entidades Product
   */
  constructor(
    database: TripFoodDatabase,
    productFactory: (props: ProductProps) => Product
  ) {
    this.db = database;
    this.productFactory = productFactory;
  }

  /**
   * Busca un producto por su ID.
   *
   * @param id - ID único del producto
   * @returns Promise con el Product encontrado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findById(id: string): Promise<Product | null> {
    try {
      const record = await this.db.products.get(id);

      if (!record) {
        return null;
      }

      const props = ProductMapper.toDomainProps(record);
      return this.productFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'findById',
        'products',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Obtiene todos los productos.
   *
   * @returns Promise con array de todos los Product
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAll(): Promise<Product[]> {
    try {
      const records = await this.db.products.toArray();
      const propsList = ProductMapper.toDomainPropsList(records);
      return propsList.map((props) => this.productFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda un producto (crea nuevo o actualiza existente).
   *
   * Utiliza put() de Dexie que hace upsert automático basado en la PK.
   *
   * @param product - Entidad Product a guardar
   * @returns Promise con el Product guardado
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async save(product: Product): Promise<Product> {
    try {
      const record = ProductMapper.toRecord(product);
      await this.db.products.put(record);
      return product;
    } catch (error) {
      throw new DatabaseError(
        'create',
        'products',
        error instanceof Error ? error : undefined,
        product.id
      );
    }
  }

  /**
   * Elimina un producto por su ID.
   *
   * @param id - ID del producto a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async delete(id: string): Promise<void> {
    try {
      await this.db.products.delete(id);
    } catch (error) {
      throw new DatabaseError(
        'delete',
        'products',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Busca productos por categoría.
   *
   * @param category - Categoría a buscar (ej: 'carnes', 'lacteos')
   * @returns Promise con array de Product de esa categoría
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByCategory(category: string): Promise<Product[]> {
    try {
      const records = await this.db.products.where('category').equals(category).toArray();

      const propsList = ProductMapper.toDomainPropsList(records);
      return propsList.map((props) => this.productFactory(props));
    } catch (error) {
      throw new DatabaseError('findByIndex', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Busca productos por tipo (food o beverage).
   *
   * @param type - Tipo de producto: 'food' | 'beverage'
   * @returns Promise con array de Product de ese tipo
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByType(type: ProductType): Promise<Product[]> {
    try {
      const records = await this.db.products.where('type').equals(type).toArray();

      const propsList = ProductMapper.toDomainPropsList(records);
      return propsList.map((props) => this.productFactory(props));
    } catch (error) {
      throw new DatabaseError('findByIndex', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Busca productos por nombre (búsqueda parcial, case-insensitive).
   *
   * @param name - Nombre o parte del nombre a buscar
   * @returns Promise con array de Product que coinciden
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByName(name: string): Promise<Product[]> {
    try {
      const searchTerm = name.toLowerCase();
      const records = await this.db.products
        .filter((product) => product.name.toLowerCase().includes(searchTerm))
        .toArray();

      const propsList = ProductMapper.toDomainPropsList(records);
      return propsList.map((props) => this.productFactory(props));
    } catch (error) {
      throw new DatabaseError('find', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Busca un producto por nombre exacto.
   *
   * Útil para validar duplicados.
   *
   * @param name - Nombre exacto a buscar
   * @returns Promise con el Product encontrado o null
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findByExactName(name: string): Promise<Product | null> {
    try {
      const record = await this.db.products
        .filter((p) => p.name.toLowerCase() === name.toLowerCase())
        .first();

      if (!record) {
        return null;
      }

      const props = ProductMapper.toDomainProps(record);
      return this.productFactory(props);
    } catch (error) {
      throw new DatabaseError('find', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Obtiene todas las categorías distintas de productos.
   *
   * @returns Promise con array de strings de categorías únicas
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async getDistinctCategories(): Promise<string[]> {
    try {
      const records = await this.db.products.orderBy('category').uniqueKeys();
      return records as string[];
    } catch (error) {
      throw new DatabaseError('find', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Verifica si existe un producto con el ID dado.
   *
   * @param id - ID a verificar
   * @returns Promise que resuelve a true si existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const count = await this.db.products.where('id').equals(id).count();
      return count > 0;
    } catch (error) {
      throw new DatabaseError(
        'find',
        'products',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Actualiza campos específicos de un producto.
   *
   * @param id - ID del producto a actualizar
   * @param updates - Objeto con los campos a actualizar
   * @returns Promise con el Product actualizado o null si no existe
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async update(
    id: string,
    updates: Partial<
      Pick<ProductRecord, 'name' | 'category' | 'type' | 'unit' | 'defaultQuantityPerPerson' | 'notes'>
    >
  ): Promise<Product | null> {
    try {
      const existingRecord = await this.db.products.get(id);

      if (!existingRecord) {
        return null;
      }

      const updatedRecord: ProductRecord = {
        ...existingRecord,
        ...updates,
      };

      await this.db.products.put(updatedRecord);

      const props = ProductMapper.toDomainProps(updatedRecord);
      return this.productFactory(props);
    } catch (error) {
      throw new DatabaseError(
        'update',
        'products',
        error instanceof Error ? error : undefined,
        id
      );
    }
  }

  /**
   * Cuenta el número total de productos.
   *
   * @returns Promise con el conteo de productos
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async count(): Promise<number> {
    try {
      return await this.db.products.count();
    } catch (error) {
      throw new DatabaseError('count', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta productos por categoría.
   *
   * @param category - Categoría a contar
   * @returns Promise con el conteo
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async countByCategory(category: string): Promise<number> {
    try {
      return await this.db.products.where('category').equals(category).count();
    } catch (error) {
      throw new DatabaseError('count', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Cuenta productos por tipo.
   *
   * @param type - Tipo a contar: 'food' | 'beverage'
   * @returns Promise con el conteo
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async countByType(type: ProductType): Promise<number> {
    try {
      return await this.db.products.where('type').equals(type).count();
    } catch (error) {
      throw new DatabaseError('count', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Elimina múltiples productos por sus IDs.
   *
   * @param ids - Array de IDs a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.db.products.bulkDelete(ids);
    } catch (error) {
      throw new DatabaseError('delete', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Guarda múltiples productos en una sola transacción.
   *
   * @param products - Array de entidades Product a guardar
   * @returns Promise con el array de Product guardados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async saveMany(products: Product[]): Promise<Product[]> {
    try {
      const records = ProductMapper.toRecordList(products);
      await this.db.products.bulkPut(records);
      return products;
    } catch (error) {
      throw new DatabaseError('create', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Obtiene todos los productos ordenados por nombre.
   *
   * @returns Promise con array de Product ordenados alfabéticamente
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAllOrderedByName(): Promise<Product[]> {
    try {
      const records = await this.db.products.orderBy('name').toArray();

      const propsList = ProductMapper.toDomainPropsList(records);
      return propsList.map((props) => this.productFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'products', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Obtiene todos los productos ordenados por categoría y luego por nombre.
   *
   * @returns Promise con array de Product ordenados
   * @throws {DatabaseError} Si ocurre un error de base de datos
   */
  public async findAllGroupedByCategory(): Promise<Product[]> {
    try {
      const records = await this.db.products.orderBy('category').toArray();
      // Ordenar secundariamente por nombre dentro de cada categoría
      records.sort((a, b) => {
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return a.category.localeCompare(b.category);
      });

      const propsList = ProductMapper.toDomainPropsList(records);
      return propsList.map((props) => this.productFactory(props));
    } catch (error) {
      throw new DatabaseError('findAll', 'products', error instanceof Error ? error : undefined);
    }
  }
}
