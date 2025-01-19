// File: src/components/Admin/AdminLayout.tsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-blue-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Panel Admina</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/admin/dashboard"
            className={`block p-4 hover:bg-blue-700 ${isActive('/admin/dashboard')}`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/courses"
            className={`block p-4 hover:bg-blue-700 ${isActive('/admin/courses')}`}
          >
            Zarządzanie kursami
          </Link>
          <Link
            to="/admin/users"
            className={`block p-4 hover:bg-blue-700 ${isActive('/admin/users')}`}
          >
            Użytkownicy
          </Link>
          <Link
            to="/admin/payments"
            className={`block p-4 hover:bg-blue-700 ${isActive('/admin/payments')}`}
          >
            Płatności
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
