import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { HRLayout } from './layouts/HRLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';

import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';

// HR Pages
import { HROverview } from './pages/hr/HROverview';
import { HREmployees } from './pages/hr/HREmployees';
import { HREmployeeDetails } from './pages/hr/HREmployeeDetails';
import { HRIntelligence } from './pages/hr/HRIntelligence';
import { HRMessages } from './pages/hr/HRMessages';
import { HRReports } from './pages/hr/HRReports';

// Employee Pages
import { EmployeeHome } from './pages/employee/EmployeeHome';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { EmployeeMessages } from './pages/employee/EmployeeMessages';
import { EmployeeNotifications } from './pages/employee/EmployeeNotifications';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected HR Routes */}
          <Route path="/hr" element={<HRLayout />}>
            <Route index element={<HROverview />} />
            <Route path="employees" element={<HREmployees />} />
            <Route path="employees/:id" element={<HREmployeeDetails />} />
            <Route path="intelligence" element={<HRIntelligence />} />
            <Route path="messages" element={<HRMessages />} />
            <Route path="reports" element={<HRReports />} />
          </Route>

          {/* Protected Employee Routes */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeHome />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="messages" element={<EmployeeMessages />} />
            <Route path="notifications" element={<EmployeeNotifications />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
