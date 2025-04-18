import React, { useState, useMemo } from 'react';
import { FaWallet, FaChartLine, FaPercentage, FaArrowUp, FaArrowDown, FaExchangeAlt } from 'react-icons/fa';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar elementos do Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

const ClosedOrdersStats = ({ orders }) => {
  // Estado para o filtro de número mágico
  const [selectedMagicNumber, setSelectedMagicNumber] = useState('');

  // Lista de números mágicos únicos
  const magicNumbers = useMemo(() => {
    const numbers = [...new Set(orders.map(order => order.magic_number))].filter(Boolean);
    return numbers.sort((a, b) => a - b); // Ordenar numericamente
  }, [orders]);

  // Filtrar ordens com base no número mágico selecionado
  const filteredOrders = useMemo(() => {
    if (!selectedMagicNumber) return orders;
    return orders.filter(order => order.magic_number === parseInt(selectedMagicNumber));
  }, [orders, selectedMagicNumber]);

  // Função para calcular estatísticas
  const calculateStats = (ordersToCalculate) => {
    if (!ordersToCalculate || ordersToCalculate.length === 0) {
      return {
        totalProfit: 0,
        averageProfit: 0,
        winRate: 0,
        maxWin: 0,
        maxLoss: 0,
        buyCount: 0,
        sellCount: 0,
      };
    }

    const totalProfit = ordersToCalculate.reduce((sum, o) => sum + o.profit, 0);
    const averageProfit = totalProfit / ordersToCalculate.length;
    const winningOrders = ordersToCalculate.filter(o => o.profit > 0).length;
    const winRate = (winningOrders / ordersToCalculate.length) * 100;
    const profits = ordersToCalculate.map(o => o.profit);
    const maxWin = Math.max(...profits, 0);
    const maxLoss = Math.min(...profits, 0);
    const buyCount = ordersToCalculate.filter(o => o.type.toLowerCase() === 'buy').length;
    const sellCount = ordersToCalculate.filter(o => o.type.toLowerCase() === 'sell').length;

    return {
      totalProfit,
      averageProfit,
      winRate,
      maxWin,
      maxLoss,
      buyCount,
      sellCount,
    };
  };

  const stats = calculateStats(filteredOrders);

  // Dados para o gráfico de evolução do capital
  const chartData = useMemo(() => {
    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(a.close_time) - new Date(b.close_time));
    let cumulativeProfit = 0;
    const dataPoints = sortedOrders.map(order => {
      cumulativeProfit += order.profit;
      return cumulativeProfit;
    });

    return {
      labels: sortedOrders.map((_, index) => `Op ${index + 1}`),
      datasets: [
        {
          label: 'Evolução do Capital',
          data: dataPoints,
          borderColor: '#4B5563', // Cinza escuro
          backgroundColor: 'rgba(75, 85, 99, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 12,
        },
      ],
    };
  }, [filteredOrders]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: { display: true, text: 'Capital (R$)' },
        ticks: {
          callback: value => `R$ ${value.toFixed(2)}`,
        },
      },
      x: {
        title: { display: true, text: 'Operações' },
        ticks: {
          maxTicksLimit: 5,
        },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: context => `Capital: R$ ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumo Estatístico (Ordens Fechadas)</h2>

      {/* Dropdown de Filtro por Número Mágico */}
      <div className="mb-6">
        <label htmlFor="magic-number-filter" className="block text-sm font-medium text-gray-600 mb-2">
          Filtrar por Nº Mágico:
        </label>
        <select
          id="magic-number-filter"
          value={selectedMagicNumber}
          onChange={(e) => setSelectedMagicNumber(e.target.value)}
          className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="">Todos</option>
          {magicNumbers.map(number => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
      </div>

      {/* Estatísticas */}
      {filteredOrders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Lucro Total */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FaWallet className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Lucro Total</p>
                <p className={`text-lg font-semibold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {stats.totalProfit.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Lucro Médio */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FaChartLine className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Lucro Médio por Operação</p>
                <p className={`text-lg font-semibold ${stats.averageProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {stats.averageProfit.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Taxa de Acerto */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FaPercentage className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Taxa de Acerto</p>
                <p className="text-lg font-semibold text-gray-700">
                  {stats.winRate.toFixed(1)}%
                </p>
              </div>
            </div>
            {/* Maior Ganho */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FaArrowUp className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Maior Ganho</p>
                <p className="text-lg font-semibold text-green-600">
                  R$ {stats.maxWin.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Maior Perda */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FaArrowDown className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Maior Perda</p>
                <p className="text-lg font-semibold text-red-600">
                  R$ {stats.maxLoss.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Distribuição por Tipo */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <FaExchangeAlt className="text-gray-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Distribuição por Tipo</p>
                <p className="text-lg font-semibold text-gray-700">
                  Compras: {stats.buyCount} | Vendas: {stats.sellCount}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico de Evolução do Capital */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Evolução do Capital (Filtrado)</h3>
            <div className="h-48">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 text-sm py-4">
          Nenhuma ordem fechada para o número mágico selecionado.
        </div>
      )}
    </div>
  );
};

export default ClosedOrdersStats;