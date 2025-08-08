import React from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * A reusable table component for admin sections with responsive design
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions with {header, accessor, cell, className}
 * @param {Array} props.data - Array of data objects
 * @param {Function} props.onRowClick - Optional callback when a row is clicked
 * @param {string} props.searchPlaceholder - Custom placeholder for search input
 * @param {string} props.search - Search term
 * @param {Function} props.setSearch - Function to update search term
 * @param {number} props.page - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.setPage - Function to update page
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.emptyMessage - Message to display when no data
 */
const AdminTable = ({
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Search...",
  search = "",
  setSearch,
  page = 1,
  totalPages = 1,
  setPage,
  isLoading = false,
  emptyMessage = "No data found.",
}) => {
  return (
    <div className="space-y-4 w-full animate-fade-in">
      {/* Search */}
      {setSearch && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-primary-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full sm:w-80 pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-md hover:shadow-lg transition-all duration-300 font-medium hover:border-primary-200"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (setPage) setPage(1);
            }}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse flex space-x-4 items-center bg-primary-50/70 px-6 py-4 rounded-xl shadow-lg border-2 border-primary-100">
            <div className="h-3 w-3 bg-primary-400 rounded-full animate-pulse-slow"></div>
            <div className="h-3 w-3 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="h-3 w-3 bg-primary-600 rounded-full animate-pulse-slow"></div>
            <span className="text-gray-700 font-medium ml-2">Loading...</span>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-card-hover transition-shadow duration-300">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-6 py-4 text-sm font-semibold text-gray-700 bg-gradient-to-r from-primary-50/80 to-white ${column.headerClassName || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-primary-50/40 transition-colors duration-200 hover:shadow-md ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 text-sm ${column.className || ''}`}
                      >
                        {column.cell ? column.cell(row) : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-500 bg-gray-50/50 border border-gray-200 rounded-b-xl shadow-inner"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      {!isLoading && (
        <div className="md:hidden grid gap-4">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`border border-gray-200 rounded-xl p-4 shadow-card bg-white space-y-3 hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 transform hover:-translate-y-1 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => {
                  // Skip rendering certain columns on mobile if specified
                  if (column.hideOnMobile) return null;
                  
                  return (
                    <div key={colIndex} className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">{column.header}</span>
                      <div className="text-sm font-medium">
                        {column.cell ? column.cell(row) : row[column.accessor]}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-xl border border-gray-200 text-gray-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              {emptyMessage}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && setPage && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-2.5 rounded-lg border-2 border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-300 transition-all shadow-md hover:shadow-lg hover:text-primary-600"
            aria-label="Previous page"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex space-x-1.5">
            {[...Array(totalPages)].map((_, i) => {
              // Show limited page numbers with ellipsis for better UX
              if (
                totalPages <= 7 ||
                i === 0 ||
                i === totalPages - 1 ||
                (i >= page - 2 && i <= page + 2)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${page === i + 1
                      ? 'bg-primary-500 text-white font-medium shadow-lg border-2 border-primary-600'
                      : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-300 shadow-md hover:shadow-lg hover:text-primary-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              } else if (
                (i === 1 && page > 3) ||
                (i === totalPages - 2 && page < totalPages - 3)
              ) {
                return (
                  <button
                    key={i}
                    className="min-w-[2.5rem] h-10 flex items-center justify-center text-gray-500"
                    disabled
                  >
                    ...
                  </button>
                );
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="p-2.5 rounded-lg border-2 border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-300 transition-all shadow-md hover:shadow-lg hover:text-primary-600"
            aria-label="Next page"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTable;