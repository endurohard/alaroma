import { useState, useEffect } from 'react';
import { customersApi } from '@/lib/api';
import type { Customer } from '@/types';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getAll();
      setCustomers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки клиентов');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customer: Partial<Customer>) => {
    try {
      const newCustomer = await customersApi.create(customer);
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания клиента');
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      const updated = await customersApi.update(id, customer);
      setCustomers(customers.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка обновления клиента');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
  };
};
