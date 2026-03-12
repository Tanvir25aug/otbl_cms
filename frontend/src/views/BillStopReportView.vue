<template>
  <div class="bs-report-view">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-header__title">Bill Stop Report</h1>
        <p class="page-header__subtitle">
          Saved snapshot from OTBL_CMS &mdash;
          <span v-if="snapshotDate" class="snapshot-date">Last generated: {{ formatDate(snapshotDate) }}</span>
          <span v-else class="snapshot-date muted">No snapshot available &mdash; click "Generate Bill Stop Report" on the Bill Stop page.</span>
        </p>
      </div>
      <div class="page-header__actions">
        <button class="btn btn--outline" @click="downloadExcel" :disabled="customers.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Excel
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="summary" class="summary-cards">
      <div class="summary-card total">
        <div class="summary-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="summary-card__body">
          <div class="summary-card__value">{{ summary.totalBillStop?.toLocaleString() ?? '-' }}</div>
          <div class="summary-card__title">Total Bill Stop</div>
        </div>
      </div>
      <div class="summary-card success">
        <div class="summary-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <div class="summary-card__body">
          <div class="summary-card__value">{{ summary.withBillingProfileData?.toLocaleString() ?? '-' }}</div>
          <div class="summary-card__title">Current Month Read</div>
        </div>
      </div>
      <div class="summary-card danger">
        <div class="summary-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="summary-card__body">
          <div class="summary-card__value">{{ summary.withoutBillingProfileData?.toLocaleString() ?? '-' }}</div>
          <div class="summary-card__title">No Current Month Read</div>
        </div>
      </div>
      <div class="summary-card info">
        <div class="summary-card__body">
          <div class="summary-card__value">{{ summary.completeCoverage?.toLocaleString() ?? '-' }}</div>
          <div class="summary-card__title">Complete Coverage (3 mo.)</div>
        </div>
      </div>
      <div class="summary-card warn">
        <div class="summary-card__body">
          <div class="summary-card__value">{{ summary.partialCoverage?.toLocaleString() ?? '-' }}</div>
          <div class="summary-card__title">Partial Coverage (3 mo.)</div>
        </div>
      </div>
      <div class="summary-card danger">
        <div class="summary-card__body">
          <div class="summary-card__value">{{ summary.noCoverage?.toLocaleString() ?? '-' }}</div>
          <div class="summary-card__title">No Coverage (3 mo.)</div>
        </div>
      </div>
      <div class="summary-card warn">
        <div class="summary-card__body">
          <div class="summary-card__value">{{ summary.installedThisMonthNoBill?.toLocaleString() ?? '-' }}</div>
          <div class="summary-card__title">Installed This Month (No Bill)</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div v-if="summary" class="charts-row">
      <!-- Coverage Donut -->
      <div class="chart-card">
        <h3 class="chart-title">Coverage Breakdown</h3>
        <div class="donut-wrap">
          <svg viewBox="0 0 120 120" class="donut-svg">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="20"/>
            <circle cx="60" cy="60" r="50" fill="none"
              :stroke="'#22c55e'"
              stroke-width="20"
              :stroke-dasharray="`${completePct * 3.14159} ${314.159}`"
              stroke-dashoffset="78.54"
              transform="rotate(-90 60 60)"
            />
            <circle cx="60" cy="60" r="50" fill="none"
              :stroke="'#f59e0b'"
              stroke-width="20"
              :stroke-dasharray="`${partialPct * 3.14159} ${314.159}`"
              :stroke-dashoffset="`${78.54 - completePct * 3.14159}`"
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="64" text-anchor="middle" class="donut-text">{{ summary.totalBillStop?.toLocaleString() }}</text>
            <text x="60" y="76" text-anchor="middle" class="donut-sub">Total</text>
          </svg>
          <div class="donut-legend">
            <div class="legend-item"><span class="legend-dot success"></span> Complete: {{ summary.completeCoverage }}</div>
            <div class="legend-item"><span class="legend-dot warn"></span> Partial: {{ summary.partialCoverage }}</div>
            <div class="legend-item"><span class="legend-dot danger"></span> None: {{ summary.noCoverage }}</div>
          </div>
        </div>
      </div>

      <!-- Tariff Breakdown -->
      <div class="chart-card" v-if="summary.tariffBreakdown?.length">
        <h3 class="chart-title">Tariff Breakdown</h3>
        <div class="bar-list">
          <div v-for="t in summary.tariffBreakdown" :key="t.TARIFF" class="bar-item">
            <div class="bar-label">{{ t.TARIFF || 'Unknown' }}</div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: tariffBarWidth(t.cnt) + '%' }"></div>
            </div>
            <div class="bar-value">{{ t.cnt?.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Read vs No Read -->
      <div class="chart-card">
        <h3 class="chart-title">Current Month Reading</h3>
        <div class="read-split">
          <div class="read-pct success">
            <div class="read-pct__value">{{ readPct }}%</div>
            <div class="read-pct__label">Has Read</div>
          </div>
          <div class="read-divider"></div>
          <div class="read-pct danger">
            <div class="read-pct__value">{{ 100 - readPct }}%</div>
            <div class="read-pct__label">No Read</div>
          </div>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: readPct + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <input v-model="filters.search" @input="debouncedFetch" type="text" placeholder="Search customer / meter / name..." class="form-control filter-search" />
      <select v-model="filters.coverage" @change="fetchData" class="form-control filter-select">
        <option value="">All Coverage</option>
        <option value="COMPLETE_COVERAGE">Complete Coverage</option>
        <option value="PARTIAL_COVERAGE">Partial Coverage</option>
        <option value="NO_COVERAGE">No Coverage</option>
      </select>
      <select v-model="filters.hasRead" @change="fetchData" class="form-control filter-select">
        <option value="">All Read Status</option>
        <option value="yes">Has Current Read</option>
        <option value="no">No Current Read</option>
      </select>
      <select v-model="filters.installed" @change="fetchData" class="form-control filter-select">
        <option value="">All Install</option>
        <option value="yes">Installed This Month</option>
        <option value="no">Not Installed This Month</option>
      </select>
      <select v-model="filters.tariff" @change="fetchData" class="form-control filter-select">
        <option value="">All Tariff</option>
        <option v-for="t in tariffOptions" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="loading" class="loading-state">Loading...</div>
      <div v-else-if="error" class="alert alert--danger">{{ error }}</div>
      <div v-else-if="customers.length === 0" class="empty-state">
        <p>No data found. Generate a report from the Bill Stop page first.</p>
      </div>
      <template v-else>
        <div class="table-info">
          Showing {{ customers.length }} of {{ total.toLocaleString() }} records
          &nbsp;&bull;&nbsp; Page {{ filters.page }} / {{ totalPages }}
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer No.</th>
                <th>Customer Name</th>
                <th>Meter No.</th>
                <th>Tariff</th>
                <th>Conn. Date</th>
                <th>Last Bill Date</th>
                <th>Current Read</th>
                <th>Coverage</th>
                <th>Installed This Month</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, idx) in customers" :key="c.Id">
                <td>{{ (filters.page - 1) * filters.limit + idx + 1 }}</td>
                <td>{{ c.CUSTOMER_NUM }}</td>
                <td>{{ c.CUSTOMER_NAME || '-' }}</td>
                <td>{{ c.METER_NO || '-' }}</td>
                <td><span class="badge badge--info">{{ c.TARIFF || '-' }}</span></td>
                <td>{{ formatDate(c.CONN_DATE) }}</td>
                <td>{{ formatDate(c.LAST_BILL_DATE) }}</td>
                <td>
                  <span :class="c.HAS_CURRENT_MONTH_READ ? 'badge badge--success' : 'badge badge--danger'">
                    {{ c.HAS_CURRENT_MONTH_READ ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <span :class="coverageBadge(c.COVERAGE)">{{ coverageLabel(c.COVERAGE) }}</span>
                </td>
                <td>
                  <span v-if="c.INSTALLED_THIS_MONTH_NO_BILL" class="badge badge--warn">Yes</span>
                  <span v-else class="badge badge--secondary">No</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="btn btn--sm btn--outline" :disabled="filters.page <= 1" @click="changePage(filters.page - 1)">Prev</button>
          <span class="pagination__info">Page {{ filters.page }} / {{ totalPages }}</span>
          <button class="btn btn--sm btn--outline" :disabled="filters.page >= totalPages" @click="changePage(filters.page + 1)">Next</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { getBillStopSnapshot, getBillStopSnapshotSummary } from '../api';

const loading      = ref(false);
const error        = ref('');
const customers    = ref<any[]>([]);
const total        = ref(0);
const totalPages   = ref(1);
const snapshotDate = ref<string | null>(null);
const summary      = ref<any | null>(null);
const tariffOptions = ref<string[]>([]);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const filters = reactive({
  search:    '',
  coverage:  '',
  hasRead:   '',
  installed: '',
  tariff:    '',
  page:      1,
  limit:     100,
});

const completePct = computed(() => {
  if (!summary.value || !summary.value.totalBillStop) return 0;
  return Math.round((summary.value.completeCoverage / summary.value.totalBillStop) * 100);
});
const partialPct = computed(() => {
  if (!summary.value || !summary.value.totalBillStop) return 0;
  return Math.round((summary.value.partialCoverage / summary.value.totalBillStop) * 100);
});
const readPct = computed(() => {
  if (!summary.value || !summary.value.totalBillStop) return 0;
  return Math.round((summary.value.withBillingProfileData / summary.value.totalBillStop) * 100);
});

const tariffMax = computed(() => {
  if (!summary.value?.tariffBreakdown?.length) return 1;
  return Math.max(...summary.value.tariffBreakdown.map((t: any) => t.cnt));
});
const tariffBarWidth = (cnt: number) => Math.round((cnt / tariffMax.value) * 100);

const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { filters.page = 1; fetchData(); }, 400);
};

const fetchData = async () => {
  loading.value = true;
  error.value   = '';
  try {
    const { data } = await getBillStopSnapshot({
      page:      filters.page,
      limit:     filters.limit,
      coverage:  filters.coverage  || undefined,
      tariff:    filters.tariff    || undefined,
      search:    filters.search    || undefined,
      hasRead:   filters.hasRead   || undefined,
      installed: filters.installed || undefined,
    });
    customers.value  = data.data.customers;
    total.value      = data.data.total;
    totalPages.value = data.data.totalPages;
    if (data.data.snapshotDate) snapshotDate.value = data.data.snapshotDate;
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load snapshot data';
  } finally {
    loading.value = false;
  }
};

const fetchSummary = async () => {
  try {
    const { data } = await getBillStopSnapshotSummary();
    summary.value = data.data;
    snapshotDate.value = data.data.snapshotDate;
    // Build tariff options from summary
    if (data.data.tariffBreakdown) {
      tariffOptions.value = data.data.tariffBreakdown.map((t: any) => t.TARIFF).filter(Boolean);
    }
  } catch {
    // Summary may fail if no data yet — not a fatal error
  }
};

const changePage = (p: number) => {
  filters.page = p;
  fetchData();
};

const formatDate = (d: any) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '-';
  return dt.toISOString().split('T')[0];
};

