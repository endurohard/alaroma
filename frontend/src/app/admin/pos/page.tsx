'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">POS-система (Касса)</h1>
        <p className="text-gray-600">Оформление продаж</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Products Search */}
        <div className="col-span-2">
          <Card title="Товары">
            <Input
              placeholder="Поиск товара по названию или штрихкоду..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <div className="mt-4 text-center text-gray-500">
              <p>Начните вводить название или отсканируйте штрихкод</p>
            </div>
          </Card>
        </div>

        {/* Cart */}
        <div className="col-span-1">
          <Card title="Корзина">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Корзина пуста</p>
              </div>
            ) : (
              <div>
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} x {item.price} ₽</p>
                    </div>
                    <Button size="sm" variant="danger">×</Button>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Итого:</span>
                    <span>{total} ₽</span>
                  </div>
                  <Button className="w-full mt-4" size="lg">Оформить продажу</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
