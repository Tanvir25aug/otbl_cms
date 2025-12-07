<template>
  <div class="rc-dc-analytics">
    <div class="header">
      <h1>RC/DC Analytics</h1>
      <p class="subtitle">Connection and Disconnection Operations Analysis</p>
    </div>

    <!-- Upload Section -->
    <div class="upload-card">
      <div class="upload-header">
        <h2>Upload RC/DC Data</h2>
        <div class="header-buttons">
          <button @click="downloadTemplate" class="btn-download">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Template
          </button>
          <button @click="deleteAllData" class="btn-delete-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete All Data
          </button>
        </div>
      </div>
      <div class="upload-body">
        <div class="file-input-wrapper">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept=".xlsx,.xls"
            class="file-input"
            id="rcdc-file-upload"
          />
          <label for="rcdc-file-upload" class="file-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span v-if="!selectedFile">Choose Excel File</span>
            <span v-else>{{ selectedFile.name }}</span>
          </label>
          <button
            @click="uploadFile"
            :disabled="!selectedFile || uploading"
            class="btn-upload"
          >
            <span v-if="!uploading">Upload Data</span>
            <span v-else>Uploading...</span>
          </button>
        </div>
        <p class="upload-hint">
          Upload Excel file with columns: D1_ACTIVITY_ID, OLD_CONSUMER_ID, MSN, ACCOUNT_NO, DATE_OF_COMMAND_TRIGGER, RESPONSE_DATE_AND_TIME, COMMAND_TYPE, COMMAND_STATUS, SA_ID, PAYOFF_BALNCE, NOCS_NAME, METER_STATUS, PHASE<br>
          <strong>COMMAND_TYPE:</strong> D1-RemoteConnect or D1-RemoteDisconnect<br>
          <strong>COMMAND_STATUS:</strong> COMPLETED (Success), COMINPROG (In Progress), DISCARDED (Failed)
        </p>
        <div v-if="uploadResult" class="upload-result" :class="uploadResult.type">
          <p><strong>{{ uploadResult.message }}</strong></p>
          <p v-if="uploadResult.details">
            Total: {{ uploadResult.details.total }} |
            Success: {{ uploadResult.details.success }} |
            Failed: {{ uploadResult.details.failed }}
          </p>
        </div>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="filters">
      <div class="filter-group">
        <label>Start Date:</label>
        <input type="date" v-model="filters.startDate" @change="fetchAnalytics" />
      </div>
      <div class="filter-group">
        <label>End Date:</label>
        <input type="date" v-model="filters.endDate" @change="fetchAnalytics" />
      </div>
      <div class="filter-group">
        <button @click="setToday" class="btn-secondary">Today</button>
        <button @click="setLast7Days" class="btn-secondary">Last 7 Days</button>
        <button @click="setLast30Days" class="btn-secondary">Last 30 Days</button>
        <button @click="resetFilters" class="btn-secondary">Reset</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading analytics...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Analytics Content -->
    <div v-if="!loading && !error" class="analytics-content">
      <!-- Summary Cards - RC/DC by Status -->
      <div class="status-summary">
        <h2>Remote Connect (RC) Operations (Total Count)</h2>
        <p class="table-description">Shows total RC operation counts - may include multiple operations per meter</p>
        <div class="summary-cards">
          <div class="card">
            <div class="card-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>RC Success (COMPLETED)</h3>
              <p class="value">{{ summary.rcCompleted?.toLocaleString() || 0 }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>RC In Progress (COMINPROG)</h3>
              <p class="value">{{ summary.rcInProgress?.toLocaleString() || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="status-summary">
        <h2>Remote Disconnect (DC) Operations (Total Count)</h2>
        <p class="table-description">Shows total DC operation counts - may include multiple operations per meter</p>
        <div class="summary-cards">
          <div class="card">
            <div class="card-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>DC Success (COMPLETED)</h3>
              <p class="value">{{ summary.dcCompleted?.toLocaleString() || 0 }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>DC In Progress (COMINPROG)</h3>
              <p class="value">{{ summary.dcInProgress?.toLocaleString() || 0 }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon error">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div class="card-content">
              <h3>DC Discarded/Failed</h3>
              <p class="value">{{ summary.dcDiscarded?.toLocaleString() || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Meter-wise Current Status Summary -->
      <div class="status-summary highlight-section">
        <h2>Current Meter Status (Based on Latest Operation per Meter)</h2>
        <p class="table-description">Shows unique meters counted only once - based on their most recent operation status</p>
        <div class="summary-cards">
          <div class="card highlight">
            <div class="card-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>RC Success (COMPLETED)</h3>
              <p class="value">{{ summary.rcCompletedMeters?.toLocaleString() || 0 }}</p>
              <p class="card-subtitle">Unique meters currently connected</p>
            </div>
          </div>

          <div class="card highlight">
            <div class="card-icon warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>RC In Progress (COMINPROG)</h3>
              <p class="value">{{ summary.rcInProgressMeters?.toLocaleString() || 0 }}</p>
              <p class="card-subtitle">Unique meters with pending RC</p>
            </div>
          </div>

          <div class="card highlight">
            <div class="card-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>DC Success (COMPLETED)</h3>
              <p class="value">{{ summary.dcCompletedMeters?.toLocaleString() || 0 }}</p>
              <p class="card-subtitle">Unique meters currently disconnected</p>
            </div>
          </div>

          <div class="card highlight">
            <div class="card-icon warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>DC In Progress (COMINPROG)</h3>
              <p class="value">{{ summary.dcInProgressMeters?.toLocaleString() || 0 }}</p>
              <p class="card-subtitle">Unique meters with pending DC</p>
            </div>
          </div>

          <div class="card highlight">
            <div class="card-icon error">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div class="card-content">
              <h3>DC Discarded/Failed</h3>
              <p class="value">{{ summary.dcDiscardedMeters?.toLocaleString() || 0 }}</p>
              <p class="card-subtitle">Unique meters with failed DC</p>
            </div>
          </div>

          <div class="card highlight">
            <div class="card-icon active">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <path d="M9 11l3 3L22 4"/>
              </svg>
            </div>
            <div class="card-content">
              <h3>Total Meters with Status</h3>
              <p class="value">{{ summary.totalMetersWithStatus?.toLocaleString() || 0 }}</p>
              <p class="card-subtitle">All unique meters tracked</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Summary -->
      <div class="status-summary">
        <h2>Overall Summary (Total Operations Count)</h2>
        <p class="table-description">Shows total operation counts - may include multiple operations per meter</p>
        <div class="summary-cards">
          <div class="card">
            <div class="card-icon total">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="card-content">
              <h3>Total Operations</h3>
              <p class="value">{{ summary.totalOperations?.toLocaleString() || 0 }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon active">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <path d="M9 11l3 3L22 4"/>
              </svg>
            </div>
            <div class="card-content">
              <h3>Total Unique Meters</h3>
              <p class="value">{{ summary.totalUniqueMeters?.toLocaleString() || 0 }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>Unique Meters with RC</h3>
              <p class="value">{{ summary.uniqueMetersRC?.toLocaleString() || 0 }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon error">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <div class="card-content">
              <h3>Unique Meters with DC</h3>
              <p class="value">{{ summary.uniqueMetersDC?.toLocaleString() || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Daily Statistics Chart -->
        <div class="chart-card">
          <h2>Daily RC/DC Operations</h2>
          <div class="chart-container">
            <canvas ref="dailyChart"></canvas>
          </div>
        </div>

        <!-- Hourly Distribution Chart -->
        <div class="chart-card">
          <h2>Hourly Distribution</h2>
          <div class="chart-container">
            <canvas ref="hourlyChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Top Users Table -->
      <div class="table-card">
        <h2>Top Users by Operations</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>RC Count</th>
                <th>DC Count</th>
                <th>Total Operations</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in operationsByUser" :key="user.userId">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="user-info">
                    <strong>{{ user.User?.fullName || 'Unknown' }}</strong>
                    <span class="email">{{ user.User?.email }}</span>
                  </div>
                </td>
                <td><span class="badge rc">{{ user.rcCount }}</span></td>
                <td><span class="badge dc">{{ user.dcCount }}</span></td>
                <td><strong>{{ user.totalOperations }}</strong></td>
              </tr>
              <tr v-if="operationsByUser.length === 0">
                <td colspan="5" class="no-data">No data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Meter-wise Current Status -->
      <div class="table-card">
        <h2>Meter-wise Current Status (Latest Operation per Meter)</h2>
        <p class="table-description">Shows the latest status of each unique meter - avoids duplicate counting</p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Meter Number (MSN)</th>
                <th>Customer ID</th>
                <th>NOCS</th>
                <th>Current Status</th>
                <th>Command Status</th>
                <th>Last Operation Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="meter in meterWiseStatus" :key="meter.msn">
                <td><strong>{{ meter.msn }}</strong></td>
                <td>{{ meter.customer_id || 'N/A' }}</td>
                <td>{{ meter.nocs || 'N/A' }}</td>
                <td>
                  <span :class="['badge', meter.currentStatus.toLowerCase()]">
                    {{ meter.currentStatus }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', getStatusClass(meter.commandStatus)]">
                    {{ meter.commandStatus }}
                  </span>
                </td>
                <td>{{ formatDate(meter.lastOperationTime) }}</td>
              </tr>
              <tr v-if="meterWiseStatus.length === 0">
                <td colspan="6" class="no-data">No data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- NOCS-wise Report -->
      <div class="table-card">
        <h2>NOCS-wise RC/DC Report (Total Operations)</h2>
        <p class="table-description">Shows total operation counts - may include multiple operations per meter</p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>NOCS</th>
                <th>RC Completed</th>
                <th>RC In Progress</th>
                <th>DC Completed</th>
                <th>DC In Progress</th>
                <th>DC Discarded</th>
                <th>Total Operations</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="nocs in nocswiseReport" :key="nocs.nocs">
                <td><strong>{{ nocs.nocs || 'Unknown' }}</strong></td>
                <td><span class="badge rc">{{ nocs.rcCompleted }}</span></td>
                <td><span class="badge warning">{{ nocs.rcInProgress }}</span></td>
                <td><span class="badge dc">{{ nocs.dcCompleted }}</span></td>
                <td><span class="badge warning">{{ nocs.dcInProgress }}</span></td>
                <td><span class="badge error">{{ nocs.dcDiscarded }}</span></td>
                <td><strong>{{ nocs.totalOperations }}</strong></td>
              </tr>
              <tr v-if="nocswiseReport.length === 0">
                <td colspan="7" class="no-data">No data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Logs -->
      <div class="table-card">
        <div class="table-header">
          <h2>Recent Connection Logs</h2>
          <div class="filter-group inline">
            <label>Event Type:</label>
            <select v-model="logFilters.eventType" @change="fetchRecentLogs">
              <option value="">All</option>
              <option value="RC">RC Only</option>
              <option value="DC">DC Only</option>
            </select>
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Customer ID</th>
                <th>Meter Number</th>
                <th>Event Type</th>
                <th>Command Status</th>
                <th>NOCS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in recentLogs" :key="log.id">
                <td>{{ formatDate(log.timestamp) }}</td>
                <td>{{ log.metadata?.old_consumer_id || 'N/A' }}</td>
                <td>{{ log.metadata?.msn || log.userAgent?.replace('MSN: ', '') || 'N/A' }}</td>
                <td>
                  <span :class="['badge', log.eventType.toLowerCase()]">
                    {{ log.eventType }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', getStatusClass(log.commandStatus)]">
                    {{ log.commandStatus || 'N/A' }}
                  </span>
                </td>
                <td>{{ log.metadata?.nocs_name || log.ipAddress || 'N/A' }}</td>
              </tr>
              <tr v-if="recentLogs.length === 0">
                <td colspan="6" class="no-data">No logs available</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="btn-secondary"
          >
            Previous
          </button>
          <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import apiClient from '@/api';

Chart.register(...registerables);

const loading = ref(false);
const error = ref(null);

const filters = ref({
  startDate: '',
  endDate: ''
});

const logFilters = ref({
  eventType: ''
});

const summary = ref({});
const operationsByUser = ref([]);
const dailyStats = ref([]);
const hourlyDistribution = ref([]);
const recentLogs = ref([]);
const nocswiseReport = ref([]);
const meterWiseStatus = ref([]);
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
});

const dailyChart = ref(null);
const hourlyChart = ref(null);
let dailyChartInstance = null;
let hourlyChartInstance = null;

// Upload state
const fileInput = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const uploadResult = ref(null);

// Fetch analytics data
const fetchAnalytics = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params = new URLSearchParams();
    if (filters.value.startDate) params.append('startDate', filters.value.startDate);
    if (filters.value.endDate) params.append('endDate', filters.value.endDate);

    const response = await apiClient.get(`/connection-logs/analytics?${params.toString()}`);

    summary.value = response.data.summary;
    operationsByUser.value = response.data.operationsByUser || [];
    dailyStats.value = response.data.dailyStats || [];
    hourlyDistribution.value = response.data.hourlyDistribution || [];
    nocswiseReport.value = response.data.nocswiseReport || [];
    meterWiseStatus.value = response.data.meterWiseStatus || [];

    await nextTick();
    renderCharts();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch analytics';
    console.error('Error fetching analytics:', err);
  } finally {
    loading.value = false;
  }
};

// Fetch recent logs
const fetchRecentLogs = async () => {
  try {
    const params = new URLSearchParams();
    params.append('page', pagination.value.page);
    params.append('limit', pagination.value.limit);
    if (logFilters.value.eventType) params.append('eventType', logFilters.value.eventType);

    const response = await apiClient.get(`/connection-logs?${params.toString()}`);

    recentLogs.value = response.data.logs;
    pagination.value = response.data.pagination;
  } catch (err) {
    console.error('Error fetching recent logs:', err);
  }
};

// Render charts
const renderCharts = () => {
  renderDailyChart();
  renderHourlyChart();
};

const renderDailyChart = () => {
  if (!dailyChart.value) return;

  if (dailyChartInstance) {
    dailyChartInstance.destroy();
  }

  const ctx = dailyChart.value.getContext('2d');
  const labels = dailyStats.value.map(stat => stat.date).reverse();
  const rcData = dailyStats.value.map(stat => stat.rcCount).reverse();
  const dcData = dailyStats.value.map(stat => stat.dcCount).reverse();

  dailyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'RC (Connect)',
          data: rcData,
          borderColor: 'rgb(52, 211, 153)',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          tension: 0.4
        },
        {
          label: 'DC (Disconnect)',
          data: dcData,
          borderColor: 'rgb(248, 113, 113)',
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const renderHourlyChart = () => {
  if (!hourlyChart.value) return;

  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
  }

  const ctx = hourlyChart.value.getContext('2d');
  const labels = hourlyDistribution.value.map(stat => new Date(stat.hour).toLocaleString());
  const rcData = hourlyDistribution.value.map(stat => stat.rcCount);
  const dcData = hourlyDistribution.value.map(stat => stat.dcCount);

  hourlyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'RC (Connect)',
          data: rcData,
          backgroundColor: 'rgba(52, 211, 153, 0.8)'
        },
        {
          label: 'DC (Disconnect)',
          data: dcData,
          backgroundColor: 'rgba(248, 113, 113, 0.8)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const formatDuration = (seconds) => {
  if (!seconds) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const setToday = () => {
  const today = new Date().toISOString().split('T')[0];
  filters.value.startDate = today;
  filters.value.endDate = today;
  fetchAnalytics();
};

const setLast7Days = () => {
  const today = new Date();
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);

  filters.value.startDate = last7Days.toISOString().split('T')[0];
  filters.value.endDate = today.toISOString().split('T')[0];
  fetchAnalytics();
};

const setLast30Days = () => {
  const today = new Date();
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);

  filters.value.startDate = last30Days.toISOString().split('T')[0];
  filters.value.endDate = today.toISOString().split('T')[0];
  fetchAnalytics();
};

const resetFilters = () => {
  filters.value.startDate = '';
  filters.value.endDate = '';
  fetchAnalytics();
};

const changePage = (newPage) => {
  pagination.value.page = newPage;
  fetchRecentLogs();
};

const getStatusClass = (status) => {
  if (status === 'COMPLETED') return 'success';
  if (status === 'COMINPROG') return 'warning';
  if (status === 'DISCARDED') return 'error';
  return '';
};

// File upload functions
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    uploadResult.value = null;
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  uploadResult.value = null;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    const response = await apiClient.post('/connection-logs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    uploadResult.value = {
      type: 'success',
      message: response.data.message,
      details: response.data.results
    };

    // Clear file input
    selectedFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }

    // Refresh analytics data
    await fetchAnalytics();
    await fetchRecentLogs();
  } catch (err) {
    uploadResult.value = {
      type: 'error',
      message: err.response?.data?.message || 'Failed to upload file',
      details: err.response?.data?.results || null
    };
    console.error('Error uploading file:', err);
  } finally {
    uploading.value = false;
  }
};

const downloadTemplate = async () => {
  try {
    const response = await apiClient.get('/connection-logs/template', {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'RC_DC_Upload_Template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading template:', err);
    alert('Failed to download template');
  }
};

const deleteAllData = async () => {
  const confirmed = window.confirm(
    'Are you sure you want to delete ALL connection logs data? This action cannot be undone!'
  );

  if (!confirmed) return;

  // Second confirmation for extra safety
  const doubleConfirm = window.confirm(
    'This will permanently delete all RC/DC data from the database. Are you absolutely sure?'
  );

  if (!doubleConfirm) return;

  try {
    const response = await apiClient.delete('/connection-logs/delete-all');

    alert(response.data.message + ` (${response.data.deletedCount} records deleted)`);

    // Refresh analytics data
    await fetchAnalytics();
    await fetchRecentLogs();
  } catch (err) {
    console.error('Error deleting all data:', err);
    alert(err.response?.data?.message || 'Failed to delete all data');
  }
};

onMounted(() => {
  setLast7Days();
  fetchRecentLogs();
});
</script>

<style scoped>
.rc-dc-analytics {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-group.inline {
  margin-left: auto;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fef2f2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon.rc {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.card-icon.dc {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.card-icon.total {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.card-icon.active {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
}

.card-icon.duration {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.card-icon.success {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.card-icon.warning {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.card-icon.error {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.status-summary {
  margin-bottom: 2rem;
}

.status-summary.highlight-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
}

.status-summary h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.status-summary.highlight-section h2 {
  color: #1e40af;
  border-bottom-color: #3b82f6;
}

.table-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  font-style: italic;
}

.card-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.card-content .value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.card-content .card-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-style: italic;
}

.card.highlight {
  border: 2px solid #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card.highlight:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.chart-container {
  height: 300px;
  position: relative;
}

.table-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.table-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-info .email {
  color: #6b7280;
  font-size: 0.75rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.75rem;
}

.badge.rc {
  background: #d1fae5;
  color: #065f46;
}

.badge.dc {
  background: #fee2e2;
  color: #991b1b;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.badge.error {
  background: #fee2e2;
  color: #991b1b;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 2rem !important;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Upload Section Styles */
.upload-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.upload-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-download:hover {
  background: #059669;
}

.btn-delete-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-delete-all:hover {
  background: #dc2626;
}

.upload-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 250px;
}

.file-label:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.file-label svg {
  color: #6b7280;
}

.btn-upload {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-upload:hover:not(:disabled) {
  background: #2563eb;
}

.btn-upload:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.upload-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.upload-result {
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
}

.upload-result.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.upload-result.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.upload-result p {
  margin: 0.25rem 0;
}
</style>
