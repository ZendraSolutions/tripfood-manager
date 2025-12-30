/**
 * Table Component - Reusable data table with sorting and selection support
 */
import type { FC, ReactNode } from 'react';
import styles from './Table.module.css';

export interface TableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header text */
  header: string;
  /** Render function for cell content */
  render: (item: T, index: number) => ReactNode;
  /** Column width */
  width?: string;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether the column is sortable */
  sortable?: boolean;
}

export interface TableProps<T> {
  /** Data to display */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Key extractor for rows */
  getRowKey: (item: T, index: number) => string;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Current sort key */
  sortKey?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Sort change handler */
  onSort?: (key: string) => void;
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Selected row keys */
  selectedKeys?: Set<string>;
  /** Row selection handler */
  onSelectRow?: (key: string, selected: boolean) => void;
  /** Select all handler */
  onSelectAll?: (selected: boolean) => void;
  /** Whether to show row selection */
  selectable?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Compact mode */
  compact?: boolean;
}

export function Table<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  selectedKeys,
  onSelectRow,
  onSelectAll,
  selectable = false,
  striped = false,
  compact = false,
}: TableProps<T>): ReturnType<FC> {
  const allSelected = data.length > 0 && selectedKeys?.size === data.length;
  const someSelected = selectedKeys && selectedKeys.size > 0 && selectedKeys.size < data.length;

  const tableClasses = [
    styles.table,
    striped ? styles.striped : '',
    compact ? styles.compact : '',
  ].filter(Boolean).join(' ');

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(!allSelected);
    }
  };

  const handleSelectRow = (key: string) => {
    if (onSelectRow && selectedKeys) {
      onSelectRow(key, !selectedKeys.has(key));
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={tableClasses}>
        <thead className={styles.thead}>
          <tr>
            {selectable && (
              <th className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected ?? false;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Seleccionar todos"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${styles.th} ${styles[`align-${column.align || 'left'}`]}`}
                style={{ width: column.width }}
              >
                {column.sortable && onSort ? (
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => handleSort(column.key)}
                    aria-label={`Ordenar por ${column.header}`}
                  >
                    {column.header}
                    <span className={styles.sortIcon}>
                      {sortKey === column.key ? (
                        sortDirection === 'asc' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 15l-6-6-6 6" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        )
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3">
                          <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                        </svg>
                      )}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={styles.emptyCell}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowKey = getRowKey(item, index);
              const isSelected = selectedKeys?.has(rowKey);

              return (
                <tr
                  key={rowKey}
                  className={`${styles.tr} ${isSelected ? styles.selected : ''} ${onRowClick ? styles.clickable : ''}`}
                  onClick={onRowClick ? () => onRowClick(item, index) : undefined}
                >
                  {selectable && (
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowKey)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Seleccionar fila ${index + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${styles.td} ${styles[`align-${column.align || 'left'}`]}`}
                    >
                      {column.render(item, index)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
