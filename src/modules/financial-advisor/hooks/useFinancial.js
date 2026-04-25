/**
 * useFinancial — data hook for the Financial Advisor module.
 * Handles fetching, caching, and refresh.
 */
import { useState, useEffect, useCallback } from 'react';
import { financialApi } from '../api/financialApi';
import toast from 'react-hot-toast';

function useAsync(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export const useOverview    = ()       => useAsync(financialApi.getOverview,     []);
export const useTransactions= (params) => useAsync(() => financialApi.getTransactions(params), [JSON.stringify(params)]);
export const useSavingsGoals= ()       => useAsync(financialApi.getSavingsGoals, []);
export const useInvestments = ()       => useAsync(financialApi.getInvestments,  []);
export const useInsights    = ()       => useAsync(financialApi.getInsights,     []);
export const useAnalysis    = ()       => useAsync(financialApi.getAnalysis,     []);
export const useReport      = (params) => useAsync(() => financialApi.getReport(params), [JSON.stringify(params)]);
