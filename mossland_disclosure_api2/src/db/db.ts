import mysql from "mysql2"; 
import { promisify } from "es6-promisify";

export default class DB {
    public static init() {
        DB._instance = new DB();
    }
    public static get instance() {
        if (!DB._instance) DB._instance = new DB();
        return DB._instance;
    }
    private static _instance: DB;


    private pool: mysql.Pool;

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT!),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_SCHEMA, 
            connectionLimit : 10
        });
    }

    public async conn(): Promise<mysql.PoolConnection> {
        try {
            const getConn = promisify(this.pool.getConnection);
            const connection = await getConn();
            return connection;
        } catch (e) {
            throw e;
        }
    }
    public async getData(table: string, key: string){
        const connection = await this.conn();
        try{
            let sql = "SELECT json_value FROM mossland_disclosure." + table+ " WHERE query_type = ?;";
            let params = [key];
            const [rows]: any = await connection.query(sql, params);
            connection.release();
            return rows[0].json_value;
        }
        catch(err){
            connection.release();
            return {success : false};
        }
    }
    public async setData(table: string, key: string, value: any) {
        const connection = await this.conn();
        try{
            let sql = "INSERT INTO mossland_disclosure." + table + " (query_type, json_value) values(?, ?)\
                            ON DUPLICATE KEY UPDATE\
                            query_type = ?,\
                            json_value = ?;";
            let params = [key, value, key, value];
            const [rows]: any = await connection.query(sql, params);
            connection.release();
            return rows;
        }
        catch(err){
            connection.release();
            return {success : false};
        }
    }
}