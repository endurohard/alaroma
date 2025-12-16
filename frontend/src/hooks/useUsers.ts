import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { User } from '@/types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (user: Partial<User> & { password: string }) => {
    try {
      const newUser = await usersApi.create(user);
      setUsers([...users, newUser]);
      return newUser;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания пользователя');
    }
  };

  const updateUser = async (id: string, user: Partial<User>) => {
    try {
      const updated = await usersApi.update(id, user);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка обновления пользователя');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersApi.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка удаления пользователя');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
