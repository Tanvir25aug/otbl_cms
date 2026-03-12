<template>
  <div class="bs-report-view">

    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__bg-circle"></div>
      <div class="page-header__bg-circle page-header__bg-circle--2"></div>
      <div class="page-header__inner">
        <div class="page-header__left">
          <router-link to="/bill-stop" class="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><polyline points="12,19 5,12 12,5"/></svg>
            Bill Stop
          </router-link>
          <h1 class="page-header__title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Bill Stop Report
          </h1>
          <p class="page-header__subtitle">
            Live snapshot from OTBL_CMS SQL Server
            <span v-if="snapshotDate" class="snapshot-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              Last saved: {{ formatDate(snapshotDate) }}
            </span>
          </p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn--ghost" @click="refreshData" :disabled="isRefreshing">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="isRefreshing ? 'animation: spin 1s linear infinite' : ''">
              <polyline points="23,4 23,11 16,11"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 11"/>
            </svg>
            {{ isRefreshing ? 'Refreshing…' : 'Refresh' }}
          </button>
          <button class="btn btn--download" @click="downloadExcel" :disabled="customers.length === 0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Excel
          </button>
        </div>
      </div>
    </div>

    <!-- No Snapshot Banner -->
    <div v-if="noDataYet && !loading" class="no-snapshot-banner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>No snapshot available yet. Go to <router-link to="/bill-stop" class="banner-link">Bill Stop Analysis</router-link> and click <strong>"Generate Bill Stop Report"</strong> to create the first snapshot.</span>
    </div>

    <!-- Summary Cards -->
    <div v-if="summary" class="summary-grid">
      <div class="scard scard--purple">
        <div class="scard__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div class="scard__body">
          <div class="scard__value">{{ summary.totalBillStop?.toLocaleString() ?? '-' }}</div>
          <div class="scard__label">Total Bill Stop</div>
        </div>
      </div>
      <div class="scard scard--green">
        <div class="scard__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div>
        <div class="scard__body">
          <div class="scard__value">{{ summary.withBillingProfileData?.toLocaleString() ?? '-' }}</div>
          <div class="scard__label">Current Month Read</div>
        </div>
      </div>
      <div class="scard scard--red">
        <div class="scard__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
        <div class="scard__body">
          <div class="scard__value">{{ summary.withoutBillingProfileData?.toLocaleString() ?? '-' }}</div>
          <div class="scard__label">No Current Month Read</div>
        </div>
      </div>
      <div class="scard scard--blue">
        <div class="scard__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg></div>
        <div class="scard__body">
          <div class="scard__value">{{ summary.completeCoverage?.toLocaleString() ?? '-' }}</div>
          <div class="scard__label">Complete Coverage (3 mo.)</div>
        </div>
      </div>
      <div class="scard scard--amber">
        <div class="scard__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <div class="scard__body">
          <div class="scard__value">{{ summary.partialCoverage?.toLocaleString() ?? '-' }}</div>
          <div class="scard__label">Partial Coverage (3 mo.)</div>
        </div>
      </div>
      <div class="scard scard--red2">
        <div class="scard__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86,2 16.14,2 22,7.86 22,16.14 16.14,22 7.86,22 2,16.14 2,7.86"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <div class="scard__body">
          <div class="scard__value">{{ summary.noCoverage?.toLocaleString() ?? '-' }}</div>
          <div class="scard__label">No Coverage (3 mo.)</div>
        </div>
      </div>
      <div class="scard scard--teal">
        <div class="scard__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg></div>
        <div class="scard__body">
          <div class="scard__value">{{ summary.installedThisMonthNoBill?.toLocaleString() ?? '-' }}</div>
          <div class="scard__label">Installed This Month</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div v-if="summary" class="charts-row">
      <div class="chart-card">
        <div class="chart-card__header">
          <h3 class="chart-card__title">Coverage Breakdown</h3>
          <span class="chart-card__sub">Last 3 months</span>
        </div>
        <div class="donut-wrap">
          <div class="donut-container">
            <svg viewBox="0 0 140 140" class="donut-svg">
              <circle cx="70" cy="70" r="54" fill="none" stroke="#f3f4f6" stroke-width="22"/>
              <circle cx="70" cy="70" r="54" fill="none" stroke="#22c55e" stroke-width="22"
                :stroke-dasharray="`${completePct * 3.39292} 339.292`"
                stroke-dashoffset="84.82" transform="rotate(-90 70 70)" stroke-linecap="round"/>
              <circle cx="70" cy="70" r="54" fill="none" stroke="#f59e0b" stroke-width="22"
                :stroke-dasharray="`${partialPct * 3.39292} 339.292`"
                :stroke-dashoffset="`${84.82 - completePct * 3.39292}`"
                transform="rotate(-90 70 70)" stroke-linecap="round"/>
              <circle cx="70" cy="70" r="54" fill="none" stroke="#ef4444" stroke-width="22"
                :stroke-dasharray="`${(100 - completePct - partialPct) * 3.39292} 339.292`"
                :stroke-dashoffset="`${84.82 - (completePct + partialPct) * 3.39292}`"
                transform="rotate(-90 70 70)" stroke-linecap="round"/>
              <text x="70" y="66" text-anchor="middle" class="donut-num">{{ summary.totalBillStop?.toLocaleString() }}</text>
              <text x="70" y="80" text-anchor="middle" class="donut-sub-text">Total</text>
            </svg>
          </div>
          <div class="donut-legend">
            <div class="dlegend-item">
              <span class="dlegend-dot dlegend-dot--green"></span>
              <div><div class="dlegend-val">{{ summary.completeCoverage?.toLocaleString() }}</div><div class="dlegend-key">Complete</div></div>
            </div>
            <div class="dlegend-item">
              <span class="dlegend-dot dlegend-dot--amber"></span>
              <div><div class="dlegend-val">{{ summary.partialCoverage?.toLocaleString() }}</div><div class="dlegend-key">Partial</div></div>
            </div>
            <div class="dlegend-item">
              <span class="dlegend-dot dlegend-dot--red"></span>
              <div><div class="dlegend-val">{{ summary.noCoverage?.toLocaleString() }}</div><div class="dlegend-key">None</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card" v-if="summary.tariffBreakdown?.length">
        <div class="chart-card__header">
          <h3 class="chart-card__title">Tariff Breakdown</h3>
          <span class="chart-card__sub">{{ summary.tariffBreakdown.length }} types</span>
        </div>
        <div class="bar-list">
          <div v-for="(t, i) in summary.tariffBreakdown" :key="t.TARIFF" class="bar-item">
            <div class="bar-label">{{ t.TARIFF || 'Unknown' }}</div>
            <div class="bar-track"><div class="bar-fill" :class="`bar-fill--${i % 6}`" :style="{ width: tariffBarWidth(t.cnt) + '%' }"></div></div>
            <div class="bar-count">{{ t.cnt?.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-card__header">
          <h3 class="chart-card__title">Current Month Reading</h3>
          <span class="chart-card__sub">Read vs No Read</span>
        </div>
        <div class="read-split">
          <div class="read-half read-half--success">
            <div class="read-half__pct">{{ readPct }}%</div>
            <div class="read-half__label">Has Read</div>
            <div class="read-half__count">{{ summary.withBillingProfileData?.toLocaleString() }}</div>
          </div>
          <div class="read-divider"></div>
          <div class="read-half read-half--danger">
            <div class="read-half__pct">{{ 100 - readPct }}%</div>
            <div class="read-half__label">No Read</div>
            <div class="read-half__count">{{ summary.withoutBillingProfileData?.toLocaleString() }}</div>
          </div>
        </div>
        <div class="dual-bar">
          <div class="dual-bar__fill dual-bar__fill--green" :style="{ width: readPct + '%' }"></div>
          <div class="dual-bar__fill dual-bar__fill--red" :style="{ width: (100 - readPct) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-search-wrap">
        <svg class="filter-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="filters.search" @input="debouncedFetch" type="text" placeholder="Search customer / meter / name…" class="filter-input" />
      </div>
      <select v-model="filters.coverage" @change="fetchData" class="filter-select">
        <option value="">All Coverage</option>
        <option value="COMPLETE_COVERAGE">Complete Coverage</option>
        <option value="PARTIAL_COVERAGE">Partial Coverage</option>
        <option value="NO_COVERAGE">No Coverage</option>
      </select>
      <select v-model="filters.hasRead" @change="fetchData" class="filter-select">
        <option value="">All Read Status</option>
        <option value="yes">Has Current Read</option>
        <option value="no">No Current Read</option>
      </select>
      <select v-model="filters.installed" @change="fetchData" class="filter-select">
        <option value="">All Install Status</option>
        <option value="yes">Installed This Month</option>
        <option value="no">Not Installed</option>
      </select>
      <select v-model="filters.tariff" @change="fetchData" class="filter-select">
        <option value="">All Tariff</option>
        <option v-for="t in tariffOptions" :key="t" :value="t">{{ t }}</option>
      </select>
      <button v-if="activeFilterCount > 0" class="btn-clear" @click="clearFilters">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Clear ({{ activeFilterCount }})
      </button>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <template v-if="loading">
        <div class="skeleton-header"></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th v-for="i in 11" :key="i"><div class="sk-cell"></div></th></tr></thead>
            <tbody><tr v-for="r in 8" :key="r"><td v-for="c in 11" :key="c"><div class="sk-cell"></div></td></tr></tbody>
          </table>
        </div>
      </template>

      <div v-else-if="error" class="state-box state-box--error">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="noDataYet" class="state-box state-box--empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
        <h4>No snapshot data yet</h4>
        <p>Go to <router-link to="/bill-stop" class="banner-link">Bill Stop Analysis</router-link> and click "Generate Bill Stop Report".</p>
      </div>

      <template v-else>
        <div class="table-meta">
          <div class="table-meta__left">
            <span class="meta-count">{{ total.toLocaleString() }} records</span>
            <span class="meta-sep">•</span>
            <span class="meta-page">Page {{ filters.page }} / {{ totalPages }}</span>
            <span v-if="activeFilterCount > 0" class="meta-filtered">{{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active</span>
          </div>
          <div class="table-meta__right">
            <label class="per-page-label">Rows:</label>
            <select v-model="filters.limit" @change="() => { filters.page = 1; fetchData(); }" class="per-page-select">
              <option :value="50">50</option>
              <option :value="100">100</option>
              <option :value="200">200</option>
              <option :value="500">500</option>
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-num">#</th>
                <th>Customer No.</th>
                <th>Customer Name</th>
                <th>Meter No.</th>
                <th>Tariff</th>
                <th>Conn. Date</th>
                <th>Last Bill Date</th>
                <th>Days Gap</th>
                <th>Current Read</th>
                <th>Coverage</th>
                <th>New Install</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, idx) in customers" :key="c.Id" :class="rowClass(c)">
                <td class="td-num">{{ (filters.page - 1) * filters.limit + idx + 1 }}</td>
                <td class="td-mono">{{ c.CUSTOMER_NUM }}</td>
                <td>{{ c.CUSTOMER_NAME || '-' }}</td>
                <td class="td-mono">{{ c.METER_NO || '-' }}</td>
                <td><span class="badge badge--tariff">{{ c.TARIFF || '-' }}</span></td>
                <td>{{ formatDate(c.CONN_DATE) }}</td>
                <td>{{ formatDate(c.LAST_BILL_DATE) }}</td>
                <td><span :class="daysBadgeClass(c.LAST_BILL_DATE)">{{ daysSinceLastBill(c.LAST_BILL_DATE) }}</span></td>
                <td>
                  <span :class="c.HAS_CURRENT_MONTH_READ ? 'badge badge--success' : 'badge badge--danger'">
                    {{ c.HAS_CURRENT_MONTH_READ ? '✓ Yes' : '✗ No' }}
                  </span>
                </td>
                <td><span :class="coverageBadge(c.COVERAGE)">{{ coverageLabel(c.COVERAGE) }}</span></td>
                <td>
                  <span v-if="c.INSTALLED_THIS_MONTH_NO_BILL" class="badge badge--amber">New</span>
                  <span v-else class="badge badge--ghost">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="pag-btn" :disabled="filters.page <= 1" @click="changePage(1)">«</button>
          <button class="pag-btn" :disabled="filters.page <= 1" @click="changePage(filters.page - 1)">‹</button>
          <template v-for="p in visiblePages" :key="String(p)">
            <span v-if="p === '...'" class="pag-ellipsis">…</span>
            <button v-else class="pag-btn" :class="{ 'pag-btn--active': p === filters.page }" @click="changePage(Number(p))">{{ p }}</button>
          </template>
          <button class="pag-btn" :disabled="filters.page >= totalPages" @click="changePage(filters.page + 1)">›</button>
          <button class="pag-btn" :disabled="filters.page >= totalPages" @click="changePage(totalPages)">»</button>
        </div>
      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { getBillStopSnapshot, getBillStopSnapshotSummary } from '../api';

const loading       = ref(false);
const isRefreshing  = ref(false);
const error         = ref('');
const customers     = ref<any[]>([]);
const total         = ref(0);
const totalPages    = ref(1);
const snapshotDate  = ref<string | null>(null);
const summary       = ref<any | null>(null);
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

const noDataYet = computed(() => total.value === 0 && !loading.value);

const activeFilterCount = computed(() =>
  [filters.coverage, filters.hasRead, filters.installed, filters.tariff, filters.search].filter(Boolean).length
);

const completePct = computed(() => {
  if (!summary.value?.totalBillStop) return 0;
  return Math.round((summary.value.completeCoverage / summary.value.totalBillStop) * 100);
});
const partialPct = computed(() => {
  if (!summary.value?.totalBillStop) return 0;
  return Math.round((summary.value.partialCoverage / summary.value.totalBillStop) * 100);
});
const readPct = computed(() => {
  if (!summary.value?.totalBillStop) return 0;
  return Math.round((summary.value.withBillingProfileData / summary.value.totalBillStop) * 100);
});
const tariffMax = computed(() => {
  if (!summary.value?.tariffBreakdown?.length) return 1;
  return Math.max(...summary.value.tariffBreakdown.map((t: any) => t.cnt));
});
const tariffBarWidth = (cnt: number) => Math.round((cnt / tariffMax.value) * 100);

const visiblePages = computed((): (number | string)[] => {
  const tot = totalPages.value;
  const cur = filters.page;
  if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(tot - 1, cur + 1); p++) pages.push(p);
  if (cur < tot - 2) pages.push('...');
  pages.push(tot);
  return pages;
});

const daysSinceLastBill = (dateStr: any): string => {
  if (!dateStr) return 'No Bill';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return `${Math.floor((Date.now() - d.getTime()) / 86400000)}d`;
};

const daysBadgeClass = (dateStr: any): string => {
  if (!dateStr) return 'badge badge--ghost';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days > 60) return 'badge badge--danger';
  if (days > 30) return 'badge badge--amber';
  return 'badge badge--success';
};

const rowClass = (c: any): string => {
  if (c.COVERAGE === 'NO_COVERAGE' && !c.HAS_CURRENT_MONTH_READ) return 'row--critical';
  if (c.COVERAGE === 'PARTIAL_COVERAGE') return 'row--warn';
  return '';
};

const clearFilters = () => {
  Object.assign(filters, { search: '', coverage: '', hasRead: '', installed: '', tariff: '', page: 1 });
  fetchData();
};

const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { filters.page = 1; fetchData(); }, 400);
};

