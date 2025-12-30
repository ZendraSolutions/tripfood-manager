/**
 * @fileoverview Error especializado para operaciones de base de datos.
 *
 * Esta clase extiende InfrastructureError para proporcionar
 * información específica sobre errores de persistencia en IndexedDB.
 *
 * @module infrastructure/errors/DatabaseError
 * @version 1.0.0
 */

import { InfrastructureError } from './InfrastructureError';

/**
 * Tipos de operaciones de base de datos que pueden fallar.
 * Permite categorización y manejo específico de errores.
 */
export type DatabaseOperation =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'find'
  | 'findAll'
  | 'findById'
  | 'findByIndex'
  | 'count'
  | 'clear'
  | 'transaction'
  | 'connection'
  | 'migration';

/**
 * Error específico para operaciones de base de datos.
 *
 * Extiende InfrastructureError con información adicional sobre
 * la operación fallida, la tabla afectada y el ID del registro
 * si aplica.
 *
 * @class DatabaseError
 * @extends InfrastructureError
 *
 * @example
 * ```typescript
 * try {
 *   await db.trips.get(tripId);
 * } catch (error) {
 *   throw new DatabaseError(
 *     'findById',
 *     'trips',
 *     error instanceof Error ? error : undefined,
 *     tripId
 *   );
 * }
 * ```
 */
export class DatabaseError extends InfrastructureError {
  /**
   * Nombre del tipo de error para identificación.
   * @readonly
   */
  public override readonly name: string = 'DatabaseError';

  /**
   * Tipo de operación que falló.
   * @readonly
   */
  public readonly operation: DatabaseOperation;

  /**
   * Nombre de la tabla/colección afectada.
   * @readonly
   */
  public readonly tableName: string;

  /**
   * ID del registro afectado, si aplica.
   * @readonly
   */
  public readonly recordId: string | undefined;

  /**
   * Crea una nueva instancia de DatabaseError.
   *
   * @param operation - Tipo de operación que falló
   * @param tableName - Nombre de la tabla afectada
   * @param originalError - Error original de Dexie/IndexedDB (opcional)
   * @param recordId - ID del registro afectado (opcional)
   */
  constructor(
    operation: DatabaseOperation,
    tableName: string,
    originalError?: Error,
    recordId?: string
  ) {
    const message = DatabaseError.buildMessage(operation, tableName, recordId);
    super(message, originalError);

    this.operation = operation;
    this.tableName = tableName;
    this.recordId = recordId;

    // Mantiene el stack trace correcto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }

  /**
   * Construye un mensaje descriptivo para el error.
   *
   * @param operation - Tipo de operación
   * @param tableName - Nombre de la tabla
   * @param recordId - ID del registro (opcional)
   * @returns Mensaje formateado
   */
  private static buildMessage(
    operation: DatabaseOperation,
    tableName: string,
    recordId?: string
  ): string {
    const baseMessage = `Database operation '${operation}' failed on table '${tableName}'`;
    return recordId ? `${baseMessage} for record '${recordId}'` : baseMessage;
  }

  /**
   * Serializa el error a un objeto plano para logging.
   * Extiende la serialización base con campos específicos de DB.
   *
   * @returns Objeto con información del error serializada
   */
  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      operation: this.operation,
      tableName: this.tableName,
      recordId: this.recordId,
    };
  }

  /**
   * Verifica si un error es una instancia de DatabaseError.
   *
   * @param error - Error a verificar
   * @returns true si es DatabaseError
   */
  public static isDatabaseError(error: unknown): error is DatabaseError {
    return error instanceof DatabaseError;
  }

  /**
   * Crea un DatabaseError para errores de conexión.
   *
   * @param originalError - Error original
   * @returns Nueva instancia de DatabaseError
   */
  public static connectionError(originalError?: Error): DatabaseError {
    return new DatabaseError('connection', 'database', originalError);
  }

  /**
   * Crea un DatabaseError para errores de migración.
   *
   * @param originalError - Error original
   * @returns Nueva instancia de DatabaseError
   */
  public static migrationError(originalError?: Error): DatabaseError {
    return new DatabaseError('migration', 'database', originalError);
  }
}
