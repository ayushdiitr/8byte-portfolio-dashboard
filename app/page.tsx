'use client';

import { useEffect, useState, useCallback } from 'react';
import { type StockSearchResult, type PortfolioResponse } from './lib/types';
import { fetchPortfolio, searchStocks, addStock } from './lib/api';
import { useWSS } from './lib/websocket';
import Loading from './components/LoadingState';
import ErrorState from './components/ErrorState';
import SectorSummary from './components/SectorSummary';
import SectorTable from './components/SectorTable';
import { formatCurrency } from './utils/currency';
import { deleteHoldings } from './lib/api';
import { useRouter } from 'next/navigation';
import Card from './components/Card';


export default function Home() {
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});

  const getPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPortfolio();
      setPortfolioData(data);
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

  useEffect(() => {
    if (!showAddPanel) return;

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setAddError(null);
      try {
        const results = await searchStocks(searchQuery);
        setSearchResults(results);
      } catch (err) {
        setAddError(
          err instanceof Error ? err.message : 'Failed to search stocks'
        );
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, showAddPanel]);

  const handleAddClick = () => {
    setShowAddPanel((prev) => !prev);
    setAddMessage(null);
    setAddError(null);
  };

  const handleChangeQty = (symbol: string, value: string) => {
    const qty = Number(value);
    setQuantities((prev) => ({ ...prev, [symbol]: Number.isNaN(qty) ? 0 : qty }));
  };

  const handleChangePrice = (symbol: string, value: string) => {
    const price = Number(value);
    setPrices((prev) => ({
      ...prev,
      [symbol]: Number.isNaN(price) ? 0 : price,
    }));
  };

  const handleAddStock = async (stock: StockSearchResult) => {
    const qty = quantities[stock.symbol];
    const price = prices[stock.symbol];

    if (!qty || !price) {
      setAddError('Please enter quantity and purchase price');
      return;
    }

    try {
      setAddError(null);
      setAddMessage(null);
      await addStock({
        symbol: stock.symbol,
        qty,
        purchasePrice: price,
        exchange: stock.exchange,
        name: stock.name,
        sector: stock.sector
      });
      setAddMessage(`Added ${stock.symbol} to your holdings`);
      setSearchQuery('');
      setSearchResults([]);
      setQuantities((prev) => ({ ...prev, [stock.symbol]: 0 }));
      setPrices((prev) => ({ ...prev, [stock.symbol]: 0 }));
      await getPortfolio();
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : 'Failed to add stock to holdings'
      );
    }
  };

  const handleDeleteHoldings = async (ids: string[]) => {
    try {
      await deleteHoldings(ids);
      await getPortfolio();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete holdings'
      );
    }
  };

  const handleViewHistory = (holdingId: string, symbol: string, name: string) => {
    router.push(`/holding/${holdingId}`);
  };

  if (loading && !portfolioData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error && !portfolioData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  const totalGainLoss = portfolioData?.totalGainLoss ?? 0;
  const isTotalPositive = totalGainLoss >= 0;

  return (
    <div className="min-h-screen  from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 lg:px-6">
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Portfolio Dashboard
              </h1>
           
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm dark:bg-gray-900/80">
                <div
                  className={`h-2 w-2 rounded-full ${
                    wsStatus === 'connected'
                      ? 'bg-green-500 animate-pulse'
                      : wsStatus === 'connecting'
                      ? 'bg-yellow-500 animate-pulse'
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
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {wsStatus === 'connected'
                    ? 'Live'
                    : wsStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Offline'}
                </span>
              </div>
              <button
                className="group relative overflow-hidden rounded-lg bg-[#f59e0b] px-4 py-2.5 text-sm font-semibold text-white  transition-all cursor-pointer active:scale-95 "
                onClick={handleAddClick}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {showAddPanel ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Stocks
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {portfolioData && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card label='Total Investment' val={formatCurrency(portfolioData.totalInvestment)} />
              <Card label='Present Value' val={formatCurrency(portfolioData.totalPresentValue)} />
              <Card label='Gain/Loss' val={formatCurrency(totalGainLoss)} />
              <Card label='Net Change' val={`${portfolioData.totalGainLossPercent.toFixed(2)}%`}  />
              {/* <div className="rounded-xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/80">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Gain/Loss
                </p>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    isTotalPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isTotalPositive ? '+' : ''}
                  {formatCurrency(totalGainLoss)}
                </p>
              </div> */}
              
            </div>
          )}
        </div>

      {showAddPanel && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-gray-200/60 bg-white/90 p-6 shadow-lg backdrop-blur-sm dark:border-[#404040] dark:bg-[#262626]">
          <div className="mb-4 flex items-center gap-2">
           
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#e5e5e5]">
              Add Stock to Portfolio
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by symbol or name (e.g. AAPL, Reliance)..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#404040] dark:bg-background dark:text-gray-100 dark:focus:border-[#fde68a]"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-[#fde68a]"></div>
                </div>
              )}
            </div>
            {addError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                {addError}
              </div>
            )}
            {addMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                {addMessage}
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-3">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="group rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-800 dark:bg-background dark:hover:border-[#fde68a]/50 dark:hover:bg-[#1f1f1f]"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {stock.symbol}
                          </p>
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {stock.exchange}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-[#a3a3a3]">
                          {stock.name}
                        </p>
                        {stock.sector && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            {stock.sector}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={quantities[stock.symbol] ?? ''}
                          onChange={(e) =>
                            handleChangeQty(stock.symbol, e.target.value)
                          }
                          placeholder="Quantity"
                          className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-[#fde68a] focus:ring-1  dark:border-gray-700 dark:bg-background dark:text-[#e5e5e5]"
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={prices[stock.symbol] ?? ''}
                          onChange={(e) =>
                            handleChangePrice(stock.symbol, e.target.value)
                          }
                          placeholder="Purchase Price"
                          className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-[#fde68a] focus:ring-1  dark:border-gray-700 dark:bg-background dark:text-[#e5e5e5]"
                        />
                      </div>
                      <button
                        className="cursor-pointer inline-flex items-center justify-center rounded-lg  px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 active:scale-95 dark:bg-[#f59e0b]"
                        onClick={() => handleAddStock(stock)}
                      >
                        Add to Portfolio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {error && portfolioData && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={handleRetry}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {portfolioData && portfolioData.holdings.length > 0 && (
        <div className="mb-8">
          <SectorSummary portfolioData={portfolioData} />
        </div>
      )}

      {portfolioData && portfolioData.holdings.length > 0 ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold ">
                Portfolio Holdings
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-[#a3a3a3]">
                Organized by sector for better analysis
              </p>
            </div>
          </div>
          <SectorTable 
            portfolioData={portfolioData}
            onViewHistory={handleViewHistory}
            onDelete={handleDeleteHoldings}
          />
        </div>
      ) : portfolioData && portfolioData.holdings.length === 0 ? (
        <div className="rounded-xl border border-gray-200/60 bg-white/80 p-12 text-center backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No portfolio data available
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start by adding stocks to your portfolio
          </p>
        </div>
      ) : null}
      </div>
    </div>
  );
}
