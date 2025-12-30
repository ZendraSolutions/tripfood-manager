/**
 * @fileoverview Configuración de la base de datos IndexedDB usando Dexie.js.
 *
 * Define el esquema de la base de datos, las tablas, índices y la instancia
 * singleton de la base de datos para toda la aplicación.
 *
 * @module infrastructure/persistence/indexeddb/database
 * @version 1.0.0
 */

import Dexie, { type Table } from 'dexie';

/**
 * Registro de Trip almacenado en IndexedDB.
 * Representa la estructura de datos persistida.
 */
export interface TripRecord {
  /** Identificador único del viaje */
  id: string;
  /** Nombre del viaje */
  name: string;
  /** Descripción opcional del viaje */
  description?: string;
  /** Fecha de inicio en formato ISO 8601 */
  startDate: string;
  /** Fecha de fin en formato ISO 8601 */
  endDate: string;
  /** Timestamp de creación en formato ISO 8601 */
  createdAt: string;
  /** Timestamp de última actualización en formato ISO 8601 */
  updatedAt: string;
}

/**
 * Registro de Participant almacenado en IndexedDB.
 */
export interface ParticipantRecord {
  /** Identificador único del participante */
  id: string;
  /** ID del viaje al que pertenece */
  tripId: string;
  /** Nombre del participante */
  name: string;
  /** Email del participante (opcional) */
  email?: string;
  /** Notas adicionales (opcional) */
  notes?: string;
  /** Timestamp de creación en formato ISO 8601 */
  createdAt: string;
}

/**
 * Registro de Product almacenado en IndexedDB.
 */
export interface ProductRecord {
  /** Identificador único del producto */
  id: string;
  /** Nombre del producto */
  name: string;
  /** Categoría del producto (ej: 'carnes', 'lacteos', 'snacks') */
  category: string;
  /** Tipo de producto: 'food' | 'beverage' */
  type: string;
  /** Unidad de medida (ej: 'kg', 'unidad', 'litro') */
  unit: string;
  /** Cantidad por defecto por persona (opcional) */
  defaultQuantityPerPerson?: number;
  /** Notas adicionales (opcional) */
  notes?: string;
  /** Timestamp de creación en formato ISO 8601 */
  createdAt: string;
}

/**
 * Registro de Consumption almacenado en IndexedDB.
 */
export interface ConsumptionRecord {
  /** Identificador único del consumo */
  id: string;
  /** ID del viaje */
  tripId: string;
  /** ID del participante que consumió */
  participantId: string;
  /** ID del producto consumido */
  productId: string;
  /** Fecha del consumo en formato ISO 8601 */
  date: string;
  /** Comida del día (ej: 'breakfast', 'lunch', 'dinner') */
  meal: string;
  /** Cantidad consumida */
  quantity: number;
  /** Timestamp de creación en formato ISO 8601 */
  createdAt: string;
}

/**
 * Registro de Availability almacenado en IndexedDB.
 */
export interface AvailabilityRecord {
  /** Identificador único de la disponibilidad */
  id: string;
  /** ID del participante */
  participantId: string;
  /** ID del viaje */
  tripId: string;
  /** Fecha de disponibilidad en formato ISO 8601 */
  date: string;
  /** Comidas en las que estará presente */
  meals: string[];
}

/**
 * Clase principal de la base de datos TripFood.
 *
 * Extiende Dexie para proporcionar tipado fuerte y configuración
 * de tablas e índices optimizados para las consultas frecuentes.
 *
 * @class TripFoodDatabase
 * @extends Dexie
 *
 * @example
 * ```typescript
 * import { db } from '@infrastructure/persistence/indexeddb/database';
 *
 * // Usar directamente
 * const trips = await db.trips.toArray();
 *
 * // O inyectar en repositorios
 * const tripRepo = new TripRepository(db);
 * ```
 */
export class TripFoodDatabase extends Dexie {
  /**
   * Tabla de viajes.
   * Índices: id (PK), name, startDate, endDate, createdAt
   */
  public trips!: Table<TripRecord, string>;

  /**
   * Tabla de participantes.
   * Índices: id (PK), tripId, name, createdAt
   */
  public participants!: Table<ParticipantRecord, string>;

  /**
   * Tabla de productos.
   * Índices: id (PK), name, category, type, createdAt
   */
  public products!: Table<ProductRecord, string>;

  /**
   * Tabla de consumos.
   * Índices: id (PK), tripId, participantId, productId, date, meal
   * Índice compuesto: [tripId+date], [tripId+participantId]
   */
  public consumptions!: Table<ConsumptionRecord, string>;

  /**
   * Tabla de disponibilidades.
   * Índices: id (PK), participantId, tripId, date
   * Índice compuesto: [tripId+date], [participantId+date]
   */
  public availabilities!: Table<AvailabilityRecord, string>;

  /**
   * Nombre de la base de datos en IndexedDB.
   */
  public static readonly DATABASE_NAME = 'tripfood-db';

  /**
   * Versión actual del esquema de la base de datos.
   */
  public static readonly CURRENT_VERSION = 1;

  /**
   * Crea una nueva instancia de TripFoodDatabase.
   *
   * Configura el esquema de la base de datos con todas las tablas
   * e índices necesarios para el funcionamiento óptimo de la aplicación.
   */
  constructor() {
    super(TripFoodDatabase.DATABASE_NAME);

    this.version(TripFoodDatabase.CURRENT_VERSION).stores({
      // Trips: índice primario 'id', índices secundarios para búsquedas y ordenación
      trips: 'id, name, startDate, endDate, createdAt',

      // Participants: índice primario 'id', FK tripId para queries por viaje
      participants: 'id, tripId, name, createdAt',

      // Products: índice primario 'id', índices para filtrado por categoría y tipo
      products: 'id, name, category, type, createdAt',

      // Consumptions: múltiples índices para queries complejas
      // Índice compuesto [tripId+date] para obtener consumos de un viaje en una fecha
      // Índice compuesto [tripId+participantId] para consumos de un participante en un viaje
      consumptions:
        'id, tripId, participantId, productId, date, meal, [tripId+date], [tripId+participantId], [tripId+productId]',

      // Availabilities: índices compuestos para queries de disponibilidad
      // [tripId+date] para disponibilidad en un viaje/fecha
      // [participantId+date] para disponibilidad de un participante
      availabilities:
        'id, participantId, tripId, date, [tripId+date], [participantId+date], [participantId+tripId]',
    });
  }

  /**
   * Elimina todos los datos de la base de datos.
   * PRECAUCIÓN: Esta operación es irreversible.
   *
   * @returns Promise que resuelve cuando se completa la limpieza
   */
  public async clearAllData(): Promise<void> {
    await this.transaction(
      'rw',
      [this.trips, this.participants, this.products, this.consumptions, this.availabilities],
      async () => {
        await Promise.all([
          this.trips.clear(),
          this.participants.clear(),
          this.products.clear(),
          this.consumptions.clear(),
          this.availabilities.clear(),
        ]);
      }
    );
  }

  /**
   * Verifica si la base de datos está disponible y funcionando.
   *
   * @returns Promise que resuelve a true si la DB está operativa
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.trips.count();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Instancia singleton de la base de datos.
 *
 * Se exporta como singleton para garantizar que toda la aplicación
 * use la misma conexión a IndexedDB.
 *
 * @example
 * ```typescript
 * import { db } from '@infrastructure/persistence/indexeddb/database';
 * const allTrips = await db.trips.toArray();
 * ```
 */
export const db = new TripFoodDatabase();
