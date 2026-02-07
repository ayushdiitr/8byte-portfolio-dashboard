'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo, useState, memo } from 'react';
import type { Stock, PortfolioResponse } from '../lib/types';
import { formatCurrency } from '../utils/currency';

interface SectorGroupedTableProps {
  portfolioData: PortfolioResponse;
  onViewHistory?: (holdingId: string, symbol: string, name: string) => void;
  onDelete?: (ids: string[]) => Promise<void>;
}

const TableRow = memo(function TableRow({ 
  row, 
  selectedIds, 
  onToggleSelect, 
  onViewHistory 
}: { 
  row: any;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewHistory?: (holdingId: string, symbol: string, name: string) => void;
}) {
  const stock = row.original as Stock;
  const isSelected = selectedIds.has(stock.id);

  return (
    <tr 
      className={`border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-900/30 ${
        isSelected ? 'bg-blue-50/50 dark:bg-[#1f1f1f]' : ''
      }`}
    >
      {row.getVisibleCells().map((cell: any) => (
        <td
          key={cell.id}
          className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
});

const SectorSection = memo(function SectorSection({
  sector,
  stocks,
  sectorData,
  columns,
  selectedStocks,
  onToggleSelect,
  onViewHistory,
  onDelete,
}: {
  sector: string;
  stocks: Stock[];
  sectorData: { investment: number; presentValue: number; gainLoss: number; gainLossPercent: number };
  columns: ColumnDef<Stock>[];
  selectedStocks: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewHistory?: (holdingId: string, symbol: string, name: string) => void;
  onDelete?: (ids: string[]) => Promise<void>;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const isPositive = sectorData.gainLoss >= 0;
  const sectorSelectedIds = stocks.filter(s => selectedStocks.has(s.id)).map(s => s.id);
  const allSelected = sectorSelectedIds.length > 0 && sectorSelectedIds.length === stocks.length;
  const someSelected = sectorSelectedIds.length > 0 && sectorSelectedIds.length < stocks.length;

  const handleSelectAll = () => {
    stocks.forEach(stock => {
      if (!allSelected) {
        onToggleSelect(stock.id);
      } else {
        onToggleSelect(stock.id);
      }
    });
  };

  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/50">
      <div className="border-b border-gray-200/60 bg-[#1f1f1f] from-gray-50 to-gray-100/50 px-6 py-4 ">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {sector}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stocks.length} holding{stocks.length !== 1 ? 's' : ''}
               
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {sectorSelectedIds.length > 0 && onDelete && (
              <button
                onClick={() => onDelete(sectorSelectedIds)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 active:scale-95"
              >
                Delete ({sectorSelectedIds.length})
              </button>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Investment</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(sectorData.investment)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Present Value</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(sectorData.presentValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Gain/Loss</p>
              <p
                className={`font-semibold ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {formatCurrency(sectorData.gainLoss)} ({sectorData.gainLossPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50/80 dark:bg-[#1f1f1f]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-200' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '↕'}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-primary dark:bg-[#1f1f1f]">
            {table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.id} 
                row={row}
                selectedIds={selectedStocks}
                onToggleSelect={onToggleSelect}
                onViewHistory={onViewHistory}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default function SectorTable({ 
  portfolioData, 
  onViewHistory, 
  onDelete 
}: SectorGroupedTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const formatPercentage = (value: number): string => {
    console.log(value)
    return `${value.toFixed(2)}%`;
    
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = async (ids: string[]) => {
    if (!onDelete) return;
    if (!confirm(`Are you sure you want to delete holdings?`)) return;
    
    try {
      await onDelete(ids);
      setSelectedIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    } catch (error) {
      console.error('Failed to delete holdings:', error);
    }
  };

  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        id: 'select',
        header: '',
        cell: (i) => {
          const stock = i.row.original;
          const isSelected = selectedIds.has(stock.id);
          return (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleSelect(stock.id)}
              className="h-4 w-4 rounded border-gray-300 dark:text-[#a3a3a3] focus:ring-2 dark:focus:ring-[#404040] dark:border-[#404040]"
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 40,
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: (i) => {
          const stock = i.row.original;
          return (
            <div 
              className="cursor-pointer hover:underline"
              onClick={() => onViewHistory?.(stock.id, stock.symbol, stock.name)}
            >
              <span className="font-semibold text-gray-900 dark:text-[#e5e5e5]">
                {i.getValue() as string}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-[#a3a3a3]">
                {i.row.original.exchange}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Company Name',
        cell: (i) => (
          <span className="font-medium  dark:text-[#e5e5e5]">
            {i.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'purchasePrice',
        header: 'Purchase Price',
        cell: (i) => (
          <span className=" dark:text-[#e5e5e5]">
            {formatCurrency(i.getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: 'qty',
        header: 'Quantity',
        cell: (i) => (
          <span className=" dark:text-[#e5e5e5]">
            {(i.getValue() as number).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'investment',
        header: 'Investment',
        cell: (i) => (
          <span className="font-medium  dark:text-[#e5e5e5]">
            {formatCurrency(i.getValue() as number)}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          return rowA.original.investment - rowB.original.investment;
        },
      },
      {
        accessorKey: 'cmp',
        header: 'CMP',
        cell: (i) => {
          const value = i.getValue() as number | null;
          return value !== null ? (
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(value)}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">N/A</span>
          );
        },
      },
      {
        accessorKey: 'presentValue',
        header: 'Present Value',
        cell: (i) => (
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(i.getValue() as number)}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          return rowA.original.presentValue - rowB.original.presentValue;
        },
      },
      {
        accessorKey: 'gainLoss',
        header: 'Gain/Loss',
        cell: (i) => {
          const stock = i.row.original;
          const isPositive = stock.gainLoss >= 0;
          
          return (
            <div className="flex flex-col">
              <span
                className={`font-semibold ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {formatCurrency(stock.gainLoss)}
              </span>
              <span
                className={`text-xs ${
                  isPositive
                    ? 'text-green-600/80 dark:text-green-400/80'
                    : 'text-red-600/80 dark:text-red-400/80'
                }`}
              >
                {isPositive ? '+' : ''}
                {stock.gainLossPercent.toFixed(2)}%
              </span>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          return rowA.original.gainLoss - rowB.original.gainLoss;
        },
      },
      {
        accessorKey: 'portfolioPercent',
        header: 'Portfolio %',
        cell: (i) => (
          <span className="text-gray-700 dark:text-gray-300">
            {formatPercentage(i.getValue() as number )}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          return rowA.original.pfPercent - rowB.original.pfPercent;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (i) => {
          const stock = i.row.original;
          return (
            <button
              onClick={() => onViewHistory?.(stock.id, stock.symbol, stock.name)}
              className="group relative overflow-hidden rounded-lg bg-[#f59e0b] px-3 py-1.5 text-sm font-normal text-white  transition-all cursor-pointer active:scale-95 "
              >
              View 
            </button>
          );
        },
        size: 120,
      },
    ],
    [selectedIds, onViewHistory]
  );

  const sectors = useMemo(() => {
    return Object.entries(portfolioData.bySector).sort(
      (a, b) => b[1].investment - a[1].investment
    );
  }, [portfolioData.bySector]);

  if (sectors.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
        <p className="text-gray-600 dark:text-gray-400">
          No portfolio data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sectors.map(([sector, sectorData]) => (
        <SectorSection
          key={sector}
          sector={sector}
          stocks={sectorData.holdings}
          sectorData={sectorData}
          columns={columns}
          selectedStocks={selectedIds}
          onToggleSelect={handleToggleSelect}
          onViewHistory={onViewHistory}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
