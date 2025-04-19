import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">StatQuantAnalyzer</h1>
          <nav className="mt-6">
            <ul>
              <li>
                <Link to="/" className="block py-2 px-4 text-gray-700 hover:bg-blue-500 hover:text-white">
                  Home
                </Link>
              </li>
              {/* Adicione outros links conforme necessário */}
            </ul>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sair
          </button>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;