const fetchData = async () => {
  loading.value = true; error.value = '';
  try {
    const { data } = await getBillStopSnapshot({
      page: filters.page, limit: filters.limit,
      coverage: filters.coverage || undefined, tariff: filters.tariff || undefined,
      search: filters.search || undefined, hasRead: filters.hasRead || undefined,
      installed: filters.installed || undefined,
    });
    customers.value  = data.data.customers;
    total.value      = data.data.total;
    totalPages.value = data.data.totalPages;
    if (data.data.snapshotDate) snapshotDate.value = data.data.snapshotDate;
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load snapshot data';
  } finally { loading.value = false; }
};

const fetchSummary = async () => {
  try {
    const { data } = await getBillStopSnapshotSummary();
    summary.value = data.data;
    snapshotDate.value = data.data.snapshotDate;
    if (data.data.tariffBreakdown)
      tariffOptions.value = data.data.tariffBreakdown.map((t: any) => t.TARIFF).filter(Boolean);
  } catch { /* not fatal */ }
};

const refreshData = async () => {
  isRefreshing.value = true;
  await Promise.all([fetchSummary(), fetchData()]);
  isRefreshing.value = false;
};

const changePage = (p: number) => { filters.page = p; fetchData(); };

const formatDate = (d: any) => {
  if (!d) return '-';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '-' : dt.toISOString().split('T')[0];
};

