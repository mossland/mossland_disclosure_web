// Gopax.js
const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

class Gopax {
  constructor() {
    this.baseURL = "https://api.gopax.co.kr";

    // DB에 저장된 Upbit/Bithumb 쪽 마켓 코드 (csv에서 보이던 값)
    this.krwMarket = "KRW-MOC";
    // GOPAX API 실제 거래쌍 이름
    this.krwTradingPair = "MOC-KRW";
  }

  // ───────────────────────────
  // 공통 HTTP 래퍼
  // ───────────────────────────
  async _request(config) {
    const base = {
      baseURL: this.baseURL,
      method: "get",
      ...config,
    };
    const res = await axios(base);
    return res.data;
  }

  // ───────────────────────────
  // GOPAX raw API 래퍼
  // ───────────────────────────

  // 최근 체결
  async _getRawTrades(tradingPair, limit) {
    return await this._request({
      url: `/trading-pairs/${tradingPair}/trades`,
      params: { limit },
    });
  }

  // 티커
  async _getRawTicker(tradingPair) {
    return await this._request({
      url: `/trading-pairs/${tradingPair}/ticker`,
    });
  }

  // 24h 통계 (open/high/low/close/volume)
  async _getRawStats(tradingPair) {
    return await this._request({
      url: `/trading-pairs/${tradingPair}/stats`,
    });
  }

  // 오더북
  async _getRawOrderBook(tradingPair, level = 2) {
    return await this._request({
      url: `/trading-pairs/${tradingPair}/book`,
      params: { level },
    });
  }

  // 캔들: [time(ms), low, high, open, close, volume]
  async _getRawCandles(tradingPair, start, end, interval, limit) {
    const data = await this._request({
      url: `/trading-pairs/${tradingPair}/candles`,
      params: { start, end, interval, limit },
    });
    return data || [];
  }

  // ───────────────────────────
  // 캔들: Bithumb/Upbit 스타일 매핑
  // ───────────────────────────
  async getCandle(candleType, marketType, count) {
    const tradingPair = this.krwTradingPair; // KRW-MOC 고정

    const now = dayjs().utc();
    let daysRange;

    switch (candleType) {
      case "weeks":
        daysRange = 7 * count;
        break;
      case "months":
        daysRange = 30 * count;
        break;
      case "days":
      default:
        daysRange = count;
        break;
    }

    const end = now.valueOf();
    const start = now.subtract(daysRange, "day").valueOf();
    const interval = 1440; // 1일 봉
    const limit = Math.min(daysRange, 1024);

    const candles = await this._getRawCandles(
      tradingPair,
      start,
      end,
      interval,
      limit
    );

    // GOPAX: [time(ms), low, high, open, close, volume]
    return candles.map((c) => ({
      candle_date_time_utc: c[0],
      low_price: c[1],
      high_price: c[2],
      opening_price: c[3],
      closing_price: c[4],
      candle_acc_trade_volume: c[5],
    }));
  }

  async getDaysCandle(marketType, count) {
    return await this.getCandle("days", marketType, count);
  }

  async getWeeksCandle(marketType, count) {
    return await this.getCandle("weeks", marketType, count);
  }

  async getMonthCandle(marketType, count) {
    return await this.getCandle("months", marketType, count);
  }

  // ───────────────────────────
  // 누적 거래량 / 고가/저가 헬퍼
  // ───────────────────────────
  async getAccVolume(candles) {
    let accVol = 0;
    for (const c of candles) {
      accVol += Number(c.candle_acc_trade_volume || 0);
    }
    return accVol;
  }

  async getHighLowPrice(candles) {
    let lowPrice = -1;
    let highPrice = -1;

    for (const c of candles) {
      const low = Number(c.low_price);
      const high = Number(c.high_price);

      if (!Number.isFinite(low) || !Number.isFinite(high)) continue;

      if (lowPrice < 0 || low < lowPrice) lowPrice = low;
      if (highPrice < 0 || high > highPrice) highPrice = high;
    }

    return { lowPrice, highPrice };
  }

