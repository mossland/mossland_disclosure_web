const express = require("express");
const cors = require('cors');
const axios = require('axios');
const app = express();
const mysql = require('mysql2'); 
const https = require('https');
const fs = require('fs');
const Luniverse = require("./luniverse.js");
const Upbit = require("./upbit.js");
const GitHub = require("./github.js");

require("dotenv").config();
const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA, 
        connectionLimit : 10
};

const pool = mysql.createPool(config);

let memDB = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());


app.get("/api/getTotalTx", async (req, res) => {
    const key = 'getTotalTx';
    return res.send(getMocInfo(key));
});

app.get("/api/getLastYearTx", async (req, res) => {
    const key = 'getLastYearTx';
    return res.send(getMocInfo(key));
});

app.get("/api/getLastMonthTx", async (req, res) => {
    const key = 'getLastMonthTx';
    return res.send(getMocInfo(key));
});

app.get("/api/getLastWeekTx", async (req, res) => {
    const key = 'getLastWeekTx';
    return res.send(getMocInfo(key));
});

app.get("/api/getLastDayTx", async (req, res) => {
    const key = 'getLastDayTx';
    return res.send(getMocInfo(key));
});

app.get("/api/getHolderCount", async (req, res) => {
    const key = 'getHolderCount';
    return res.send(getMocInfo(key));
});

app.get("/api/getLastTx", async (req, res) => {
    const key = 'getLastTx';
    return res.send(getMocInfo(key));
});

app.get("/api/getTickerKrw", async (req, res) => {
    const key = 'getTickerKrw';
    return res.send(getMocInfo(key));
});

app.get("/api/getYearKrw", async (req, res) => {
    const key = 'getYearKrw';
    return res.send(getMocInfo(key));
});

app.get("/api/getMonthKrw", async (req, res) => {
    const key = 'getMonthKrw';
    return res.send(getMocInfo(key));
});

app.get("/api/getWeekKrw", async (req, res) => {
    const key = 'getWeekKrw';
    return res.send(getMocInfo(key));
});

app.get("/api/getDayKrw", async (req, res) => {
    const key = 'getDayKrw';
    return res.send(getMocInfo(key));
});

app.get("/api/getOrderbookKrw", async (req, res) => {
    const key = 'getOrderbookKrw';
    return res.send(getMocInfo(key));
});

app.get("/api/getLastKrwTx", async (req, res) => {
    const key = 'getLastKrwTx';
    return res.send(getMocInfo(key));
});

app.get("/api/getAccTradeVolumeKrw", async (req, res) => {
    const key = 'getAccTradeVolumeKrw';
    return res.send(getMocInfo(key));
});

app.get("/api/getCommitCount", async (req, res) => {
    const key = 'getCommitCount';
    return res.send(getMocInfo(key));
});

app.get("/api/getCodeFrequency", async (req, res) => {
    const key = 'getCodeFrequency';
    return res.send(getMocInfo(key));
});

app.get("/api/market", (req, res) => {
    console.log(pool);
    pool.getConnection((error, connection) =>{
        if (!error){
            console.log(connection)
            connection.query('SELECT * FROM mossland_disclosure.market_data', (error, result, field)=>{
                if (!error){
                    console.log(result);
                    connection.release()
                    res.send(result);
                }
                else{
                    res.send({ok: false});
                    throw error
                }
            })
        }
        else{
            res.send({ok: false});
            console.log(error);
        }
    });
});

app.get("/api/recent_release", (req, res) => {
    console.log(pool);
    pool.getConnection((error, connection) =>{
        if (!error){
            console.log(connection)
            connection.query('SELECT * FROM mossland_disclosure.release_schedule WHERE date BETWEEN NOW() - INTERVAL 3 MONTH AND NOW()', (error, result, field)=>{
                if (!error){
                    console.log(result);
                    connection.release()
                    res.send(result);
                }
                else{
                    res.send({ok: false});
                    throw error
                }
            })
        }
        else{
            res.send({ok: false});
            console.log(error);
        }
    });
});

app.get("/api/expected_release", (req, res) => {
    console.log(pool);
    pool.getConnection((error, connection) =>{
        if (!error){
            console.log(connection)
            connection.query('SELECT * FROM mossland_disclosure.release_schedule WHERE date >= CURDATE() AND date <= (CURDATE() + INTERVAL 3 MONTH)', (error, result, field)=>{
                if (!error){
                    console.log(result);
                    connection.release()
                    res.send(result);
                }
                else{
                    res.send({ok: false});
                    throw error
                }
            })
        }
        else{
            res.send({ok: false});
            console.log(error);
        }
    });
});

