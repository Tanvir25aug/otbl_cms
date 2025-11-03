<template>
  <div :class="['metric-card', variant]">
    <div class="metric-header">
      <span class="metric-icon" v-if="icon">{{ icon }}</span>
      <h3 class="metric-title">{{ title }}</h3>
    </div>
    <div class="metric-value">{{ formattedValue }}</div>
    <div class="metric-subtitle" v-if="subtitle">{{ subtitle }}</div>
    <div class="metric-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  suffix: {
    type: String,
    default: ''
  }
});

const formattedValue = computed(() => {
  return `${props.value}${props.suffix}`;
});
</script>

<style scoped>
.metric-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.metric-card.primary {
  border-left: 4px solid #2196F3;
}

.metric-card.success {
  border-left: 4px solid #4CAF50;
}

.metric-card.warning {
  border-left: 4px solid #FF9800;
}

.metric-card.danger {
  border-left: 4px solid #F44336;
}

.metric-card.info {
  border-left: 4px solid #00BCD4;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.metric-icon {
  font-size: 1.5rem;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0.5rem 0;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.metric-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
}
</style>
