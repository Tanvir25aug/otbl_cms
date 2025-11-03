<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  velocityData: {
    type: Array,
    required: true,
    // Expected format: [{ week: 'Week -3', closed: 4 }, ...]
  },
  title: {
    type: String,
    default: 'Weekly Velocity'
  }
});

const chartData = computed(() => ({
  labels: props.velocityData.map(d => d.week || d.sprintName),
  datasets: [
    {
      label: 'Tickets Closed',
      backgroundColor: '#4BC0C0',
      borderColor: '#4BC0C0',
      borderWidth: 1,
      data: props.velocityData.map(d => d.closed || d.ticketsCompleted || d.pointsCompleted)
    }
  ]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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
      padding: 12
    }
  },
  scales: {
    x: {
      ticks: {
        color: 'var(--text-secondary)'
      },
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: 'var(--text-secondary)',
        stepSize: 1
      },
      grid: {
        color: 'var(--color-border)'
      }
    }
  }
}));
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
  position: relative;
}
</style>
