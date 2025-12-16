'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Redirect based on role
    switch (user?.role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'cashier':
        router.push('/cashier');
        break;
      case 'manager':
        router.push('/manager');
        break;
      case 'salesperson':
        router.push('/salesperson');
        break;
      case 'warehouse_worker':
        router.push('/warehouse');
        break;
      default:
        router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
