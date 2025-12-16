'use client';

import { useState } from 'react';
import { Button, Input, Modal, Table, Card } from '@/components/ui';

export default function CertificatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const certificates = [];

  const columns = [
    { key: 'code', label: 'Код' },
    { key: 'amount', label: 'Сумма', render: (val: number) => `${val} ₽` },
    { key: 'issued_at', label: 'Дата выпуска' },
    { key: 'expires_at', label: 'Срок действия' },
    { key: 'status', label: 'Статус', render: (val: string) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        val === 'active' ? 'bg-green-100 text-green-600' :
        val === 'used' ? 'bg-gray-100 text-gray-600' :
        val === 'expired' ? 'bg-red-100 text-red-600' :
        'bg-yellow-100 text-yellow-600'
      }`}>
        {val === 'active' ? 'Активен' : val === 'used' ? 'Использован' : val === 'expired' ? 'Истек' : 'Отменен'}
      </span>
    )},
    { key: 'actions', label: 'Действия', render: () => (
      <Button size="sm" variant="outline">Подробнее</Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Подарочные сертификаты</h1>
        <p className="text-gray-600">Создание и управление подарочными сертификатами</p>
      </div>

      <Card
        title="Сертификаты"
        actions={<Button onClick={() => setIsModalOpen(true)}>+ Выпустить сертификат</Button>}
      >
        <Table columns={columns} data={certificates} emptyMessage="Сертификатов пока нет" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Выпустить сертификат">
        <form className="space-y-4">
          <Input label="Сумма сертификата" type="number" required />
          <Input label="Срок действия (дней)" type="number" defaultValue="365" />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              После создания будет сгенерирован уникальный код сертификата
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
