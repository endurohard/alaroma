'use client';

import { useState } from 'react';
import { Button, Input, Modal, Table, Card, Select } from '@/components/ui';
import { useUsers } from '@/hooks/useUsers';
import { useLocations } from '@/hooks/useLocations';

export default function UsersPage() {
  const { users, loading, createUser, deleteUser } = useUsers();
  const { locations } = useLocations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: '',
    location_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        ...formData,
        location_id: formData.location_id || undefined,
      });
      setIsModalOpen(false);
      setFormData({ full_name: '', email: '', password: '', role: '', location_id: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await deleteUser(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const columns = [
    { key: 'full_name', label: 'Имя' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Роль' },
    { key: 'location', label: 'Локация', render: (_: any, row: any) => {
      const location = locations.find(l => l.id === row.location_id);
      return location?.name || '-';
    }},
    { key: 'is_active', label: 'Статус', render: (val: boolean) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {val ? 'Активен' : 'Неактивен'}
      </span>
    )},
    { key: 'actions', label: 'Действия', render: (_: any, row: any) => (
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline">Редактировать</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Удалить</Button>
      </div>
    )},
  ];

  const roleOptions = [
    { value: '', label: 'Выберите роль' },
    { value: 'admin', label: 'Администратор' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'cashier', label: 'Кассир' },
    { value: 'salesperson', label: 'Продавец' },
    { value: 'warehouse_worker', label: 'Складской работник' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
        <p className="text-gray-600">Добавляйте и управляйте пользователями системы</p>
      </div>

      <Card
        title="Пользователи"
        actions={<Button onClick={() => setIsModalOpen(true)}>+ Добавить пользователя</Button>}
      >
        <Table columns={columns} data={users} loading={loading} emptyMessage="Пользователей пока нет" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить пользователя">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Полное имя" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Пароль" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <Select label="Роль" options={roleOptions} required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
          <Select
            label="Локация (для кассиров и продавцов)"
            value={formData.location_id}
            onChange={(e) => setFormData({...formData, location_id: e.target.value})}
            options={[
              { value: '', label: 'Без локации' },
              ...locations.map(loc => ({ value: loc.id, label: loc.name }))
            ]}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
