import React, { useState } from 'react';
import clsx from 'clsx';

const formatCurrency = (value) => {
  return typeof value === 'number' ? value.toFixed(2) : '0.00';
};

const ClosedOrdersTable = ({ orders, filter, setFilter }) => {
  const totalProfit = orders.reduce((sum, o) => sum + (o.profit || 0), 0);
  const [inputValue, setInputValue] = useState(filter.value); // Controla o input localmente
  const [showFilters, setShowFilters] = useState(false); // Controla visibilidade dos filtros

  const filterOptions = [
    { value: '', label: 'Selecione um critério' },
    { value: 'magic_number', label: 'Nº Mágico' },
    { value: 'ticket', label: 'Ticket' },
    { value: 'symbol', label: 'Ativo' },
    { value: 'type', label: 'Tipo' },
    { value: 'open_time', label: 'Hora de Abertura' },
  ];

  const handleCriterionChange = (e) => {
    console.log('Alterando critério:', e.target.value);
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
            placeholder="Digite o número"
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

  const uniqueSymbols = [...new Set(orders.map(o => o.symbol).filter(Boolean))];

  const formatTime = (openTime) => {
    const date = new Date(openTime);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

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
          {filterOptions.map(option => (
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
          <div className="text-sm text-gray-600 mb-4">
            Mostrando {orders.length} ordens
          </div>
        ) : (
          <div className="text-sm text-gray-600 mb-4">
            Nenhum resultado para o filtro
          </div>
        )
      ) : (
        <div className="text-sm text-gray-600 mb-4">
          Mostrando todas as ordens ({orders.length})
        </div>
      )}

      {/* Datalist para Autocomplete */}
      <datalist id="symbol">
        {uniqueSymbols.map(s => <option key={s} value={s} />)}
      </datalist>

      {/* Tabela */}
      <div className="w-full bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Nº Mágico</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Ticket</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Ativo</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Tipo</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Volume</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Hora de Abertura</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Preço de Entrada</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Take Profit</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Stop Loss</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Status</th>
              <th className="px-3 py-2 sm:px-6 sm:py-4">Posição R$</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {orders.map((order) => (
              <tr key={order.ticket} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.magic_number}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.ticket}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.symbol || 'N/A'}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4 capitalize">{order.type}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{order.volume}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatTime(order.open_time)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatCurrency(order.open_price)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatCurrency(order.tp)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">{formatCurrency(order.sl)}</td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">
                  <span className="text-gray-500 font-semibold">Fechado</span>
                </td>
                <td className="px-3 py-2 sm:px-6 sm:py-4">
                  <span
                    className={clsx(
                      'font-medium',
                      order.profit > 0
                        ? 'text-green-600'
                        : order.profit < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-17 4h14m-7 4h7m-14 4h14" />
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
                    totalProfit > 0
                      ? 'text-green-600'
                      : totalProfit < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  )}
                >
                  R$ {formatCurrency(totalProfit)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClosedOrdersTable;