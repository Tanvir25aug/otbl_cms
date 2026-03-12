const { getPool, sql } = require('../config/sqlServerOTBL');

/**
 * Truncate BillStopSnapshot and bulk-insert fresh customer records.
 * @param {Array} customers - array from getBillStopCustomers internal logic
 * @returns {number} rows inserted
 */
const saveSnapshot = async (customers) => {
  const pool = await getPool();

  // Delete previous snapshot
  await pool.request().query('TRUNCATE TABLE [dbo].[BillStopSnapshot]');

  if (!customers || customers.length === 0) return 0;

  // Build a bulk-insert table
  const table = new sql.Table('BillStopSnapshot');
  table.create = false;
  table.columns.add('CUSTOMER_NUM',                 sql.VarChar(50),    { nullable: true });
  table.columns.add('CUSTOMER_NAME',                sql.NVarChar(200),  { nullable: true });
  table.columns.add('ADDRESS',                      sql.NVarChar(500),  { nullable: true });
  table.columns.add('MOBILE_NO',                    sql.VarChar(50),    { nullable: true });
  table.columns.add('METER_NO',                     sql.VarChar(50),    { nullable: true });
  table.columns.add('CONN_DATE',                    sql.Date,           { nullable: true });
  table.columns.add('TARIFF',                       sql.VarChar(50),    { nullable: true });
  table.columns.add('LAST_BILL_DATE',               sql.Date,           { nullable: true });
  table.columns.add('HAS_CURRENT_MONTH_READ',       sql.Bit,            { nullable: false });
  table.columns.add('COVERAGE',                     sql.VarChar(30),    { nullable: true });
  table.columns.add('INSTALLED_THIS_MONTH_NO_BILL', sql.Bit,            { nullable: false });

  for (const c of customers) {
    table.rows.add(
      c.CUSTOMER_NUM   || null,
      c.CUSTOMER_NAME  || null,
      c.ADDRESS        || null,
      c.MOBILE_NO      || null,
      c.METER_NO       || null,
      c.CONN_DATE      ? new Date(c.CONN_DATE)      : null,
      c.TARIFF         || null,
      c.LAST_BILL_DATE ? new Date(c.LAST_BILL_DATE) : null,
      c.hasCurrentMonthRead      ? 1 : 0,
      c.coverage       || null,
      c.installedThisMonthNoBill ? 1 : 0
    );
  }

  const result = await pool.request().bulk(table);
  return result.rowsAffected;
};

/**
 * GET /api/bill-stop/snapshot
 * Returns the saved bill stop customers from OTBL_CMS with optional filters & pagination.
 */
exports.getSnapshot = async (req, res) => {
  try {
    const pool = await getPool();

    const page      = Math.max(1, parseInt(req.query.page  || '1'));
    const limit     = Math.min(500, Math.max(1, parseInt(req.query.limit || '100')));
    const offset    = (page - 1) * limit;
    const coverage  = req.query.coverage  || '';
    const tariff    = req.query.tariff    || '';
    const search    = req.query.search    || '';
    const hasRead   = req.query.hasRead   || ''; // 'yes' | 'no'
    const installed = req.query.installed || ''; // 'yes' | 'no'

    const request = pool.request();

    let where = 'WHERE 1=1';

    if (coverage) {
      request.input('coverage', sql.VarChar(30), coverage);
      where += ' AND COVERAGE = @coverage';
    }
    if (tariff) {
      request.input('tariff', sql.VarChar(50), tariff);
      where += ' AND TARIFF = @tariff';
    }
    if (search) {
      request.input('search', sql.VarChar(100), `%${search}%`);
      where += ' AND (CUSTOMER_NUM LIKE @search OR METER_NO LIKE @search OR CUSTOMER_NAME LIKE @search)';
    }
    if (hasRead === 'yes')  where += ' AND HAS_CURRENT_MONTH_READ = 1';
    if (hasRead === 'no')   where += ' AND HAS_CURRENT_MONTH_READ = 0';
    if (installed === 'yes') where += ' AND INSTALLED_THIS_MONTH_NO_BILL = 1';
    if (installed === 'no')  where += ' AND INSTALLED_THIS_MONTH_NO_BILL = 0';

    request.input('limit',  sql.Int, limit);
    request.input('offset', sql.Int, offset);

    // Count query with same parameters
    const countReq = pool.request();
    if (coverage)  countReq.input('coverage', sql.VarChar(30), coverage);
    if (tariff)    countReq.input('tariff',   sql.VarChar(50), tariff);
    if (search)    countReq.input('search',   sql.VarChar(100), `%${search}%`);
    if (hasRead === 'yes' || hasRead === 'no') {} // literal in where
    if (installed === 'yes' || installed === 'no') {} // literal in where
    const countRes = await countReq.query(`SELECT COUNT(*) AS total FROM [dbo].[BillStopSnapshot] ${where}`);
    const total = countRes.recordset[0].total;

    const dataRes = await request.query(
      `SELECT * FROM [dbo].[BillStopSnapshot] ${where}
       ORDER BY CUSTOMER_NUM
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`
    );

    // Get snapshot date from first record
    const snapshotDate = dataRes.recordset.length > 0 ? dataRes.recordset[0].SNAPSHOT_DATE : null;

    return res.json({
      success: true,
      data: {
        customers: dataRes.recordset,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        snapshotDate
      }
    });
  } catch (error) {
    console.error('BillStopSnapshot getSnapshot error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch snapshot' });
  }
};

/**
 * GET /api/bill-stop/snapshot/summary
 * Returns aggregated report stats from the saved snapshot.
 */
exports.getSnapshotSummary = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        COUNT(*)                                                     AS totalBillStop,
        SUM(CASE WHEN HAS_CURRENT_MONTH_READ = 1 THEN 1 ELSE 0 END) AS withBillingProfileData,
        SUM(CASE WHEN HAS_CURRENT_MONTH_READ = 0 THEN 1 ELSE 0 END) AS withoutBillingProfileData,
        SUM(CASE WHEN COVERAGE = 'COMPLETE_COVERAGE'  THEN 1 ELSE 0 END) AS completeCoverage,
        SUM(CASE WHEN COVERAGE = 'PARTIAL_COVERAGE'   THEN 1 ELSE 0 END) AS partialCoverage,
        SUM(CASE WHEN COVERAGE = 'NO_COVERAGE'        THEN 1 ELSE 0 END) AS noCoverage,
        SUM(CASE WHEN INSTALLED_THIS_MONTH_NO_BILL = 1 THEN 1 ELSE 0 END) AS installedThisMonthNoBill,
        MAX(SNAPSHOT_DATE) AS snapshotDate
      FROM [dbo].[BillStopSnapshot]
    `);

    const tariffResult = await pool.request().query(`
      SELECT TARIFF, COUNT(*) AS cnt
      FROM [dbo].[BillStopSnapshot]
      WHERE TARIFF IS NOT NULL
      GROUP BY TARIFF
      ORDER BY cnt DESC
    `);

    return res.json({
      success: true,
      data: {
        ...result.recordset[0],
        tariffBreakdown: tariffResult.recordset
      }
    });
  } catch (error) {
    console.error('BillStopSnapshot getSnapshotSummary error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch snapshot summary' });
  }
};

module.exports = { ...exports, saveSnapshot };
