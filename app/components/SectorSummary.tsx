'use client';

import { useMemo } from 'react';
import type { PortfolioResponse } from '../lib/types';
import { formatCurrency } from '../utils/currency';

interface SectorSummaryProps {
  portfolioData: PortfolioResponse;
}

export default function SectorSummary({ portfolioData }: SectorSummaryProps) {
  const sectorGroups = useMemo(() => {
    return Object.entries(portfolioData.bySector)
      .map(([sector, sectorData]) => ({
        sector,
        ...sectorData,
      }))
      .sort((a, b) => b.investment - a.investment);
  }, [portfolioData.bySector]);



  if (sectorGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sector Overview
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-[#a3a3a3]">
          Breakdown by sector
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sectorGroups.map((group) => {
          const isPositive = group.gainLoss >= 0;
          const portfolioWeight = (group.investment / portfolioData.totalInvestment) * 100;
          
          return (
            <div
              key={group.sector}
              className="group relative overflow-hidden rounded-xl border  bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-200  hover:shadow-lg dark:border-[#404040] dark:bg-[#262626]"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {group.sector}
                </h3>
                <div className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-[#92400e] dark:text-[#fff]">
                  {portfolioWeight.toFixed(1)}%
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Investment</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(group.investment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Present Value</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(group.presentValue)}
                  </span>
                </div>
                <div className="border-t border-gray-200/60 pt-3 dark:border-gray-800/60">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gain/Loss</span>
                    <div className="text-right">
                      <span
                        className={`block font-bold ${
                          isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(group.gainLoss)}
                      </span>
                      <span
                        className={`text-xs ${
                          isPositive
                            ? 'text-green-600/80 dark:text-green-400/80'
                            : 'text-red-600/80 dark:text-red-400/80'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {group.gainLossPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {group.holdings.length} stock{group.holdings.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
