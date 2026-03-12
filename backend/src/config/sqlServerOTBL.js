const sql = require('mssql');

const config = {
  server: process.env.OTBL_CMS_DB_SERVER || '192.168.10.104',
  port: parseInt(process.env.OTBL_CMS_DB_PORT || '1433'),
  database: process.env.OTBL_CMS_DB_NAME || 'OTBL_CMS',
  user: process.env.OTBL_CMS_DB_USER || 'sa',
  password: process.env.OTBL_CMS_DB_PASSWORD || 'sqlbis@^7*',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

const getPool = async () => {
  if (pool && pool.connected) return pool;
  pool = await sql.connect(config);
  return pool;
};

module.exports = { getPool, sql };
