'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { HoldingHistoryResponse, PriceHistory } from '../../lib/types';
import { getHoldingHistory } from '../../lib/api';
import StockChart from '../../components/StockChart';
import Loading from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { formatCurrency } from '../../utils/currency';

export default function HoldingHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const holdingId = params.id as string;

  const [data, setData] = useState<HoldingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!holdingId) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const historyData = await getHoldingHistory(holdingId);
        setData(historyData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 lg:px-6">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 lg:px-6">
          <ErrorState
            message={error || 'Failed to load holding history'}
            onRetry={() => router.refresh()}
          />
        </div>
      </div>
    );
  }

  const { holding, history } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-6">

        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back 
          </Link>

          <div className="rounded-xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-[#404040] dark:bg-[#1f1f1f]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {holding.symbol}
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  {holding.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {history.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Latest Price
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(history[history.length - 1].price)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {history.length > 0 ? (
          <StockChart data={history} symbol={holding.symbol} />
        ) : (
          <div className="rounded-xl border border-gray-200/60 bg-white/80 p-12 text-center backdrop-blur-sm dark:border-gray-800/60 dark:bg-background">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No price history available
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Price history will appear here once data is recorded
            </p>
          </div>
        )}

        
      </div>
    </div>
  );
}