app.get("/api/disclosure", (req, res) => {
    console.log(pool);
    pool.getConnection((error, connection) =>{
        if (!error){
            console.log(connection)
            connection.query('SELECT * FROM mossland_disclosure.disclosure ORDER BY date DESC', (error, result, field)=>{
                if (!error){
                    console.log(result);
                    connection.release()
                    res.send(result);
                }
                else{
                    res.send({ok: false});
                    throw error
                }
            })
        }
        else{
            res.send({ok: false});
            console.log(error);
        }
    });
});

app.get("/api/materials", (req, res) => {
    console.log(pool);
    pool.getConnection((error, connection) =>{
        if (!error){
            console.log(connection)
            connection.query('SELECT * FROM mossland_disclosure.materials ORDER BY date DESC', (error, result, field)=>{
                if (!error){
                    console.log(result);
                    connection.release()
                    res.send(result);
                }
                else{
                    res.send({ok: false});
                    throw error
                }
            })
        }
        else{
            res.send({ok: false});
            console.log(error);
        }
    });
});

app.listen(3000, () => console.log("Server start"));


function getMocInfo (key){    
    if (memDB.has(key))
        return memDB.get(key);
    else
        return {success : false};
}

setMocInfo();
setMocLoop();
getCoinCap();
getCoinLoop();

function setMocLoop (){    
    setTimeout(() => {
        setMocInfo();
        setMocLoop();
    }, 15000);
}

async function setMocInfo(){    
    const ln = new Luniverse();
    {
        const ret =  await ln.getTotalTx();
        memDB.set('getTotalTx', {count : ret.toString()});
    }
    {
        const ret =  await ln.getLastOneYear();
        memDB.set('getLastYearTx', {count : ret.toString()});
    }
    {
        const ret =  await ln.getLastOneMonth();
        memDB.set('getLastMonthTx', {count : ret.toString()});
    }
    {
        const ret =  await ln.getLastOneWeek();
        memDB.set('getLastWeekTx', {count : ret.toString()});
    }
    {
        const ret =  await ln.getLastOneDay();
        memDB.set('getLastDayTx', {count : ret.toString()});
    }
    {
        const ret =  await ln.getHolderCount();
        memDB.set('getHolderCount', {count : ret.toString()});
    }
    {
        const ret =  await ln.getLastTx();
        const jsonString = JSON.stringify(ret)
        memDB.set('getLastTx', jsonString.toString());
    }

    const ub = new Upbit();
    {
        const ret =  await ub.getTickerKrw();
        const jsonString = JSON.stringify(ret)
        memDB.set('getTickerKrw', jsonString.toString());
    }
    {
        const ret =  await ub.getYearKrw();
        const jsonString = JSON.stringify(ret)
        memDB.set('getYearKrw', jsonString.toString());
    }
    {
        const ret =  await ub.getMonthKrw();
        const jsonString = JSON.stringify(ret)
        memDB.set('getMonthKrw', jsonString.toString());
    }

    {
        const ret =  await ub.getWeekKrw();
        const jsonString = JSON.stringify(ret)
        memDB.set('getWeekKrw', jsonString.toString());
    }

    {
        const ret =  await ub.getDayKrw();
        const jsonString = JSON.stringify(ret)
        memDB.set('getDayKrw', jsonString.toString());
    }
    {
        const ret =  await ub.getOrderbookKrw();
        const jsonString = JSON.stringify(ret)
        memDB.set('getOrderbookKrw', jsonString.toString());
    }
    {
        let ret =  await ub.getLastKrwTx();
        const jsonString = JSON.stringify(ret)
        memDB.set('getLastKrwTx', jsonString.toString());
    }
    {
        let ret =  await ub.getAccTradeVolumeKrw();
        const jsonString = JSON.stringify(ret)
        memDB.set('getAccTradeVolumeKrw', jsonString.toString());
    }

    const gb = new GitHub();
    {
        let ret =  await gb.getWeeklyCodeCount();
        const jsonString = JSON.stringify(ret)
        memDB.set('getCodeFrequency', jsonString.toString());
    }
    {
        let ret =  await gb.getWeeklyCommitCount();
        const jsonString = JSON.stringify(ret)
        memDB.set('getCommitCount', jsonString.toString());
    }
}

function getCoinLoop (){    
    setTimeout(() => {
        getCoinCap();

        getCoinLoop();
    }, 1000 * 60 * 10);
}

async function getCoinCap (){    
    getCoinmarketCap();
    getCoingeckoCap();
    getMosslandCap();
}

