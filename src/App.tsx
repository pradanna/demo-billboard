import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BillboardListPage } from './pages/billboard/BillboardListPage';
import { BillboardDetailPage } from './pages/billboard/BillboardDetailPage';
import { ComparePage } from './pages/compare/ComparePage';
import { ReportsPage } from './pages/reports/ReportsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Default redirect to /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* 10.1 Agent 1: Dashboard & Map View */}
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* 10.2 Agent 2: Billboard List & Detail */}
          <Route path="billboard" element={<BillboardListPage />} />
          <Route path="billboard/:id" element={<BillboardDetailPage />} />
          
          {/* 10.3 Agent 3: Comparison */}
          <Route path="compare" element={<ComparePage />} />
          
          {/* 10.4 Agent 4: Reports & Export */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
