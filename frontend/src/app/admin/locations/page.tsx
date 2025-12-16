'use client';

import { useState } from 'react';
import { Button, Input, Modal, Table, Card, Select } from '@/components/ui';
import { useLocations } from '@/hooks/useLocations';

export default function LocationsPage() {
  const { locations, loading, createLocation } = useLocations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLocation({
        name: formData.name,
        type: formData.type as any,
        address: formData.address,
        phone: formData.phone,
        isActive: true,
      });
      setIsModalOpen(false);
      setFormData({ name: '', type: '', address: '', phone: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Название' },
    { key: 'type', label: 'Тип' },
    { key: 'address', label: 'Адрес' },
    { key: 'phone', label: 'Телефон' },
    { key: 'is_active', label: 'Статус', render: (val: boolean) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {val ? 'Активна' : 'Неактивна'}
      </span>
    )},
    { key: 'actions', label: 'Действия', render: () => (
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline">Редактировать</Button>
        <Button size="sm" variant="danger">Удалить</Button>
      </div>
    )},
  ];

  const typeOptions = [
    { value: '', label: 'Выберите тип' },
    { value: 'central_warehouse', label: 'Центральный склад' },
    { value: 'store', label: 'Магазин' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Склады и магазины</h1>
        <p className="text-gray-600">Управление локациями хранения товаров</p>
      </div>

      <Card
        title="Локации"
        actions={<Button onClick={() => setIsModalOpen(true)}>+ Добавить локацию</Button>}
      >
        <Table columns={columns} data={locations} loading={loading} emptyMessage="Локаций пока нет" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить локацию">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Название" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Select label="Тип" options={typeOptions} required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} />
          <Input label="Адрес" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          <Input label="Телефон" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
