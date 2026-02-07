'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import type { PriceHistory } from '../lib/types';
import { formatCurrency } from '../utils/currency';
import Card from './Card';

interface StockChartProps {
  data: PriceHistory[];
  symbol: string;
}

interface ChartDataPoint {
  date: string;
  price: number;
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
}

export default function StockChart({ data, symbol }: StockChartProps) {
  
  const chartData: ChartDataPoint[] = data
    .map((entry) => {
      const date = new Date(entry.recordedAt);
      return {
        date: date.toISOString(),
        price: entry.price,
        timestamp: date.getTime(),
        formattedDate: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        formattedTime: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    })
    .reverse(); 

  if (chartData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
        <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const priceRange = maxPrice - minPrice;
  const yAxisDomain = [
    minPrice - priceRange * 0.1,
    maxPrice + priceRange * 0.1,
  ];

  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const totalChange = lastPrice - firstPrice;
  const totalChangePercent =
    firstPrice !== 0 ? (totalChange / firstPrice) * 100 : 0;
  const isPositive = totalChange >= 0;

  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.formattedDate} {data.formattedTime}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.price)}
          </p>
        </div>
      );
    }
    return null;
  };

  
  const XAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      
      


      <div className="rounded-xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-[#1f1f1f]">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#a3a3a3]">
            Price History 
          </h3>
         
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-gray-800"
            />
            <XAxis
              dataKey="date"
              tickFormatter={XAxisLabel}
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={yAxisDomain}
              tickFormatter={(value) => formatCurrency(value)}
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={firstPrice}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              label={{ value: 'Start', position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label='Min Price' val={formatCurrency(minPrice)} />
       <Card label='Max Price' val={formatCurrency(maxPrice)} />
        <Card label='Price Range' val={formatCurrency(priceRange)} />
       <Card label='Avg Price' val={
        formatCurrency(
          chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length

        )
       } />
        
      </div>
    </div>
  );
}
