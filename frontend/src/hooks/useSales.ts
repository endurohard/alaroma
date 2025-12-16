import { useState, useEffect } from 'react';
import { salesApi } from '@/lib/api';
import type { Sale } from '@/types';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await salesApi.getAll();
      setSales(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки продаж');
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (sale: any) => {
    try {
      const newSale = await salesApi.create(sale);
      setSales([...sales, newSale]);
      return newSale;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания продажи');
    }
  };

  const cancelSale = async (id: string) => {
    try {
      const cancelled = await salesApi.cancel(id);
      setSales(sales.map(s => s.id === id ? cancelled : s));
      return cancelled;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка отмены продажи');
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    cancelSale,
  };
};
