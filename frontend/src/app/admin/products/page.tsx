'use client';

import { useState } from 'react';
import { Button, Input, Select, Modal, Table, Card } from '@/components/ui';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

export default function ProductsPage() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    cost_price: '',
    barcode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id || undefined,
        base_price: parseFloat(formData.base_price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        barcode: formData.barcode,
        is_active: true,
      });
      setIsModalOpen(false);
      setFormData({ sku: '', name: '', description: '', category_id: '', base_price: '', cost_price: '', barcode: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await deleteProduct(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'sku', label: 'Артикул' },
    { key: 'name', label: 'Название' },
    { key: 'category', label: 'Категория', render: (_: any, row: any) => row.category?.name || '-' },
    { key: 'base_price', label: 'Цена', render: (val: number) => `${val} ₽` },
    { key: 'is_active', label: 'Статус', render: (val: boolean) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {val ? 'Активен' : 'Неактивен'}
      </span>
    )},
    { key: 'actions', label: 'Действия', render: (_: any, row: any) => (
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" onClick={() => console.log('Edit', row)}>Редактировать</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Удалить</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление товарами</h1>
        <p className="text-gray-600">Создавайте и управляйте товарами вашего магазина</p>
      </div>

      <Card
        title="Товары"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            + Добавить товар
          </Button>
        }
      >
        <div className="mb-4">
          <Input
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        <Table
          columns={columns}
          data={filteredProducts}
          loading={loading}
          emptyMessage="Товаров пока нет. Добавьте первый товар!"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Добавить товар"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Артикул"
            required
            value={formData.sku}
            onChange={(e) => setFormData({...formData, sku: e.target.value})}
          />
          <Input
            label="Название товара"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Select
            label="Категория"
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            options={[
              { value: '', label: 'Без категории' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name }))
            ]}
          />
          <Input
            label="Описание"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <Input
            label="Базовая цена"
            type="number"
            required
            value={formData.base_price}
            onChange={(e) => setFormData({...formData, base_price: e.target.value})}
          />
          <Input
            label="Себестоимость"
            type="number"
            value={formData.cost_price}
            onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
          />
          <Input
            label="Штрихкод"
            value={formData.barcode}
            onChange={(e) => setFormData({...formData, barcode: e.target.value})}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
