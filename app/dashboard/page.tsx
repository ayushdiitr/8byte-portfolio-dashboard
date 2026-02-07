'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchPortfolio } from '../lib/api';
import { useWSS } from '../lib/websocket';
import type { Stock } from '../lib/types';
import PortfolioTable from '../components/PortfolioTable';
import SectorSummary from '../components/SectorSummary';
import Loading from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function DashboardPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPortfolio();
      setStocks(data.holdings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load portfolio data'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getPortfolio();
  }, [getPortfolio]);

  const { status: wsStatus } = useWSS(getPortfolio);

  const handleRetry = useCallback(() => {
    getPortfolio();
  }, [getPortfolio]);

  if (loading && stocks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error && stocks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Portfolio Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Real-time portfolio tracking and analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              wsStatus === 'connected'
                ? 'bg-green-500'
                : wsStatus === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            title={
              wsStatus === 'connected'
                ? 'WebSocket Connected'
                : wsStatus === 'connecting'
                  ? 'Connecting...'
                  : 'WebSocket Disconnected'
            }
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {wsStatus === 'connected'
              ? 'Live'
              : wsStatus === 'connecting'
                ? 'Connecting...'
                : 'Offline'}
          </span>
        </div>
      </div>

      {error && stocks.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={handleRetry}
              className="text-sm font-medium text-red-800 underline dark:text-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* {stocks.length > 0 && (
        <div className="mb-8">
          <SectorSummary stocks={stocks} />
        </div>
      )} */}

      {stocks.length > 0 ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Portfolio Holdings
          </h2>
          <PortfolioTable stocks={stocks} />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">
            No portfolio data available
          </p>
        </div>
      )}
    </div>
  );
}
