const axios = require('axios');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

class Bithumb{
    constructor() {
        this.baseURL = 'https://api.bithumb.com';
        this.btcMarket = 'BTC-MOC';
        this.krwMarket = 'KRW-MOC';

    }
    async getLastTx(marketType, limit) {
        const url = `/v1/trades/ticks`;
        const config = {
            baseURL : this.baseURL,
            url,
            method: "get",
            params: {
                market: marketType,
                count: limit,
            }
        }

        let res = await axios(config);
        return res.data;
    }

    async getTicker(marketType) {
        const url = `/v1/ticker`;
        const config = {
            baseURL : this.baseURL,
            url,
            method: "get",
            params: {
                markets: marketType,
            }
        }

        let res = await axios(config);
        return res.data;
    }

    async getOrderBook(marketType) {
        const url = `/v1/orderbook`;
        const config = {
            baseURL : this.baseURL,
            url,
            method: "get",
            params: {
                markets: marketType,
            }
        }

        let res = await axios(config);
        return res.data;
    }

    async getCandle(candleType, marketType, count){
        const url = `/v1/candles/${candleType}`;
        const config = {
            baseURL : this.baseURL,
            url,
            method: "get",
            params: {
                market: marketType,
                count: count,
            }
        }

        let res = await axios(config);
        return res.data;
    }

    async getDaysCandle(marketType, count) {
        return await this.getCandle('days', marketType, count);
    }

    async getWeeksCandle(marketType, count) {
        return await this.getCandle('weeks', marketType, count);
    }

    async getMonthCandle(marketType, count) {
        return await this.getCandle('months', marketType, count);
    }

    async getAccVolume(data){
        let accVol = 0;
        for(const element of data) {
            accVol += element.candle_acc_trade_volume;
        }

        return accVol;
    }

    async getHighLowPrice(data){
        let lowPrice = -1;
        let highPrice = -1;
        for(const element of data) {
            if (lowPrice < 0 || element.low_price < lowPrice)
                lowPrice = element.low_price;

            if (highPrice < 0 || element.high_price > highPrice)
                highPrice = element.high_price;
        }

        return {lowPrice, highPrice};
    }

    async getInfo(data){
        let accVolume = await this.getAccVolume(data);
        let hlValue = await this.getHighLowPrice(data);

        //console.log(hlValue);

        return {
            volume: accVolume, 
            high_price: hlValue.highPrice, 
            low_price: hlValue.lowPrice
        };
    }


    async getLastKrwTx() {
        return await this.getLastTx(this.krwMarket, 10);
    };


    async getOrderbookKrw() {
        return await this.getOrderBook(this.krwMarket);
    };


    async getDayKrw() {
        let ret =  await this.getDaysCandle(this.krwMarket, 1);
        let info = this.getInfo(ret);

        return info;
    };

    async getWeekKrw() {
        let ret = await this.getDaysCandle(this.krwMarket, 7);
        let info = this.getInfo(ret);

        return info;
    };
    

    async getMonthKrw() {
        let ret = await this.getDaysCandle(this.krwMarket, 31);
        let info = this.getInfo(ret);

        return info;
    };   

    async getYearKrw() {
        let ret = await this.getWeeksCandle(this.krwMarket, 53);
        let info = this.getInfo(ret);

        return info;
    }; 

    async getTickerKrw() {
        let ret = await this.getTicker(this.krwMarket);
        return ret;
    }; 
    
    async getAccTradeVolumeKrw() {
        let ret = await this.getMonthCandle(this.krwMarket, 200);
        let info = this.getInfo(ret);
        
        return info;
    }; 
}

module.exports = Bithumb;