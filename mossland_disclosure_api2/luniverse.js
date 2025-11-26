const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const config = require("./config.json");

dayjs.extend(utc);
dayjs.extend(timezone);

class Luniverse {
  constructor() {
    this.protocol = "luniverse"; // e.g., luniverse, ethereum
    this.network = "mainnet"; // e.g., mainnet, goerli
    this.contractAddress = "0x8bbfe65e31b348cd823c62e02ad8c19a84dd0dab"; // e.g., 0xabc...
    this.baseURL = "https://web3.nodit.io";
  }
  async getToken() {
    return config.Node["X-API-KEY"];
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
  appendTx(txArray, transferEventsItem, start) {
    let isStop = false;
    transferEventsItem.forEach((item) => {
      if (item.timestamp >= start) {
        txArray.push(item.timestamp);
      } else {
        isStop = true;
        return false;
      }
    });

    return isStop;
  }

  async getTrasferEvent() {
    return new Promise(async (resolve) => {
      let result = [];

      let now = dayjs();
      let utcNow = dayjs.utc(now);

      let start = dayjs(utcNow).subtract(24, "hour").unix();

      const options = {
        method: "GET",
        url: `https://api.luniverse.io/scan/v1.0/chains/0/tokens/${this.contractAddress}/transfer-events?limit=100`,
      };
      let ret = await axios(options);

      let data = ret.data.data.transferEvents;
      console.log(ret.data.data.transferEvents);
      let isStop = this.appendTx(result, data.items, start);
      if (data.paging.cursors.after !== null && isStop == false) {
        await this.getTrasferAfter(
          this.contractAddress,
          data.paging.cursors.after,
          result,
          start
        );
      }
      resolve(result.length);
    });
  }
  async getTrasferAfter(address, after, result, start) {
    return new Promise(async (resolve) => {
      const options = {
        method: "GET",
        url: `https://api.luniverse.io/scan/v1.0/chains/0/tokens/${address}/transfer-events?limit=100&after=${after}`,
      };
      let ret = await axios(options);

      let data = ret.data.data.transferEvents;
      let isStop = this.appendTx(result, data.items, start);
      if (data.paging.cursors.after !== null && isStop == false) {
        await this.getTrasferAfter(
          address,
          data.paging.cursors.after,
          result,
          start
        );
      }
      resolve();
    });
  }

  /////

  async getHourlyTransactionsByContract(start, end) {
    let authToken = await this.getToken();
    const url = `/v1/${this.protocol}/${this.network}/stats/getHourlyTransactionsStatsByContract`;
    const axiosConfig = {
      baseURL: this.baseURL,
      url,
      headers: {
        "X-API-KEY": `${authToken}`,
      },
      method: "post",
      data: {
        contractAddress: this.contractAddress.toLowerCase(),
        startDateTime: start,
        endDateTime: end,
      },
    };

    let res;
    try {
      await new Promise((resolve) => setTimeout(resolve, config.Node.delay));
      res = await axios(axiosConfig);
    } catch (error) {
      return null;
    }

    return res.data.items;
  }

  async getDailyTransactionsByContract(start, end) {
    let authToken = await this.getToken();
    const url = `/v1/${this.protocol}/${this.network}/stats/getDailyTransactionsStatsByContract`;
    const axiosConfig = {
      baseURL: this.baseURL,
      url,
      headers: {
        "X-API-KEY": `${authToken}`,
      },
      method: "post",
      data: {
        contractAddress: this.contractAddress.toLowerCase(),
        startDate: start,
        endDate: end,
      },
    };

    let res;
    try {
      await new Promise((resolve) => setTimeout(resolve, config.Node.delay));
      res = await axios(axiosConfig);
    } catch (error) {
      console.error("Error occurred:", error.message);
      return null;
    }

    return res.data.items;
  }

  async getLastTransactions(limitCount) {
    const url = `/scan/v1.0/chains/0/tokens/${this.contractAddress.toLowerCase()}/transfer-events`;
    const config = {
      baseURL: "https://api.luniverse.io",
      url,
      method: "get",
      params: {
        limit: limitCount,
      },
    };
    let res = await axios(config);
    //console.log(res.data.data.transferEvents.items);

    return res.data.data.transferEvents.items;
  }

  async getTotalTransactionsCount() {
    const url = `https://api.ethplorer.io/getTokenInfo/${this.contractAddress}?apiKey=${process.env.ETHPLORER_API_KEY}`;
    try {
      const res = await axios.get(url);
      const data = res.data;
      return data.transfersCount || 0;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  async getHolderCount() {
    const url = `https://api.ethplorer.io/getTokenInfo/${this.contractAddress}?apiKey=${process.env.ETHPLORER_API_KEY}`;
    try {
      const res = await axios.get(url);
      const data = res.data;
      return data.holdersCount || 0;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  async getTxCount(arr) {
    //arr.sort((a, b) => (a.date > b.date) ? 1: -1);
    const unique1 = [
      ...arr
        .reduce((map, obj) => {
          if (!map.has(obj.date)) map.set(obj.date, obj);
          return map;
        }, new Map())
        .values(),
    ];

    let sum = 0;
    for (const element of unique1) {
      sum += element.count;
    }
    return sum;
  }

  async getTransactionCount(dateList) {
    let retArr = [];

    for (const element of dateList) {
      let ret = await this.getDailyTransactionsByContract(
        element.startDate,
        element.endDate
      );
      retArr = retArr.concat(ret);
    }
    let count = await this.getTxCount(retArr);

    return count;
  }

  async getLastTx() {
    const ethplorerConfig = {
      baseURL: "https://api.ethplorer.io",
      url: `/getTokenHistory/${this.contractAddress}`,
      method: "get",
      params: {
        limit: 10,
        apiKey: process.env.ETHPLORER_API_KEY,
      },
      headers: {
        "Accept-Encoding": "identity",
      },
      decompress: false,
    };

    try {
      const res = await axios(ethplorerConfig);
      const operations = res.data.operations || [];

      return operations.map((op) => ({
        txHash: op.transactionHash,
        from: op.from,
        to: op.to,
        value: op.value,
        timestamp: op.timestamp,
      }));
    } catch (error) {
      console.error("Ethplorer API Error (Last 10 Txs):", error.message);
      console.error(error);
      return [];
    }
  }

  async getTotalHolder() {
    return await this.getHolderCount();
  }

  async _fetchTxListRecursive(
    startTimestamp,
    endTimestamp,
    nextTimestampParam = null,
    collectedTxs = []
  ) {
    const pageSize = 1000;

    const ethplorerConfig = {
      baseURL: "https://api.ethplorer.io",
      url: `/getTokenHistory/${this.contractAddress}`,
      method: "get",
      params: {
        apiKey: process.env.ETHPLORER_API_KEY,
        limit: pageSize,
        ...(nextTimestampParam && { timestamp: nextTimestampParam }),
      },
      headers: { "Accept-Encoding": "identity" },
      decompress: false,
      timeout: 30000,
    };

    try {
      const response = await axios(ethplorerConfig);
      const operations = response.data.operations || [];

      if (operations.length === 0) {
        console.log("더 이상 가져올 데이터가 없습니다.");
        return collectedTxs;
      }

      const filteredBatch = [];
      let stopRecursion = false;

      for (const tx of operations) {
        const txTime = tx.timestamp;

        if (txTime >= endTimestamp) {
          continue;
        }

        if (txTime < startTimestamp) {
          stopRecursion = true;
          break;
        }

        filteredBatch.push(tx);
      }

      collectedTxs.push(...filteredBatch);

      if (stopRecursion) {
        return collectedTxs;
      }

      if (operations.length < pageSize) {
        console.log(`[종료] 데이터 끝. 총 수집: ${collectedTxs.length}개`);
        return collectedTxs;
      }

      const lastTx = operations[operations.length - 1];
      const nextTimestamp = lastTx.timestamp;

      return this._fetchTxListRecursive(
        startTimestamp,
        endTimestamp,
        nextTimestamp,
        collectedTxs
      );
    } catch (error) {
      console.error("API Error:", error.message);
      return collectedTxs;
    }
  }

  async getLastOneDay() {
    const endTimestamp = dayjs().utc().startOf("day").unix();
    const startTimestamp = dayjs()
      .utc()
      .startOf("day")
      .subtract(1, "day")
      .unix();
    const tx24hList = await this._fetchTxListRecursive(
      startTimestamp,
      endTimestamp
    );

    return tx24hList.length;
  }

  async getLastOneWeek() {
    let dateList = [];
    const format = "YYYY-MM-DD";
    let now = dayjs();
    let utcNow = dayjs.utc(now);

    let end = utcNow.format(format);
    let start = dayjs(utcNow).subtract(1, "week").format(format);
    dateList.push({ startDate: start, endDate: end });

    let count = await this.getTransactionCount(dateList);
    //console.log('getLastOneWeek : ' + count);

    return count;
  }

  async getLastOneMonth() {
    let dateList = [];
    const format = "YYYY-MM-DD";
    let now = dayjs();
    let utcNow = dayjs.utc(now);

    let end = utcNow.format(format);
    let start = dayjs(utcNow).subtract(1, "month").format(format);
    dateList.push({ startDate: start, endDate: end });

    let count = await this.getTransactionCount(dateList);
    //console.log('getLastOneMonth : ' + count);

    return count;
  }

  async getDateList(start, end) {
    let dateList = [];
    const format = "YYYY-MM-DD";

    let windowSize = 90;
    let startTemp = start;
    let endTemp;
    do {
      endTemp = dayjs(startTemp).add(windowSize, "day");
      if (end.diff(endTemp) <= 0) endTemp = end;
      dateList.push({
        startDate: dayjs(startTemp).format(format),
        endDate: dayjs(endTemp).format(format),
      });

      startTemp = endTemp;
    } while (end.diff(endTemp) > 0);

    return dateList;
  }

  async getLastOneYear() {
    let now = dayjs();
    let end = dayjs.utc(now);
    let start = dayjs(end).subtract(1, "year");

    const dateList = await this.getDateList(start, end);
    let count = await this.getTransactionCount(dateList);
    //console.log('getLastOneYear : ' + count);

    return count;
  }

  async getTotalTx() {
    let count = await this.getTotalTransactionsCount();
    //console.log('getTotalTxCount : ' + count);

    return count;
  }
}

module.exports = Luniverse;
