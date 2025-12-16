import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      setProducts(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: Partial<Product>) => {
    try {
      const newProduct = await productsApi.create(product);
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания товара');
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const updated = await productsApi.update(id, product);
      setProducts(products.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка обновления товара');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка удаления товара');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
