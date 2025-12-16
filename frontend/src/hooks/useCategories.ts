import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: { name: string; description?: string; parent_id?: string }) => {
    try {
      const response = await axios.post(`${API_URL}/categories`, category);
      setCategories([...categories, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания категории');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка удаления категории');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory,
  };
};