  async getInfo(candles) {
    const volume = await this.getAccVolume(candles);
    const { lowPrice, highPrice } = await this.getHighLowPrice(candles);

    return {
      volume,
      low_price: lowPrice,
      high_price: highPrice,
    };
  }

  // 52주 최고/최저 + 날짜 계산
  async getHighLowWithDate(candles) {
    let highest = null;
    let lowest = null;

    for (const c of candles) {
      const high = Number(c.high_price);
      const low = Number(c.low_price);
      const ts = c.candle_date_time_utc;

      if (!Number.isFinite(high) || !Number.isFinite(low)) continue;

      if (!highest || high > highest.price) {
        highest = { price: high, ts };
      }
      if (!lowest || low < lowest.price) {
        lowest = { price: low, ts };
      }
    }

    return { highest, lowest };
  }

  async get52WeekHighLowKrw() {
    const candles = await this.getDaysCandle(this.krwMarket, 365);
    const { highest, lowest } = await this.getHighLowWithDate(candles);

    const formatDate = (ts) =>
      ts ? dayjs(ts).utc().format("YYYY-MM-DD") : null;

    return {
      highest_52_week_price: highest?.price ?? null,
      lowest_52_week_price: lowest?.price ?? null,
      highest_52_week_date: formatDate(highest?.ts),
      lowest_52_week_date: formatDate(lowest?.ts),
    };
  }

  // ───────────────────────────
  // Upbit 스타일: Ticker 변환
  // ───────────────────────────
  async getTickerKrw() {
    const [ticker, stats, hl52w] = await Promise.all([
      this._getRawTicker(this.krwTradingPair),
      this._getRawStats(this.krwTradingPair),
      this.get52WeekHighLowKrw(),
    ]);

    const nowUtc = dayjs().utc();

    const open = Number(stats.open ?? stats.opening_price ?? stats.price ?? 0);
    const high = Number(stats.high ?? 0);
    const low = Number(stats.low ?? 0);
    const close = Number(stats.close ?? ticker.price ?? 0);
    const volume24h = Number(stats.volume ?? ticker.volume ?? 0);

    const prevClosingPrice = open || close;
    let changeType = "EVEN";
    if (close > prevClosingPrice) changeType = "RISE";
    else if (close < prevClosingPrice) changeType = "FALL";

    const changePrice = close - prevClosingPrice;
    const changeRate = prevClosingPrice ? changePrice / prevClosingPrice : 0;

    const obj = {
      market: this.krwMarket,

      trade_date: nowUtc.format("YYYYMMDD"),
      trade_time: nowUtc.format("HHmmss"),
      trade_date_kst: nowUtc.tz("Asia/Seoul").format("YYYYMMDD"),
      trade_time_kst: nowUtc.tz("Asia/Seoul").format("HHmmss"),

      opening_price: open,
      high_price: high,
      low_price: low,
      trade_price: close,
      prev_closing_price: prevClosingPrice,

      change: changeType,
      change_price: Number(changePrice.toFixed(8)),
      change_rate: Number(changeRate.toFixed(8)),
      signed_change_price: Number(changePrice.toFixed(8)),
      signed_change_rate: Number(changeRate.toFixed(8)),

      // Bithumb ticker 스키마와 맞추기 위해 ask_bid 는 넣지 않음
      trade_volume: null, // 마지막 체결량 (필요 시 최근 체결에서 가져와서 채워도 됨)

      // 누적 거래량/대금 - Gopax public API로는 24h volume만 명확해서,
      // acc_trade_volume_24h 만 채우고 나머지는 null 유지
      acc_trade_volume: null,
      acc_trade_price: null,
      acc_trade_volume_24h: volume24h,
      acc_trade_price_24h: null,

      highest_52_week_price: hl52w.highest_52_week_price,
      highest_52_week_date: hl52w.highest_52_week_date,
      lowest_52_week_price: hl52w.lowest_52_week_price,
      lowest_52_week_date: hl52w.lowest_52_week_date,

      trade_timestamp: nowUtc.valueOf(),
      timestamp: nowUtc.valueOf(),
    };

    // Upbit REST /ticker 처럼 배열로 리턴
    return [obj];
  }

