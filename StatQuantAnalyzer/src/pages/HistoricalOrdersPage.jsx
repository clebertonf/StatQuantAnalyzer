import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ClosedOrdersTable from '../components/ClosedOrdersTable.jsx';
import CapitalEvolutionChart from '../components/CapitalEvolutionChart.jsx';

const HistoricalOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrders = async (date) => {
    try {
      setLoading(true);
      // Assumindo um endpoint que aceita uma query de data
      const response = await axios.get(`https://localhost:7188/orders?date=${date}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar ordens históricas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchOrders(selectedDate);
    }
  }, [selectedDate]);

  const filterOrdersByDate = (orders) => {
    return orders.filter(order => order.open_time.startsWith(selectedDate));
  };

  const sortOrdersByOpenTime = (orders) => {
    return orders.sort((a, b) => new Date(b.open_time) - new Date(a.open_time));
  };

  const closedOrders = sortOrdersByOpenTime(filterOrdersByDate(orders.filter(order => !order.is_open)));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-0">
          Historico de Ordens
        </h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
            disabled={loading}
          />
          <button
            onClick={() => fetchOrders(selectedDate)}
            disabled={loading || !selectedDate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Buscar Ordens'}
          </button>
        </div>
      </div>

      {/* Tabela de Ordens Fechadas */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 text-center mb-4">
          Ordens Fechadas - {selectedDate || 'Selecione uma data'}
        </h2>
        {closedOrders.length > 0 ? (
          <ClosedOrdersTable orders={closedOrders} />
        ) : (
          <div className="p-4 bg-gray-100 text-center text-gray-500 text-sm">
            Nenhuma ordem fechada para a data selecionada.
          </div>
        )}
      </div>

      {/* Gráfico de Evolução do Capital */}
      <div className="mb-8">
        <CapitalEvolutionChart orders={closedOrders} />
      </div>
    </div>
  );
};

export default HistoricalOrdersPage;