const coverageBadge = (c: string) => {
  if (c === 'COMPLETE_COVERAGE') return 'badge badge--success';
  if (c === 'PARTIAL_COVERAGE')  return 'badge badge--amber';
  return 'badge badge--danger';
};
const coverageLabel = (c: string) => {
  if (c === 'COMPLETE_COVERAGE') return '● Complete';
  if (c === 'PARTIAL_COVERAGE')  return '◐ Partial';
  return '○ None';
};

const downloadExcel = async () => {
  try {
    const { data } = await getBillStopSnapshot({ page: 1, limit: 50000 });
    const rows = data.data.customers.map((c: any) => ({
      CUSTOMER_NUM: c.CUSTOMER_NUM, CUSTOMER_NAME: c.CUSTOMER_NAME,
      ADDRESS: c.ADDRESS, MOBILE_NO: c.MOBILE_NO, METER_NO: c.METER_NO,
      CONN_DATE: formatDate(c.CONN_DATE), TARIFF: c.TARIFF,
      LAST_BILL_DATE: formatDate(c.LAST_BILL_DATE),
      DAYS_SINCE_LAST_BILL: daysSinceLastBill(c.LAST_BILL_DATE),
      HAS_CURRENT_MONTH_READ: c.HAS_CURRENT_MONTH_READ ? 'Yes' : 'No',
      COVERAGE: c.COVERAGE,
      INSTALLED_THIS_MONTH_NO_BILL: c.INSTALLED_THIS_MONTH_NO_BILL ? 'Yes' : 'No',
      SNAPSHOT_DATE: formatDate(c.SNAPSHOT_DATE),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BillStopReport');
    XLSX.writeFile(wb, `bill_stop_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to download');
  }
};

onMounted(async () => { await Promise.all([fetchSummary(), fetchData()]); });
</script>

<style scoped>
@keyframes fadeInUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin      { to { transform:rotate(360deg); } }
@keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

.bs-report-view {
  max-width: 1600px; margin: 0 auto; padding: 1.5rem;
  background: #f1f5f9; min-height: 100vh; font-family: inherit;
}

/* ── Header ── */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1.25rem; padding: 1.75rem 2rem; margin-bottom: 1.5rem;
  position: relative; overflow: hidden;
  box-shadow: 0 10px 30px rgba(102,126,234,.35);
  animation: slideDown .5s ease-out; color: white;
}
.page-header__bg-circle {
  position:absolute; border-radius:50%; background:rgba(255,255,255,.08);
  width:300px; height:300px; top:-100px; right:-60px; pointer-events:none;
}
.page-header__bg-circle--2 { width:200px;height:200px;top:auto;bottom:-80px;right:60px;background:rgba(255,255,255,.05); }
.page-header__inner { position:relative; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; }
.page-header__left  { display:flex; flex-direction:column; gap:.35rem; }
.back-btn {
  display:inline-flex; align-items:center; gap:.4rem;
  color:rgba(255,255,255,.8); text-decoration:none; font-size:.8rem; font-weight:500; transition:color .2s;
}
.back-btn:hover { color:#fff; }
.page-header__title {
  margin:0; font-size:1.85rem; font-weight:800;
  display:flex; align-items:center; gap:.6rem;
  text-shadow:0 2px 6px rgba(0,0,0,.2);
}
.page-header__subtitle { margin:0; font-size:.88rem; opacity:.9; display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }
.snapshot-chip {
  background:rgba(255,255,255,.18); border-radius:999px;
  padding:.2rem .65rem; font-size:.75rem; font-weight:600;
  display:inline-flex; align-items:center; gap:.3rem; backdrop-filter:blur(4px);
}
.page-header__actions { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; }
.btn--ghost {
  background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); color:white;
  border-radius:.6rem; padding:.5rem 1rem; font-size:.85rem; font-weight:500;
  cursor:pointer; display:inline-flex; align-items:center; gap:.4rem; transition:all .2s;
}
.btn--ghost:hover:not(:disabled) { background:rgba(255,255,255,.25); }
.btn--ghost:disabled { opacity:.5; cursor:not-allowed; }
.btn--download {
  background:white; color:#667eea; border:none; border-radius:.6rem;
  padding:.5rem 1.1rem; font-size:.85rem; font-weight:700; cursor:pointer;
  display:inline-flex; align-items:center; gap:.4rem; transition:all .2s;
  box-shadow:0 2px 8px rgba(0,0,0,.15);
}
.btn--download:hover:not(:disabled) { background:#f5f3ff; transform:translateY(-1px); }
.btn--download:disabled { opacity:.5; cursor:not-allowed; }

/* ── Banner ── */
.no-snapshot-banner {
  background:#fef9c3; border:1px solid #fde68a; border-radius:.85rem;
  padding:.9rem 1.25rem; margin-bottom:1.25rem;
  display:flex; align-items:center; gap:.75rem;
  font-size:.875rem; color:#92400e; animation:fadeInUp .4s ease-out;
}
.no-snapshot-banner svg { flex-shrink:0; color:#d97706; }
.banner-link { color:#667eea; font-weight:700; text-decoration:none; }
.banner-link:hover { text-decoration:underline; }

/* ── Summary Cards ── */
.summary-grid {
  display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
  gap:1rem; margin-bottom:1.5rem; animation:fadeInUp .5s ease-out;
}
.scard {
  border-radius:1rem; padding:1.1rem 1.2rem; display:flex; align-items:center; gap:.9rem;
  box-shadow:0 2px 8px rgba(0,0,0,.07); border-top:4px solid transparent;
  transition:transform .25s,box-shadow .25s; background:#fff;
}
.scard:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(0,0,0,.13); }
.scard__icon { width:44px;height:44px;border-radius:.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.scard__value { font-size:1.55rem; font-weight:800; line-height:1.1; }
.scard__label { font-size:.71rem; font-weight:600; margin-top:.2rem; opacity:.7; text-transform:uppercase; letter-spacing:.04em; }

.scard--purple { border-top-color:#7c3aed; }
.scard--purple .scard__icon { background:#ede9fe; color:#7c3aed; }
.scard--purple .scard__value { color:#5b21b6; }

.scard--green { border-top-color:#16a34a; }
.scard--green .scard__icon { background:#dcfce7; color:#16a34a; }
.scard--green .scard__value { color:#166534; }

.scard--red { border-top-color:#ef4444; }
.scard--red .scard__icon { background:#fee2e2; color:#ef4444; }
.scard--red .scard__value { color:#b91c1c; }

.scard--blue { border-top-color:#3b82f6; }
.scard--blue .scard__icon { background:#dbeafe; color:#2563eb; }
.scard--blue .scard__value { color:#1e40af; }

.scard--amber { border-top-color:#f59e0b; }
.scard--amber .scard__icon { background:#fef3c7; color:#d97706; }
.scard--amber .scard__value { color:#92400e; }

.scard--red2 { border-top-color:#dc2626; }
.scard--red2 .scard__icon { background:#fee2e2; color:#dc2626; }
.scard--red2 .scard__value { color:#991b1b; }

.scard--teal { border-top-color:#14b8a6; }
.scard--teal .scard__icon { background:#ccfbf1; color:#0d9488; }
.scard--teal .scard__value { color:#0f766e; }

/* ── Charts ── */
.charts-row {
  display:grid; grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
  gap:1rem; margin-bottom:1.5rem;
}
.chart-card {
  background:#fff; border-radius:1rem; padding:1.25rem;
  box-shadow:0 2px 8px rgba(0,0,0,.07); animation:fadeInUp .5s ease-out;
}
.chart-card__header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:1rem; }
.chart-card__title { font-size:.95rem; font-weight:700; color:#1f2937; margin:0; }
.chart-card__sub { font-size:.73rem; color:#9ca3af; }

.donut-wrap { display:flex; align-items:center; gap:1.5rem; }
.donut-svg { width:140px; height:140px; }
.donut-num { font-size:18px; font-weight:800; fill:#1f2937; }
.donut-sub-text { font-size:10px; fill:#6b7280; }
.donut-legend { display:flex; flex-direction:column; gap:.75rem; }
.dlegend-item { display:flex; align-items:center; gap:.6rem; }
.dlegend-dot { width:12px;height:12px;border-radius:50%;flex-shrink:0; }
.dlegend-dot--green { background:#22c55e; }
.dlegend-dot--amber { background:#f59e0b; }
.dlegend-dot--red   { background:#ef4444; }
.dlegend-val { font-size:.9rem; font-weight:700; color:#1f2937; }
.dlegend-key { font-size:.72rem; color:#6b7280; }

.bar-list { display:flex; flex-direction:column; gap:.7rem; }
.bar-item { display:grid; grid-template-columns:80px 1fr 55px; align-items:center; gap:.6rem; }
.bar-label { font-size:.8rem; font-weight:600; color:#374151; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.bar-track { background:#f3f4f6; border-radius:6px; height:10px; overflow:hidden; }
.bar-fill { height:10px; border-radius:6px; transition:width .6s cubic-bezier(.4,0,.2,1); }
.bar-fill--0 { background:linear-gradient(90deg,#667eea,#764ba2); }
.bar-fill--1 { background:linear-gradient(90deg,#f093fb,#f5576c); }
.bar-fill--2 { background:linear-gradient(90deg,#4facfe,#00f2fe); }
.bar-fill--3 { background:linear-gradient(90deg,#43e97b,#38f9d7); }
.bar-fill--4 { background:linear-gradient(90deg,#fa709a,#fee140); }
.bar-fill--5 { background:linear-gradient(90deg,#a18cd1,#fbc2eb); }
.bar-count { text-align:right; font-size:.8rem; color:#6b7280; font-weight:600; }

.read-split { display:flex; align-items:center; justify-content:space-around; margin:.5rem 0 .75rem; }
.read-half { text-align:center; }
.read-half__pct { font-size:2rem; font-weight:800; line-height:1; }
.read-half--success .read-half__pct { color:#16a34a; }
.read-half--danger  .read-half__pct { color:#dc2626; }
.read-half__label { font-size:.7rem; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-top:.1rem; }
.read-half__count { font-size:.85rem; font-weight:700; color:#374151; margin-top:.2rem; }
.read-divider { width:1px; height:55px; background:#e5e7eb; }
.dual-bar { display:flex; height:8px; border-radius:999px; overflow:hidden; }
.dual-bar__fill { height:8px; transition:width .6s ease; }
.dual-bar__fill--green { background:#22c55e; }
.dual-bar__fill--red   { background:#ef4444; }

/* ── Filter Bar ── */
.filter-bar {
  display:flex; gap:.65rem; flex-wrap:wrap; align-items:center;
  background:#fff; padding:.85rem 1rem; border-radius:1rem;
  box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:1rem;
}
.filter-search-wrap { position:relative; flex:2; min-width:200px; }
.filter-search-icon { position:absolute; left:.75rem; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }
.filter-input {
  width:100%; padding:.48rem .75rem .48rem 2.2rem; border:1.5px solid #e5e7eb;
  border-radius:.6rem; font-size:.85rem; outline:none; transition:border-color .2s;
  background:#f9fafb; color:#1f2937; box-sizing:border-box;
}
.filter-input:focus { border-color:#667eea; background:#fff; }
.filter-select {
  flex:1; min-width:140px; padding:.48rem .75rem; border:1.5px solid #e5e7eb;
  border-radius:.6rem; font-size:.85rem; background:#f9fafb; color:#374151;
  outline:none; cursor:pointer; transition:border-color .2s;
}
.filter-select:focus { border-color:#667eea; background:#fff; }
.btn-clear {
  display:inline-flex; align-items:center; gap:.3rem;
  background:#fef2f2; color:#dc2626; border:1px solid #fecaca;
  border-radius:.6rem; padding:.45rem .85rem; font-size:.8rem;
  font-weight:600; cursor:pointer; white-space:nowrap; transition:all .2s;
}
.btn-clear:hover { background:#fee2e2; }

/* ── Table ── */
.table-card { background:#fff; border-radius:1rem; box-shadow:0 2px 8px rgba(0,0,0,.07); overflow:hidden; }
.table-meta {
  display:flex; justify-content:space-between; align-items:center;
  padding:.7rem 1rem; border-bottom:1px solid #f3f4f6; flex-wrap:wrap; gap:.5rem;
}
.table-meta__left { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
.meta-count { font-size:.85rem; font-weight:700; color:#374151; }
.meta-sep  { color:#d1d5db; }
.meta-page { font-size:.82rem; color:#6b7280; }
.meta-filtered {
  background:#ede9fe; color:#5b21b6; border-radius:999px;
  padding:.15rem .6rem; font-size:.72rem; font-weight:700;
}
.table-meta__right { display:flex; align-items:center; gap:.4rem; }
.per-page-label { font-size:.8rem; color:#6b7280; }
.per-page-select { padding:.3rem .5rem; border:1px solid #e5e7eb; border-radius:.4rem; font-size:.8rem; background:#f9fafb; cursor:pointer; outline:none; }

.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:.82rem; }
.data-table thead { position:sticky; top:0; z-index:2; }
.data-table th {
  background:linear-gradient(180deg,#f9fafb,#f3f4f6);
  padding:.65rem .9rem; text-align:left; font-weight:700; color:#374151;
  border-bottom:2px solid #e5e7eb; white-space:nowrap;
  font-size:.76rem; text-transform:uppercase; letter-spacing:.05em;
}
.th-num { width:46px; text-align:center; }
.data-table td { padding:.55rem .9rem; border-bottom:1px solid #f3f4f6; color:#1f2937; vertical-align:middle; }
.td-num { text-align:center; color:#9ca3af; font-size:.78rem; }
.td-mono { font-family:ui-monospace,monospace; font-size:.8rem; color:#374151; }
.data-table tbody tr:hover { background:#f8faff !important; }
.data-table tbody tr:nth-child(even) { background:#fafafa; }
.row--critical { background:#fff5f5 !important; }
.row--critical:hover { background:#fee2e2 !important; }
.row--warn { background:#fffbeb !important; }

/* ── Pagination ── */
.pagination {
  display:flex; align-items:center; justify-content:center;
  gap:.3rem; padding:.85rem; border-top:1px solid #f3f4f6; flex-wrap:wrap;
}
.pag-btn {
  min-width:34px; height:34px; border-radius:.5rem;
  border:1.5px solid #e5e7eb; background:#fff; color:#374151;
  font-size:.82rem; font-weight:600; cursor:pointer;
  display:inline-flex; align-items:center; justify-content:center;
  transition:all .2s; padding:0 .5rem;
}
.pag-btn:hover:not(:disabled) { border-color:#667eea; color:#667eea; background:#f5f3ff; }
.pag-btn:disabled { opacity:.35; cursor:not-allowed; }
.pag-btn--active { background:#667eea; border-color:#667eea; color:#fff; box-shadow:0 2px 8px rgba(102,126,234,.4); }
.pag-ellipsis { color:#9ca3af; font-size:.9rem; padding:0 .2rem; }

/* ── Badges ── */
.badge { display:inline-block; padding:.22em .6em; border-radius:999px; font-size:.72rem; font-weight:700; white-space:nowrap; }
.badge--success { background:#dcfce7; color:#166534; }
.badge--danger  { background:#fee2e2; color:#991b1b; }
.badge--amber   { background:#fef3c7; color:#92400e; }
.badge--tariff  { background:#ede9fe; color:#5b21b6; }
.badge--ghost   { background:transparent; color:#d1d5db; }

/* ── States ── */
.state-box { padding:4rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1rem; }
.state-box h4 { font-size:1.1rem; font-weight:700; color:#374151; margin:0; }
.state-box p  { color:#6b7280; margin:0; font-size:.9rem; }
.state-box--error p { color:#ef4444; }
.skeleton-header { height:50px; background:#f3f4f6; border-bottom:1px solid #e5e7eb; }
.sk-cell {
  height:12px; background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);
  background-size:400px 100%; border-radius:4px; animation:shimmer 1.4s infinite;
  margin:4px 0;
}
</style>
