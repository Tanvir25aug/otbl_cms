<template>
  <div class="progress-container">
    <div class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-percentage">{{ percentage }}%</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${percentage}%`, backgroundColor: color }"
      ></div>
    </div>
    <div class="progress-details" v-if="showDetails">
      <span>{{ current }} / {{ total }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#4CAF50'
  }
});

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.round((props.current / props.total) * 100);
});
</script>

<style scoped>
.progress-container {
  margin: 1rem 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.progress-label {
  font-weight: 500;
  color: var(--text-primary);
}

.progress-percentage {
  font-weight: 600;
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-details {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: right;
}
</style>
