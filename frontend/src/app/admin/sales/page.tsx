'use client';

import { useState } from 'react';
import { Button, Table, Card, Input } from '@/components/ui';
import { useSales } from '@/hooks/useSales';

export default function SalesPage() {
  const { sales, loading } = useSales();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(s =>
    s.saleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'sale_number', label: '№ Продажи' },
    { key: 'created_at', label: 'Дата' },
    { key: 'cashier', label: 'Кассир' },
    { key: 'total_amount', label: 'Сумма', render: (val: number) => `${val} ₽` },
    { key: 'payment_method', label: 'Оплата' },
    { key: 'status', label: 'Статус', render: (val: string) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        val === 'completed' ? 'bg-green-100 text-green-600' :
        val === 'cancelled' ? 'bg-red-100 text-red-600' :
        'bg-yellow-100 text-yellow-600'
      }`}>
        {val === 'completed' ? 'Завершена' : val === 'cancelled' ? 'Отменена' : 'В обработке'}
      </span>
    )},
    { key: 'actions', label: 'Действия', render: () => (
      <Button size="sm" variant="outline">Подробнее</Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">История продаж</h1>
        <p className="text-gray-600">Просмотр и управление продажами</p>
      </div>

      <Card title="Продажи">
        <div className="mb-4">
          <Input
            placeholder="Поиск по номеру продажи..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <Table columns={columns} data={filteredSales} loading={loading} emptyMessage="Продаж пока нет" />
      </Card>
    </div>
  );
}
