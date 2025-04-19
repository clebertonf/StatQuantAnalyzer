import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import OpenOrdersTable from '../components/OpenOrdersTable.jsx';
import ClosedOrdersTable from '../components/ClosedOrdersTable.jsx';
import CapitalEvolutionChart from '../components/CapitalEvolutionChart.jsx';
import ClosedOrdersStats from '../components/ClosedOrdersStats.jsx';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [highlightedTickets, setHighlightedTickets] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const previousTickets = useRef(new Set());
  const [openFilter, setOpenFilter] = useState({ criterion: '', value: '' });
  const [closedFilter, setClosedFilter] = useState({ criterion: '', value: '' });

  const fetchOrders = async () => {
    try {
      setLoading(true);
  
      const token = localStorage.getItem('token'); // pega o token do localStorage
  
      const response = await axios.get('https://localhost:7188/open', {
        headers: {
          Authorization: `Bearer ${token}`, // envia o token no cabeçalho
        },
      });
  
      const fetchedOrders = response.data;
      console.log('Dados recebidos da API:', fetchedOrders);
  
      const newTickets = fetchedOrders
        .map(o => o.ticket)
        .filter(ticket => !previousTickets.current.has(ticket));
  
      setHighlightedTickets(newTickets);
      setOrders(fetchedOrders);
      setLastUpdate(new Date());
      previousTickets.current = new Set(fetchedOrders.map(o => o.ticket));
  
      setTimeout(() => setHighlightedTickets([]), 4000);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 1800000); // 30 minutos
    return () => clearInterval(interval);
  }, []);

  const filterOrdersByToday = (orders) => {
    if (!orders || !Array.isArray(orders)) {
      console.warn('Nenhum pedido válido recebido');
      return [];
    }
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    console.log('Filtrando com data de hoje:', todayString);
    const filtered = orders.filter(order => {
      if (!order.open_time || typeof order.open_time !== 'string') {
        console.warn('open_time inválido:', order);
        return false;
      }
      const matches = order.open_time.startsWith(todayString);
      console.log(`Order ${order.ticket}: open_time=${order.open_time}, matches=${matches}`);
      return matches;
    });
    console.log('Ordens filtradas:', filtered);
    return filtered;
  };

  const sortOrdersByOpenTime = (orders) => {
    return orders.sort((a, b) => new Date(b.open_time) - new Date(a.open_time));
  };

  const applyFilter = (orders, filter) => {
    console.log('Aplicando filtro:', filter);
    if (!filter.criterion || !filter.value.trim()) {
      console.log('Filtro vazio ou inválido, retornando todas as ordens');
      return orders;
    }

    const filteredOrders = orders.filter(order => {
      const value = filter.value.toLowerCase().trim();
      console.log(`Filtrando ordem ${order.ticket} com valor: ${value}`);
      try {
        switch (filter.criterion) {
          case 'magic_number':
          case 'ticket':
            const parsedValue = parseInt(value);
            if (isNaN(parsedValue)) {
              console.log(`Valor inválido para ${filter.criterion}: ${value}`);
              return true; // Mantém todas as ordens
            }
            const result = order[filter.criterion] === parsedValue;
            console.log(`Comparando ${filter.criterion} ${order[filter.criterion]} === ${parsedValue}: ${result}`);
            return result;
          case 'symbol':
            const symbolMatch = order.symbol?.toLowerCase().includes(value) || false;
            console.log(`Symbol ${order.symbol} inclui ${value}: ${symbolMatch}`);
            return symbolMatch;
          case 'type':
            const typeMatch = order.type?.toLowerCase() === value;
            console.log(`Type ${order.type} === ${value}: ${typeMatch}`);
            return typeMatch;
          case 'open_time':
            if (!value) {
              console.log('Hora vazia, mantendo ordem');
              return true;
            }
            const inputTime = value; // Formato HH:mm do <input type="time">
            const orderDate = new Date(order.open_time);
            const orderTime = `${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}`;
            const timeMatch = orderTime === inputTime;
            console.log(`Hora orderTime=${orderTime}, inputTime=${inputTime}, matches=${timeMatch}`);
            return timeMatch;
          default:
            console.log('Critério desconhecido, mantendo ordem');
            return true;
        }
      } catch (error) {
        console.error(`Erro ao filtrar ordem ${order.ticket}:`, error);
        return true; // Mantém a ordem em caso de erro
      }
    });

    console.log('Ordens filtradas:', filteredOrders);
    return filteredOrders;
  };

  const openOrders = sortOrdersByOpenTime(
    applyFilter(filterOrdersByToday(orders.filter(order => order.is_open)), openFilter)
  );
  const closedOrders = sortOrdersByOpenTime(
    applyFilter(filterOrdersByToday(orders.filter(order => !order.is_open)), closedFilter)
  );
  console.log('Open Orders:', openOrders);
  console.log('Closed Orders:', closedOrders);

  const totalProfit = openOrders.reduce((sum, o) => sum + o.profit, 0);
  const buyCount = openOrders.filter(o => o.type === 'buy').length;
  const sellCount = openOrders.filter(o => o.type === 'sell').length;

  const formatCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-0">
          StatQuant Analyzer
        </h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar Agora'}
        </button>
      </div>

      {/* Última atualização */}
      <div className="text-xs sm:text-sm text-gray-500 mb-6">
        Última atualização: {lastUpdate?.toLocaleTimeString() || 'Nunca'}
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Card "Agora" */}
        <div className="bg-white shadow rounded-2xl p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">AGORA {formatCurrentDateTime()}</h3>
          {(() => {
            const profitClass = totalProfit >= 0 ? 'text-green-600' : 'text-red-600';
            return (
              <>
                <p className={`text-xl sm:text-2xl font-bold ${profitClass}`}>
                  R$ {totalProfit.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Total Posições abertas: ({openOrders.length})
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Compras: {buyCount}   |   Vendas: {sellCount}
                </p>
              </>
            );
          })()}
        </div>

        {/* Card "Resumo do Dia" */}
        <div className="bg-white shadow rounded-2xl p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Resumo do Dia (Ordens fechadas) {formatCurrentDateTime()}</h3>
          {(() => {
            const closedProfit = closedOrders.reduce((sum, o) => sum + o.profit, 0);
            const profitClass = closedProfit >= 0 ? 'text-green-600' : 'text-red-600';
            return (
              <>
                <p className={`text-xl sm:text-2xl font-bold ${profitClass}`}>
                  R$ {closedProfit.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Total Ordens Fechadas: ({closedOrders.length})
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Acertos: {closedOrders.filter(o => o.profit > 0).length}   |  
                  Erros: {closedOrders.filter(o => o.profit < 0).length}
                </p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Tabela de Ordens Abertas */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 text-center mb-4">
          Ordens Abertas
        </h2>
        <OpenOrdersTable
          orders={openOrders}
          highlighted={highlightedTickets}
          filter={openFilter}
          setFilter={setOpenFilter}
        />
      </div>

      {/* Tabela de Ordens Fechadas */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 text-center mb-4">
          Ordens Fechadas
        </h2>
        <ClosedOrdersTable
          orders={closedOrders}
          filter={closedFilter}
          setFilter={setClosedFilter}
        />
      </div>

     {/* Gráfico de Evolução do Capital e Resumo Estatístico */}
<div className="mb-8">
  {closedOrders.length > 0 ? (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
      {/* Gráfico de Evolução do Capital */}
      <div className="w-full sm:w-1/2 bg-white rounded-lg shadow-md p-4 h-full">
        <CapitalEvolutionChart
          orders={closedOrders}
          title={`Evolução do Capital - Dia Corrente (Ordens Fechadas ${formatCurrentDateTime()})`}
        />
      </div>
      {/* Resumo Estatístico das Ordens Fechadas */}
      <div className="w-full sm:w-1/2 h-full">
        <ClosedOrdersStats orders={closedOrders} />
      </div>
    </div>
  ) : (
    <div className="p-4 bg-gray-100 text-center text-gray-500 text-sm">
      Nenhuma ordem fechada para exibir o gráfico e o resumo.
    </div>
  )}
</div>
    </div>
  );
};

export default OrdersPage;