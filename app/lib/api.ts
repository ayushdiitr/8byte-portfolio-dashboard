import type {
  PortfolioResponse,
  StockSearchResult,
  StockRequest,
  HoldingHistoryResponse,
} from './types';
import axios from 'axios';


const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    headers: {
        'Content-Type':'application/json',
    }
})

export default api;

export async function fetchPortfolio(): Promise<PortfolioResponse> {
  try {
    const res = await api.get('/portfolio');
    if (!res.data) {
      throw new Error('Failed to get portfolio');
    }
    const data: PortfolioResponse = res.data;
    return data;
  } catch (error) {
    throw new Error(
      `Error fetching portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const res = await api.get('/stocks', {
      params: { q: query },
    });

    return res.data ?? [];
  } catch (error) {
    throw new Error(
      `Error searching stocks: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function addStock(payload: StockRequest): Promise<void> {
  try {
    await api.post('/stocks', payload);
  } catch (error) {
    throw new Error(
      `Error adding stock: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function deleteHoldings(ids: string[]): Promise<void> {
  try {
    await api.delete('/stocks', {
      data: { ids },
    });
  } catch (error) {
    throw new Error(
      `Error deleting holdings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getHoldingHistory(id: string): Promise<HoldingHistoryResponse> {
  try {
    const res = await api.get(`/stocks/${id}/history`);
    return res.data;
  } catch (error) {
    throw new Error(
      `Error fetching holding history: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
