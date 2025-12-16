import { useState, useEffect } from 'react';
import { locationsApi } from '@/lib/api';
import type { Location } from '@/types';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsApi.getAll();
      setLocations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки локаций');
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (location: Partial<Location>) => {
    try {
      const newLocation = await locationsApi.create(location);
      setLocations([...locations, newLocation]);
      return newLocation;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка создания локации');
    }
  };

  const updateLocation = async (id: string, location: Partial<Location>) => {
    try {
      const updated = await locationsApi.update(id, location);
      setLocations(locations.map(l => l.id === id ? updated : l));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Ошибка обновления локации');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
  };
};
