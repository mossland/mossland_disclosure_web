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
        this.baseURL = "https://web3.nodit.io";
    }
    async getToken() {
        return config.Node['X-API-KEY'];
        /*
        const auth_tokens = await axios.post("https://api.luniverse.io/tx/v2.0/auth-tokens", {
            accessKey: config.Node.ACCESSKEY,
            secretKey: config.Node.SECRETKEY,
            expiresIn: 300
        });
        return auth_tokens.data.data.authToken.token;
        */
    }
    /////
    appendTx(txArray, transferEventsItem, start){
        let isStop = false;
        transferEventsItem.forEach( (item) => {
            if (item.timestamp >= start){
                txArray.push(item.timestamp);
            }
            else{
                isStop = true;
                return false;
            }
        });

        return isStop;
    }

    async getTrasferEvent() {
        return new Promise(async resolve => {
            let result = [];

            let now = dayjs();
            let utcNow = dayjs.utc(now);

            let start = dayjs(utcNow).subtract(24, 'hour').unix();

            const options = {
                method: 'GET',
                url: `https://api.luniverse.io/scan/v1.0/chains/0/tokens/${this.contractAddress}/transfer-events?limit=100`,
              };
            let ret = await axios(options);
    
            let data = ret.data.data.transferEvents;
            console.log(ret.data.data.transferEvents);
            let isStop = this.appendTx(result, data.items, start);
            if (data.paging.cursors.after !== null && isStop == false){
                await this.getTrasferAfter(this.contractAddress, data.paging.cursors.after, result, start);
            }
            resolve(result.length);
        });
        
    }
    async getTrasferAfter(address, after, result, start) {
        return new Promise(async resolve => {
            const options = {
                method: 'GET',
                url: `https://api.luniverse.io/scan/v1.0/chains/0/tokens/${address}/transfer-events?limit=100&after=${after}`,
              };
            let ret = await axios(options);
    
            let data = ret.data.data.transferEvents;
            let isStop = this.appendTx(result, data.items, start);
            if (data.paging.cursors.after !== null && isStop == false){
                await this.getTrasferAfter(address, data.paging.cursors.after, result, start)
            }
            resolve();
        });
    }

    /////
    
    async getHourlyTransactionsByContract(start, end){
        let authToken = await this.getToken();
        const url = `/v1/${this.protocol}/${this.network}/stats/getHourlyTransactionsStatsByContract`;
        const axiosConfig = {
            baseURL : this.baseURL,
            url,
            headers: {
                "X-API-KEY": `${authToken}`
            },
            method: "post",
            data: {
                contractAddress: this.contractAddress.toLowerCase(),
                startDateTime: start,
                endDateTime: end,
            }
        };
    
        let res;
        try{
            await new Promise(resolve => setTimeout(resolve, config.Node.delay));
            res = await axios(axiosConfig);
        } catch(error){
            return null;
        }
        
        
        return res.data.items;
    }
    
    async getDailyTransactionsByContract(start, end) {
        let authToken = await this.getToken();
        const url = `/v1/${this.protocol}/${this.network}/stats/getDailyTransactionsStatsByContract`;
        const axiosConfig = {
            baseURL : this.baseURL,
            url,
            headers: {
                "X-API-KEY": `${authToken}`
            },
            method: "post",
            data: {
                contractAddress: this.contractAddress.toLowerCase(),
                startDate: start,
                endDate: end,
            }
        }
    
        let res;
        try{
            await new Promise(resolve => setTimeout(resolve, config.Node.delay));
            res = await axios(axiosConfig);
        } catch(error){
            console.error("Error occurred:", error.message);
            return null;
        }
        
        
        return res.data.items;
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
        //console.log(res.data.data.transferEvents.items);
    
        return res.data.data.transferEvents.items;
    }

    async getTotalTransactionsCount() {
        const url = `/scan/v1.0/chains/0/accounts/${this.contractAddress.toLowerCase()}`;
        const config = {
            baseURL : 'https://api.luniverse.io',
            url,
            method: "get",
        }
        let res = await axios(config);
    
        return res.data.data.account.transactionsCount;
    }
    
    async getHolderCount(){
        const url = `/scan/v1.0/chains/0/tokens/${this.contractAddress.toLowerCase()}`;
        const config = {
            baseURL : 'https://api.luniverse.io',
            url,
            method: "get",
        }
        let res = await axios(config);
        //console.log('getHolderCount : ' + res.data.data.token.holdersCount);
    
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
        // getHourlyTransactionsByContract 장애발생했을때 임시 사용
        let count = await this.getTrasferEvent();
        
        /*
        const format = 'YYYY-MM-DD-HH';
        let now = dayjs();
        let utcNow = dayjs.utc(now);
    
        let end = utcNow.format(format);
        let start = dayjs(utcNow).subtract(24, 'hour').format(format);
    
        const retArr = await this.getHourlyTransactionsByContract(start, end);
        
        let count = await this.getTxCount(retArr);
        */
        //console.log('getLastOneDay : ' + count);

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
        //console.log('getLastOneWeek : ' + count);
    
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
        //console.log('getLastOneMonth : ' + count);
    
        return count;
    };
    
    async getDateList(start, end) {
        let dateList = [];
        const format = 'YYYY-MM-DD';

        let windowSize = 90;
        let startTemp = start;
        let endTemp;
        do{
            endTemp = dayjs(startTemp).add(windowSize, 'day');
            if (end.diff(endTemp) <= 0)
                endTemp = end;
            dateList.push({startDate : dayjs(startTemp).format(format),
                            endDate : dayjs(endTemp).format(format)});

            startTemp = endTemp;
        }while(end.diff(endTemp) > 0);

        return dateList;
    }
    
    async getLastOneYear() {
        let now = dayjs();
        let end = dayjs.utc(now);
        let start = dayjs(end).subtract(1, 'year');

        const dateList = await this.getDateList(start, end);
        let count = await this.getTransactionCount(dateList);
        //console.log('getLastOneYear : ' + count);
    
        return count;
    };

    async getTotalTx() {
        let count = await this.getTotalTransactionsCount();
        //console.log('getTotalTxCount : ' + count);
    
        return count;
    };
};

module.exports = Luniverse;