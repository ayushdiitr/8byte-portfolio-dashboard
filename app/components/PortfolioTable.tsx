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
import type { Stock } from '../lib/types';
import { formatCurrency } from '../utils/currency';

interface PortfolioTableProps {
  stocks: Stock[];
}

const TableRow = memo(function TableRow({ row }: { row: any }) {
  return (
    <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50">
      {row.getVisibleCells().map((cell: any) => (
        <td
          key={cell.id}
          className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
});

export default function PortfolioTable({ stocks }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const totalInvestment = useMemo(() => {
    return stocks.reduce((sum, stock) => sum + stock.purchasePrice * stock.qty, 0);
  }, [stocks]);

  

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Stock Name',
        cell: (i) => (
          <span className="font-medium">{i.getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'purchasePrice',
        header: 'Purchase Price',
        cell: (i) => formatCurrency(i.getValue() as number),
      },
      {
        accessorKey: 'qty',
        header: 'Qty',
        cell: (i) => (i.getValue() as number).toLocaleString(),
      },
      {
        id: 'investment',
        header: 'Investment',
        cell: (i) => {
          const stock = i.row.original;
          const investment = stock.purchasePrice * stock.qty;
          return formatCurrency(investment);
        },
        sortingFn: (rowA, rowB) => {
          const investmentA = rowA.original.purchasePrice * rowA.original.qty;
          const investmentB = rowB.original.purchasePrice * rowB.original.qty;
          return investmentA - investmentB;
        },
      },
      {
        id: 'portfolioPt',
        header: 'Portfolio %',
        cell: (i) => {
          const stock = i.row.original;
          const investment = stock.purchasePrice * stock.qty;
          const percent = totalInvestment > 0 ? (investment / totalInvestment) * 100 : 0;
          return formatPercentage(percent);
        },
        sortingFn: (rowA, rowB) => {
          const investmentA = rowA.original.purchasePrice * rowA.original.qty;
          const investmentB = rowB.original.purchasePrice * rowB.original.qty;
          const percentA = totalInvestment > 0 ? (investmentA / totalInvestment) * 100 : 0;
          const percentB = totalInvestment > 0 ? (investmentB / totalInvestment) * 100 : 0;
          return percentA - percentB;
        },
      },
      {
        accessorKey: 'exchange',
        header: 'Exchange',
        cell: (i) => (
          <span className="text-gray-600 dark:text-gray-400">
            {i.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'cmp',
        header: 'CMP',
        cell: (i) => formatCurrency(i.getValue() as number),
      },
      {
        id: 'presentValue',
        header: 'Present Value',
        cell: (i) => {
          const stock = i.row.original;
          const presentValue = stock.cmp! * stock.qty;
          return formatCurrency(presentValue);
        },
        sortingFn: (rowA, rowB) => {
          const presentValueA = rowA.original.cmp! * rowA.original.qty;
          const presentValueB = rowB.original.cmp! * rowB.original.qty;
          return presentValueA - presentValueB;
        },
      },
      {
        id: 'gainLoss',
        header: 'Gain/Loss',
        cell: (i) => {
          const stock = i.row.original;
          const investment = stock.purchasePrice * stock.qty;
          const presentValue = stock.cmp! * stock.qty;
          const gainLoss = presentValue - investment;
          const isPositive = gainLoss >= 0;
          
          return (
            <span
              className={`font-medium ${
                isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(gainLoss)}
            </span>
          );
        },
        sortingFn: (rowA, rowB) => {
          const investmentA = rowA.original.purchasePrice * rowA.original.qty;
          const investmentB = rowB.original.purchasePrice * rowB.original.qty;
          const presentValueA = rowA.original.cmp! * rowA.original.qty;
          const presentValueB = rowB.original.cmp! * rowB.original.qty;
          const gainLossA = presentValueA - investmentA;
          const gainLossB = presentValueB - investmentB;
          return gainLossA - gainLossB;
        },
      },
      {
        accessorKey: 'peRatio',
        header: 'P/E Ratio',
        cell: (i) => {
          const value = i.getValue() as number | undefined;
          return value !== undefined && value !== null
            ? value.toFixed(2)
            : 'N/A';
        },
      },
      {
        accessorKey: 'latestEarnings',
        header: 'Latest Earnings',
        cell: (i) => {
          const value = i.getValue() as string | number | undefined;
          if (value === undefined || value === null) return 'N/A';
          
          if (typeof value === 'number') {
            return formatCurrency(value);
          }
          
          return value;
        },
      },
    ],
    [totalInvestment]
  );

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
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-900">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex items-center gap-2 ${
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
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
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
