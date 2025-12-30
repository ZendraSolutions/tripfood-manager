/**
 * @fileoverview Servicio de exportación a CSV.
 *
 * Proporciona funcionalidad para exportar datos del sistema a formato CSV,
 * con soporte para diferentes tipos de datos y configuración de columnas.
 *
 * @module infrastructure/export/CSVExporter
 * @version 1.0.0
 */

import type { IExportService } from '@domain/interfaces/services/IExportService';
import { InfrastructureError } from '../errors/InfrastructureError';

/**
 * Opciones de configuración para la exportación CSV.
 */
export interface CSVExportOptions {
  /** Delimitador de campos (por defecto: ',') */
  delimiter?: string;
  /** Carácter para encerrar campos (por defecto: '"') */
  quoteChar?: string;
  /** Incluir cabecera con nombres de columnas (por defecto: true) */
  includeHeader?: boolean;
  /** Formato de fecha para serialización (por defecto: ISO) */
  dateFormat?: 'iso' | 'locale' | 'short';
  /** Nombre del archivo para descarga */
  fileName?: string;
  /** BOM para compatibilidad con Excel (por defecto: true) */
  includeBOM?: boolean;
}

/**
 * Definición de columna para exportación CSV.
 */
export interface CSVColumn<T> {
  /** Nombre de la cabecera de la columna */
  header: string;
  /** Función para extraer el valor del objeto */
  accessor: (item: T) => string | number | boolean | Date | null | undefined;
  /** Función opcional para formatear el valor */
  formatter?: (value: unknown) => string;
}

/**
 * Resultado de una exportación CSV.
 */
export interface CSVExportResult {
  /** Contenido CSV generado */
  content: string;
  /** Nombre del archivo sugerido */
  fileName: string;
  /** Tipo MIME */
  mimeType: string;
  /** Tamaño en bytes */
  size: number;
  /** Número de filas exportadas (sin cabecera) */
  rowCount: number;
}

/**
 * Opciones por defecto para exportación CSV.
 */
const DEFAULT_OPTIONS: Required<CSVExportOptions> = {
  delimiter: ',',
  quoteChar: '"',
  includeHeader: true,
  dateFormat: 'iso',
  fileName: 'export.csv',
  includeBOM: true,
};

/**
 * Servicio para exportación de datos a formato CSV.
 *
 * Implementa la interfaz IExportService del dominio y proporciona
 * funcionalidad completa para generar archivos CSV a partir de
 * arrays de objetos, con configuración flexible de columnas y formato.
 *
 * @class CSVExporter
 * @implements {IExportService}
 *
 * @example
 * ```typescript
 * const exporter = new CSVExporter();
 *
 * // Exportar viajes
 * const columns: CSVColumn<Trip>[] = [
 *   { header: 'ID', accessor: (t) => t.id },
 *   { header: 'Nombre', accessor: (t) => t.name },
 *   { header: 'Fecha Inicio', accessor: (t) => t.startDate },
 * ];
 *
 * const result = await exporter.exportToCSV(trips, columns, {
 *   fileName: 'viajes.csv'
 * });
 *
 * // Descargar el archivo
 * exporter.download(result);
 * ```
 */
export class CSVExporter implements IExportService {
  /**
   * Opciones de configuración del exportador.
   * @private
   * @readonly
   */
  private readonly options: Required<CSVExportOptions>;

