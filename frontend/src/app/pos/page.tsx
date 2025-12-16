'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useProducts } from '@/hooks/useProducts';
import { salesApi } from '@/lib/api';
import { Product, CartItem } from '@/types';
import { Button, Input } from '@/components/ui';

export default function POSPage() {
  const { user } = useAuthStore();
  const { products, loading } = useProducts();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'certificate'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-focus barcode input
  useEffect(() => {
    const input = document.getElementById('barcode-input');
    if (input) input.focus();
  }, []);

  // Handle barcode scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Товар не найден');
      setBarcodeInput('');
    }
  };

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: product.base_price,
        discount: 0,
        isGift: false,
      };
      setCart([...cart, newItem]);
    }
  };

  // Update item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - discountTotal;

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      alert('Корзина пуста');
      return;
    }

    if (!user?.location_id) {
      alert('Кассир не привязан к торговой точке');
      return;
    }

    setIsProcessing(true);

    try {
      await salesApi.create({
        locationId: user.location_id,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discount,
          isGift: item.isGift,
        })),
        paymentMethod,
        customerPhone: customerPhone || undefined,
      });

      // Clear cart
      setCart([]);
      setCustomerPhone('');
      alert('Продажа успешно завершена!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при создании продажи');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter products for search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">POS Касса</h1>
            <p className="text-sm text-green-100">{user?.full_name}</p>
          </div>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-4 py-2 bg-green-700 rounded-lg hover:bg-green-800 transition"
          >
            Админ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
        {/* Left: Product Search & Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode Scanner */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <form onSubmit={handleBarcodeSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сканер штрихкода
              </label>
              <div className="flex gap-2">
                <input
                  id="barcode-input"
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Отсканируйте штрихкод..."
                  className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
                <Button type="submit" className="px-6 text-lg">
                  Добавить
                </Button>
              </div>
            </form>
          </div>

          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск товара
            </label>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Название или артикул..."
              className="text-lg"
            />

            {searchTerm && (
              <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Загрузка...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Товары не найдены</p>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        addToCart(product);
                        setSearchTerm('');
                      }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-500 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <p className="text-lg font-semibold text-green-600">
                          {product.base_price} ₽
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="space-y-4">
          {/* Cart */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Корзина</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Корзина пуста</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.unitPrice} ₽</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center py-2 border border-gray-300 rounded-lg text-lg font-semibold"
                        min="0"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                      >
                        +
                      </button>
                      <p className="ml-auto text-lg font-semibold text-gray-900">
                        {(item.unitPrice * item.quantity).toFixed(2)} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Оформление</h2>

              <Input
                label="Телефон клиента (опционально)"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Способ оплаты
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-3 rounded-lg border-2 font-medium transition ${
                      paymentMethod === 'cash'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Наличные
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 rounded-lg border-2 font-medium transition ${
                      paymentMethod === 'card'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Карта
                  </button>
                  <button
                    onClick={() => setPaymentMethod('certificate')}
                    className={`py-3 rounded-lg border-2 font-medium transition ${
                      paymentMethod === 'certificate'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Сертификат
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Подытог:</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} ₽</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Скидка:</span>
                    <span className="font-semibold">-{discountTotal.toFixed(2)} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Итого:</span>
                  <span className="text-green-600">{total.toFixed(2)} ₽</span>
                </div>
              </div>

              <button
                onClick={processSale}
                disabled={isProcessing}
                className="w-full py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? 'Обработка...' : 'Завершить продажу'}
              </button>

              <button
                onClick={() => setCart([])}
                className="w-full py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition"
              >
                Очистить корзину
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
