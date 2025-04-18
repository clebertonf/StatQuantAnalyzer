import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrar o plugin ChartDataLabels globalmente (se necessário)
Chart.register(ChartDataLabels);

const CapitalEvolutionChart = ({ orders, title = 'Evolucao do Capital' }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Ordenar ordens por open_time
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(a.open_time) - new Date(b.open_time)
    );

    // Calcular o capital acumulado
    let cumulativeProfit = 0;
    const dataPoints = sortedOrders.map((order) => {
      cumulativeProfit += order.profit || 0;
      return {
        x: new Date(order.open_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        y: cumulativeProfit.toFixed(2),
      };
    });

    // Configurar o gráfico de linha
    const ctx = chartRef.current.getContext('2d');

    // Destruir gráfico anterior, se existir
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Capital Acumulado (R$)',
            data: dataPoints,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: (context) => {
              const value = context.parsed?.y || 0;
              return value < 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
            },
            fill: true,
            tension: 0.3,
            segment: {
              borderColor: (context) => {
                const value = context.p1.parsed.y;
                return value < 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
              },
              backgroundColor: (context) => {
                const value = context.p1.parsed.y;
                return value < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
              },
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Horario (HH:MM)',
              font: { size: 14 },
            },
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Capital Acumulado (R$)',
              font: { size: 14 },
            },
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12 },
            },
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (tooltipItems) => '', // Não mostrar o horário no tooltip
              label: (context) => `R$ ${context.parsed.y}`,
            },
          },
          datalabels: {
            display: false, // Desativar datalabels para não mostrar o horário nos pontos
          },
        },
      },
    });

    // Limpeza ao desmontar
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [orders]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
        {title}
      </h2>
      <div className="relative h-64 sm:h-80">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default CapitalEvolutionChart;