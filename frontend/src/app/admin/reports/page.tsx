'use client';

import { Card, Button, Input } from '@/components/ui';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Отчеты и аналитика</h1>
        <p className="text-gray-600">Просмотр статистики и генерация отчетов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Отчет по продажам">
          <form className="space-y-4">
            <Input label="Дата начала" type="date" />
            <Input label="Дата окончания" type="date" />
            <Button className="w-full">Сформировать отчет</Button>
          </form>
        </Card>

        <Card title="Отчет по остаткам">
          <form className="space-y-4">
            <Input label="Локация" />
            <div className="pt-10">
              <Button className="w-full">Сформировать отчет</Button>
            </div>
          </form>
        </Card>

        <Card title="ABC-анализ товаров">
          <form className="space-y-4">
            <Input label="Период (дней)" type="number" defaultValue="30" />
            <div className="pt-10">
              <Button className="w-full">Провести анализ</Button>
            </div>
          </form>
        </Card>

        <Card title="Отчет по кассиру">
          <form className="space-y-4">
            <Input label="Кассир" />
            <Input label="Дата" type="date" />
            <Button className="w-full">Сформировать отчет</Button>
          </form>
        </Card>
      </div>

      <Card title="Статистика продаж">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Продажи сегодня</p>
            <p className="text-2xl font-bold text-green-900 mt-2">0 ₽</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Продажи за неделю</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">0 ₽</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Продажи за месяц</p>
            <p className="text-2xl font-bold text-purple-900 mt-2">0 ₽</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">Средний чек</p>
            <p className="text-2xl font-bold text-orange-900 mt-2">0 ₽</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
