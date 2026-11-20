import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { getBillboards } from '../../lib/mockData';

export const AppLayout: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Semua');
  const location = useLocation();

  // Dynamic title based on active route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard & Peta Sebaran';
    if (path.startsWith('/billboard/')) return 'Detail Analisis Titik Billboard';
    if (path === '/billboard') return 'Daftar Semua Titik Billboard';
    if (path === '/compare') return 'Perbandingan Antar Billboard & Wilayah';
    if (path === '/reports') return 'Pusat Laporan & Export Data';
    if (path === '/settings') return 'Pengaturan & Konfigurasi Sistem';
    return 'Billboard Traffic Intelligence';
  };

  const totalBillboards = getBillboards().length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Left Sidebar */}
      <Sidebar totalBillboardsCount={totalBillboards} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={getPageTitle()}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {/* Child Page Injected Here */}
          <Outlet context={{ selectedCity, setSelectedCity }} />
        </main>

        {/* Clean Enterprise Footer */}
        <footer className="border-t border-slate-200 bg-white py-5 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="font-semibold text-slate-700">NexTraffic OOH Intelligence</span>
              <span>• Demo & Proof of Concept Platform</span>
            </div>
            <div>
              Status: <span className="text-blue-600 font-semibold">Demo Mock Data (Seed-based)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
