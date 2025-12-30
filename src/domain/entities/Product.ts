/**
 * @fileoverview Product entity for TripFood Manager.
 * Represents a food or beverage product that can be consumed during trips.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors';
import {
  ProductCategory,
  ProductType,
  ProductUnit,
  isProductCategory,
  isProductType,
  isProductUnit,
  getCategoryForType,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  PRODUCT_UNITS,
} from '../types';

/**
 * Interface representing the data transfer object for creating a Product.
 */
export interface IProductCreateDTO {
  /** Name of the product */
  readonly name: string;
  /** Category of the product (food, beverage, other) */
  readonly category: ProductCategory;
  /** Specific type of the product */
  readonly type: ProductType;
  /** Unit of measurement */
  readonly unit: ProductUnit;
  /** Default quantity per person (optional) */
  readonly defaultQuantityPerPerson?: number | undefined;
  /** Optional notes about the product */
  readonly notes?: string | undefined;
}

/**
 * Interface representing the data transfer object for updating a Product.
 */
export interface IProductUpdateDTO {
  /** New name for the product */
  readonly name?: string;
  /** New category for the product */
  readonly category?: ProductCategory;
  /** New type for the product */
  readonly type?: ProductType;
  /** New unit for the product */
  readonly unit?: ProductUnit;
  /** New default quantity per person (null to remove) */
  readonly defaultQuantityPerPerson?: number | null;
  /** New notes for the product (null to remove) */
  readonly notes?: string | null;
}

/**
 * Interface representing the Product entity properties.
 */
export interface IProductProps {
  /** Unique identifier */
  readonly id: string;
  /** Name of the product */
  readonly name: string;
  /** Category of the product */
  readonly category: ProductCategory;
  /** Specific type of the product */
  readonly type: ProductType;
  /** Unit of measurement */
  readonly unit: ProductUnit;
  /** Default quantity per person */
  readonly defaultQuantityPerPerson?: number | undefined;
  /** Optional notes about the product */
  readonly notes?: string | undefined;
  /** Timestamp when the product was created */
  readonly createdAt: Date;
  /** Timestamp when the product was last updated */
  readonly updatedAt?: Date | undefined;
}

/**
 * Product entity representing a food or beverage item.
 *
 * @description
 * The Product entity represents items that can be consumed during trips.
 * Products are categorized by type (food/beverage) and have units of
 * measurement for tracking consumption quantities.
 *
 * All instances are immutable - updates return new instances.
 *
 * @example
 * ```typescript
 * // Create a new product
 * const product = Product.create({
 *   name: 'Bottled Water',
 *   category: 'beverage',
 *   type: 'water',
 *   unit: 'bottle',
 *   defaultQuantityPerPerson: 2,
 * });
 *
 * // Update the product
 * const updated = product.update({ defaultQuantityPerPerson: 3 });
 * ```
 *
 * @implements {IProductProps}
 */
export class Product implements IProductProps {
  /**
   * Minimum length for product name.
   */
  public static readonly MIN_NAME_LENGTH = 2;

  /**
   * Maximum length for product name.
   */
  public static readonly MAX_NAME_LENGTH = 100;

  /**
   * Maximum length for product notes.
   */
  public static readonly MAX_NOTES_LENGTH = 500;

  /**
   * Minimum default quantity per person.
   */
  public static readonly MIN_QUANTITY = 0.01;

  /**
   * Maximum default quantity per person.
   */
  public static readonly MAX_QUANTITY = 1000;

  /**
   * Unique identifier for the product.
   * @readonly
   */
  public readonly id: string;

  /**
   * Name of the product.
   * @readonly
   */
  public readonly name: string;

  /**
   * Category of the product (food, beverage, other).
   * @readonly
   */
  public readonly category: ProductCategory;

  /**
   * Specific type of the product.
   * @readonly
   */
  public readonly type: ProductType;

  /**
   * Unit of measurement for the product.
   * @readonly
   */
  public readonly unit: ProductUnit;

  /**
   * Default quantity per person.
   * @readonly
   */
  public readonly defaultQuantityPerPerson?: number | undefined;

  /**
   * Optional notes about the product.
   * @readonly
   */
  public readonly notes?: string | undefined;

  /**
   * Timestamp when the product was created.
   * @readonly
   */
  public readonly createdAt: Date;

  /**
   * Timestamp when the product was last updated.
   * @readonly
   */
  public readonly updatedAt?: Date | undefined;

  /**
   * Private constructor to enforce factory method usage.
   *
   * @param props - The product properties
   */
  private constructor(props: IProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.category = props.category;
    this.type = props.type;
    this.unit = props.unit;
    this.defaultQuantityPerPerson = props.defaultQuantityPerPerson;
    this.notes = props.notes;
    this.createdAt = new Date(props.createdAt);
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : undefined;

    // Freeze the object to ensure immutability
    Object.freeze(this);
  }

