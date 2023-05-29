const axios = require('axios');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const config = require("./config.json");

dayjs.extend(utc);
dayjs.extend(timezone);

class Luniverse{
    constructor() {
        this.protocol = "luniverse"; // e.g., luniverse, ethereum
        this.network = "mainnet"; // e.g., mainnet, goerli
        this.contractAddress = "0x878120A5C9828759A250156c66D629219F07C5c6"; // e.g., 0xabc...
        this.baseURL = "https://web3.luniverse.io";
    }
    async getToken() {
        const options = {
            method: 'POST',
            url: 'https://web3.luniverse.io/v1/auth-token',
            headers: {
              accept: 'application/json',
              'X-NODE-ID': config.Node.NodeId,
              'X-Key-ID': config.Node.KeyId,
              'X-Key-Secret': config.Node.SecretKey,
            },
          };
        let ret = await axios(options);
        return ret.data.access_token;
    }
    
    async getHourlyTransactionsByContract(start, end){
        let authToken = await this.getToken();
        const url = `/v1/${this.protocol}/${this.network}/stats/hourly/contract/${this.contractAddress.toLowerCase()}/transactions`;
        const config = {
            baseURL : this.baseURL,
            url,
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            method: "get",
            params: {
                startDateTime: start,
                endDateTime: end,
            }
        };
    
        let res = await axios(config);
        return res.data.data.items;
    }
    
    async getDailyTransactionsByContract(start, end) {
        let authToken = await this.getToken();
        const url = `/v1/${this.protocol}/${this.network}/stats/daily/contract/${this.contractAddress.toLowerCase()}/transactions`;
        const config = {
            baseURL : this.baseURL,
            url,
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            method: "get",
            params: {
                startDate: start,
                endDate: end,
            }
        }
    
        let res = await axios(config);
        return res.data.data.items;
    }
    
    async getLastTransactions (limitCount) {
        const url = `/scan/v1.0/chains/0/tokens/${this.contractAddress.toLowerCase()}/transfer-events`;
        const config = {
            baseURL : 'https://api.luniverse.io',
            url,
            method: "get",
            params: {
                limit : limitCount
            }
        }
        let res = await axios(config);
        console.log(res.data.data.transferEvents.items);
    
        return res.data.data.transferEvents.items;
    }
    
    async getHolderCount(){
        const url = `/scan/v1.0/chains/0/tokens/${this.contractAddress.toLowerCase()}`;
        const config = {
            baseURL : 'https://api.luniverse.io',
            url,
            method: "get",
        }
        let res = await axios(config);
        console.log('getHolderCount : ' + res.data.data.token.holdersCount);
    
        return res.data.data.token.holdersCount;
        
    }
        
    async getTxCount(arr) {
        //arr.sort((a, b) => (a.date > b.date) ? 1: -1);
        const unique1 = [...
            arr.reduce((map, obj) => {
                if(!map.has(obj.date)) map.set(obj.date, obj);
                return map;
            }, new Map)
            .values()
        ];
    
        let sum = 0;
        for(const element of unique1) {
            sum += element.count;
        }
        return sum;
    };
    
    async getTransactionCount(dateList){
        let retArr = [];
    
        for(const element of dateList) {
            let ret = await this.getDailyTransactionsByContract(element.startDate, element.endDate);
            retArr = retArr.concat(ret);
        }
        let count = await this.getTxCount(retArr);
    
        return count;
    }
    
    async getLastTx() {
        return await this.getLastTransactions(10);
    };
    
    async getTotalHolder() {
        return await this.getHolderCount();
    };
    
    async getLastOneDay() {
        const format = 'YYYY-MM-DD-HH';
        let now = dayjs();
        let utcNow = dayjs.utc(now);
    
        let end = utcNow.format(format);
        let start = dayjs(utcNow).subtract(24, 'hour').format(format);
    
        const retArr = await this.getHourlyTransactionsByContract(start, end);
        
        let count = await this.getTxCount(retArr);
        console.log('getLastOneDay : ' + count);

        return count;
    }
    
    async getLastOneWeek() {
        let dateList = [];
        const format = 'YYYY-MM-DD';
        let now = dayjs();
        let utcNow = dayjs.utc(now);
    
        let end = utcNow.format(format);
        let start = dayjs(utcNow).subtract(1, 'week').format(format);
        dateList.push({startDate : start, endDate : end});
    
        let count = await this.getTransactionCount(dateList);
        console.log('getLastOneWeek : ' + count);
    
        return count;
    };
    
    async getLastOneMonth() {
        let dateList = [];
        const format = 'YYYY-MM-DD';
        let now = dayjs();
        let utcNow = dayjs.utc(now);
    
        let end = utcNow.format(format);
        let start = dayjs(utcNow).subtract(1, 'month').format(format);
        dateList.push({startDate : start, endDate : end});
    
        let count = await this.getTransactionCount(dateList);
        console.log('getLastOneMonth : ' + count);
    
        return count;
    };
    
    async getLastOneYear() {
        let dateList = [];
        const format = 'YYYY-MM-DD';
        let now = dayjs();
        let utcNow = dayjs.utc(now);
        let newEnd = utcNow.format(format);
        for(let i = 1; ; i++){
            let subDay = i * 90;
            if (subDay > 365) subDay = 365; 
            let start = dayjs(utcNow).subtract(subDay, 'day').format(format);
            dateList.push({startDate : start, endDate : newEnd});
            newEnd = start;
            if (subDay >= 365) break;
        }
    
        let count = await this.getTransactionCount(dateList);
        console.log('getLastOneYear : ' + count);
        return count;
    };
};

module.exports = Luniverse;