<template>
  <div class="bill-stop-view">

    <!-- Page Header (gradient) -->
    <div class="page-header">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb__link">Home</router-link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
        <span class="breadcrumb__current">Bill Stop Analysis</span>
      </div>

      <div class="page-header__inner">
        <div class="page-header__content">
          <h1 class="page-header__title">Bill Stop Analysis</h1>
          <p class="page-header__subtitle">Identify customers with billing issues and missing meter readings</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn--export" @click="exportResults" v-if="analysisResults.length > 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Results
          </button>
          <button class="btn btn--generate" @click="generateReport" :disabled="isGenerating"
            :class="{ 'btn--generate-pulse': !reportSummary && !isGenerating }">
            <div v-if="isGenerating" class="colorful-loader"></div>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            {{ isGenerating ? 'Generating...' : 'Generate Bill Stop Report' }}
          </button>
          <button class="btn btn--download" @click="downloadBillStopList" :disabled="isDownloading">
            <div v-if="isDownloading" class="colorful-loader colorful-loader--sm"></div>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Bill Stop List
          </button>
          <router-link to="/bill-stop-report" class="btn btn--report">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            View Report
          </router-link>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="reportSummary" class="summary-cards">
      <div class="summary-card total">
        <div class="summary-card__icon-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="summary-card__title">Total Bill Stop</div>
        <div class="summary-card__value">{{ reportSummary.totalBillStop }}</div>
      </div>
      <div class="summary-card success">
        <div class="summary-card__icon-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <div class="summary-card__title">Current Month Reads</div>
        <div class="summary-card__value">{{ reportSummary.withBillingProfileData }}</div>
      </div>
      <div class="summary-card warn">
        <div class="summary-card__icon-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="summary-card__title">No Current Month Reads</div>
        <div class="summary-card__value">{{ reportSummary.withoutBillingProfileData }}</div>
      </div>
      <div class="summary-card info">
        <div class="summary-card__icon-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
        <div class="summary-card__title">Complete Coverage (last 3 months)</div>
        <div class="summary-card__value">{{ reportSummary.completeCoverage ?? '-' }}</div>
      </div>
      <div class="summary-card info">
        <div class="summary-card__icon-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div class="summary-card__title">Partial Coverage (last 3 months)</div>
        <div class="summary-card__value">{{ reportSummary.partialCoverage ?? '-' }}</div>
      </div>
      <div class="summary-card danger">
        <div class="summary-card__icon-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="summary-card__title">No Coverage (last 3 months)</div>
        <div class="summary-card__value">{{ reportSummary.noCoverage ?? '-' }}</div>
      </div>
      <div class="summary-card warn">
        <div class="summary-card__icon-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div class="summary-card__title">Installed This Month (No Bill Yet)</div>
        <div class="summary-card__value">{{ reportSummary.installedThisMonthNoBill ?? '-' }}</div>
      </div>
    </div>

    <!-- Analysis Methods -->
    <div class="analysis-methods">
      <div class="analysis-methods__grid">

        <!-- Bulk Analysis Card -->
        <div class="card analysis-card analysis-card--bulk">
          <div class="card__header">
            <h3 class="card__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Bulk Analysis (CSV Upload)
            </h3>
          </div>
          <div class="card__content">
            <form @submit.prevent="uploadAndAnalyze" class="upload-form">
              <div class="form-group">
                <label for="file" class="form-label">Select CSV File</label>
                <div class="file-upload" :class="{ 'file-upload--has-file': !!file }">
                  <input
                    type="file"
                    id="file"
                    ref="fileInput"
                    @change="handleFileUpload"
                    accept=".csv"
                    class="file-upload__input"
                  >
                  <div class="file-upload__display">
                    <div class="file-upload__icon-wrap">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17,8 12,3 7,8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div class="file-upload__text">
                      <span v-if="file" class="file-upload__filename">{{ file.name }}</span>
                      <span v-else class="file-upload__placeholder">Drag & drop or click to choose CSV</span>
                      <span class="file-upload__hint">Supports: .csv &nbsp;&bull;&nbsp; Required columns: CUSTOMER_NUM, METER_NO</span>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn btn--primary" :disabled="!file || isAnalyzing">
                <div v-if="isAnalyzing" class="colorful-loader colorful-loader--sm"></div>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ isAnalyzing ? 'Analyzing...' : 'Upload and Analyze' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Individual Analysis Card -->
        <div class="card analysis-card analysis-card--individual">
          <div class="card__header">
            <h3 class="card__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              Individual Customer Analysis
            </h3>
          </div>
          <div class="card__content">
            <form @submit.prevent="analyzeIndividualCustomer" class="individual-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="customerNum" class="form-label">Customer Number</label>
                  <input
                    type="text"
                    id="customerNum"
                    v-model="individualAnalysis.customerNum"
                    class="form-control"
                    required
                    placeholder="Enter customer number"
                  >
                </div>
                <div class="form-group">
                  <label for="meterNo" class="form-label">Meter Number</label>
                  <input
                    type="text"
                    id="meterNo"
                    v-model="individualAnalysis.meterNo"
                    class="form-control"
                    required
                    placeholder="Enter meter number"
                  >
                </div>
              </div>
              <button type="submit" class="btn btn--success" :disabled="isAnalyzing">
                <div v-if="isAnalyzing" class="colorful-loader colorful-loader--sm"></div>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                {{ isAnalyzing ? 'Analyzing...' : 'Analyze Customer' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" class="alert" :class="messageClass" role="alert">
      <div class="alert__content">
        <svg v-if="messageClass.includes('success')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
        <svg v-else-if="messageClass.includes('danger')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ message }}
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResults.length > 0" class="results-section">

      <!-- Sticky Results Top Bar -->
      <div class="results-topbar">
        <div class="results-topbar__left">
          <h2 class="results-title">Analysis Results</h2>
          <div class="results-stats-pills">
            <span class="stat-pill stat-pill--total">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
              {{ analysisResults.length }} processed
            </span>
            <span class="stat-pill stat-pill--success">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
              {{ analysisResults.filter(r => r.status === 'ANALYZED').length }} analyzed
            </span>
            <span class="stat-pill stat-pill--warn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ analysisResults.filter(r => r.billStopIssues && r.billStopIssues.length > 0).length }} with issues
            </span>
            <span class="stat-pill stat-pill--danger">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {{ analysisResults.filter(r => r.status === 'ERROR').length }} errors
            </span>
          </div>
        </div>
        <div class="results-topbar__right">
          <span class="results-count-text">{{ analysisResults.length }} customers processed</span>
        </div>
      </div>

      <div class="results-grid">
        <div v-for="(result, index) in analysisResults" :key="index" class="result-card">
          <div class="result-card__header" :class="getStatusClass(result.status)">
            <div class="result-card__title">
              <h4>Customer: {{ result.customerNumber }}</h4>
              <p>Meter: {{ result.meterNumber }}</p>
              <p v-if="result.lastBillDate">Last Bill Date: {{ formatDate(result.lastBillDate) }}</p>
              <span v-if="result.tariff" class="badge badge--primary">{{ result.tariff }}</span>
            </div>
            <div class="result-card__header-right">
              <span class="badge" :class="getStatusBadgeClass(result.status)">{{ result.status }}</span>
              <!-- Collapse toggle -->
              <button class="collapse-btn" @click="toggleCollapse(index)" :title="collapsedCards.has(index) ? 'Expand' : 'Collapse'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  :style="{ transform: collapsedCards.has(index) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
            </div>
            <div class="result-card__actions">
              <button class="btn btn--sm btn--outline-primary" @click="downloadExcel(result)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Excel
              </button>
              <button class="btn btn--sm btn--outline-secondary" @click="downloadPdf(result)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                PDF
              </button>
              <button class="btn btn--sm btn--outline-primary" @click="analyzeWithAi(result.customerNumber)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Analyze with AI
              </button>
            </div>
          </div>

          <!-- Collapsible content -->
          <div class="result-card__content" v-show="!collapsedCards.has(index)">
            <!-- Bill Start Info -->
            <div v-if="result.status === 'BILL_START'" class="analysis-section">
              <h6 class="analysis-section__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Bill Start Customer - MDM Reads
              </h6>
              <div v-if="result.mdmReads && result.mdmReads.length > 0" class="readings-table">
                <table class="table">
                  <thead class="table__header">
                    <tr class="table__row">
                      <th class="table__cell table__cell--header">Date</th>
                      <th class="table__cell table__cell--header">Reading Type</th>
                      <th class="table__cell table__cell--header">Value</th>
                      <th class="table__cell table__cell--header">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="reading in result.mdmReads" :key="reading.MSRMT_DTTM" class="table__row">
                      <td class="table__cell">{{ formatDate(reading.MSRMT_DTTM) }}</td>
                      <td class="table__cell">{{ reading.READING_TYPE }}</td>
                      <td class="table__cell">{{ formatValue(reading.READING_VAL) }}</td>
                      <td class="table__cell">{{ reading.REMARKS }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="p-4">
                <p>No MDM reads found for this customer.</p>
              </div>
            </div>

            <!-- Error Display -->
            <div v-if="result.error" class="alert alert--danger">
              <strong>Error:</strong> {{ result.error }}
            </div>

            <!-- Replacement Information -->
            <div v-if="result.replacementInfo" class="replacement-info">
              <h5>Meter Replacement Information</h5>
              <div class="replacement-grid">
                <div class="replacement-item">
                  <span class="replacement-label">Old Meter:</span>
                  <span class="replacement-value">{{ result.replacementInfo.oldMeterNumber }}</span>
                </div>
                <div class="replacement-item">
                  <span class="replacement-label">New Meter:</span>
                  <span class="replacement-value">{{ result.replacementInfo.newMeterNumber }}</span>
                </div>
                <div class="replacement-item">
                  <span class="replacement-label">Install Date:</span>
                  <span class="replacement-value">{{ formatDate(result.replacementInfo.installDate) }}</span>
                </div>
                <div class="replacement-item">
                  <span class="replacement-label">Replace Date:</span>
                  <span class="replacement-value">{{ formatDate(result.replacementInfo.replaceDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Bill Stop Issues Summary -->
            <div v-if="result.billStopIssues && result.billStopIssues.length > 0" class="issues-summary">
              <h5>Bill Stop Issues Detected</h5>
              <div class="issues-list">
                <div v-for="(issue, issueIndex) in result.billStopIssues" :key="issueIndex" class="issue-item">
                  <div class="issue-header">
                    <strong>{{ issue.meterType }} ({{ issue.meterNo }}):</strong>
                    <span class="issue-stats">
                      {{ issue.missingReadings }} issues found
                    </span>
                  </div>
                  <div class="issue-details">
                    <div v-for="(detail, detailIndex) in issue.issues" :key="detailIndex" class="issue-detail">
                      <div class="issue-detail__header">
                        <span class="badge" :class="getSeverityBadgeClass(detail.severity)">
                          {{ detail.severity }}
                        </span>
                        <span class="issue-detail__type">{{ detail.type }}</span>
                      </div>
                      <div class="issue-detail__description">
                        {{ detail.description }}
                      </div>
                      <div v-if="detail.date" class="issue-detail__date">
                        Date: {{ formatDate(detail.date) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Analysis Details -->
            <div class="analysis-details">
              <!-- Old Meter Analysis -->
              <div v-if="result.oldMeterAnalysis" class="analysis-section">
                <h6 class="analysis-section__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  Old Meter Analysis ({{ result.oldMeterAnalysis.meterNo }})
                </h6>
                <div v-if="result.oldMeterStatus" class="analysis-status">
                  Status: {{ result.oldMeterStatus }} - {{ result.oldMeterReason }}
                </div>
                <div v-if="result.oldMeterAnalysis.monthlyReadings.length > 0" class="readings-table">
                  <table class="table">
                    <thead class="table__header">
                      <tr class="table__row">
                        <th class="table__cell table__cell--header">Date</th>
                        <th class="table__cell table__cell--header">Reading Type</th>
                        <th class="table__cell table__cell--header">Value</th>
                        <th class="table__cell table__cell--header">Source</th>
                        <th class="table__cell table__cell--header">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="reading in result.oldMeterAnalysis.monthlyReadings" :key="reading.date"
                          class="table__row" :class="getReadingRowClass(reading.source)">
                        <td class="table__cell">{{ formatDate(reading.date) }}</td>
                        <td class="table__cell">{{ reading.readingType }}</td>
                        <td class="table__cell">{{ formatValue(reading.value) }}</td>
                        <td class="table__cell">
                          <span class="badge" :class="getSourceBadgeClass(reading.source)">
                            {{ reading.source }}
                          </span>
                        </td>
                        <td class="table__cell">{{ reading.remark }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- New Meter Analysis -->
              <div v-if="result.newMeterAnalysis" class="analysis-section">
                <h6 class="analysis-section__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  New Meter Analysis ({{ result.newMeterAnalysis.meterNo }})
                </h6>
                <div v-if="result.newMeterAnalysis.monthlyReadings.length > 0" class="readings-table">
                  <table class="table">
                    <thead class="table__header">
                      <tr class="table__row">
                        <th class="table__cell table__cell--header">Date</th>
                        <th class="table__cell table__cell--header">Reading Type</th>
                        <th class="table__cell table__cell--header">Value</th>
                        <th class="table__cell table__cell--header">Source</th>
                        <th class="table__cell table__cell--header">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="reading in result.newMeterAnalysis.monthlyReadings" :key="reading.date"
                          class="table__row" :class="getReadingRowClass(reading.source)">
                        <td class="table__cell">{{ formatDate(reading.date) }}</td>
                        <td class="table__cell">{{ reading.readingType }}</td>
                        <td class="table__cell">{{ formatValue(reading.value) }}</td>
                        <td class="table__cell">
                          <span class="badge" :class="getSourceBadgeClass(reading.source)">
                            {{ reading.source }}
                          </span>
                        </td>
                        <td class="table__cell">{{ reading.remark }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Current Meter Analysis -->
              <div v-if="result.currentMeterAnalysis" class="analysis-section">
                <h6 class="analysis-section__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Current Meter Analysis ({{ result.currentMeterAnalysis.meterNo }})
                </h6>
                <div v-if="result.analysisPeriod" class="analysis-period-info">
                  <strong>Analysis Period:</strong> {{ result.analysisPeriod === 'LAST_BILL_TO_CURRENT' ? 'From Last Bill Date to Current Month' : 'From Next Month of Installation to Current Month' }}
                  <br>
                  <strong>Start Date:</strong> {{ formatDate(result.analysisStartDate) }}
                </div>
                <div v-if="result.currentMeterAnalysis.monthlyReadings.length > 0" class="readings-table">
                  <table class="table">
                    <thead class="table__header">
                      <tr class="table__row">
                        <th class="table__cell table__cell--header">Date</th>
                        <th class="table__cell table__cell--header">Reading Type</th>
                        <th class="table__cell table__cell--header">Value</th>
                        <th class="table__cell table__cell--header">Source</th>
                        <th class="table__cell table__cell--header">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="reading in result.currentMeterAnalysis.monthlyReadings" :key="reading.date"
                          class="table__row" :class="getReadingRowClass(reading.source)">
                        <td class="table__cell">{{ formatDate(reading.date) }}</td>
                        <td class="table__cell">{{ reading.readingType }}</td>
                        <td class="table__cell">{{ formatValue(reading.value) }}</td>
                        <td class="table__cell">
                          <span class="badge" :class="getSourceBadgeClass(reading.source)">
                            {{ reading.source }}
                          </span>
                        </td>
                        <td class="table__cell">{{ reading.remark }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <!-- Collapsed hint -->
          <div v-if="collapsedCards.has(index)" class="result-card__collapsed-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Card collapsed — click the chevron to expand
          </div>
        </div>
      </div>
    </div>

    <!-- AI Analysis Modal -->
    <div v-if="isAiModalOpen" class="ai-modal-overlay" @click.self="isAiModalOpen = false">
      <div class="ai-modal">
        <div class="ai-modal-header">
          <div class="ai-modal-title">
            <div class="ai-modal-title__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <h3>AI Analysis &amp; Resolution</h3>
              <p class="ai-modal-title__sub">Powered by Gemini</p>
            </div>
          </div>
          <button @click="isAiModalOpen = false" class="ai-modal-close-btn" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="ai-modal-body">
          <div v-if="isAnalyzingWithAi" class="ai-modal-loader">
            <div class="colorful-loader colorful-loader--lg"></div>
            <p>Analyzing with Gemini, please wait...</p>
            <p class="ai-modal-loader__hint">This may take a few seconds</p>
          </div>
          <div v-if="!isAnalyzingWithAi && aiAnalysisResult" class="ai-analysis-content">
            <div class="analysis-section ai-section">
              <h4 class="analysis-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Root Cause
              </h4>
              <p class="analysis-text">{{ aiAnalysisResult.rootCause }}</p>
            </div>
            <div class="analysis-section ai-section">
              <h4 class="analysis-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Resolution Plan
              </h4>
              <ol class="resolution-plan">
                <li v-for="(step, index) in aiAnalysisResult.resolutionPlan.split('\n')" :key="index" class="resolution-step">{{ step.replace(/^\d+\.\s*/, '') }}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import apiClient from '../api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const file = ref<File | null>(null);
const message = ref('');
const messageClass = ref('');
const analysisResults = ref<any[]>([]);
const isAnalyzing = ref(false);
const isGenerating = ref(false);
const isDownloading = ref(false);

const reportSummary = ref<any | null>(null);

const individualAnalysis = reactive({
  customerNum: '',
  meterNo: ''
});

interface AiAnalysisResult {
  rootCause: string;
  resolutionPlan: string;
}

const isAiModalOpen = ref(false);
const aiAnalysisResult = ref<AiAnalysisResult | null>(null);
const isAnalyzingWithAi = ref(false);

// Collapse/expand state for result cards
const collapsedCards = ref<Set<number>>(new Set());
const toggleCollapse = (index: number) => {
  const s = new Set(collapsedCards.value);
  if (s.has(index)) s.delete(index);
  else s.add(index);
  collapsedCards.value = s;
};

const analyzeWithAi = async (customerNum: string) => {
  isAnalyzingWithAi.value = true;
  isAiModalOpen.value = true;
  aiAnalysisResult.value = null;

  try {
    const response = await apiClient.post(`/bill-stop-analysis/analyze/${customerNum}`);
    aiAnalysisResult.value = response.data;
  } catch (error) {
    console.error('Error analyzing with AI:', error);
    aiAnalysisResult.value = {
      rootCause: 'Error',
      resolutionPlan: 'Could not get analysis from the server.'
    };
  } finally {
    isAnalyzingWithAi.value = false;
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    file.value = target.files[0];
  }
};

const uploadAndAnalyze = async () => {
  if (!file.value) {
    message.value = 'Please select a file to upload.';
    messageClass.value = 'alert--danger';
    return;
  }

  isAnalyzing.value = true;
  message.value = '';
  messageClass.value = '';

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    const response = await apiClient.post('/bill-stop/upload-and-analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    analysisResults.value = response.data;
    message.value = `Analysis complete. Processed ${response.data.length} customers.`;
    messageClass.value = 'alert--success';
  } catch (error: any) {
    message.value = error.response?.data || 'An error occurred during analysis.';
    messageClass.value = 'alert--danger';
    analysisResults.value = [];
  } finally {
    isAnalyzing.value = false;
  }
};

const analyzeIndividualCustomer = async () => {
  if (!individualAnalysis.customerNum || !individualAnalysis.meterNo) {
    message.value = 'Please provide customer number and meter number.';
    messageClass.value = 'alert--danger';
    return;
  }

  isAnalyzing.value = true;
  message.value = '';
  messageClass.value = '';

  try {
    const params = new URLSearchParams({
      customerNum: individualAnalysis.customerNum,
      meterNo: individualAnalysis.meterNo
    });

    const response = await apiClient.get(`/bill-stop/analyze?${params}`);
    analysisResults.value = [response.data];
    message.value = 'Individual customer analysis complete.';
    messageClass.value = 'alert--success';
  } catch (error: any) {
    message.value = error.response?.data || 'An error occurred during analysis.';
    messageClass.value = 'alert--danger';
    analysisResults.value = [];
  } finally {
    isAnalyzing.value = false;
  }
};

const generateReport = async () => {
  try {
    isGenerating.value = true;
    const { data } = await apiClient.get('/bill-stop/report');
    reportSummary.value = data;
    message.value = 'Report generated';
    messageClass.value = 'alert--success';
  } catch (e: any) {
    message.value = e.response?.data?.error || 'Failed to generate report';
    messageClass.value = 'alert--danger';
  } finally {
    isGenerating.value = false;
  }
};



const downloadBillStopList = async () => {
  try {
    isDownloading.value = true;
    const { data } = await apiClient.get('/bill-stop/customers');
    const rows = data.customers || [];
    if (!rows.length) {
      alert('No bill stop customers found.');
      return;
    }
    const exportRows = rows.map((r: any) => ({

      CUSTOMER_NUM: r.CUSTOMER_NUM,
      METER_NO: r.METER_NO,
      CONN_DATE: r.CONN_DATE ? new Date(r.CONN_DATE).toISOString().split('T')[0] : '',
      TARIFF: r.TARIFF,
      LAST_BILL_DATE: r.LAST_BILL_DATE ? new Date(r.LAST_BILL_DATE).toISOString().split('T')[0] : '',
      HAS_CURRENT_MONTH_READ: r.hasCurrentMonthRead ? 'Yes' : 'No',
      COVERAGE: r.coverage,
      INSTALLED_THIS_MONTH_NO_BILL: r.installedThisMonthNoBill ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BillStopCustomers');
    XLSX.writeFile(wb, `bill_stop_customers_${new Date().toISOString().slice(0,10)}.xlsx`);
  } catch (e: any) {
    alert(e.response?.data?.error || 'Failed to download list');
  } finally {
    isDownloading.value = false;
  }
};

const formatDate = (date: string | Date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

const formatValue = (value: number) => {
  if (value == null) return 'N/A';
  return value.toFixed(2);
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ANALYZED': return 'result-card__header--success';
    case 'ERROR': return 'result-card__header--error';
    case 'BILL_START': return 'result-card__header--info';
    default: return 'result-card__header--default';
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'ANALYZED': return 'badge--success';
    case 'ERROR': return 'badge--danger';
    case 'BILL_START': return 'badge--info';
    default: return 'badge--secondary';
  }
};

const getSourceBadgeClass = (source: string) => {
  switch (source) {
    case 'MDM_READS': return 'badge--primary';
    case 'BILLING_PROFILE': return 'badge--info';
    case 'MISSING': return 'badge--danger';
    default: return 'badge--secondary';
  }
};

const getReadingRowClass = (source: string) => {
  switch (source) {
    case 'MISSING': return 'table__row--danger';
    default: return '';
  }
};

const getSeverityBadgeClass = (severity: string) => {
  switch (severity) {
    case 'HIGH': return 'badge--danger';
    case 'MEDIUM': return 'badge--warning';
    case 'LOW': return 'badge--info';
    default: return 'badge--secondary';
  }
};

const exportResults = () => {
  const csvContent = generateCSV(analysisResults.value);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bill-stop-analysis-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const downloadExcel = (result: any) => {
  let data = [];
  if (result.status === 'BILL_START') {
    data = result.mdmReads;
  } else if (result.currentMeterAnalysis) {
    data = result.currentMeterAnalysis.monthlyReadings;
  } else if (result.oldMeterAnalysis || result.newMeterAnalysis) {
    if(result.oldMeterAnalysis) data.push(...result.oldMeterAnalysis.monthlyReadings);
    if(result.newMeterAnalysis) data.push(...result.newMeterAnalysis.monthlyReadings);
  }

  if(data.length === 0) {
    alert('No data available to download.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis');
  XLSX.writeFile(workbook, `bill_stop_analysis_${result.customerNumber}.xlsx`);
};

const downloadPdf = (result: any) => {
  let data: any[] = [];
  let head: any[] = [];
  if (result.status === 'BILL_START') {
    head = [['Date', 'Reading Type', 'Value', 'Remark']];
    data = result.mdmReads.map((r: any) => [formatDate(r.MSRMT_DTTM), r.READING_TYPE, formatValue(r.READING_VAL), r.REMARKS]);
  } else if (result.currentMeterAnalysis || result.oldMeterAnalysis || result.newMeterAnalysis) {
    head = [['Date', 'Reading Type', 'Value', 'Source', 'Remark']];
    let readings: any[] = [];
    if (result.currentMeterAnalysis) {
        readings = result.currentMeterAnalysis.monthlyReadings;
    } else {
        if(result.oldMeterAnalysis) readings.push(...result.oldMeterAnalysis.monthlyReadings);
        if(result.newMeterAnalysis) readings.push(...result.newMeterAnalysis.monthlyReadings);
    }
    data = readings.map((r: any) => [formatDate(r.date), r.readingType, formatValue(r.value), r.source, r.remark]);
  }

  if(data.length === 0) {
    alert('No data available to download.');
    return;
  }

  const doc = new jsPDF();
  autoTable(doc, {
    head: head,
    body: data,
  });
  doc.save(`bill_stop_analysis_${result.customerNumber}.pdf`);
};

const generateCSV = (results: any[]) => {
  const headers = [
    'Customer Number',
    'Meter Number',
    'Tariff',
    'Last Bill Date',
    'Analysis Period',
    'Status',
    'Bill Stop Issues',
    'Missing Readings',
    'Initial Read Missing',
    'MDM Missing Billing Available',
    'TOD Readings Missing'
  ];

  const rows = results.map(result => {
    const billStopIssues = result.billStopIssues || [];
    const initialReadMissing = billStopIssues.some((issue: any) =>
      issue.issues?.some((detail: any) => detail.type === 'INITIAL_READ_MISSING')
    ) ? 'Yes' : 'No';

    const mdmMissingBillingAvailable = billStopIssues.some((issue: any) =>
      issue.issues?.some((detail: any) => detail.type === 'MDM_MISSING_BILLING_AVAILABLE')
    ) ? 'Yes' : 'No';

    const todReadingsMissing = billStopIssues.some((issue: any) =>
      issue.issues?.some((detail: any) => detail.type === 'TOD_READING_MISSING')
    ) ? 'Yes' : 'No';

    return [
      result.customerNumber,
      result.meterNumber,
      result.tariff || '',
      result.lastBillDate || '',
      result.analysisPeriod || 'N/A',
      result.status,
      billStopIssues.length,
      billStopIssues.reduce((sum: number, issue: any) => sum + issue.missingReadings, 0),
      initialReadMissing,
      mdmMissingBillingAvailable,
      todReadingsMissing
    ];
  });

  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
};
</script>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────── */
.bill-stop-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-xl, 1.5rem);
  background-color: var(--color-background, #f8fafc);
  min-height: 100vh;
}

/* ─── Breadcrumb ─────────────────────────────────────────────────── */
.breadcrumb {
  display: flex; align-items: center; gap: 0.4rem;
  color: rgba(255,255,255,0.75); font-size: 0.78rem; margin-bottom: 0.75rem;
}
.breadcrumb__link {
  color: rgba(255,255,255,0.75); text-decoration: none; font-weight: 500;
  transition: color 0.2s;
}
.breadcrumb__link:hover { color: #fff; }
.breadcrumb__current { font-weight: 600; color: rgba(255,255,255,0.9); }
.breadcrumb svg { color: rgba(255,255,255,0.5); }

/* ─── Page Header ─────────────────────────────────────────────────── */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-2xl, 2rem) var(--spacing-3xl, 2.25rem);
  border-radius: var(--radius-2xl, 1.25rem);
  margin-bottom: var(--spacing-2xl, 1.5rem);
  box-shadow: 0 20px 25px -5px rgba(102, 126, 234, 0.3), 0 10px 10px -5px rgba(118, 75, 162, 0.2);
  position: relative;
  overflow: hidden;
  animation: slideInDown 0.5s ease-out;
}
.page-header::before {
  content: '';
  position: absolute;
  top: -50%; right: -10%;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}
.page-header__inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
}
.page-header__title {
  font-size: var(--font-size-4xl, 2rem);
  font-weight: var(--font-weight-black, 800);
  margin-bottom: var(--spacing-sm, 0.25rem);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  letter-spacing: -0.025em;
  margin-top: 0;
}
.page-header__subtitle {
  font-size: var(--font-size-lg, 1rem);
  opacity: 0.95;
  font-weight: 400;
  margin: 0;
}
.page-header__actions {
  display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;
}

/* ─── Header Buttons ─────────────────────────────────────────────────── */
.btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: 0.025em;
  border-radius: var(--radius-lg, 0.6rem);
  padding: var(--spacing-md, 0.5rem) var(--spacing-xl, 1rem);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 0.4rem);
  font-size: 0.84rem;
  cursor: pointer;
  border: none;
  text-decoration: none;
}
.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
}
.btn:active:not(:disabled) { transform: translateY(0); }
.btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }

.btn--export {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none; color: white;
}
.btn--generate {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none; color: white;
}
.btn--download {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.4); color: white;
}
.btn--download:hover:not(:disabled) { background: rgba(255,255,255,0.28); }
.btn--report {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border: none; color: white;
}
.btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none; color: white;
}
.btn--success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none; color: white;
}

/* Pulse animation on Generate button when no report yet */
@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(245,87,108,0.5); }
  70%  { box-shadow: 0 0 0 12px rgba(245,87,108,0); }
  100% { box-shadow: 0 0 0 0 rgba(245,87,108,0); }
}
.btn--generate-pulse { animation: pulse-ring 2s ease-out infinite; }

/* ─── Summary Cards ─────────────────────────────────────────────────── */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg, 1rem);
  margin-bottom: var(--spacing-2xl, 1.5rem);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.summary-card {
  border-radius: var(--radius-2xl, 1rem);
  padding: var(--spacing-xl, 1.25rem);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: none;
  background: var(--color-surface, #fff);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.summary-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500, #6366f1), var(--secondary-500, #8b5cf6));
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.summary-card.total   { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border: 1px solid #e9d5ff; }
.summary-card.total::before { background: linear-gradient(90deg, #9333ea, #a855f7); }
.summary-card.success { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 1px solid #bbf7d0; }
.summary-card.success::before { background: linear-gradient(90deg, #16a34a, #22c55e); }
.summary-card.warn    { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 1px solid #ffedd5; }
.summary-card.warn::before { background: linear-gradient(90deg, #ea580c, #f97316); }
.summary-card.info    { background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border: 1px solid #bae6fd; }
.summary-card.info::before { background: linear-gradient(90deg, #0284c7, #0ea5e9); }
.summary-card.danger  { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 1px solid #fecaca; }
.summary-card.danger::before { background: linear-gradient(90deg, #dc2626, #ef4444); }

.summary-card__icon-bg {
  width: 48px; height: 48px; border-radius: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.6); margin-bottom: 0.75rem;
  color: #374151;
}
.summary-card.total   .summary-card__icon-bg { color: #9333ea; background: rgba(147,51,234,0.12); }
.summary-card.success .summary-card__icon-bg { color: #16a34a; background: rgba(22,163,74,0.12); }
.summary-card.warn    .summary-card__icon-bg { color: #ea580c; background: rgba(234,88,12,0.12); }
.summary-card.info    .summary-card__icon-bg { color: #0284c7; background: rgba(2,132,199,0.12); }
.summary-card.danger  .summary-card__icon-bg { color: #dc2626; background: rgba(220,38,38,0.12); }

.summary-card__title {
  font-size: 13px; color: #374151; margin-bottom: 6px;
  font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase;
}
.summary-card__value {
  font-size: 32px; font-weight: 800; color: #111827; line-height: 1;
}

/* ─── Analysis Methods ─────────────────────────────────────────────────── */
.analysis-methods { margin-bottom: var(--spacing-2xl, 1.5rem); }
.analysis-methods__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: var(--spacing-2xl, 1.5rem);
}

.analysis-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-2xl, 1rem);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--color-border, #e5e7eb);
  position: relative; overflow: hidden;
  animation: fadeInScale 0.5s ease-out;
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
.analysis-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px;
}
.analysis-card--bulk::before       { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }
.analysis-card--individual::before { background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); }
.analysis-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
}
.analysis-card .card__header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  padding: var(--spacing-xl, 1.25rem);
}
.analysis-card .card__title {
  display: flex; align-items: center; gap: var(--spacing-md, 0.5rem);
  font-size: var(--font-size-xl, 1.1rem); font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #111827); letter-spacing: -0.02em; margin: 0;
}
.analysis-card .card__title svg { color: #667eea; }
.analysis-card .card__content { padding: var(--spacing-xl, 1.25rem); }

/* ─── File Upload ─────────────────────────────────────────────────── */
.file-upload {
  transition: all 0.3s ease;
  position: relative;
  border: 2.5px dashed var(--color-border, #d1d5db);
  border-radius: var(--radius-xl, 0.75rem);
  padding: var(--spacing-2xl, 1.75rem) var(--spacing-xl, 1.25rem);
  text-align: center;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
}
.file-upload:hover, .file-upload--has-file {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.07) 0%, rgba(118, 75, 162, 0.07) 100%);
}
.file-upload:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
}
.file-upload__input {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
}
.file-upload__display { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; pointer-events: none; }
.file-upload__icon-wrap {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
  display: flex; align-items: center; justify-content: center; color: #667eea;
}
.file-upload__text { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.file-upload__placeholder { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary, #374151); }
.file-upload__filename { font-size: 0.9rem; font-weight: 700; color: #667eea; }
.file-upload__hint { font-size: 0.75rem; color: var(--color-text-secondary, #6b7280); }

/* ─── Forms ─────────────────────────────────────────────────── */
.upload-form, .individual-form {
  display: flex; flex-direction: column; gap: var(--spacing-lg, 1rem);
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg, 1rem); }
.form-group { margin-bottom: 0; }
.form-label {
  font-weight: var(--font-weight-semibold, 600); margin-bottom: var(--spacing-sm, 0.35rem);
  display: block; color: var(--color-text-primary, #374151); font-size: var(--font-size-sm, 0.83rem);
}
.form-control {
  width: 100%; transition: all 0.3s ease;
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 0.6rem);
  padding: var(--spacing-md, 0.5rem) var(--spacing-lg, 0.75rem);
  font-size: var(--font-size-base, 0.875rem);
  background: var(--color-surface, #fff); color: var(--color-text-primary, #111);
  outline: none; box-sizing: border-box;
}
.form-control:focus { border-color: #667eea; box-shadow: 0 0 0 4px rgba(102,126,234,0.1); }

/* ─── Alerts ─────────────────────────────────────────────────── */
.alert {
  display: flex; align-items: center; gap: var(--spacing-md, 0.5rem);
  margin-bottom: var(--spacing-lg, 1rem);
  padding: var(--spacing-lg, 0.9rem) var(--spacing-xl, 1.1rem);
  border-radius: var(--radius-xl, 0.75rem);
  border-left: 4px solid;
  animation: slideInRight 0.4s ease-out;
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
.alert--success { background: rgba(34,197,94,0.08); border-left-color: #22c55e; color: #166534; }
.alert--danger  { background: rgba(239,68,68,0.08);  border-left-color: #ef4444; color: #991b1b; }
.alert--info    { background: rgba(59,130,246,0.08);  border-left-color: #3b82f6; color: #1e40af; }
.alert__content { display: flex; align-items: center; gap: var(--spacing-sm, 0.35rem); flex: 1; }

/* ─── Results Section ─────────────────────────────────────────────────── */
.results-section { margin-top: var(--spacing-2xl, 1.5rem); animation: fadeInUp 0.6s ease-out 0.2s backwards; }

.results-topbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  background: #fff; border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  margin-bottom: 1.25rem;
  border-left: 4px solid;
  border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
  border-radius: 1rem;
}
.results-topbar__left { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.results-title {
  font-size: 1.3rem; font-weight: 800; margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.results-stats-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.stat-pill {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.25em 0.75em; border-radius: 999px;
  font-size: 0.75rem; font-weight: 700;
}
.stat-pill--total   { background: #ede9fe; color: #7c3aed; }
.stat-pill--success { background: #dcfce7; color: #15803d; }
.stat-pill--warn    { background: #fef3c7; color: #92400e; }
.stat-pill--danger  { background: #fee2e2; color: #b91c1c; }
.results-count-text { font-size: 0.82rem; color: #6b7280; font-weight: 500; }

.results-grid { display: flex; flex-direction: column; gap: var(--spacing-lg, 1.25rem); }

/* ─── Result Cards ─────────────────────────────────────────────────── */
.result-card {
  border-radius: var(--radius-2xl, 1rem);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  animation: slideInLeft 0.5s ease-out;
  border: 1px solid var(--color-border, #e5e7eb);
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}
.result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px -8px rgba(0,0,0,0.15);
}
.result-card__header {
  color: white; padding: var(--spacing-xl, 1.1rem);
  position: relative; overflow: hidden;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.5rem 1rem;
  align-items: start;
}
.result-card__header::before {
  content: ''; position: absolute; top: -50%; right: -25%;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%);
  border-radius: 50%;
}
.result-card__header--success { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
.result-card__header--error   { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.result-card__header--info    { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
.result-card__header--default { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }
.result-card__title { position: relative; }
.result-card__title h4 { font-weight: 700; font-size: 1.05rem; margin: 0 0 0.25rem; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.result-card__title p { margin: 0; font-size: 0.83rem; opacity: 0.88; }

.result-card__header-right {
  display: flex; align-items: center; gap: 0.5rem; justify-self: end;
  position: relative;
}
.collapse-btn {
  background: rgba(255,255,255,0.22); border: none; cursor: pointer;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; transition: background 0.2s;
}
.collapse-btn:hover { background: rgba(255,255,255,0.35); }

.result-card__actions {
  display: flex; gap: var(--spacing-sm, 0.4rem); flex-wrap: wrap;
  grid-column: 1 / -1; position: relative;
}
.result-card__actions .btn { font-size: 0.78rem; padding: 0.35rem 0.7rem; }

.result-card__content {
  padding: var(--spacing-lg, 1.1rem);
  background: var(--color-surface, #fff);
}
.result-card__collapsed-hint {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  font-size: 0.78rem; color: #9ca3af;
  background: var(--color-surface, #fff);
  border-top: 1px solid #f3f4f6;
}

/* ─── Tables ─────────────────────────────────────────────────── */
.readings-table { overflow-x: auto; border-radius: var(--radius-lg, 0.5rem); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 0.55rem 0.8rem; text-align: left; }
.table thead { background: linear-gradient(135deg, rgba(102,126,234,0.07) 0%, rgba(118,75,162,0.07) 100%); }
.table th {
  font-weight: 700; color: var(--color-text-primary, #374151);
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 2px solid rgba(102,126,234,0.18);
}
.table tbody tr { transition: all 0.2s ease; border-bottom: 1px solid var(--color-border, #f3f4f6); }
.table tbody tr:nth-child(even) { background-color: rgba(102,126,234,0.02); }
.table tbody tr:hover {
  background: linear-gradient(90deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%);
  box-shadow: inset 3px 0 0 #667eea;
}
.table__row--danger { background: #fff5f5 !important; }
.table__row--danger:hover { background: #fee2e2 !important; }

/* ─── Badges ─────────────────────────────────────────────────── */
.badge {
  font-weight: 700; text-shadow: none;
  padding: 0.25em 0.65em;
  border-radius: var(--radius-full, 999px);
  font-size: 0.7rem; letter-spacing: 0.025em; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: var(--spacing-xs, 0.2rem);
}
.badge--primary   { background: linear-gradient(135deg,#667eea,#764ba2); color: white; box-shadow: 0 2px 4px rgba(102,126,234,0.3); }
.badge--info      { background: linear-gradient(135deg,#3b82f6,#2563eb); color: white; box-shadow: 0 2px 4px rgba(59,130,246,0.3); }
.badge--success   { background: linear-gradient(135deg,#22c55e,#16a34a); color: white; box-shadow: 0 2px 4px rgba(34,197,94,0.3); }
.badge--warning   { background: linear-gradient(135deg,#f59e0b,#d97706); color: white; box-shadow: 0 2px 4px rgba(245,158,11,0.3); }
.badge--danger    { background: linear-gradient(135deg,#ef4444,#dc2626); color: white; box-shadow: 0 2px 4px rgba(239,68,68,0.3); }
.badge--secondary { background: linear-gradient(135deg,#6b7280,#4b5563); color: white; box-shadow: 0 2px 4px rgba(107,114,128,0.3); }

/* ─── Analysis Sections ─────────────────────────────────────────────────── */
.analysis-details { display: flex; flex-direction: column; gap: var(--spacing-xl, 1.25rem); }
.analysis-section {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-xl, 0.75rem); overflow: hidden;
  background: var(--color-surface, #fff); transition: box-shadow 0.3s ease;
}
.analysis-section:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.07); }
.analysis-section__title {
  display: flex; align-items: center; gap: var(--spacing-sm, 0.4rem);
  margin: 0; padding: 0.7rem 1rem;
  background: linear-gradient(135deg,rgba(102,126,234,0.07) 0%,rgba(118,75,162,0.07) 100%);
  border-bottom: 2px solid rgba(102,126,234,0.18);
  font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary, #374151);
}
.analysis-status {
  padding: 0.55rem 1rem;
  background: linear-gradient(135deg,rgba(59,130,246,0.05) 0%,rgba(37,99,235,0.05) 100%);
  font-size: 0.82rem; color: var(--color-text-secondary, #6b7280);
  border-bottom: 1px solid var(--color-border, #e5e7eb); font-weight: 500;
}
.analysis-period-info {
  background: rgba(102,126,234,0.06); border: 1px solid rgba(102,126,234,0.15);
  border-radius: 0.5rem; padding: 0.65rem 1rem; margin-bottom: 0.65rem;
  font-size: 0.82rem; color: #4338ca; line-height: 1.6;
}

/* ─── Replacement Info ─────────────────────────────────────────────────── */
.replacement-info {
  background: rgba(102,126,234,0.06); border: 1px solid rgba(102,126,234,0.2);
  border-radius: var(--radius-lg, 0.6rem); padding: var(--spacing-lg, 1rem);
  margin-bottom: var(--spacing-lg, 1rem);
}
.replacement-info h5 { margin: 0 0 var(--spacing-md, 0.5rem); color: #4338ca; font-weight: 700; }
.replacement-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem; }
.replacement-item { display: flex; flex-direction: column; gap: 0.15rem; }
.replacement-label { font-size: 0.75rem; color: #9ca3af; font-weight: 600; }
.replacement-value { font-weight: 700; color: var(--color-text-primary, #374151); font-size: 0.88rem; }

/* ─── Issues Summary ─────────────────────────────────────────────────── */
.issues-summary {
  background: linear-gradient(135deg,rgba(251,191,36,0.08) 0%,rgba(245,158,11,0.08) 100%);
  border: 1px solid rgba(251,191,36,0.3); border-radius: var(--radius-xl, 0.75rem);
  padding: var(--spacing-xl, 1.1rem); margin-bottom: var(--spacing-lg, 1rem);
}
.issues-summary h5 { margin: 0 0 var(--spacing-lg, 1rem); color: #92400e; font-weight: 700; font-size: 1rem; }
.issues-list { display: flex; flex-direction: column; gap: var(--spacing-md, 0.6rem); }
.issue-item {
  background: var(--color-surface, #fff); border-radius: var(--radius-lg, 0.6rem);
  padding: var(--spacing-lg, 0.85rem); border: 1px solid var(--color-border, #e5e7eb);
  transition: all 0.3s ease;
}
.issue-item:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.07); transform: translateX(3px); }
.issue-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
.issue-stats { font-size: 0.78rem; color: #9ca3af; }
.issue-details { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.issue-detail {
  background: linear-gradient(135deg,rgba(102,126,234,0.03) 0%,rgba(118,75,162,0.03) 100%);
  border: 1px solid var(--color-border, #e5e7eb);
  border-left: 3px solid #667eea; border-radius: 0.5rem; padding: 0.6rem 0.75rem;
  transition: all 0.2s ease;
}
.issue-detail:hover { border-left-color: #764ba2; background: linear-gradient(135deg,rgba(102,126,234,0.07) 0%,rgba(118,75,162,0.07) 100%); }
.issue-detail__header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; }
.issue-detail__type { font-weight: 700; color: var(--color-text-primary, #374151); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
.issue-detail__description { color: var(--color-text-secondary, #6b7280); font-size: 0.82rem; line-height: 1.5; margin-bottom: 0.2rem; }
.issue-detail__date { font-size: 0.72rem; color: #9ca3af; font-weight: 600; }

/* ─── Buttons (small variants) ─────────────────────────────────────────────────── */
.btn--sm { font-size: 0.77rem; padding: 0.35rem 0.65rem; }
.btn--outline-primary {
  background: rgba(102,126,234,0.08); border: 1.5px solid rgba(102,126,234,0.35);
  color: #667eea;
}
.btn--outline-primary:hover { background: rgba(102,126,234,0.15); border-color: #667eea; }
.btn--outline-secondary {
  background: rgba(107,114,128,0.08); border: 1.5px solid rgba(107,114,128,0.3);
  color: #4b5563;
}
.btn--outline-secondary:hover { background: rgba(107,114,128,0.15); }

/* ─── Colorful Loader ─────────────────────────────────────────────────── */
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.colorful-loader {
  width: 24px; height: 24px; border-radius: 50%; display: inline-block;
  position: relative; border-top: 3px solid #667eea; border-right: 3px solid transparent;
  box-sizing: border-box; animation: rotation 1s linear infinite;
}
.colorful-loader::after {
  content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0;
  width: 24px; height: 24px; border-radius: 50%;
  border-bottom: 3px solid #764ba2; border-left: 3px solid transparent;
}
.colorful-loader--sm  { width: 18px; height: 18px; border-width: 2px; }
.colorful-loader--sm::after { width: 18px; height: 18px; border-width: 2px; }
.colorful-loader--lg  { width: 40px; height: 40px; border-width: 4px; }
.colorful-loader--lg::after { width: 40px; height: 40px; border-width: 4px; }

/* ─── AI Modal ─────────────────────────────────────────────────── */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalSlideUp {
  from { transform: translateY(50px) scale(0.95); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
.ai-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.65); display: flex; justify-content: center;
  align-items: center; z-index: 1050; backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}
.ai-modal {
  background: #fff; color: #1f2937;
  border-radius: 1.25rem;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.3);
  width: 92%; max-width: 760px;
  border: 1px solid rgba(102,126,234,0.15);
  animation: modalSlideUp 0.4s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
}
.ai-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.ai-modal-title { display: flex; align-items: center; gap: 0.85rem; }
.ai-modal-title__icon {
  width: 44px; height: 44px; border-radius: 0.75rem;
  background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
.ai-modal-title h3 { margin: 0; font-size: 1.2rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.12); }
.ai-modal-title__sub { margin: 0.15rem 0 0; font-size: 0.75rem; opacity: 0.8; }
.ai-modal-close-btn {
  background: rgba(255,255,255,0.18); border: none;
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: white; transition: all 0.3s ease;
}
.ai-modal-close-btn:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
.ai-modal-body {
  padding: 2rem; max-height: 65vh; overflow-y: auto;
}
.ai-modal-body::-webkit-scrollbar { width: 7px; }
.ai-modal-body::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 999px; }
.ai-modal-body::-webkit-scrollbar-thumb { background: linear-gradient(135deg,#667eea,#764ba2); border-radius: 999px; }
.ai-modal-loader {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 1rem; min-height: 220px; color: #6b7280;
  text-align: center;
}
.ai-modal-loader p { margin: 0; font-size: 0.9rem; }
.ai-modal-loader__hint { font-size: 0.78rem; color: #9ca3af; }
.ai-analysis-content { display: flex; flex-direction: column; gap: 1.25rem; }
.ai-section {
  background: linear-gradient(135deg,rgba(102,126,234,0.04) 0%,rgba(118,75,162,0.04) 100%);
  border: 1px solid rgba(102,126,234,0.15);
  padding: 1.25rem; border-radius: 0.85rem;
}
.analysis-title {
  font-weight: 800; margin: 0 0 0.75rem;
  display: flex; align-items: center; gap: 0.45rem;
  background: linear-gradient(135deg,#667eea,#764ba2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  font-size: 1rem;
}
.analysis-title svg { color: #667eea; flex-shrink: 0; }
.analysis-text { color: #374151; line-height: 1.7; font-size: 0.9rem; margin: 0; }
.resolution-plan {
  list-style-type: none; padding-left: 0; display: flex; flex-direction: column;
  gap: 0.6rem; counter-reset: step-counter; margin: 0;
}
.resolution-step {
  color: #374151; line-height: 1.65; padding-left: 2.25rem;
  position: relative; counter-increment: step-counter; font-size: 0.88rem;
}
.resolution-step::before {
  content: counter(step-counter);
  position: absolute; left: 0; top: 0;
  background: linear-gradient(135deg,#667eea,#764ba2); color: white;
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.7rem;
  box-shadow: 0 2px 4px rgba(102,126,234,0.35);
}

/* ─── Animations ─────────────────────────────────────────────────── */
@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .summary-cards { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  .analysis-methods__grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .bill-stop-view { padding: var(--spacing-md, 1rem); }
  .page-header { padding: 1.25rem; flex-direction: column; }
  .page-header__title { font-size: 1.5rem; }
  .page-header__actions { flex-direction: column; width: 100%; }
  .page-header__actions .btn { width: 100%; justify-content: center; }
  .summary-cards { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; }
  .summary-card__value { font-size: 24px; }
  .analysis-methods__grid { grid-template-columns: 1fr; gap: 1rem; }
  .form-row { grid-template-columns: 1fr; }
  .results-topbar { flex-direction: column; align-items: flex-start; }
  .result-card__header { grid-template-columns: 1fr; }
  .result-card__header-right { justify-self: start; }
  .result-card__actions { flex-direction: column; }
  .result-card__actions .btn { width: 100%; justify-content: center; }
  .replacement-grid { grid-template-columns: 1fr; }
  .ai-modal { width: 96%; margin: 0.5rem; }
  .ai-modal-body { padding: 1.25rem; }
}
@media (max-width: 480px) {
  .page-header__title { font-size: 1.3rem; }
  .summary-card { padding: 0.85rem; }
  .summary-card__value { font-size: 20px; }
  .readings-table { font-size: 0.72rem; }
  .table th, .table td { padding: 0.4rem 0.5rem; }
}
</style>