function updateMarketCap(marketInfo){
    pool.getConnection((error, connection) =>{
        if (!error){
           {
                console.log(marketInfo.name + "_circulating_supply");
                let sql = "UPDATE `mossland_disclosure`.`market_data` SET `number` = '?' WHERE (`market_type` = ?)";
                let params = [marketInfo.circulatingSupply, marketInfo.name + '_circulating_supply']
                connection.query(sql, params, (error, result, field)=>{
                    if (!error){
                        console.log(result);
                        connection.release()
                    }
                    else{
                        throw error
                    }
                })
            }
            {
                console.log(marketInfo.name + "_marketcap_krw");
                let sql = "UPDATE `mossland_disclosure`.`market_data` SET `number` = '?' WHERE (`market_type` = ?)";
                let params = [marketInfo.marketCap_krw, marketInfo.name + '_marketcap_krw']
                connection.query(sql, params, (error, result, field)=>{
                    if (!error){
                        console.log(result);
                        connection.release()
                    }
                    else{
                        throw error
                    }
                })
            }
            {
                console.log(marketInfo.name + "_marketcap_usd");
                let sql = "UPDATE `mossland_disclosure`.`market_data` SET `number` = '?' WHERE (`market_type` = ?)";
                let params = [marketInfo.marketCap_usd, marketInfo.name + '_marketcap_usd']
                connection.query(sql, params, (error, result, field)=>{
                    if (!error){
                        console.log(result);
                        connection.release()
                    }
                    else{
                        throw error
                    }
                })
            }
            {
                if (marketInfo.name == "mossland"){
                    console.log(marketInfo.name + "_max_supply");
                    let sql = "UPDATE `mossland_disclosure`.`market_data` SET `number` = '?' WHERE (`market_type` = ?)";
                    let params = [marketInfo.maxSupply, marketInfo.name + '_max_supply']
                    connection.query(sql, params, (error, result, field)=>{
                        if (!error){
                            console.log(result);
                            connection.release()
                        }
                        else{
                            throw error
                        }
                    })
                }
            }
            
        }
        else{
            console.log(error);
        }
    });

}
function getCoinmarketCap() {    
    let response = null;
    new Promise(async (resolve, reject) => {
        let ret = {
            name : 'coinmarketcap',
            maxSupply : 0, 
            circulatingSupply : 0,
            marketCap_usd : 0,
            marketCap_krw : 0
        };
        try {
            response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=2915&convert=USD', {
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
            },
            });
        } catch(ex) {
            response = null;
            // error
            console.log(ex);
            reject(ex);
        }
        if (response) {
            // success
            const json = response.data;

            ret.maxSupply = json.data['2915'].max_supply;
            ret.circulatingSupply = json.data['2915'].circulating_supply;
            ret.marketCap_usd = json.data['2915'].quote.USD.market_cap;
        }

        try {
            response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=2915&convert=KRW', {
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
            },
            });
        } catch(ex) {
            response = null;
            // error
            console.log(ex);
            reject(ex);
        }
        if (response) {
            // success
            const json = response.data;
            ret.marketCap_krw = json.data['2915'].quote.KRW.market_cap;
            
        }

        updateMarketCap(ret);
        console.log(ret);
        resolve(ret);
    });
}

function getCoingeckoCap() {    
    let response = null;
    new Promise(async (resolve, reject) => {
        let ret = {
            name : 'coingecko',
            maxSupply : 0, 
            circulatingSupply : 0,
            marketCap_usd : 0,
            marketCap_krw : 0
        };

        try {
            response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=mossland', {
                headers: {
                    "Accept-Encoding": "gzip,deflate,compress"
                },
            });
        } catch(ex) {
            response = null;
            console.log(ex);
            reject(ex);
        }
        if (response) {
            console.log('success');
            const json = response.data;

            ret.marketCap_usd =  json[0].market_cap;
            ret.maxSupply =  json[0].max_supply;
            ret.circulatingSupply =  json[0].circulating_supply;
        }

        try {
            response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=krw&ids=mossland', {
                headers: {
                    "Accept-Encoding": "gzip,deflate,compress"
                },
            });
        } catch(ex) {
            response = null;
            console.log(ex);
            reject(ex);
        }
        if (response) {
            console.log('success');
            const json = response.data;
            ret.marketCap_krw =  json[0].market_cap;
        }

        updateMarketCap(ret);
        console.log(ret);
        resolve(true);
    });
}


function getMosslandCap() {    
    let response = null;
    new Promise(async (resolve, reject) => {
        try {
            response = await axios.get('https://api.moss.land/MOC/info ', {
            });
        } catch(ex) {
            response = null;
            // error
            console.log(ex);
            reject(ex);
        }
        if (response) {
            // success
            const json = response.data;

            let ret = {
                name : 'mossland',
                maxSupply : 0, 
                circulatingSupply : 0,
                marketCap_usd : 0,
                marketCap_krw : 0
            };
            
            json.forEach(function(data, idx){
                if (data.currencyCode ==='USD'){
                    ret.maxSupply = data.maxSupply;
                    ret.circulatingSupply = data.circulatingSupply;
                    ret.marketCap_usd = data.marketCap;
                }
                if (data.currencyCode ==='KRW'){
                    ret.marketCap_krw = data.marketCap;
                }
            });

            updateMarketCap(ret);
            console.log(ret);
            resolve(ret);
        }
    });
    
}