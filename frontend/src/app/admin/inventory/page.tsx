'use client';

import { useState } from 'react';
import { Button, Table, Card, Input, Modal, Select } from '@/components/ui';

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inventory = [];

  const columns = [
    { key: 'product', label: 'Товар' },
    { key: 'location', label: 'Локация' },
    { key: 'quantity', label: 'Количество' },
    { key: 'reserved_quantity', label: 'Зарезервировано' },
    { key: 'available', label: 'Доступно', render: (_: any, row: any) => row.quantity - row.reserved_quantity },
    { key: 'actions', label: 'Действия', render: () => (
      <Button size="sm" variant="outline">Переместить</Button>
    )},
  ];

  const actionOptions = [
    { value: '', label: 'Выберите действие' },
    { value: 'transfer', label: 'Перемещение' },
    { value: 'writeoff', label: 'Списание' },
    { value: 'adjustment', label: 'Корректировка' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление остатками</h1>
        <p className="text-gray-600">Контроль за остатками товаров по локациям</p>
      </div>

      <Card
        title="Остатки"
        actions={<Button onClick={() => setIsModalOpen(true)}>Операция с остатками</Button>}
      >
        <div className="mb-4">
          <Input
            placeholder="Поиск товара..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <Table columns={columns} data={inventory} emptyMessage="Остатков пока нет" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Операция с остатками">
        <form className="space-y-4">
          <Select label="Тип операции" options={actionOptions} required />
          <Input label="Товар" required />
          <Input label="Количество" type="number" required />
          <Input label="Причина" />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button type="submit">Выполнить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
