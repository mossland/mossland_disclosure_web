import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default class Upbit{
    private baseURL: string;
    private btcMarket: string;
    private krwMarket: string;

    constructor() {
        this.baseURL = 'https://api.upbit.com';
        this.btcMarket = 'BTC-MOC';
        this.krwMarket = 'KRW-MOC';

    }

    public async getLastTx(marketType: string, limit: number) {
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

    public async getTicker(marketType: string) {
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

    public async getOrderBook(marketType: string) {
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

    public async getCandle(candleType: string, marketType: string, count: number){
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

    public async getDaysCandle(marketType: string, count: number) {
        return await this.getCandle('days', marketType, count);
    }

    public async getWeeksCandle(marketType: string, count: number) {
        return await this.getCandle('weeks', marketType, count);
    }

    public async getMonthCandle(marketType: string, count: number) {
        return await this.getCandle('months', marketType, count);
    }

    public async getAccVolume(data: any){
        let accVol = 0;
        for(const element of data) {
            accVol += element.candle_acc_trade_volume;
        }

        return accVol;
    }

    public async getHighLowPrice(data: any){
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

    public async getInfo(data: any){
        let accVolume = await this.getAccVolume(data);
        let hlValue = await this.getHighLowPrice(data);

        //console.log(hlValue);

        return {
            volume: accVolume, 
            high_price: hlValue.highPrice, 
            low_price: hlValue.lowPrice
        };
    }


    public async getLastBtcTx() {
        return await this.getLastTx(this.btcMarket, 10);
    };

    public async getLastKrwTx() {
        return await this.getLastTx(this.krwMarket, 10);
    };

    public async getOrderbookBtc() {
        return await this.getOrderBook(this.btcMarket);
    };

    public async getOrderbookKrw() {
        return await this.getOrderBook(this.krwMarket);
    };

    public async getDayBtc() {
        let ret = await this.getDaysCandle(this.btcMarket, 1);
        let info = this.getInfo(ret);

        return info;
    };

    public async getDayKrw() {
        let ret =  await this.getDaysCandle(this.krwMarket, 1);
        let info = this.getInfo(ret);

        return info;
    };

    public async getWeekBtc() {
        let ret = await this.getDaysCandle(this.btcMarket, 7);
        let info = this.getInfo(ret);

        return info;
    };

    public async getWeekKrw() {
        let ret = await this.getDaysCandle(this.krwMarket, 7);
        let info = this.getInfo(ret);

        return info;
    };
    
    public async getMonthBtc() {
        let ret = await this.getDaysCandle(this.btcMarket, 31);
        let info = this.getInfo(ret);

        return info;
    };

    public async getMonthKrw() {
        let ret = await this.getDaysCandle(this.krwMarket, 31);
        let info = this.getInfo(ret);

        return info;
    };   
    public async getYearBtc() {
        let ret = await this.getWeeksCandle(this.btcMarket, 53);
        let info = this.getInfo(ret);

        return info;
    };

    public async getYearKrw() {
        let ret = await this.getWeeksCandle(this.krwMarket, 53);
        let info = this.getInfo(ret);

        return info;
    }; 

    public async getTickerKrw() {
        let ret = await this.getTicker(this.krwMarket);
        return ret;
    }; 

    public async getTickerBtc() {
        let ret = await this.getTicker(this.btcMarket);
        return ret;
    }; 
    public async getAccTradeVolumeKrw() {
        let ret = await this.getMonthCandle(this.krwMarket, 200);
        let info = this.getInfo(ret);
        
        return info;
    }; 

    public async getAccTradeVolumeBtc() {
        let ret = await this.getMonthCandle(this.btcMarket, 200);
        let info = this.getInfo(ret);

        return info;
    }; 
}