  // ───────────────────────────
  // Upbit 스타일: Orderbook 변환
  // ───────────────────────────
  async getOrderbookKrw() {
    const raw = await this._getRawOrderBook(this.krwTradingPair, 2);
    const bid = Array.isArray(raw.bid) ? raw.bid : [];
    const ask = Array.isArray(raw.ask) ? raw.ask : [];

    // [id, price, amount]
    const bid10 = bid.slice(0, 10);
    const ask10 = ask.slice(0, 10);

    const totalBidSize = bid10.reduce((sum, b) => sum + Number(b[2] || 0), 0);
    const totalAskSize = ask10.reduce((sum, a) => sum + Number(a[2] || 0), 0);

    const maxLen = Math.max(bid10.length, ask10.length);
    const units = [];

    for (let i = 0; i < maxLen; i++) {
      const b = bid10[i] || [];
      const a = ask10[i] || [];
      const bidPrice = b[1] ?? null;
      const bidSize = b[2] ?? 0;
      const askPrice = a[1] ?? null;
      const askSize = a[2] ?? 0;

      units.push({
        ask_price: askPrice,
        ask_size: Number(askSize),
        bid_price: bidPrice,
        bid_size: Number(bidSize),
      });
    }

    const obj = {
      market: this.krwMarket,
      timestamp: Date.now(),
      total_ask_size: totalAskSize,
      total_bid_size: totalBidSize,
      orderbook_units: units,
    };

    // Upbit /orderbook 처럼 배열로 반환
    return [obj];
  }

  // ───────────────────────────
  // Upbit 스타일: 최근 체결 변환
  // ───────────────────────────
  async getLastKrwTx() {
    const limit = 10;

    const [trades, stats] = await Promise.all([
      this._getRawTrades(this.krwTradingPair, limit),
      this._getRawStats(this.krwTradingPair),
    ]);

    const prevClosingPrice = Number(
      stats.open ?? stats.opening_price ?? stats.price ?? 0
    );

    return trades.map((t) => {
      const tTime = t.time ? dayjs(t.time) : null;

      const trade_timestamp = tTime ? tTime.valueOf() : null;
      const trade_date_utc = tTime ? tTime.utc().format("YYYY-MM-DD") : null;
      const trade_time_utc = tTime ? tTime.utc().format("HH:mm:ss") : null;

      const price = Number(t.price);
      const changePrice = price - prevClosingPrice;

      return {
        market: this.krwMarket,
        ask_bid: t.side === "sell" ? "ASK" : "BID",
        trade_price: price,
        trade_volume: Number(t.amount),
        prev_closing_price: prevClosingPrice,
        // Bithumb getLastKrwTx 형식에 맞추기: change -> change_price
        change_price: Number(changePrice.toFixed(8)),
        trade_date_utc,
        trade_time_utc,
        timestamp: trade_timestamp,
        sequential_id: t.id,
      };
    });
  }

  // ───────────────────────────
  // Day/Week/Month/Year / AccVolume
  // ───────────────────────────
  async getDayKrw() {
    const candles = await this.getDaysCandle(this.krwMarket, 1);
    return await this.getInfo(candles);
  }

  async getWeekKrw() {
    const candles = await this.getDaysCandle(this.krwMarket, 7);
    return await this.getInfo(candles);
  }

  async getMonthKrw() {
    const candles = await this.getDaysCandle(this.krwMarket, 31);
    return await this.getInfo(candles);
  }

  async getYearKrw() {
    const candles = await this.getWeeksCandle(this.krwMarket, 53);
    return await this.getInfo(candles);
  }

  async getAccTradeVolumeKrw() {
    // 최근 200일 기준 누적 거래량/고가/저가
    const candles = await this.getMonthCandle(this.krwMarket, 200);
    return await this.getInfo(candles);
  }
}

module.exports = Gopax;
