<template>
  <div class="bill-stop-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-header__title">Bill Stop Analysis</h1>
        <p class="page-header__subtitle">Identify customers with billing issues and missing meter readings</p>
      </div>
      <div class="page-header__actions">
        <button class="btn btn--primary" @click="exportResults" v-if="analysisResults.length > 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Results
        </button>
        <button class="btn btn--secondary" @click="generateReport" :disabled="isGenerating">
          {{ isGenerating ? 'Generating...' : 'Generate Bill Stop Report' }}
        </button>
        <button class="btn btn--outline" @click="downloadBillStopList" :disabled="isDownloading">
          Download Bill Stop Customers (Excel)
        </button>
        <router-link to="/bill-stop-report" class="btn btn--info">
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

    <!-- Summary Bar -->
    <div v-if="reportSummary" class="summary-cards">
      <div class="summary-card total">
        <div class="summary-card__title">Total Bill Stop</div>
        <div class="summary-card__value">{{ reportSummary.totalBillStop }}</div>
      </div>
      <div class="summary-card success">
        <div class="summary-card__title">Current Month Reads</div>
        <div class="summary-card__value">{{ reportSummary.withBillingProfileData }}</div>
      </div>
      <div class="summary-card warn">
        <div class="summary-card__title">No Current Month Reads</div>
        <div class="summary-card__value">{{ reportSummary.withoutBillingProfileData }}</div>
      </div>
      <div class="summary-card info">
        <div class="summary-card__title">Complete Coverage (last 3 months)</div>
        <div class="summary-card__value">{{ reportSummary.completeCoverage ?? '-' }}</div>
      </div>
      <div class="summary-card info">
        <div class="summary-card__title">Partial Coverage (last 3 months)</div>
        <div class="summary-card__value">{{ reportSummary.partialCoverage ?? '-' }}</div>
      </div>
      <div class="summary-card danger">
        <div class="summary-card__title">No Coverage (last 3 months)</div>
        <div class="summary-card__value">{{ reportSummary.noCoverage ?? '-' }}</div>
      </div>
      <div class="summary-card warn">
        <div class="summary-card__title">Installed This Month (No Bill Yet)</div>
        <div class="summary-card__value">{{ reportSummary.installedThisMonthNoBill ?? '-' }}</div>
      </div>
    </div>

    <!-- Analysis Methods -->
    <div class="analysis-methods">
      <div class="analysis-methods__grid">
        <!-- Bulk Analysis Card -->
        <div class="card analysis-card">
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
                <div class="file-upload">
                  <input 
                    type="file" 
                    id="file" 
                    ref="fileInput" 
                    @change="handleFileUpload" 
                    accept=".csv"
                    class="file-upload__input"
                  >
                  <div class="file-upload__display">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span v-if="file">{{ file.name }}</span>
                    <span v-else>Choose a CSV file or drag it here</span>
                  </div>
                </div>
                <div class="form-text">
                  CSV should contain: CUSTOMER_NUM, METER_NO
                </div>
              </div>
              <button type="submit" class="btn btn--primary" :disabled="!file || isAnalyzing">
                <div v-if="isAnalyzing" class="colorful-loader"></div>
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
        <div class="card analysis-card">
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
                <div v-if="isAnalyzing" class="colorful-loader"></div>
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
      <div class="results-header">
        <h2 class="results-title">Analysis Results</h2>
        <div class="results-summary">
          <span class="results-count">{{ analysisResults.length }} customers processed</span>
                          <div class="results-stats">
                  <span class="stat">
                    <span class="stat__label">Analyzed:</span>
                    <span class="stat__value">{{ analysisResults.filter(r => r.status === 'ANALYZED').length }}</span>
                  </span>
                  <span class="stat">
                    <span class="stat__label">Missing Data:</span>
                    <span class="stat__value">{{ analysisResults.filter(r => r.billStopIssues && r.billStopIssues.length > 0).length }}</span>
                  </span>
                  <span class="stat">
                    <span class="stat__label">Errors:</span>
                    <span class="stat__value">{{ analysisResults.filter(r => r.status === 'ERROR').length }}</span>
                  </span>
                </div>
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
            <div class="result-card__status">
              <span class="badge" :class="getStatusBadgeClass(result.status)">
                {{ result.status }}
              </span>
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

          <div class="result-card__content">
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
        </div>
      </div>
    </div>

    <!-- AI Analysis Modal -->
    <div v-if="isAiModalOpen" class="ai-modal-overlay" @click.self="isAiModalOpen = false">
      <div class="ai-modal">
        <div class="ai-modal-header">
          <div class="ai-modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h3>AI Analysis & Resolution</h3>
          </div>
          <button @click="isAiModalOpen = false" class="ai-modal-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="ai-modal-body">
          <div v-if="isAnalyzingWithAi" class="ai-modal-loader">
            <div class="colorful-loader"></div>
            <p>Analyzing with Gemini, please wait...</p>
          </div>
          <div v-if="!isAnalyzingWithAi && aiAnalysisResult" class="ai-analysis-content">
            <div class="analysis-section">
              <h4 class="analysis-title">Root Cause</h4>
              <p class="analysis-text">{{ aiAnalysisResult.rootCause }}</p>
            </div>
            <div class="analysis-section">
              <h4 class="analysis-title">Resolution Plan</h4>
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
import { ref, reactive } from 'vue';
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
/* General Styles */
.bill-stop-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  background-color: var(--color-background);
  min-height: 100vh;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-card {
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: none;
  background: var(--color-surface);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--secondary-500));
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.summary-card.total {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border: 1px solid #e9d5ff;
}
.summary-card.total::before { background: linear-gradient(90deg, #9333ea, #a855f7); }

.summary-card.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #bbf7d0;
}
.summary-card.success::before { background: linear-gradient(90deg, #16a34a, #22c55e); }

.summary-card.warn {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1px solid #ffedd5;
}
.summary-card.warn::before { background: linear-gradient(90deg, #ea580c, #f97316); }

.summary-card.info {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border: 1px solid #bae6fd;
}
.summary-card.info::before { background: linear-gradient(90deg, #0284c7, #0ea5e9); }

.summary-card.danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1px solid #fecaca;
}
.summary-card.danger::before { background: linear-gradient(90deg, #dc2626, #ef4444); }

.summary-card__title {
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.summary-card__value {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-2xl) var(--spacing-3xl);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: 0 20px 25px -5px rgba(102, 126, 234, 0.3), 0 10px 10px -5px rgba(118, 75, 162, 0.2);
  position: relative;
  overflow: hidden;
  animation: slideInDown 0.5s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.page-header__title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  margin-bottom: var(--spacing-sm);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  letter-spacing: -0.025em;
}

.page-header__subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* Analysis Methods */
.analysis-methods {
  margin-bottom: var(--spacing-2xl);
}

.analysis-methods__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: var(--spacing-2xl);
}

.analysis-card {
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
  animation: fadeInScale 0.5s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.analysis-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.analysis-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-color: var(--primary-300);
}

.analysis-card .card__header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-xl);
}

.analysis-card .card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.analysis-card .card__title svg {
  color: #667eea;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

/* Forms */
.upload-form, .individual-form {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  display: block;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  letter-spacing: 0.025em;
}

.form-control {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  outline: none;
}

.file-upload {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 3px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-align: center;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
}

.file-upload:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  transform: scale(1.02);
}

.file-upload:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

/* Buttons */
.btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.025em;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-xl);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #63408b 100%);
}

.btn--secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
}

.btn--success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: white;
}

.btn--info {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border: none;
  color: white;
  text-decoration: none;
}

.btn--info:hover {
  background: linear-gradient(135deg, #36d46a 0%, #2ce8c3 100%);
  color: white;
}

/* Results Section */
.results-section {
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.results-header {
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-xl);
}

.results-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.results-stats {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

/* Result Cards */
.result-card {
  margin-bottom: var(--spacing-2xl);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.result-card__header {
  color: white;
  padding: var(--spacing-xl);
  border-top-left-radius: var(--radius-2xl);
  border-top-right-radius: var(--radius-2xl);
  position: relative;
  overflow: hidden;
}

.result-card__header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -25%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.result-card__header--success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

.result-card__header--error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

.result-card__header--info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

.result-card__header--default {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

.result-card__title h4 {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.result-card__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.result-card__actions .btn {
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Tables */
.readings-table {
  border-collapse: collapse;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.table {
  width: 100%;
}

.table th, .table td {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
}

.table thead {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.table th {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--color-border);
}

.table tbody tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.02);
}

.table tbody tr:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transform: scale(1.01);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Badges */
.badge {
  font-weight: var(--font-weight-bold);
  text-shadow: none;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  letter-spacing: 0.025em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.badge--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.badge--info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.badge--success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
}

.badge--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.badge--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.badge--secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);
}

/* Other styles from original file */
.bill-stop-view {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.page-header__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-header__subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Analysis Methods */
.analysis-methods {
  margin-bottom: var(--spacing-2xl);
}

.analysis-methods__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

.analysis-card {
  height: fit-content;
}

.analysis-card .card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Forms */
.upload-form,
.individual-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.file-upload {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.file-upload:hover {
  border-color: var(--color-border-hover);
  background: var(--color-surface-hover);
}

.file-upload__input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload__display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.file-upload__display svg {
  color: var(--primary-600);
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-xl);
  border-left: 4px solid;
  animation: slideInRight 0.4s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert--success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%);
  border-left-color: #22c55e;
  color: #166534;
}

.alert--danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border-left-color: #ef4444;
  color: #991b1b;
}

.alert--info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  border-left-color: #3b82f6;
  color: #1e40af;
}

.alert__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

/* Results Section */
.results-section {
  margin-top: var(--spacing-2xl);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.results-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.results-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.results-count {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.results-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.stat__value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Result Cards */
.result-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: var(--shadow-md);
}

.result-card__header {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
}

.result-card__header--success {
  background: var(--success-50);
  border-bottom-color: var(--success-200);
}

.result-card__header--error {
  background: var(--danger-50);
  border-bottom-color: var(--danger-200);
}

.result-card__header--info {
  background: var(--primary-50);
  border-bottom-color: var(--primary-200);
}

.result-card__header--default {
  background: var(--color-background-secondary);
}

.result-card__title h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.result-card__title p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.result-card__content {
  padding: var(--spacing-lg);
}

/* Replacement Info */
.replacement-info {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.replacement-info h5 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--primary-800);
  font-weight: var(--font-weight-semibold);
}

.replacement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.replacement-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.replacement-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.replacement-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Issues Summary */
.issues-summary {
  background: var(--warning-50);
  border: 1px solid var(--warning-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.issues-summary h5 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--warning-800);
  font-weight: var(--font-weight-semibold);
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.issue-item {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.issue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.issue-stats {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.issue-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.issue-detail {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.issue-detail__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.issue-detail__type {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.issue-detail__description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-xs);
}

.issue-detail__date {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.analysis-period-info {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--primary-800);
}

/* Analysis Details */
.analysis-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.analysis-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.analysis-section__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.analysis-status {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-background-tertiary);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.readings-table {
  overflow-x: auto;
}

/* Table Enhancements */
.table__row--warning {
  background: var(--warning-50);
}

.table__row--warning:hover {
  background: var(--warning-100);
}

/* Badge Enhancements */
.badge--info {
  background: var(--primary-100);
  color: var(--primary-800);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .analysis-methods__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .bill-stop-view {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
  }

  .page-header__title {
    font-size: var(--font-size-3xl);
  }

  .page-header__actions {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
  }

  .page-header__actions .btn {
    width: 100%;
    justify-content: center;
  }

  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }

  .summary-card__value {
    font-size: 24px;
  }

  .analysis-methods__grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .results-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
    width: 100%;
  }

  .results-stats {
    flex-direction: column;
    width: 100%;
  }

  .replacement-grid {
    grid-template-columns: 1fr;
  }

  .issue-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .result-card__actions {
    flex-direction: column;
    width: 100%;
  }

  .result-card__actions .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header__title {
    font-size: var(--font-size-2xl);
  }

  .summary-card {
    padding: var(--spacing-md);
  }

  .summary-card__title {
    font-size: 12px;
  }

  .summary-card__value {
    font-size: 20px;
  }

  .result-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .readings-table {
    font-size: var(--font-size-xs);
  }

  .table th, .table td {
    padding: var(--spacing-sm);
  }

  .ai-modal {
    width: 95%;
    margin: var(--spacing-sm);
  }
}

/* Colorful Loader */
.colorful-loader {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  border-top: 3px solid #667eea;
  border-right: 3px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.colorful-loader::after {
  content: '';
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border-bottom: 3px solid #764ba2;
  border-left: 3px solid transparent;
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Loading animation for buttons */
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.btn:disabled:hover {
  box-shadow: none !important;
}

/* Issues Section Enhancements */
.issues-summary {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.issues-summary h5 {
  margin: 0 0 var(--spacing-lg) 0;
  color: #92400e;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.issue-item {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.issue-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.issue-detail {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border: 1px solid var(--color-border);
  border-left: 3px solid #667eea;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: all 0.2s ease;
}

.issue-detail:hover {
  border-left-color: #764ba2;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}

/* Analysis Section Improvements */
.analysis-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface);
  transition: all 0.3s ease;
}

.analysis-section:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.analysis-section__title {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.analysis-status {
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  font-weight: var(--font-weight-medium);
}

/* AI Modal Styles */
.ai-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ai-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #1f2937;
  border-radius: var(--radius-2xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 700px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(50px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.ai-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-2xl);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.ai-modal-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.ai-modal-title svg {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.ai-modal-title h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ai-modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.ai-modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.ai-modal-body {
  padding: var(--spacing-2xl);
  max-height: 60vh;
  overflow-y: auto;
}

.ai-modal-body::-webkit-scrollbar {
  width: 8px;
}

.ai-modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: var(--radius-full);
}

.ai-modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-full);
}

.ai-modal-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  min-height: 200px;
  color: var(--color-text-secondary);
}

.ai-analysis-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.ai-analysis-content .analysis-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.ai-analysis-content .analysis-title {
  font-weight: var(--font-weight-bold);
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: #1f2937;
  font-size: var(--font-size-lg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.analysis-text {
  color: #374151;
  line-height: 1.7;
  font-size: var(--font-size-base);
}

.resolution-plan {
  list-style-type: none;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  counter-reset: step-counter;
}

.resolution-step {
  color: #374151;
  line-height: 1.7;
  padding-left: var(--spacing-2xl);
  position: relative;
  counter-increment: step-counter;
}

.resolution-step::before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}
</style>