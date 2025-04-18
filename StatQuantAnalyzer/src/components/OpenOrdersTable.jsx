import React, { useState } from 'react';
import clsx from 'clsx';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import ScatterChart from './ScatterChart';

// Registrar elementos do Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

const formatCurrency = (value) => {
  return typeof value === 'number' ? value.toFixed(2) : '0.00';
};

const formatPoints = (value) => {
  return value.toLocaleString('pt-BR'); // Ex.: 127500
};

const formatTime = (openTime) => {
  const date = new Date(openTime);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const calculatePoints = (order) => {
  if (order.type.toLowerCase() === 'buy') {
    return order.current_price - order.open_price; // Buy: current_price - open_price
  } else {
    return order.open_price - order.current_price; // Sell: open_price - current_price
  }
};

const PriceChartModal = ({ order, onClose }) => {
  // Dados do gráfico
  const labels = ['Entrada', 'TP', 'SL', 'Atual'];
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Preco de Entrada',
        data: [order.open_price, order.open_price, null, null], // Linha horizontal para Entrada
        borderColor: 'blue',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'Take Profit (TP)',
        data: [null, order.tp, order.tp, null], // Linha horizontal para TP
        borderColor: 'green',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'Stop Loss (SL)',
        data: [null, null, order.sl, order.sl], // Linha horizontal para SL
        borderColor: 'red',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'Preco Atual',
        data: [null, null, order.current_price, null], // Ponto para Preco Atual
        borderColor: 'blue',
        borderWidth: 2,
        pointRadius: 6,
        pointBackgroundColor: 'blue',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: { display: true, text: 'Pontos' },
        min: Math.min(order.open_price, order.tp, order.sl, order.current_price) - 500,
        max: Math.max(order.open_price, order.tp, order.sl, order.current_price) + 500,
        ticks: {
          callback: (value) => formatPoints(value),
        },
      },
      x: {
        display: false,
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      datalabels: {
        display: false
      }
    },
  };
  

  const points = calculatePoints(order);
  const profit = order.profit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Detalhes da Ordem - {order.ticket}</h2>
        {/* Gráfico */}
        <div className="h-80 mb-4">
          <Line data={chartData} options={chartOptions} />
        </div>
        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-center">
          <div className="flex flex-col gap-2">
            <p><strong>Ticket:</strong> {order.ticket}</p>
            <p><strong>Ativo:</strong> {order.symbol}</p>
            <p><strong>Tipo:</strong> {order.type}</p>
            <p><strong>Volume:</strong> {order.volume}</p>
            <p>
              <strong>Preco de Entrada:</strong>{' '}
              <span className="text-blue-600">{formatPoints(order.open_price)} pontos</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p>
              <strong>TP:</strong>{' '}
              <span className="text-green-600">{formatPoints(order.tp)} pontos</span>
            </p>
            <p>
              <strong>SL:</strong>{' '}
              <span className="text-red-600">{formatPoints(order.sl)} pontos</span>
            </p>
            <p>
              <strong>Preco Atual:</strong>{' '}
              <span className="text-blue-600">{formatPoints(order.current_price)} pontos</span>
            </p>
            <p>
              <strong>Pontos:</strong>{' '}
              <span className={clsx(points >= 0 ? 'text-green-600' : 'text-red-600')}>
                {points >= 0 ? '+' : ''}{points} pontos
              </span>
            </p>
            <p>
              <strong>Lucro:</strong>{' '}
              <span className={clsx(profit >= 0 ? 'text-green-600' : 'text-red-600')}>
                R$ {formatCurrency(profit)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const OpenOrdersTable = ({ orders, highlighted, filter, setFilter }) => {
  const totalProfit = orders.reduce((sum, o) => sum + (o.profit || 0), 0);
  const [inputValue, setInputValue] = useState(filter.value); // Controla o input localmente
  const [showFilters, setShowFilters] = useState(false); // Controla visibilidade dos filtros
  const [selectedOrder, setSelectedOrder] = useState(null); // Estado para ordem selecionada

  const filterOptions = [
    { value: '', label: 'Selecione um criterio' },
    { value: 'magic_number', label: 'Nº Magico' },
    { value: 'ticket', label: 'Ticket' },
    { value: 'symbol', label: 'Ativo' },
    { value: 'type', label: 'Tipo' },
    { value: 'open_time', label: 'Hora de Abertura' },
  ];

  const handleCriterionChange = (e) => {
    console.log('Alterando criterio:', e.target.value);
    setFilter({ criterion: e.target.value, value: '' });
    setInputValue('');
  };

  const handleValueChange = (e) => {
    console.log('Alterando valor do input:', e.target.value);
    setInputValue(e.target.value);
  };

  const applyFilterValue = () => {
    console.log('Aplicando filtro com valor:', inputValue);
    setFilter({ ...filter, value: inputValue });
  };

  const clearFilter = () => {
    console.log('Limpando filtro');
    setFilter({ criterion: '', value: '' });
    setInputValue('');
  };

  const toggleFilters = () => {
    console.log('Toggling filtros:', !showFilters);
    setShowFilters(!showFilters);
  };

  const getInputType = () => {
    switch (filter.criterion) {
      case 'magic_number':
      case 'ticket':
        return (
          <input
            type="number"
            value={inputValue}
            onChange={handleValueChange}
            placeholder="Digite o numero"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
          />
        );
      case 'symbol':
        return (
          <input
            type="text"
            value={inputValue}
            onChange={handleValueChange}
            placeholder="Ex.: WIN"
            list="symbol"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
          />
        );
      case 'type':
        return (
          <select
            value={inputValue}
            onChange={handleValueChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
          >
            <option value="">Selecione o tipo</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        );
      case 'open_time':
        return (
          <input
            type="time"
            value={inputValue}
            onChange={handleValueChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
          />
        );
      default:
        return null;
    }
  };

  const uniqueSymbols = [...new Set(orders.map((o) => o.symbol).filter(Boolean))];

  return (
    <div className="w-full">
      {/* Controles de Filtro (mostrados ou escondidos) */}
      <div
        className={clsx(
          'mb-4 bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row gap-4 transition-all duration-300',
          showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <select
          value={filter.criterion}
          onChange={handleCriterionChange}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {getInputType()}
        <button
          onClick={clearFilter}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Limpar
        </button>
      </div>

      {/* Feedback do Filtro */}
      {filter.criterion && filter.value ? (
        orders.length > 0 ? (
          <div className="text-sm text-gray-600 mb-4">Mostrando {orders.length} ordens</div>
        ) : (
          <div className="text-sm text-gray-600 mb-4">Nenhum resultado para o filtro</div>
        )
      ) : (
        <div className="text-sm text-gray-600 mb-4">Mostrando todas as ordens ({orders.length})</div>
      )}

      {/* Datalist para Autocomplete */}
      <datalist id="symbol">
        {uniqueSymbols.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {/* Tabela */}
      <div className="w-full bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Nº Magico</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Ticket</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Ativo</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Tipo</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Volume</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Hora de Abertura</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Preco de Entrada</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Take Profit</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Stop Loss</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Status</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Posicao R$</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {orders.map((order) => (
              <tr
                key={order.ticket}
                onClick={() => setSelectedOrder(order)}
                className={clsx(
                  'border-t hover:bg-gray-50 cursor-pointer',
                  highlighted.includes(order.ticket) && 'bg-yellow-100'
                )}
              >
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.magic_number}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.ticket}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.symbol || 'N/A'}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 capitalize">{order.type}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.volume}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatTime(order.open_time)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatPoints(order.open_price)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatPoints(order.tp)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatPoints(order.sl)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">
                  <span className="text-green-600 font-semibold">Aberto</span>
                </td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">
                  <span
                    className={clsx(
                      'font-medium',
                      order.profit > 0 ? 'text-green-600' : order.profit < 0 ? 'text-red-600' : 'text-gray-600'
                    )}
                  >
                    R$ {formatCurrency(order.profit)}
                  </span>
                </td>
              </tr>
            ))}
            {/* Linha de Total */}
            <tr className="border-t bg-gray-100">
              <td className="px-3 py-2 sm:px-6 sm:py-4 flex items-center gap-2">
                <button
                  onClick={toggleFilters}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300 transition flex items-center gap-1 text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-17 4h14m-7 4h7m-14 4h14"
                    />
                  </svg>
                  Filtros
                </button>
                <button
                  onClick={applyFilterValue}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300 transition text-xs"
                >
                  Aplicar
                </button>
              </td>
              <td colSpan={9} className="px-3 py-2 sm:px-6 sm:py-4 text-right font-bold">
                Total
              </td>
              <td className="px-3 py-2 sm:px-6 sm:py-4 font-bold">
                <span
                  className={clsx(
                    totalProfit > 0 ? 'text-green-600' : totalProfit < 0 ? 'text-red-600' : 'text-gray-600'
                  )}
                >
                  R$ {formatCurrency(totalProfit)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gráficos (ScatterChart e espaço reservado para o próximo gráfico) */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <div className="w-full sm:w-1/2">
          <ScatterChart orders={orders} onOrderClick={setSelectedOrder} />
        </div>
        <div className="w-full sm:w-1/2 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Espaco Reservado</h2>
          <div className="h-56 flex items-center justify-center text-gray-500">
            Proximo grafico sera adicionado aqui
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <PriceChartModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default OpenOrdersTable;