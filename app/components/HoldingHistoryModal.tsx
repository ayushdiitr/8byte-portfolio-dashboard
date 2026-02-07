'use client';

import { useEffect, useState } from 'react';
import type {  PriceHistory } from '../lib/types';
import { getHoldingHistory } from '../lib/api';
import { formatCurrency } from '../utils/currency';

interface HoldingHistoryProps {
  holdingId: string;
  symbol: string;
  name: string;
  onClose: () => void;
}

export default function HoldingHistoryModal({
  holdingId,
  symbol,
  name,
  onClose,
}: HoldingHistoryProps) {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getHoldingHistory(holdingId);
        setHistory(data.history);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load price history'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [holdingId]);

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {symbol}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

    
      </div>
    </div>
  );
}
