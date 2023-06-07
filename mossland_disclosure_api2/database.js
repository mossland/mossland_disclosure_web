const mysql = require('mysql2/promise'); 
require("dotenv").config();

const db_config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA, 
    connectionLimit : 20
};
const pool = mysql.createPool(db_config);

class Database{  
    constructor() {
    }
    async setData(table, key, value){
        const connection = await pool.getConnection();
        try{
            let sql = "INSERT INTO mossland_disclosure." + table + " (query_type, json_value) values(?, ?)\
                            ON DUPLICATE KEY UPDATE\
                            query_type = ?,\
                            json_value = ?;";
            let params = [key, value, key, value];
            const [rows] = await connection.query(sql, params);
            connection.release();
            return rows;
        }
        catch(err){
            connection.release();
            return {success : false};
        }
    }

    async getData(table, key){
        const connection = await pool.getConnection();
        try{
            let sql = "SELECT json_value FROM mossland_disclosure." + table+ " WHERE query_type = ?;";
            let params = [key];
            const [rows] = await connection.query(sql, params);
            connection.release();
            return rows[0].json_value;
        }
        catch(err){
            connection.release();
            return {success : false};
        }
    }

    async getGithubData(key){
        return await this.getData('github', key);
    }
    async setGithubData(key, value){
        return await this.setData('github', key, value);
    }
    async getLuniverseData(key){
        return await this.getData('luniverse', key);
    }
    async setLuniverseData(key, value){
        return await this.setData('luniverse', key, value);
    }
    async getUpbitData(key){
        return await this.getData('upbit', key);
    }
    async setUpbitData(key, value){
        return await this.setData('upbit', key, value);
    }
}

module.exports = Database;