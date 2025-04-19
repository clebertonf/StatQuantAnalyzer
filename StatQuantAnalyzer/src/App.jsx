import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { FaClock, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import clsx from 'clsx';
import OrdersPage from './pages/OrdersPage.jsx';
import HistoricalOrdersPage from './pages/HistoricalOrdersPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { AuthContext, AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white shadow p-4">
          <ul className="flex space-x-2 sm:space-x-4 justify-center items-center">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base transition-all duration-200',
                    isActive
                      ? 'bg-gray-400 text-gray-900'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  )
                }
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              >
                <FaClock className="w-4 h-4" />
                Ordens do Dia (Real Time)
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/historical"
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base transition-all duration-200',
                    isActive
                      ? 'bg-gray-400 text-gray-900'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  )
                }
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              >
                <FaHistory className="w-4 h-4" />
                Histórico
              </NavLink>
            </li>
            <li>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
              >
                <FaSignOutAlt className="w-4 h-4" />
                Sair
              </button>
            </li>
          </ul>
        </nav>
      )}
      <div className="w-full mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historical"
            element={
              <ProtectedRoute>
                <HistoricalOrdersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;