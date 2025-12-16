'use client';

import { useState } from 'react';
import { Button, Input, Modal, Table, Card } from '@/components/ui';
import { useCustomers } from '@/hooks/useCustomers';

export default function CustomersPage() {
  const { customers, loading, createCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    full_name: '',
    email: '',
    birth_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer({
        phone: formData.phone,
        fullName: formData.full_name,
        email: formData.email,
        birthDate: formData.birth_date,
      });
      setIsModalOpen(false);
      setFormData({ phone: '', full_name: '', email: '', birth_date: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.phone.includes(searchTerm) ||
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'phone', label: 'Телефон' },
    { key: 'full_name', label: 'Имя' },
    { key: 'email', label: 'Email' },
    { key: 'birth_date', label: 'День рождения' },
    { key: 'total_purchases', label: 'Покупок', render: (val: number) => `${val} ₽` },
    { key: 'visit_count', label: 'Визиты' },
    { key: 'actions', label: 'Действия', render: () => (
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline">Редактировать</Button>
        <Button size="sm" variant="secondary">История</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">База клиентов</h1>
        <p className="text-gray-600">Управление информацией о клиентах</p>
      </div>

      <Card
        title="Клиенты"
        actions={<Button onClick={() => setIsModalOpen(true)}>+ Добавить клиента</Button>}
      >
        <div className="mb-4">
          <Input
            placeholder="Поиск по телефону или имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <Table columns={columns} data={filteredCustomers} loading={loading} emptyMessage="Клиентов пока нет" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить клиента">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Телефон" type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <Input label="Полное имя" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Дата рождения" type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
