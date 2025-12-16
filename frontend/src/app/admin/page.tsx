'use client';

import { useAuthStore } from '@/store/auth';

export default function AdminPage() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <div>
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Добро пожаловать, {user.full_name}!</h2>
              <p className="text-gray-600">Email: {user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Продажи сегодня</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">0 ₽</p>
            <p className="text-sm text-gray-500 mt-2">0 операций</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Товары</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-2">Всего в каталоге</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Клиенты</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-2">Активных клиентов</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Пользователи</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">1</p>
            <p className="text-sm text-gray-500 mt-2">В системе</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Система готова к работе!</h3>
              <p className="text-gray-700 mb-4">
                Вы успешно вошли в систему управления продажами Al Aroma.
                База данных подключена, все сервисы работают.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Следующие шаги:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Создание модулей управления товарами</li>
                  <li>Разработка POS-системы для кассиров</li>
                  <li>Настройка аналитики и отчетов</li>
                  <li>Добавление управления пользователями</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
