/**
 * useProducts Hook - Manages global products data with filtering and CRUD operations
 * Provides a complete interface for product management with service integration
 *
 * @module presentation/hooks/useProducts
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useServices } from '../context/ServiceContext';
import type { Product, IProductCreateDTO, IProductUpdateDTO } from '@domain/entities/Product';
import type { ProductCategory, ProductType } from '@domain/types';

/**
 * Filter options for products
 */
export interface ProductFilters {
  /** Filter by product category */
  category?: ProductCategory;
  /** Filter by product type */
  type?: ProductType;
  /** Filter by search term (name) */
  searchTerm?: string;
}

/**
 * State interface for the useProducts hook
 */
export interface UseProductsState {
  /** List of all products (before filtering) */
  products: Product[];
  /** List of filtered products */
  filteredProducts: Product[];
  /** Current filter settings */
  filters: ProductFilters;
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if an operation failed */
  error: Error | null;
}

/**
 * Actions interface for the useProducts hook
 */
export interface UseProductsActions {
  /** Fetches all products from the service */
  fetchProducts: () => Promise<void>;
  /** Creates a new product */
  createProduct: (dto: IProductCreateDTO) => Promise<Product>;
  /** Updates an existing product */
  updateProduct: (id: string, dto: IProductUpdateDTO) => Promise<Product>;
  /** Deletes a product by ID */
  deleteProduct: (id: string) => Promise<void>;
  /** Gets a single product by ID */
  getProductById: (id: string) => Promise<Product>;
  /** Sets the filter options */
  setFilters: (filters: ProductFilters) => void;
  /** Clears all filters */
  clearFilters: () => void;
  /** Filters products by category */
  filterByCategory: (category: ProductCategory | undefined) => void;
  /** Filters products by type */
  filterByType: (type: ProductType | undefined) => void;
  /** Searches products by name */
  searchByName: (term: string) => void;
  /** Clears the current error */
  clearError: () => void;
  /** Refetches products (alias for fetchProducts) */
  refetch: () => Promise<void>;
}

/**
 * Combined return type for the useProducts hook
 */
export type UseProductsReturn = UseProductsState & UseProductsActions;

/**
 * Initial empty filter state
 */
const INITIAL_FILTERS: ProductFilters = {};

/**
 * Hook for managing global products with filtering capabilities
 *
 * @description
 * This hook provides a complete interface for managing products in the application.
 * It includes filtering by category, type, and search term.
 * Uses the ProductService from the ServiceContext for all operations.
 *
 * @returns {UseProductsReturn} State and actions for product management
 *
 * @example
 * ```tsx
 * function ProductsPage() {
 *   const {
 *     filteredProducts,
 *     isLoading,
 *     error,
 *     filterByCategory,
 *     searchByName,
 *     createProduct,
 *   } = useProducts();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         placeholder="Buscar productos..."
 *         onChange={(e) => searchByName(e.target.value)}
 *       />
 *       <select onChange={(e) => filterByCategory(e.target.value as ProductCategory)}>
 *         <option value="">Todas las categorias</option>
 *         <option value="food">Comida</option>
 *         <option value="beverage">Bebida</option>
 *       </select>
 *       {filteredProducts.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFiltersState] = useState<ProductFilters>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { productService } = useServices();

  /**
   * Memoized filtered products based on current filters
   */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Filter by type
    if (filters.type) {
      result = result.filter((p) => p.type === filters.type);
    }

    // Filter by search term (name)
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(term) ||
        (p.notes && p.notes.toLowerCase().includes(term))
      );
    }

    return result;
  }, [products, filters]);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetches all products from the service
   */
  const fetchProducts = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al cargar los productos');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [productService]);

  /**
   * Creates a new product
   */
  const createProduct = useCallback(async (dto: IProductCreateDTO): Promise<Product> => {
    try {
      setIsLoading(true);
      setError(null);
      const newProduct = await productService.createProduct(dto);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al crear el producto');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [productService]);

  /**
   * Updates an existing product
   */
  const updateProduct = useCallback(async (
    id: string,
    dto: IProductUpdateDTO
  ): Promise<Product> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProduct = await productService.updateProduct(id, dto);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al actualizar el producto');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [productService]);

  /**
   * Deletes a product by ID
   */
  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al eliminar el producto');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [productService]);

  /**
   * Gets a single product by ID
   */
  const getProductById = useCallback(async (id: string): Promise<Product> => {
    try {
      setError(null);
      return await productService.getProductById(id);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener el producto');
      setError(errorObj);
      throw errorObj;
    }
  }, [productService]);

  /**
   * Sets filter options
   */
  const setFilters = useCallback((newFilters: ProductFilters) => {
    setFiltersState(newFilters);
  }, []);

  /**
   * Clears all filters
   */
  const clearFilters = useCallback(() => {
    setFiltersState(INITIAL_FILTERS);
  }, []);

  /**
   * Filters products by category
   */
  const filterByCategory = useCallback((category: ProductCategory | undefined) => {
    setFiltersState((prev) => ({
      ...prev,
      category,
      // Clear type filter if category changes, as types are category-specific
      type: category !== prev.category ? undefined : prev.type,
    }));
  }, []);

  /**
   * Filters products by type
   */
  const filterByType = useCallback((type: ProductType | undefined) => {
    setFiltersState((prev) => ({
      ...prev,
      type,
    }));
  }, []);

  /**
   * Searches products by name
   */
  const searchByName = useCallback((term: string) => {
    setFiltersState((prev) => ({
      ...prev,
      searchTerm: term,
    }));
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    // State
    products,
    filteredProducts,
    filters,
    isLoading,
    error,
    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    setFilters,
    clearFilters,
    filterByCategory,
    filterByType,
    searchByName,
    clearError,
    refetch: fetchProducts,
  };
}

// Re-export types for convenience
export type { Product, IProductCreateDTO, IProductUpdateDTO } from '@domain/entities/Product';
export type { ProductCategory, ProductType } from '@domain/types';
