/**
 * DataTable — plug-and-play table with pagination, search, and loading state.
 * Used across all agent modules.
 *
 * Props:
 *  columns     { key, header, render?, width?, align? }[]
 *  data        object[]
 *  loading     boolean
 *  searchable  boolean
 *  searchKeys  string[]          - keys to search against
 *  pageSize    number (default 10)
 *  emptyText   string
 *  rowKey      string (default 'id')
 *  onRowClick  fn(row)
 */
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
  emptyText = 'No records found',
  rowKey = 'id',
  onRowClick,
  className,
}) {
  const [query,   setQuery]   = useState('');
  const [page,    setPage]    = useState(1);

  const filtered = useMemo(() => {
    if (!query || !searchKeys.length) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
    );
  }, [data, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData   = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (e) => { setQuery(e.target.value); setPage(1); };

  const SKELETON_ROWS = Array.from({ length: pageSize < 6 ? pageSize : 6 });

  return (
    <div className={clsx('card', className)}>
      {/* Search bar */}
      {searchable && (
        <div className="card-header">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={handleSearch}
              placeholder="Search…"
              className="input pl-8 py-1.5 text-xs"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={clsx(col.align === 'right' && 'text-right', col.align === 'center' && 'text-center')}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              SKELETON_ROWS.map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-400 text-sm">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={row[rowKey]}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="card-header border-t border-b-0 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-ghost btn-sm rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
              if (pg > totalPages) return null;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={clsx(
                    'btn-sm rounded-lg min-w-[28px] text-xs',
                    pg === page ? 'bg-primary-600 text-white' : 'btn-ghost',
                  )}
                >
                  {pg}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-ghost btn-sm rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