const coverageBadge = (c: string) => {
  if (c === 'COMPLETE_COVERAGE') return 'badge badge--success';
  if (c === 'PARTIAL_COVERAGE')  return 'badge badge--warn';
  return 'badge badge--danger';
};
const coverageLabel = (c: string) => {
  if (c === 'COMPLETE_COVERAGE') return 'Complete';
  if (c === 'PARTIAL_COVERAGE')  return 'Partial';
  return 'None';
};

const downloadExcel = async () => {
  try {
    // Fetch all records for export
    const { data } = await getBillStopSnapshot({ page: 1, limit: 50000 });
    const rows = data.data.customers.map((c: any) => ({
      CUSTOMER_NUM:                 c.CUSTOMER_NUM,
      CUSTOMER_NAME:                c.CUSTOMER_NAME,
      ADDRESS:                      c.ADDRESS,
      MOBILE_NO:                    c.MOBILE_NO,
      METER_NO:                     c.METER_NO,
      CONN_DATE:                    formatDate(c.CONN_DATE),
      TARIFF:                       c.TARIFF,
      LAST_BILL_DATE:               formatDate(c.LAST_BILL_DATE),
      HAS_CURRENT_MONTH_READ:       c.HAS_CURRENT_MONTH_READ ? 'Yes' : 'No',
      COVERAGE:                     c.COVERAGE,
      INSTALLED_THIS_MONTH_NO_BILL: c.INSTALLED_THIS_MONTH_NO_BILL ? 'Yes' : 'No',
      SNAPSHOT_DATE:                formatDate(c.SNAPSHOT_DATE),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BillStopReport');
    XLSX.writeFile(wb, `bill_stop_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to download');
  }
};

onMounted(async () => {
  await Promise.all([fetchSummary(), fetchData()]);
});
</script>

<style scoped>
.bs-report-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-xl, 1.5rem);
  background: var(--color-background, #f9fafb);
  min-height: 100vh;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.page-header__title { font-size: 1.75rem; font-weight: 700; color: var(--color-text, #111); margin: 0; }
.page-header__subtitle { color: var(--color-text-muted, #6b7280); margin: 0.25rem 0 0; font-size: 0.9rem; }
.snapshot-date { font-weight: 600; }
.snapshot-date.muted { font-weight: 400; font-style: italic; }
.page-header__actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.summary-card {
  background: var(--color-surface, #fff);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-left: 4px solid #e5e7eb;
}
.summary-card.total   { border-left-color: #6366f1; }
.summary-card.success { border-left-color: #22c55e; }
.summary-card.danger  { border-left-color: #ef4444; }
.summary-card.warn    { border-left-color: #f59e0b; }
.summary-card.info    { border-left-color: #3b82f6; }
.summary-card__icon { color: #9ca3af; }
.summary-card__value { font-size: 1.4rem; font-weight: 700; color: var(--color-text, #111); }
.summary-card__title { font-size: 0.75rem; color: #6b7280; margin-top: 0.1rem; }

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.chart-card {
  background: var(--color-surface, #fff);
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.chart-title { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; color: var(--color-text, #111); }

/* Donut chart */
.donut-wrap { display: flex; align-items: center; gap: 1.5rem; }
.donut-svg { width: 120px; height: 120px; }
.donut-text { font-size: 14px; font-weight: 700; fill: var(--color-text, #111); }
.donut-sub  { font-size: 9px; fill: #6b7280; }
.donut-legend { font-size: 0.8rem; }
.legend-item { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.legend-dot.success { background: #22c55e; }
.legend-dot.warn    { background: #f59e0b; }
.legend-dot.danger  { background: #ef4444; }

/* Bar list */
.bar-list { display: flex; flex-direction: column; gap: 0.6rem; }
.bar-item { display: grid; grid-template-columns: 90px 1fr 60px; align-items: center; gap: 0.5rem; font-size: 0.8rem; }
.bar-label { color: #374151; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-track { background: #e5e7eb; border-radius: 4px; height: 8px; }
.bar-fill  { background: #6366f1; border-radius: 4px; height: 8px; transition: width 0.5s ease; }
.bar-value { text-align: right; color: #6b7280; }

/* Read split */
.read-split { display: flex; align-items: center; justify-content: space-around; margin: 0.5rem 0 0.75rem; }
.read-pct { text-align: center; }
.read-pct__value { font-size: 1.75rem; font-weight: 700; }
.read-pct.success .read-pct__value { color: #22c55e; }
.read-pct.danger  .read-pct__value { color: #ef4444; }
.read-pct__label  { font-size: 0.75rem; color: #6b7280; }
.read-divider     { width: 1px; height: 40px; background: #e5e7eb; }
.progress-bar-track { background: #e5e7eb; border-radius: 999px; height: 8px; }
.progress-bar-fill  { background: #22c55e; border-radius: 999px; height: 8px; transition: width 0.5s ease; }

/* Filters */
.filter-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.filter-search { flex: 2; min-width: 180px; }
.filter-select { flex: 1; min-width: 140px; }

/* Table card */
.table-card {
  background: var(--color-surface, #fff);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
}
.table-info { padding: 0.75rem 1rem; font-size: 0.8rem; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table th {
  background: #f9fafb;
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.data-table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}
.data-table tbody tr:hover { background: #f0f9ff; }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  border-top: 1px solid #f3f4f6;
}
.pagination__info { font-size: 0.85rem; color: #6b7280; }

/* Badges */
.badge {
  display: inline-block;
  padding: 0.2em 0.55em;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge--success   { background: #dcfce7; color: #15803d; }
.badge--danger    { background: #fee2e2; color: #b91c1c; }
.badge--warn      { background: #fef3c7; color: #92400e; }
.badge--info      { background: #dbeafe; color: #1d4ed8; }
.badge--secondary { background: #f3f4f6; color: #374151; }

/* States */
.loading-state { padding: 3rem; text-align: center; color: #9ca3af; }
.empty-state   { padding: 3rem; text-align: center; color: #9ca3af; font-size: 0.9rem; }
.alert--danger { background: #fee2e2; color: #b91c1c; padding: 0.75rem 1rem; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
.btn--outline { background: transparent; border: 1px solid #d1d5db; color: #374151; }
.btn--outline:hover:not(:disabled) { background: #f9fafb; }
.btn--sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Form controls */
.form-control {
  padding: 0.45rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  background: var(--color-surface, #fff);
  color: var(--color-text, #111);
  outline: none;
  transition: border-color 0.2s;
}
.form-control:focus { border-color: #6366f1; }
</style>
