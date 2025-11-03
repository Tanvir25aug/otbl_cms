<template>
  <div class="chart-container">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  data: {
    type: Object,
    required: true,
    // Expected format: { label1: count1, label2: count2, ... }
  },
  title: {
    type: String,
    default: ''
  },
  colors: {
    type: Array,
    default: () => [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#C9CBCF'
    ]
  }
});

const chartData = computed(() => ({
  labels: Object.keys(props.data),
  datasets: [
    {
      backgroundColor: props.colors,
      data: Object.values(props.data)
    }
  ]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'var(--text-primary)',
        padding: 15,
        font: {
          size: 12
        }
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
      borderWidth: 1,
      borderColor: '#ddd'
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
