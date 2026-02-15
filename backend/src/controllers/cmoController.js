const axios = require('axios');

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
 * POST /api/cmo/check-mdm-entry — Proxy to CMO API POST /api/cmo/check-mdm-entry
 * Checks all CMO records against Customer DB and updates IsMDMEntry
 */
exports.checkMDMEntry = async (req, res) => {
  try {
    const token = await getCmoApiToken();

    const response = await axios.post(`${CMO_API_URL}/cmo/check-mdm-entry`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 120000
    });

    return res.json(response.data);
  } catch (error) {
    console.error('CMO check MDM entry proxy error:', error.response?.data || error.message);
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
