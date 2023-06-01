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
const Database = require("./database.js");

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
const db = new Database();

//let memDB = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());


app.get("/api/getTotalTx", async (req, res) => {
    const key = 'getTotalTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

app.get("/api/getLastYearTx", async (req, res) => {
    const key = 'getLastYearTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

app.get("/api/getLastMonthTx", async (req, res) => {
    const key = 'getLastMonthTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

app.get("/api/getLastWeekTx", async (req, res) => {
    const key = 'getLastWeekTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

app.get("/api/getLastDayTx", async (req, res) => {
    const key = 'getLastDayTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

app.get("/api/getHolderCount", async (req, res) => {
    const key = 'getHolderCount';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

app.get("/api/getLastTx", async (req, res) => {
    const key = 'getLastTx';
    const ret = await db.getLuniverseData(key);
    return res.send(ret);
});

app.get("/api/getTickerKrw", async (req, res) => {
    const key = 'getTickerKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getYearKrw", async (req, res) => {
    const key = 'getYearKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getMonthKrw", async (req, res) => {
    const key = 'getMonthKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getWeekKrw", async (req, res) => {
    const key = 'getWeekKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getDayKrw", async (req, res) => {
    const key = 'getDayKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getOrderbookKrw", async (req, res) => {
    const key = 'getOrderbookKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getLastKrwTx", async (req, res) => {
    const key = 'getLastKrwTx';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getAccTradeVolumeKrw", async (req, res) => {
    const key = 'getAccTradeVolumeKrw';
    const ret = await db.getUpbitData(key);
    return res.send(ret);
});

app.get("/api/getCommitCount", async (req, res) => {
    const key = 'getCommitCount';
    const ret = await db.getGithubData(key);
    return res.send(ret);
});

app.get("/api/getCodeFrequency", async (req, res) => {
    const key = 'getCodeFrequency';
    const ret = await db.getGithubData(key);
    return res.send(ret);
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
                    connection.release();
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


// function getMocInfo (key){    
//     if (memDB.has(key))
//         return memDB.get(key);
//     else
//         return {success : false};
// }

getCoinCap();
getCoinLoop();

setLuniverseInfo();
setLuniverseLoop();

setGitHubInfo();
setGithubLoop();

setUpbitInfo();
setUpbitLoop();

function setLuniverseLoop (){    
    setTimeout(() => {
        setLuniverseInfo();
        setLuniverseLoop();
    }, 60 * 1000);
}

function setGithubLoop (){    
    setTimeout(() => {
        setGitHubInfo();
        setGithubLoop();
    }, 1000 * 60 * 10);
}


function setUpbitLoop (){    
    setTimeout(() => {
        setUpbitInfo();
        setUpbitLoop();
    }, 1000 * 10);
}

async function setUpbitInfo(){    
    const ub = new Upbit();
    {
        const key = 'getTickerKrw';
        const ret =  await ub.getTickerKrw();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getYearKrw';
        const ret =  await ub.getYearKrw();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getMonthKrw';
        const ret =  await ub.getMonthKrw();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());
        //memDB.set(key, jsonString.toString());
    }

    {
        const key = 'getWeekKrw';
        const ret =  await ub.getWeekKrw();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());
        //memDB.set(key, jsonString.toString());
    }

    {
        const key = 'getDayKrw';
        const ret =  await ub.getDayKrw();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getOrderbookKrw';
        const ret =  await ub.getOrderbookKrw();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getLastKrwTx';
        let ret =  await ub.getLastKrwTx();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getAccTradeVolumeKrw';
        let ret =  await ub.getAccTradeVolumeKrw();
        const jsonString = JSON.stringify(ret);
        await  db.setUpbitData(key, jsonString.toString());
        //memDB.set(key, jsonString.toString());
    }
}

async function setGitHubInfo(){    
    const gb = new GitHub();
    {
        const key = 'getCodeFrequency';
        let ret =  await gb.getWeeklyCodeCount();
        const jsonString = JSON.stringify(ret);
        await  db.setGithubData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getCommitCount';
        let ret =  await gb.getWeeklyCommitCount();
        const jsonString = JSON.stringify(ret)
        await  db.setGithubData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
}

async function setLuniverseInfo(){    
    const ln = new Luniverse();
    {
        const key = 'getTotalTx';
        const ret =  await ln.getTotalTx();
        const jsonString = JSON.stringify({count : ret.toString()});
        await  db.setLuniverseData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getLastYearTx';
        const ret =  await ln.getLastOneYear();
        const jsonString = JSON.stringify({count : ret.toString()});
        await  db.setLuniverseData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getLastMonthTx';
        const ret =  await ln.getLastOneMonth();
        const jsonString = JSON.stringify({count : ret.toString()});
        await  db.setLuniverseData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getLastWeekTx';
        const ret =  await ln.getLastOneWeek();
        const jsonString = JSON.stringify({count : ret.toString()});
        await  db.setLuniverseData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getLastDayTx';
        const ret =  await ln.getLastOneDay();
        const jsonString = JSON.stringify({count : ret.toString()});
        await  db.setLuniverseData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getHolderCount';
        const ret =  await ln.getHolderCount();
        const jsonString = JSON.stringify({count : ret.toString()});
        await  db.setLuniverseData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
    }
    {
        const key = 'getLastTx';
        const ret =  await ln.getLastTx();
        const jsonString = JSON.stringify(ret);
        await  db.setLuniverseData(key, jsonString.toString());        
        //memDB.set(key, jsonString.toString());
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