  /**
   * Creates a new Product entity with validation.
   *
   * @param dto - The data transfer object containing product data
   * @returns A new Product instance
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const product = Product.create({
   *   name: 'Fresh Bread',
   *   category: 'food',
   *   type: 'grains',
   *   unit: 'unit',
   *   defaultQuantityPerPerson: 2,
   * });
   * ```
   */
  public static create(dto: IProductCreateDTO): Product {
    // Validate name
    Product.validateName(dto.name);

    // Validate category
    Product.validateCategory(dto.category);

    // Validate type
    Product.validateType(dto.type);

    // Validate type matches category
    Product.validateTypeMatchesCategory(dto.type, dto.category);

    // Validate unit
    Product.validateUnit(dto.unit);

    // Validate default quantity if provided
    if (dto.defaultQuantityPerPerson !== undefined) {
      Product.validateQuantity(dto.defaultQuantityPerPerson);
    }

    // Validate notes if provided
    if (dto.notes !== undefined) {
      Product.validateNotes(dto.notes);
    }

    const now = new Date();

    return new Product({
      id: uuidv4(),
      name: dto.name.trim(),
      category: dto.category,
      type: dto.type,
      unit: dto.unit,
      defaultQuantityPerPerson: dto.defaultQuantityPerPerson,
      notes: dto.notes?.trim(),
      createdAt: now,
    });
  }

  /**
   * Reconstructs a Product entity from persistence data.
   *
   * @param props - The product properties from persistence
   * @returns A Product instance
   */
  public static fromPersistence(props: IProductProps): Product {
    return new Product(props);
  }

