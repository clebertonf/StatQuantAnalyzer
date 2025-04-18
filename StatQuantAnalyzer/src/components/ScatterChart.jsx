import React from 'react';
import { Chart as ChartJS, ScatterController, PointElement, LinearScale, Title, Tooltip, Legend, LineController } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrar elementos do Chart.js
ChartJS.register(ScatterController, PointElement, LinearScale, Title, Tooltip, Legend, LineController, ChartDataLabels);

// Função para calcular distâncias
const calculateDistances = (order) => {
  const isBuy = order.type.toLowerCase() === 'buy';
  const distanceToTP = isBuy ? order.tp - order.current_price : order.current_price - order.tp;
  const distanceToSL = isBuy ? order.current_price - order.sl : order.sl - order.current_price;
  return { distanceToTP, distanceToSL };
};

// Função para determinar a cor do ponto
const getPointColor = (distanceToTP, distanceToSL) => {
  const absDistanceToTP = Math.abs(distanceToTP);
  const absDistanceToSL = Math.abs(distanceToSL);
  
  // Comparar distâncias absolutas
  if (absDistanceToTP < absDistanceToSL) {
    return 'forestgreen'; // Mais próximo do TP
  } else if (absDistanceToSL < absDistanceToTP) {
    return 'darkred'; // Mais próximo do SL
  } else {
    return 'steelblue'; // Distâncias iguais ou longe de ambos
  }
};

// Função para limitar ordens (mostrar as 10 mais críticas)
const getCriticalOrders = (orders) => {
  const ordersWithDistances = orders.map(order => {
    const { distanceToTP, distanceToSL } = calculateDistances(order);
    return { order, distanceToTP, distanceToSL, minDistance: Math.min(Math.abs(distanceToTP), Math.abs(distanceToSL)) };
  });

  // Ordenar por menor distância (mais críticas primeiro)
  ordersWithDistances.sort((a, b) => a.minDistance - b.minDistance);

  // Limitar a 10 ordens se houver mais de 20
  return orders.length > 20 ? ordersWithDistances.slice(0, 10).map(item => ({
    ...item.order,
    distanceToTP: item.distanceToTP,
    distanceToSL: item.distanceToSL,
  })) : ordersWithDistances.map(item => ({
    ...item.order,
    distanceToTP: item.distanceToTP,
    distanceToSL: item.distanceToSL,
  }));
};

const ScatterChart = ({ orders, onOrderClick }) => {
  // Processar ordens
  const processedOrders = getCriticalOrders(orders);

  // Preparar dados para o gráfico
  const scatterData = processedOrders.map(order => {
    const { distanceToTP, distanceToSL } = order;
    const color = getPointColor(distanceToTP, distanceToSL);
    return {
      x: distanceToTP,
      y: distanceToSL,
      order, // Armazenar a ordem para interatividade
      backgroundColor: color,
      radius: Math.max(5, order.volume * 3), // Tamanho proporcional ao volume
    };
  });

  const chartData = {
    datasets: [
      {
        label: 'Ordens',
        data: scatterData,
        backgroundColor: scatterData.map(item => item.backgroundColor),
        pointRadius: scatterData.map(item => item.radius),
        pointHoverRadius: scatterData.map(item => item.radius + 2),
      },
      // Linha de referência para TP (200 pontos)
      {
        type: 'line',
        label: 'Zona Crítica TP',
        data: [
          { x: 200, y: -Infinity },
          { x: 200, y: Infinity },
        ],
        borderColor: 'rgba(255, 165, 0, 0.3)', // Laranja claro
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      // Linha de referência para SL (200 pontos)
      {
        type: 'line',
        label: 'Zona Crítica SL',
        data: [
          { x: -Infinity, y: 200 },
          { x: Infinity, y: 200 },
        ],
        borderColor: 'rgba(255, 0, 0, 0.3)', // Vermelho claro
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Distância para TP (pontos)' },
        min: Math.min(-500, ...scatterData.map(d => d.x)) - 100,
        max: Math.max(1000, ...scatterData.map(d => d.x)) + 100,
        grid: { display: true },
      },
      y: {
        title: { display: true, text: 'Distância para SL (pontos)' },
        min: Math.min(-500, ...scatterData.map(d => d.y)) - 100,
        max: Math.max(1000, ...scatterData.map(d => d.y)) + 100,
        grid: { display: true },
      },
    },
    plugins: {
      legend: {
        labels: {
          filter: (legendItem, chartData) => {
            // Mostrar apenas a legenda do dataset "Ordens"
            return legendItem.datasetIndex === 0;
          },
        },
      },
      tooltip: {
        filter: (tooltipItem) => {
          // Mostrar tooltips apenas para o dataset "Ordens" (índice 0)
          return tooltipItem.datasetIndex === 0;
        },
        callbacks: {
          label: (context) => {
            const order = context.raw.order;
            const { distanceToTP, distanceToSL } = order;
            return [
              `Ticket: ${order.ticket}`,
              `Ativo: ${order.symbol}`,
              `Tipo: ${order.type}`,
              `Distância para TP: ${distanceToTP} pontos`,
              `Distância para SL: ${distanceToSL} pontos`,
            ];
          },
        },
      },
      datalabels: { display: false }, // Desativar datalabels
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const order = scatterData[index].order;
        onOrderClick(order);
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Proximidade de TP/SL</h2>
      <div className="h-56">
        <Scatter data={chartData} options={chartOptions} />
      </div>
      {orders.length > 20 && (
        <p className="text-sm text-gray-600 mt-2">
          Mostrando as 10 ordens mais críticas (menores distâncias para TP ou SL).
        </p>
      )}
    </div>
  );
};

export default ScatterChart;