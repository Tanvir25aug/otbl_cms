const axios = require('axios');
const { Op } = require('sequelize');
const Customer = require('../models/Customer');

const CMO_API_URL = process.env.CMO_API_URL || 'http://192.168.10.100:8085/api';
const CMO_API_USERNAME = process.env.CMO_API_USERNAME;
const CMO_API_PASSWORD = process.env.CMO_API_PASSWORD;

// Cache the CMO API token
let cachedToken = null;
let tokenExpiry = null;

/**
 * Login to the CMO API and cache the JWT token
 */
const getCmoApiToken = async () => {
  // Return cached token if still valid (refresh 5 min before expiry)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${CMO_API_URL}/auth/login`, {
      username: CMO_API_USERNAME,
      password: CMO_API_PASSWORD
    });

    if (response.data.success && response.data.data.accessToken) {
      cachedToken = response.data.data.accessToken;
      // Token typically expires in 24h, refresh after 23h
      tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
      return cachedToken;
    }

    throw new Error('Failed to obtain CMO API token - no accessToken in response');
  } catch (error) {
    console.error('CMO API login error:', error.response?.data || error.message);
    cachedToken = null;
    tokenExpiry = null;
    throw new Error(`Failed to authenticate with CMO API: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * GET /api/cmo — Proxy to CMO API GET /api/cmo
 * Passes query params: page, limit, status, search, sortBy, sortOrder
 */
exports.getCMOs = async (req, res) => {
  try {
    const token = await getCmoApiToken();
    const { page, limit, isApproved, search, sortBy, sortOrder } = req.query;

    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (isApproved !== undefined && isApproved !== '') params.isApproved = isApproved;
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axios.get(`${CMO_API_URL}/cmo/cms-list`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
      timeout: 30000
    });

    return res.json(response.data);
  } catch (error) {
    console.error('CMO proxy error:', error.response?.data || error.message);
    // If auth failed, clear token so next request retries login
    if (error.response?.status === 401) {
      cachedToken = null;
      tokenExpiry = null;
    }
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Failed to fetch CMO data';
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * POST /api/cmo/check-mdm-entry — Orchestrator
 * 1. Fetches unchecked records from CMO API
 * 2. Matches against CMS SQLite Customer table (CUSTOMER_NUM or METER_NO)
 * 3. Bulk updates matched records via CMO API
 */
exports.checkMDMEntry = async (req, res) => {
  try {
    const token = await getCmoApiToken();

    // Step 1: Get unchecked records from CMO API
    const uncheckedRes = await axios.get(`${CMO_API_URL}/cmo/unchecked-mdm`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 60000
    });

    const uncheckedRecords = uncheckedRes.data?.data || [];

    if (uncheckedRecords.length === 0) {
      return res.json({
        success: true,
        data: { checked: 0, foundInCustomerDB: 0, updated: 0 },
        message: 'MDM Entry check completed - no records to check'
      });
    }

    // Step 2: Extract unique values for matching
    const customerIds = [...new Set(
      uncheckedRecords
        .map(r => r.CustomerId)
        .filter(id => id != null && String(id).trim() !== '')
        .map(id => String(id).trim())
    )];

    const meterNos = [...new Set(
      uncheckedRecords
        .map(r => r.NewMeterNoOCR)
        .filter(m => m != null && String(m).trim() !== '')
        .map(m => String(m).trim())
    )];

    // Step 3: Batch query CMS SQLite Customer table
    const matchedCustomerNums = new Set();
    const matchedMeterNos = new Set();
    const chunkSize = 500;

    // Check CUSTOMER_NUM matches
    for (let i = 0; i < customerIds.length; i += chunkSize) {
      const chunk = customerIds.slice(i, i + chunkSize);
      const results = await Customer.findAll({
        where: { CUSTOMER_NUM: { [Op.in]: chunk } },
        attributes: ['CUSTOMER_NUM'],
        raw: true
      });
      results.forEach(r => matchedCustomerNums.add(r.CUSTOMER_NUM));
    }

    // Check METER_NO matches
    for (let i = 0; i < meterNos.length; i += chunkSize) {
      const chunk = meterNos.slice(i, i + chunkSize);
      const results = await Customer.findAll({
        where: { METER_NO: { [Op.in]: chunk } },
        attributes: ['METER_NO'],
        raw: true
      });
      results.forEach(r => matchedMeterNos.add(r.METER_NO));
    }

    // Step 4: Determine which record IDs matched on either condition
    const matchedIds = uncheckedRecords
      .filter(r => {
        const custId = r.CustomerId != null ? String(r.CustomerId).trim() : '';
        const meterNo = r.NewMeterNoOCR != null ? String(r.NewMeterNoOCR).trim() : '';
        return (custId && matchedCustomerNums.has(custId)) ||
               (meterNo && matchedMeterNos.has(meterNo));
      })
      .map(r => r.Id);

    const foundCount = matchedIds.length;

    // Step 5: Bulk update matched records via CMO API
    let updatedCount = 0;
    const updateChunkSize = 1000;

    for (let i = 0; i < matchedIds.length; i += updateChunkSize) {
      const chunk = matchedIds.slice(i, i + updateChunkSize);
      const updateRes = await axios.post(`${CMO_API_URL}/cmo/bulk-update-mdm`, { ids: chunk }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60000
      });
      updatedCount += updateRes.data?.data?.updated || 0;
    }

    console.log(`MDM Entry check: checked ${uncheckedRecords.length}, found ${foundCount} in CMS Customer DB, updated ${updatedCount} records`);

    return res.json({
      success: true,
      data: {
        checked: uncheckedRecords.length,
        foundInCustomerDB: foundCount,
        updated: updatedCount
      },
      message: `MDM Entry check completed. ${updatedCount} records updated.`
    });

  } catch (error) {
    console.error('CMO check MDM entry error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      cachedToken = null;
      tokenExpiry = null;
    }
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Failed to check MDM entries';
    return res.status(statusCode).json({ success: false, message });
  }
};

/**
 * GET /api/cmo/statistics — Proxy to CMO API GET /api/cmo/statistics
 */
exports.getCMOStatistics = async (req, res) => {
  try {
    const token = await getCmoApiToken();

    const response = await axios.get(`${CMO_API_URL}/cmo/cms-statistics`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000
    });

    return res.json(response.data);
  } catch (error) {
    console.error('CMO statistics proxy error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      cachedToken = null;
      tokenExpiry = null;
    }
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Failed to fetch CMO statistics';
    return res.status(statusCode).json({ success: false, message });
  }
};