  /**
   * Updates the product with new values, returning a new instance.
   *
   * @param dto - The update data transfer object
   * @returns A new Product instance with updated values
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = product.update({
   *   name: 'Whole Grain Bread',
   *   defaultQuantityPerPerson: 3,
   * });
   * ```
   */
  public update(dto: IProductUpdateDTO): Product {
    const newName = dto.name !== undefined ? dto.name : this.name;
    const newCategory = dto.category !== undefined ? dto.category : this.category;
    const newType = dto.type !== undefined ? dto.type : this.type;
    const newUnit = dto.unit !== undefined ? dto.unit : this.unit;
    const newDefaultQuantity = dto.defaultQuantityPerPerson === null
      ? undefined
      : dto.defaultQuantityPerPerson !== undefined
        ? dto.defaultQuantityPerPerson
        : this.defaultQuantityPerPerson;
    const newNotes = dto.notes === null
      ? undefined
      : dto.notes !== undefined
        ? dto.notes
        : this.notes;

    // Validate updated values
    if (dto.name !== undefined) {
      Product.validateName(dto.name);
    }

    if (dto.category !== undefined) {
      Product.validateCategory(dto.category);
    }

    if (dto.type !== undefined) {
      Product.validateType(dto.type);
    }

    // Validate type matches category if either changed
    if (dto.type !== undefined || dto.category !== undefined) {
      Product.validateTypeMatchesCategory(newType, newCategory);
    }

    if (dto.unit !== undefined) {
      Product.validateUnit(dto.unit);
    }

    if (dto.defaultQuantityPerPerson !== undefined && dto.defaultQuantityPerPerson !== null) {
      Product.validateQuantity(dto.defaultQuantityPerPerson);
    }

    if (dto.notes !== undefined && dto.notes !== null) {
      Product.validateNotes(dto.notes);
    }

    return new Product({
      id: this.id,
      name: newName.trim(),
      category: newCategory,
      type: newType,
      unit: newUnit,
      defaultQuantityPerPerson: newDefaultQuantity,
      notes: newNotes?.trim(),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if the product is a food item.
   *
   * @returns True if the product is food
   */
  public isFood(): boolean {
    return this.category === 'food';
  }

  /**
   * Checks if the product is a beverage.
   *
   * @returns True if the product is a beverage
   */
  public isBeverage(): boolean {
    return this.category === 'beverage';
  }

  /**
   * Checks if the product has a default quantity per person.
   *
   * @returns True if the product has a default quantity
   */
  public hasDefaultQuantity(): boolean {
    return this.defaultQuantityPerPerson !== undefined && this.defaultQuantityPerPerson > 0;
  }

  /**
   * Calculates the total quantity needed for a given number of people.
   *
   * @param numberOfPeople - The number of people
   * @returns The total quantity needed, or undefined if no default quantity
   */
  public calculateQuantityForPeople(numberOfPeople: number): number | undefined {
    if (!this.hasDefaultQuantity() || this.defaultQuantityPerPerson === undefined) {
      return undefined;
    }

    if (numberOfPeople <= 0) {
      return 0;
    }

    return this.defaultQuantityPerPerson * numberOfPeople;
  }

  /**
   * Converts the entity to a plain object for serialization.
   *
   * @returns Plain object representation of the product
   */
  public toJSON(): IProductProps {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      type: this.type,
      unit: this.unit,
      defaultQuantityPerPerson: this.defaultQuantityPerPerson,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validates the product name.
   *
   * @param name - The name to validate
   * @throws {ValidationError} If name is invalid
   */
  private static validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw ValidationError.required('name', 'Product');
    }

    const trimmedName = name.trim();

    if (trimmedName.length < Product.MIN_NAME_LENGTH) {
      throw ValidationError.invalidLength(
        'name',
        Product.MIN_NAME_LENGTH,
        Product.MAX_NAME_LENGTH,
        trimmedName.length
      );
    }

    if (trimmedName.length > Product.MAX_NAME_LENGTH) {
      throw ValidationError.invalidLength(
        'name',
        Product.MIN_NAME_LENGTH,
        Product.MAX_NAME_LENGTH,
        trimmedName.length
      );
    }
  }

  /**
   * Validates the product category.
   *
   * @param category - The category to validate
   * @throws {ValidationError} If category is invalid
   */
  private static validateCategory(category: ProductCategory): void {
    if (!isProductCategory(category)) {
      throw new ValidationError(
        `Invalid product category: '${String(category)}'. Valid categories are: ${PRODUCT_CATEGORIES.join(', ')}`,
        'category',
        'enum'
      );
    }
  }

  /**
   * Validates the product type.
   *
   * @param type - The type to validate
   * @throws {ValidationError} If type is invalid
   */
  private static validateType(type: ProductType): void {
    if (!isProductType(type)) {
      throw new ValidationError(
        `Invalid product type: '${String(type)}'. Valid types are: ${PRODUCT_TYPES.join(', ')}`,
        'type',
        'enum'
      );
    }
  }

  /**
   * Validates that product type matches the category.
   *
   * @param type - The product type
   * @param category - The product category
   * @throws {ValidationError} If type doesn't match category
   */
  private static validateTypeMatchesCategory(
    type: ProductType,
    category: ProductCategory
  ): void {
    const expectedCategory = getCategoryForType(type);

    if (expectedCategory !== category) {
      throw new ValidationError(
        `Product type '${type}' does not belong to category '${category}'. ` +
        `Expected category: '${expectedCategory}'`,
        'type',
        'categoryMismatch'
      );
    }
  }

  /**
   * Validates the product unit.
   *
   * @param unit - The unit to validate
   * @throws {ValidationError} If unit is invalid
   */
  private static validateUnit(unit: ProductUnit): void {
    if (!isProductUnit(unit)) {
      throw new ValidationError(
        `Invalid product unit: '${String(unit)}'. Valid units are: ${PRODUCT_UNITS.join(', ')}`,
        'unit',
        'enum'
      );
    }
  }

  /**
   * Validates the quantity.
   *
   * @param quantity - The quantity to validate
   * @throws {ValidationError} If quantity is invalid
   */
  private static validateQuantity(quantity: number): void {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw ValidationError.invalidFormat('defaultQuantityPerPerson', 'number');
    }

    if (quantity < Product.MIN_QUANTITY || quantity > Product.MAX_QUANTITY) {
      throw ValidationError.outOfRange(
        'defaultQuantityPerPerson',
        Product.MIN_QUANTITY,
        Product.MAX_QUANTITY,
        quantity
      );
    }
  }

  /**
   * Validates the notes.
   *
   * @param notes - The notes to validate
   * @throws {ValidationError} If notes are invalid
   */
  private static validateNotes(notes: string): void {
    if (notes.length > Product.MAX_NOTES_LENGTH) {
      throw ValidationError.invalidLength(
        'notes',
        undefined,
        Product.MAX_NOTES_LENGTH,
        notes.length
      );
    }
  }

  /**
   * Compares this product with another for equality.
   *
   * @param other - The other product to compare
   * @returns True if the products are equal (same ID)
   */
  public equals(other: Product): boolean {
    if (!(other instanceof Product)) {
      return false;
    }
    return this.id === other.id;
  }
}

/**
 * Type alias for backward compatibility.
 * @deprecated Use Product class directly
 */
export type ProductEntity = Product;

/**
 * Re-export ProductType from types for backward compatibility.
 * @deprecated Import from '../types' instead
 */
export type { ProductType } from '../types';

/**
 * Type alias for create props - backward compatibility.
 * @deprecated Use IProductCreateDTO instead
 */
export interface CreateProductProps {
  id?: string;
  name: string;
  category: string;
  type: 'food' | 'beverage';
  unit: string;
  defaultQuantityPerPerson?: number;
  notes?: string;
}

/**
 * Factory function for backward compatibility.
 * @deprecated Use Product.create() instead
 *
 * @param props - The product creation properties
 * @returns A new Product instance
 */
export function createProduct(props: CreateProductProps): Product {
  // Map old 'food'/'beverage' type to new category and infer a default type
  let category: ProductCategory;
  let type: ProductType;

  if (props.type === 'food') {
    category = 'food';
    type = 'prepared_food'; // Default type for food
  } else {
    category = 'beverage';
    type = 'soft_drink'; // Default type for beverage
  }

  // Map unit string to ProductUnit, defaulting to 'unit' if not recognized
  const unit = isProductUnit(props.unit) ? props.unit : 'unit';

  return Product.create({
    name: props.name,
    category,
    type,
    unit,
    defaultQuantityPerPerson: props.defaultQuantityPerPerson,
    notes: props.notes,
  });
}
