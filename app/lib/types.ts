
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  purchasePrice: number;
  qty: number;
  cmp: number | null;
  peRatio?: number | null;
  latestEarnings?: string | number | null;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  pfPercent: number;
}

export interface SectorData {
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  holdings: Stock[];
}

export interface PortfolioResponse {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: Stock[];
  bySector: Record<string, SectorData>;
}

export interface SectorGroup {
  sector: string;
  stocks: Stock[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface WSMessage {
  type: string;
  data?: unknown;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
}

export interface StockRequest {
  symbol: string;
  qty: number;
  purchasePrice: number;
  exchange: string;
  sector: string;
  name: string;
}

export interface PriceHistory {
  id: string;
  price: number;
  recordedAt: string | Date;
}

export interface HoldingHistoryResponse {
  holding: {
    id: string;
    symbol: string;
    name: string;
  };
  history: PriceHistory[];
}