  /**
   * Crea una nueva instancia del exportador CSV.
   *
   * @param options - Opciones de configuración (opcionales)
   */
  constructor(options?: CSVExportOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Exporta un array de datos a formato CSV.
   *
   * @template T - Tipo de los objetos a exportar
   * @param data - Array de objetos a exportar
   * @param columns - Definición de columnas para la exportación
   * @param options - Opciones específicas para esta exportación (opcionales)
   * @returns Promise con el resultado de la exportación
   * @throws {InfrastructureError} Si ocurre un error durante la exportación
   */
  public async exportToCSV<T>(
    data: T[],
    columns: CSVColumn<T>[],
    options?: CSVExportOptions
  ): Promise<CSVExportResult> {
    try {
      const mergedOptions = { ...this.options, ...options };
      const { delimiter, quoteChar, includeHeader, includeBOM, fileName } = mergedOptions;

      const rows: string[] = [];

      // Agregar cabecera si está habilitada
      if (includeHeader) {
        const headerRow = columns.map((col) => this.escapeField(col.header, quoteChar, delimiter));
        rows.push(headerRow.join(delimiter));
      }

      // Procesar cada fila de datos
      for (const item of data) {
        const rowValues = columns.map((col) => {
          const rawValue = col.accessor(item);
          const formattedValue = col.formatter
            ? col.formatter(rawValue)
            : this.formatValue(rawValue, mergedOptions.dateFormat);
          return this.escapeField(formattedValue, quoteChar, delimiter);
        });
        rows.push(rowValues.join(delimiter));
      }

      // Construir contenido CSV
      let content = rows.join('\r\n');

      // Agregar BOM para compatibilidad con Excel
      if (includeBOM) {
        content = '\uFEFF' + content;
      }

      const encoder = new TextEncoder();
      const size = encoder.encode(content).length;

      return {
        content,
        fileName,
        mimeType: 'text/csv;charset=utf-8',
        size,
        rowCount: data.length,
      };
    } catch (error) {
      throw new InfrastructureError(
        'Failed to export data to CSV',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Exporta datos directamente a un Blob para descarga.
   *
   * @template T - Tipo de los objetos a exportar
   * @param data - Array de objetos a exportar
   * @param columns - Definición de columnas
   * @param options - Opciones de exportación
   * @returns Promise con el Blob generado
   */
  public async exportToBlob<T>(
    data: T[],
    columns: CSVColumn<T>[],
    options?: CSVExportOptions
  ): Promise<Blob> {
    const result = await this.exportToCSV(data, columns, options);
    return new Blob([result.content], { type: result.mimeType });
  }

  /**
   * Inicia la descarga de un resultado de exportación.
   *
   * Este método crea un enlace temporal y dispara la descarga
   * automáticamente en el navegador.
   *
   * @param result - Resultado de exportación CSV
   */
  public download(result: CSVExportResult): void {
    try {
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Limpiar después de un breve delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      throw new InfrastructureError(
        'Failed to download CSV file',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Escapa un campo para CSV según las reglas estándar.
   *
   * - Si contiene el delimitador, comillas o saltos de línea, se encierra en comillas
   * - Las comillas dentro del campo se duplican
   *
   * @param value - Valor a escapar
   * @param quoteChar - Carácter de comillas
   * @param delimiter - Delimitador de campos
   * @returns Campo escapado para CSV
   */
  private escapeField(value: string, quoteChar: string, delimiter: string): string {
    const needsQuoting =
      value.includes(delimiter) ||
      value.includes(quoteChar) ||
      value.includes('\n') ||
      value.includes('\r');

    if (needsQuoting) {
      // Duplicar comillas existentes y encerrar en comillas
      const escaped = value.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar);
      return `${quoteChar}${escaped}${quoteChar}`;
    }

    return value;
  }

  /**
   * Formatea un valor para CSV según su tipo.
   *
   * @param value - Valor a formatear
   * @param dateFormat - Formato para fechas
   * @returns String formateado
   */
  private formatValue(
    value: string | number | boolean | Date | null | undefined,
    dateFormat: 'iso' | 'locale' | 'short'
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value, dateFormat);
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    return String(value);
  }

  /**
   * Formatea una fecha según el formato especificado.
   *
   * @param date - Fecha a formatear
   * @param format - Formato de salida
   * @returns String de fecha formateada
   */
  private formatDate(date: Date, format: 'iso' | 'locale' | 'short'): string {
    switch (format) {
      case 'iso':
        return date.toISOString();
      case 'locale':
        return date.toLocaleString();
      case 'short':
        return date.toLocaleDateString();
      default:
        return date.toISOString();
    }
  }

  /**
   * Crea columnas predefinidas para exportar viajes.
   *
   * @returns Array de definiciones de columna para Trip
   */
  public static getTripColumns(): CSVColumn<{
    id: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
  }>[] {
    return [
      { header: 'ID', accessor: (t) => t.id },
      { header: 'Nombre', accessor: (t) => t.name },
      { header: 'Descripcion', accessor: (t) => t.description },
      { header: 'Fecha Inicio', accessor: (t) => t.startDate },
      { header: 'Fecha Fin', accessor: (t) => t.endDate },
      { header: 'Creado', accessor: (t) => t.createdAt },
    ];
  }

  /**
   * Crea columnas predefinidas para exportar participantes.
   *
   * @returns Array de definiciones de columna para Participant
   */
  public static getParticipantColumns(): CSVColumn<{
    id: string;
    tripId: string;
    name: string;
    email?: string;
    notes?: string;
    createdAt: Date;
  }>[] {
    return [
      { header: 'ID', accessor: (p) => p.id },
      { header: 'ID Viaje', accessor: (p) => p.tripId },
      { header: 'Nombre', accessor: (p) => p.name },
      { header: 'Email', accessor: (p) => p.email },
      { header: 'Notas', accessor: (p) => p.notes },
      { header: 'Creado', accessor: (p) => p.createdAt },
    ];
  }

  /**
   * Crea columnas predefinidas para exportar productos.
   *
   * @returns Array de definiciones de columna para Product
   */
  public static getProductColumns(): CSVColumn<{
    id: string;
    name: string;
    category: string;
    type: string;
    unit: string;
    defaultQuantityPerPerson?: number;
    notes?: string;
  }>[] {
    return [
      { header: 'ID', accessor: (p) => p.id },
      { header: 'Nombre', accessor: (p) => p.name },
      { header: 'Categoria', accessor: (p) => p.category },
      { header: 'Tipo', accessor: (p) => p.type },
      { header: 'Unidad', accessor: (p) => p.unit },
      { header: 'Cantidad por Persona', accessor: (p) => p.defaultQuantityPerPerson },
      { header: 'Notas', accessor: (p) => p.notes },
    ];
  }

  /**
   * Crea columnas predefinidas para exportar consumos.
   *
   * @returns Array de definiciones de columna para Consumption
   */
  public static getConsumptionColumns(): CSVColumn<{
    id: string;
    tripId: string;
    participantId: string;
    productId: string;
    date: Date;
    meal: string;
    quantity: number;
  }>[] {
    return [
      { header: 'ID', accessor: (c) => c.id },
      { header: 'ID Viaje', accessor: (c) => c.tripId },
      { header: 'ID Participante', accessor: (c) => c.participantId },
      { header: 'ID Producto', accessor: (c) => c.productId },
      { header: 'Fecha', accessor: (c) => c.date },
      { header: 'Comida', accessor: (c) => c.meal },
      { header: 'Cantidad', accessor: (c) => c.quantity },
    ];
  }

  /**
   * Crea columnas para exportar lista de compras.
   *
   * @returns Array de definiciones de columna para ShoppingListItem
   */
  public static getShoppingListColumns(): CSVColumn<{
    productName: string;
    category: string;
    totalQuantity: number;
    unit: string;
  }>[] {
    return [
      { header: 'Producto', accessor: (s) => s.productName },
      { header: 'Categoria', accessor: (s) => s.category },
      { header: 'Cantidad Total', accessor: (s) => s.totalQuantity },
      { header: 'Unidad', accessor: (s) => s.unit },
    ];
  }
}
