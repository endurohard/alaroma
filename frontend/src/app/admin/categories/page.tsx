'use client';

import { useState } from 'react';
import { Button, Input, Modal, Table, Card } from '@/components/ui';
import { useCategories } from '@/hooks/useCategories';

export default function CategoriesPage() {
  const { categories, loading, createCategory, deleteCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await deleteCategory(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Название' },
    { key: 'description', label: 'Описание' },
    { key: 'products_count', label: 'Товаров', render: () => '0' },
    { key: 'actions', label: 'Действия', render: (_: any, row: any) => (
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline">Редактировать</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Удалить</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Категории товаров</h1>
        <p className="text-gray-600">Управление категориями для организации товаров</p>
      </div>

      <Card
        title="Категории"
        actions={<Button onClick={() => setIsModalOpen(true)}>+ Добавить категорию</Button>}
      >
        <Table columns={columns} data={categories} loading={loading} emptyMessage="Категорий пока нет" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить категорию">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Название категории" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Описание" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
