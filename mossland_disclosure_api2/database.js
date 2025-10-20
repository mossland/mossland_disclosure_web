const mysql = require("mysql2/promise");
require("dotenv").config();

function mask(v) {
  if (!v) return v;           // undefined/null/''은 그대로 표시
  if (v.length <= 4) return '*'.repeat(v.length);
  return v.slice(0, 2) + '***' + v.slice(-2);
}

const env = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SCHEMA: process.env.DB_SCHEMA,
};

console.log('[ENV CHECK]');
console.log('  DB_HOST    =', env.DB_HOST);
console.log('  DB_PORT    =', env.DB_PORT);
console.log('  DB_USERNAME=', env.DB_USERNAME);
console.log('  DB_PASSWORD=', env.DB_PASSWORD);
console.log('  DB_SCHEMA  =', env.DB_SCHEMA);


const db_config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SCHEMA,
  connectionLimit: 20,
};
const pool = mysql.createPool(db_config);

class Database {
  constructor() {}
  async setData(table, key, value) {
    const connection = await pool.getConnection();
    try {
      let sql =
        "INSERT INTO mossland_disclosure." +
        table +
        " (query_type, json_value) values(?, ?)\
                            ON DUPLICATE KEY UPDATE\
                            query_type = ?,\
                            json_value = ?;";
      let params = [key, value, key, value];
      const [rows] = await connection.query(sql, params);
      connection.release();
      return rows;
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async getData(table, key) {
    const connection = await pool.getConnection();
    try {
      let sql =
        "SELECT json_value FROM mossland_disclosure." +
        table +
        " WHERE query_type = ?;";
      let params = [key];
      const [rows] = await connection.query(sql, params);
      connection.release();
      return rows[0].json_value;
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async getData2(table) {
    const connection = await pool.getConnection();
    try {
      let sql =
        "SELECT * FROM mossland_disclosure." + table + " ORDER BY date DESC";
      const result = await connection.query(sql);
      connection.release();
      return result[0];
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async getMarket() {
    const connection = await pool.getConnection();
    try {
      let sql = "SELECT * FROM mossland_disclosure.market_data";
      const result = await connection.query(sql);
      connection.release();
      return result[0];
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async getRecentRelease() {
    const connection = await pool.getConnection();
    try {
      let sql =
        "SELECT * FROM mossland_disclosure.release_schedule WHERE date BETWEEN NOW() - INTERVAL 3 MONTH AND NOW()";
      const result = await connection.query(sql);
      connection.release();
      return result[0];
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async getExpectedEelease() {
    const connection = await pool.getConnection();
    try {
      let sql =
        "SELECT * FROM mossland_disclosure.release_schedule WHERE date >= CURDATE() AND date <= (CURDATE() + INTERVAL 3 MONTH)";
      const result = await connection.query(sql);
      connection.release();
      return result[0];
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async setWmocInfo(value) {
    const jsonString = JSON.stringify(value.wmocLastTx);
    const connection = await pool.getConnection();
    try {
      let sql =
        "UPDATE mossland_disclosure.wmoc_info SET\
                            maxSupplyWmoc = ?,\
                            supplyableWmoc = ?,\
                            mocBalance = ?,\
                            mocCirculatingSupply = ?,\
                            wmocLastTx = ?,\
                            pausedWmoc = ?,\
                            totalTransfersCount = '?',\
                            holderCount = '?'\
                            WHERE (`id` = '0');";
      let params = [
        value.maxSupplyWmoc,
        value.supplyableWmoc,
        value.mocBalance,
        value.mocCirculatingSupply,
        jsonString,
        value.pausedWmoc,
        value.totalTransfersCount,
        value.holderCount,
      ];

      const [rows] = await connection.query(sql, params);
      connection.release();
      return rows;
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async getWmocInfo() {
    const connection = await pool.getConnection();
    try {
      let sql = "SELECT * FROM mossland_disclosure.wmoc_info";
      const result = await connection.query(sql);
      connection.release();
      return result[0][0];
    } catch (err) {
      connection.release();
      return { success: false };
    }
  }

  async getGithubData(key) {
    return await this.getData("github", key);
  }
  async setGithubData(key, value) {
    return await this.setData("github", key, value);
  }
  async getLuniverseData(key) {
    return await this.getData("luniverse", key);
  }
  async setLuniverseData(key, value) {
    return await this.setData("luniverse", key, value);
  }
  async getUpbitData(key) {
    return await this.getData("upbit", key);
  }
  async setUpbitData(key, value) {
    return await this.setData("upbit", key, value);
  }
  async getBithumbData(key) {
    return await this.getData("bithumb", key);
  }
  async setBithumbData(key, value) {
    return await this.setData("bithumb", key, value);
  }
  async getCoinoneData(key) {
    return await this.getData("coinone", key);
  }
  async setCoinoneData(key, value) {
    return await this.setData("coinone", key, value);
  }
  async getMaterials() {
    return await this.getData2("materials");
  }
  async getDisclosure() {
    return await this.getData2("disclosure");
  }
}

module.exports = Database;
