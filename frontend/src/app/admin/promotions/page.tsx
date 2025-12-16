'use client';

import { useState } from 'react';
import { Button, Input, Modal, Table, Card, Select } from '@/components/ui';

export default function PromotionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const promotions = [];

  const columns = [
    { key: 'name', label: 'Название' },
    { key: 'type', label: 'Тип акции' },
    { key: 'discount_percentage', label: 'Скидка %' },
    { key: 'start_date', label: 'Начало' },
    { key: 'end_date', label: 'Конец' },
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
    { value: 'birthday_discount', label: 'Скидка в день рождения' },
    { value: 'buy_2_get_1', label: '2+1' },
    { value: 'combo_deal', label: 'Комбо предложение' },
    { value: 'percentage_discount', label: 'Процентная скидка' },
    { value: 'fixed_discount', label: 'Фиксированная скидка' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Акции и промо</h1>
        <p className="text-gray-600">Управление акциями и специальными предложениями</p>
      </div>

      <Card
        title="Акции"
        actions={<Button onClick={() => setIsModalOpen(true)}>+ Создать акцию</Button>}
      >
        <Table columns={columns} data={promotions} emptyMessage="Акций пока нет" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Создать акцию">
        <form className="space-y-4">
          <Input label="Название акции" required />
          <Select label="Тип акции" options={typeOptions} required />
          <Input label="Описание" />
          <Input label="Процент скидки" type="number" />
          <Input label="Сумма скидки" type="number" />
          <Input label="Дата начала" type="date" />
          <Input label="Дата окончания" type="date" />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
