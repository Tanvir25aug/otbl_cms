<template>
  <div class="export-options">
    <button class="export-btn export-pdf" @click="exportPDF" :disabled="exporting">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      {{ exporting ? 'Exporting...' : 'Export PDF' }}
    </button>

    <button class="export-btn export-print" @click="printTicket">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Print
    </button>

    <button class="export-btn export-share" @click="shareLink">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      {{ copied ? 'Copied!' : 'Share Link' }}
    </button>

    <div v-if="message" class="export-message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  ticketId: number;
}>();

const exporting = ref(false);
const copied = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const exportPDF = async () => {
  try {
    exporting.value = true;

    // Open PDF in new tab
    const pdfUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/export/ticket/${props.ticketId}/pdf`;

    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = `ticket-${props.ticketId}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showMessage('PDF export started!');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    showMessage('Failed to export PDF', 'error');
  } finally {
    exporting.value = false;
  }
};

const printTicket = () => {
  try {
    window.print();
    showMessage('Print dialog opened');
  } catch (error) {
    console.error('Error printing:', error);
    showMessage('Failed to open print dialog', 'error');
  }
};

const shareLink = async () => {
  try {
    const url = window.location.href;

    // Try to use the Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    copied.value = true;
    showMessage('Link copied to clipboard!');

    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error copying link:', error);
    showMessage('Failed to copy link', 'error');
  }
};
</script>

<style scoped>
.export-options {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  border: 2px solid;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.export-btn svg {
  flex-shrink: 0;
}

.export-pdf {
  border-color: #ef4444;
  color: #ef4444;
}

.export-pdf:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.export-print {
  border-color: #3b82f6;
  color: #3b82f6;
}

.export-print:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
}

.export-share {
  border-color: #10b981;
  color: #10b981;
}

.export-share:hover:not(:disabled) {
  background: #10b981;
  color: white;
}

.export-message {
  margin-left: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.export-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.export-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

@media (max-width: 768px) {
  .export-options {
    width: 100%;
  }

  .export-btn {
    flex: 1;
    justify-content: center;
  }
}

/* Print styles */
@media print {
  .export-options {
    display: none;
  }
}
</style>
