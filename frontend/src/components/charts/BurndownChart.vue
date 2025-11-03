<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

const props = defineProps({
  burndownData: {
    type: Array,
    required: true,
    // Expected format: [{ day: 0, date: '2025-01-20', ideal: 20, actual: 20 }, ...]
  },
  title: {
    type: String,
    default: 'Sprint Burndown'
  }
});

const chartData = computed(() => ({
  labels: props.burndownData.map(d => d.date || `Day ${d.day}`),
  datasets: [
    {
      label: 'Ideal',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      borderColor: '#36A2EB',
      borderDash: [5, 5],
      data: props.burndownData.map(d => d.ideal),
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false
    },
    {
      label: 'Actual',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: '#FF6384',
      data: props.burndownData.map(d => d.actual),
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true
    }
  ]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'var(--text-primary)',
        usePointStyle: true,
        padding: 15
      }
    },
    title: {
      display: !!props.title,
      text: props.title,
      color: 'var(--text-primary)',
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y} points`;
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: 'var(--text-secondary)',
        maxRotation: 45,
        minRotation: 45
      },
      grid: {
        color: 'var(--color-border)'
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: 'var(--text-secondary)',
        stepSize: 5
      },
      grid: {
        color: 'var(--color-border)'
      },
      title: {
        display: true,
        text: 'Story Points',
        color: 'var(--text-primary)'
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
}));
</script>

<style scoped>
.chart-container {
  height: 400px;
  width: 100%;
  position: relative;
}
</style>
