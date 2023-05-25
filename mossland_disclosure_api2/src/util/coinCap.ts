import axios from 'axios';
import DB from '../db/db';

export interface IMarketInfo {
    name: string;
    circulatingSupply: number | string;
    marketCap_krw: number | string;
}

export async function updateMarketCap(marketInfo: IMarketInfo){
    try {
        const conn = await DB.instance.conn();
        await Promise.all(
            [
                new Promise((resolve, reject) => {
                    conn.query(
                        'UPDATE `mossland_disclosure`.`market_data` SET `number` = "?" WHERE (`market_type` = ?)',
                        [marketInfo.circulatingSupply, marketInfo.name + '_circulating_supply'],
                        (error, result, field)=>{
                            
                            if (!error){
                                resolve(result);
                            }
                            else{
                                reject(error);
                            }
                        }
                    );
                }),
                new Promise((resolve, reject) => {
                    conn.query(
                        'UPDATE `mossland_disclosure`.`market_data` SET `number` = "?" WHERE (`market_type` = ?)',
                        [marketInfo.marketCap_krw, marketInfo.name + '_marketcap_krw'],
                        (error, result, field)=>{
                            if (!error) {

                                console.log(result);
                                connection.release()
                            }
                            else{
                                throw error
                            }
                        }
                    );
                })
            ]
        );
        conn.release();
    } catch (e) {
        conn.release();
    } finally {
        conn.release();
    }
    
    pool.getConnection((error, connection) =>{
        if (!error) {
           {
                console.log(marketInfo.name + "_circulating_supply");
                let sql = ;
                let params = 
                connection.query(sql, params, )
            }
            {
                console.log(marketInfo.name + "_marketcap_krw");
                let sql = "";
                let params = 
                connection.query(sql, params, )
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
export async function getCoinmarketCap() {    
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

export async function getCoingeckoCap() {    
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

export async function getMosslandCap() {    
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