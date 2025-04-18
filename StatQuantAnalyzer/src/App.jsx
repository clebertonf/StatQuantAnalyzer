import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { FaClock, FaHistory } from 'react-icons/fa'; // Ícones para os botões
import clsx from 'clsx'; // Importação do clsx
import OrdersPage from './pages/OrdersPage.jsx';
import HistoricalOrdersPage from './pages/HistoricalOrdersPage.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow p-4">
          <ul className="flex space-x-2 sm:space-x-4 justify-center">
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
          </ul>
        </nav>
        <div className="w-full mx-auto">
          <Routes>
            <Route path="/" element={<OrdersPage />} />
            <Route path="/historical" element={<HistoricalOrdersPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;