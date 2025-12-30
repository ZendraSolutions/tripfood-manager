/**
 * useShoppingList Hook - Manages consolidated shopping list for a trip
 * Provides shopping list generation and CSV export functionality
 *
 * @module presentation/hooks/useShoppingList
 */
import { useState, useCallback, useEffect } from 'react';
import { useServices } from '../context/ServiceContext';
import type { ShoppingList, ProductConsumptionSummary, ShoppingListItem } from '@application/services/ShoppingService';
import { CSVExporter, type CSVColumn, type CSVExportResult } from '@infrastructure/export/CSVExporter';

/**
 * Export format options for the shopping list
 */
export type ExportFormat = 'csv' | 'blob';

/**
 * State interface for the useShoppingList hook
 */
export interface UseShoppingListState {
  /** The generated shopping list */
  shoppingList: ShoppingList | null;
  /** Consumption summary by product */
  consumptionSummary: ProductConsumptionSummary[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if an operation failed */
  error: Error | null;
}

/**
 * Actions interface for the useShoppingList hook
 */
export interface UseShoppingListActions {
  /** Generates the shopping list from consumption data */
  generateShoppingList: () => Promise<ShoppingList>;
  /** Gets the consumption summary by product */
  getConsumptionSummary: () => Promise<ProductConsumptionSummary[]>;
  /** Exports the shopping list to CSV format */
  exportToCSV: (fileName?: string) => Promise<CSVExportResult>;
  /** Downloads the shopping list as a CSV file */
  downloadCSV: (fileName?: string) => Promise<void>;
  /** Exports the shopping list to a Blob */
  exportToBlob: () => Promise<Blob>;
  /** Refreshes the shopping list */
  refresh: () => Promise<void>;
  /** Clears the current error */
  clearError: () => void;
}

/**
 * Combined return type for the useShoppingList hook
 */
export type UseShoppingListReturn = UseShoppingListState & UseShoppingListActions;

/**
 * CSV columns definition for shopping list export
 */
const SHOPPING_LIST_COLUMNS: CSVColumn<{
  productName: string;
  category: string;
  totalQuantity: number;
  unit: string;
}>[] = [
  { header: 'Producto', accessor: (item) => item.productName },
  { header: 'Categoria', accessor: (item) => item.category },
  { header: 'Cantidad Total', accessor: (item) => item.totalQuantity },
  { header: 'Unidad', accessor: (item) => item.unit },
];

/**
 * Hook for managing the consolidated shopping list for a trip
 *
 * @description
 * This hook provides functionality to generate and export shopping lists
 * based on trip consumption data. It includes CSV export capabilities
 * for easy sharing and printing.
 * Uses the ShoppingService from the ServiceContext for all operations.
 *
 * @param tripId - The ID of the trip to generate the shopping list for
 * @returns {UseShoppingListReturn} State and actions for shopping list management
 *
 * @example
 * ```tsx
 * function ShoppingListPage({ tripId }: { tripId: string }) {
 *   const {
 *     shoppingList,
 *     isLoading,
 *     error,
 *     generateShoppingList,
 *     downloadCSV,
 *   } = useShoppingList(tripId);
 *
 *   useEffect(() => {
 *     generateShoppingList();
 *   }, [generateShoppingList]);
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *   if (!shoppingList) return <Empty message="No hay lista de compras" />;
 *
 *   return (
 *     <div>
 *       <button onClick={() => downloadCSV('lista-compras.csv')}>
 *         Descargar CSV
 *       </button>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Producto</th>
 *             <th>Cantidad</th>
 *             <th>Unidad</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {shoppingList.items.map(item => (
 *             <tr key={item.product.id}>
 *               <td>{item.product.name}</td>
 *               <td>{item.totalQuantity}</td>
 *               <td>{item.unit}</td>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *     </div>
 *   );
 * }
 * ```
 */
export function useShoppingList(tripId: string): UseShoppingListReturn {
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [consumptionSummary, setConsumptionSummary] = useState<ProductConsumptionSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { shoppingService } = useServices();

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Generates the shopping list from consumption data
   */
  const generateShoppingList = useCallback(async (): Promise<ShoppingList> => {
    if (!tripId) {
      throw new Error('No se ha especificado un viaje');
    }

    try {
      setIsLoading(true);
      setError(null);
      const list = await shoppingService.generateShoppingList(tripId);
      setShoppingList(list);
      return list;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al generar la lista de compras');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripId, shoppingService]);

  /**
   * Gets the consumption summary by product
   */
  const getConsumptionSummary = useCallback(async (): Promise<ProductConsumptionSummary[]> => {
    if (!tripId) {
      throw new Error('No se ha especificado un viaje');
    }

    try {
      setIsLoading(true);
      setError(null);
      const summary = await shoppingService.getConsumptionSummaryByProduct(tripId);
      setConsumptionSummary(summary);
      return summary;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener el resumen de consumo');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripId, shoppingService]);

  /**
   * Transforms shopping list items for CSV export
   */
  const transformItemsForExport = useCallback(() => {
    if (!shoppingList) {
      return [];
    }

    return shoppingList.items.map((item) => ({
      productName: item.product.name,
      category: item.product.category,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
    }));
  }, [shoppingList]);

  /**
   * Exports the shopping list to CSV format
   */
  const exportToCSV = useCallback(async (fileName?: string): Promise<CSVExportResult> => {
    if (!shoppingList) {
      // Try to generate if not available
      await generateShoppingList();
    }

    if (!shoppingList && !error) {
      throw new Error('No hay datos para exportar');
    }

    const items = transformItemsForExport();
    const exporter = new CSVExporter();
    const defaultFileName = `lista-compras-${tripId}-${new Date().toISOString().split('T')[0]}.csv`;

    return exporter.exportToCSV(items, SHOPPING_LIST_COLUMNS, {
      fileName: fileName || defaultFileName,
      includeHeader: true,
      dateFormat: 'locale',
    });
  }, [shoppingList, tripId, transformItemsForExport, generateShoppingList, error]);

  /**
   * Downloads the shopping list as a CSV file
   */
  const downloadCSV = useCallback(async (fileName?: string): Promise<void> => {
    try {
      setError(null);
      const result = await exportToCSV(fileName);
      const exporter = new CSVExporter();
      exporter.download(result);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al descargar el CSV');
      setError(errorObj);
      throw errorObj;
    }
  }, [exportToCSV]);

  /**
   * Exports the shopping list to a Blob
   */
  const exportToBlob = useCallback(async (): Promise<Blob> => {
    if (!shoppingList) {
      await generateShoppingList();
    }

    const items = transformItemsForExport();
    const exporter = new CSVExporter();
    return exporter.exportToBlob(items, SHOPPING_LIST_COLUMNS);
  }, [shoppingList, transformItemsForExport, generateShoppingList]);

  /**
   * Refreshes the shopping list and consumption summary
   */
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      generateShoppingList(),
      getConsumptionSummary(),
    ]);
  }, [generateShoppingList, getConsumptionSummary]);

  // Auto-generate shopping list on mount when tripId is available
  useEffect(() => {
    if (tripId) {
      generateShoppingList().catch(() => {
        // Error is handled and stored in state
      });
    }
  }, [tripId, generateShoppingList]);

  return {
    // State
    shoppingList,
    consumptionSummary,
    isLoading,
    error,
    // Actions
    generateShoppingList,
    getConsumptionSummary,
    exportToCSV,
    downloadCSV,
    exportToBlob,
    refresh,
    clearError,
  };
}

// Re-export types for convenience
export type { ShoppingList, ProductConsumptionSummary } from '@application/services/ShoppingService';
export type { ShoppingListItem };
export type { CSVExportResult } from '@infrastructure/export/CSVExporter';
