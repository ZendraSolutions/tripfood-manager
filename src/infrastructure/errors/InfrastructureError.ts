/**
 * @fileoverview Error base para errores de infraestructura.
 *
 * Esta clase representa errores que ocurren en la capa de infraestructura,
 * como problemas de persistencia, servicios externos, o configuración.
 *
 * @module infrastructure/errors/InfrastructureError
 * @version 1.0.0
 */

/**
 * Error base para todos los errores de infraestructura.
 *
 * Proporciona wrapping de errores originales para mantener
 * el contexto del error mientras se abstrae la implementación.
 *
 * @class InfrastructureError
 * @extends Error
 *
 * @example
 * ```typescript
 * try {
 *   await database.connect();
 * } catch (error) {
 *   throw new InfrastructureError(
 *     'Failed to connect to database',
 *     error instanceof Error ? error : undefined
 *   );
 * }
 * ```
 */
export class InfrastructureError extends Error {
  /**
   * Nombre del tipo de error para identificación.
   * @readonly
   */
  public override readonly name: string = 'InfrastructureError';

  /**
   * Error original que causó este error de infraestructura.
   * Útil para debugging y logging detallado.
   * @readonly
   */
  public readonly originalError: Error | undefined;

  /**
   * Timestamp de cuando ocurrió el error.
   * @readonly
   */
  public readonly timestamp: Date;

  /**
   * Crea una nueva instancia de InfrastructureError.
   *
   * @param message - Mensaje descriptivo del error
   * @param originalError - Error original que causó este error (opcional)
   */
  constructor(message: string, originalError?: Error) {
    super(message);

    this.originalError = originalError;
    this.timestamp = new Date();

    // Mantiene el stack trace correcto en V8 (Chrome, Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InfrastructureError);
    }

    // Incluir stack del error original si existe
    if (originalError?.stack) {
      this.stack = `${this.stack}\n\nCaused by: ${originalError.stack}`;
    }
  }

  /**
   * Serializa el error a un objeto plano para logging.
   *
   * @returns Objeto con información del error serializada
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
          }
        : undefined,
      stack: this.stack,
    };
  }

  /**
   * Verifica si un error es una instancia de InfrastructureError.
   *
   * @param error - Error a verificar
   * @returns true si es InfrastructureError o derivado
   */
  public static isInfrastructureError(error: unknown): error is InfrastructureError {
    return error instanceof InfrastructureError;
  }
}
