// coinone.js
// Coinone Public API v2 (axios) - Upbit 스타일 포맷 정규화 + 프로덕션 안전장치

const axios = require("axios");
const https = require("https");

class Coinone {
  constructor(options = {}) {
    this.baseURL = "https://api.coinone.co.kr/public/v2";
    this.krwMarket = "KRW-MOC";

    // 공용 옵션
    this.opts = {
      timeout: 10_000,
      maxRetries: 3, // 재시도 2→3으로 상향
      acceptEncoding: "gzip, deflate, identity", // br 제외 (가장 안전)
      include52w: true, // 티커에서 52주 고저 포함 여부
      cache52wMs: 5 * 60_000, // 52주 고저 캐시 유효기간(기본 5분)
      orderbookAllowed: [5, 10, 15, 16], // 코인원 오더북 허용 size
      ...options,
    };

    this._w52Cache = new Map(); // { key: { t:ms, v:{...} } }

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: this.opts.timeout,
      headers: {
        Accept: "application/json",
        "Accept-Encoding": this.opts.acceptEncoding,
      },
      httpsAgent: new https.Agent({ keepAlive: true }),
      decompress: true, // Node 환경에서 압축 해제
    });
  }

  /* ========== 공통 유틸 ========== */

  /** 'KRW-MOC' → { quote:'KRW', target:'MOC' } */
  parseMarket(marketType) {
    const [quote, target] = String(marketType).split("-");
    if (!quote || !target) throw new Error(`Invalid market: ${marketType}`);
    return { quote, target };
  }

  /** 숫자 문자열 → Number */
  n(x) {
    return typeof x === "number" ? x : Number(x);
  }

  /** 반올림 */
  round(x, d = 8) {
    return Number(this.n(x).toFixed(d));
  }

  /** UTC yyyyMMdd / HHmmss */
  fmtUTC(ms) {
    const dt = new Date(ms);
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const HH = String(dt.getUTCHours()).padStart(2, "0");
    const MM = String(dt.getUTCMinutes()).padStart(2, "0");
    const SS = String(dt.getUTCSeconds()).padStart(2, "0");
    return { date: `${yyyy}${mm}${dd}`, time: `${HH}${MM}${SS}` };
  }

  /** KST yyyyMMdd / HHmmss (UTC+9) */
  fmtKST(ms) {
    const dt = new Date(ms + 9 * 3600 * 1000);
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const HH = String(dt.getUTCHours()).padStart(2, "0");
    const MM = String(dt.getUTCMinutes()).padStart(2, "0");
    const SS = String(dt.getUTCSeconds()).padStart(2, "0");
    return { date: `${yyyy}${mm}${dd}`, time: `${HH}${MM}${SS}` };
  }

  /** 로그 타임스탬프: "YYYY-MM-DD HH:mm:ss" (UTC) */
  nowLineStampUTC() {
    const dt = new Date();
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const HH = String(dt.getUTCHours()).padStart(2, "0");
    const MM = String(dt.getUTCMinutes()).padStart(2, "0");
    const SS = String(dt.getUTCSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
  }

  /** (fallback) sequential_id: timestamp * 10000 */
  makeSequentialId(ms) {
    try {
      return Number(BigInt(ms) * 10000n);
    } catch {
      return ms * 10000;
    }
  }

  /** 오더북 size 보정 */
  _nearestAllowed(n, arr) {
    const min = Math.min(...arr),
      max = Math.max(...arr);
    const x = Math.max(min, Math.min(max, Number(n) || arr[0]));
    return arr.reduce(
      (best, cur) => (Math.abs(cur - x) < Math.abs(best - x) ? cur : best),
      arr[0]
    );
  }

  /* ========== 공통 GET with Retry/Backoff ========== */
  async _get(url, config = {}) {
    let attempt = 0,
      lastErr;
    while (attempt <= this.opts.maxRetries) {
      try {
        return await this.api.get(url, config);
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        const retriable = !status || (status >= 500 && status < 600);
        if (!retriable || attempt === this.opts.maxRetries) break;
        await new Promise((r) => setTimeout(r, 100 * Math.pow(4, attempt))); // 100 → 1600ms
        attempt++;
      }
    }
    throw lastErr;
  }

  /* ========== 원시 호출 (Coinone Public v2) ========== */

  /** 티커(개별) - ticker_new / ticker_utc_new */
  async _fetchTicker(
    quote,
    target,
    { utc = false, additional_data = false } = {}
  ) {
    const path = utc ? "ticker_utc_new" : "ticker_new";
    const url = `/${path}/${quote}/${target}`;
    const { data } = await this._get(url, { params: { additional_data } });
    if (!data || data.result !== "success") {
      throw new Error(`Ticker error: ${JSON.stringify(data)}`);
    }
    const t = (data.tickers && data.tickers[0]) || null;
    if (!t) throw new Error("Empty ticker");
    return t;
  }

  /** 최근 체결 */
  async _fetchTrades(quote, target, size = 10) {
    // 허용: 10/50/100/150/200
    const allowed = [10, 50, 100, 150, 200];
    const nearest = allowed.reduce(
      (b, c) => (Math.abs(c - size) < Math.abs(b - size) ? c : b),
      allowed[0]
    );
    const url = `/trades/${quote}/${target}`;
    const { data } = await this._get(url, { params: { size: nearest } });
    if (!data || data.result !== "success") {
      throw new Error(`Trades error: ${JSON.stringify(data)}`);
    }
    return data;
  }

  /** 오더북 */
  async _fetchOrderbook(
    quote,
    target,
    { size = 15, order_book_unit = 0.0 } = {}
  ) {
    const s = this._nearestAllowed(size, this.opts.orderbookAllowed);
    const url = `/orderbook/${quote}/${target}`;
    const { data } = await this._get(url, {
      params: { size: s, order_book_unit },
    });
    if (!data || data.result !== "success") {
      throw new Error(`Orderbook error: ${JSON.stringify(data)}`);
    }
    return data;
  }

  /** 캔들 */
  async _fetchChart(quote, target, interval = "1d", size = 200, timestamp) {
    const url = `/chart/${quote}/${target}`;
    const params = {
      interval,
      size: Math.max(1, Math.min(500, Number(size) || 200)),
    };
    if (timestamp) params.timestamp = Number(timestamp);
    const { data } = await this._get(url, { params });
    if (!data || !Array.isArray(data.chart)) {
      throw new Error(`Chart error: ${JSON.stringify(data)}`);
    }
    return data.chart;
  }

  /* ========== 포맷 정규화 (Upbit 스타일) ========== */

  /** 오더북 → Upbit 스타일 */
  _normalizeOrderbook(data, { depth, roundPrice = 2, roundSize = 8 } = {}) {
    const asks = [...(data.asks || [])].sort(
      (a, b) => this.n(a.price) - this.n(b.price)
    );
    const bids = [...(data.bids || [])].sort(
      (a, b) => this.n(b.price) - this.n(a.price)
    );
    const pairLen = Math.min(asks.length, bids.length, depth ?? Infinity);
    const units = [];
    let totalAsk = 0,
      totalBid = 0;

    for (let i = 0; i < pairLen; i++) {
      const a = asks[i],
        b = bids[i];
      const ask_price = this.round(a.price, roundPrice);
      const bid_price = this.round(b.price, roundPrice);
      const ask_size = this.round(a.qty, roundSize);
      const bid_size = this.round(b.qty, roundSize);
      units.push({ ask_size, bid_size, ask_price, bid_price });
      totalAsk += ask_size;
      totalBid += bid_size;
    }

    const tsMicro = Number(BigInt(Math.trunc(data.timestamp)) * 1000n);
    return [
      {
        market: `${data.quote_currency}-${data.target_currency}`,
        timestamp: tsMicro,
        total_ask_size: this.round(totalAsk, roundSize),
        total_bid_size: this.round(totalBid, roundSize),
        orderbook_units: units,
      },
    ];
  }

  /** 52주 고저(최근 365~366일, 캐시/옵션) */
  async _get52WeekStats(quote, target) {
    const candles = await this._fetchChart(quote, target, "1d", 366);
    let max = null,
      min = null;
    for (const c of candles) {
      if (!max || this.n(c.high) > this.n(max.high)) max = c;
      if (!min || this.n(c.low) < this.n(min.low)) min = c;
    }
    const toDate = (ms) => {
      const d = new Date(ms);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    return {
      highest_52_week_price: max ? this.n(max.high) : null,
      lowest_52_week_price: min ? this.n(min.low) : null,
      highest_52_week_date: max ? toDate(max.timestamp) : null,
      lowest_52_week_date: min ? toDate(min.timestamp) : null,
    };
  }

  /** 체결 ask_bid 추론 (우선순위: is_ask → is_seller_maker → 폴백) */
  _makeAskBid(tx /*, prevBest*/) {
    if (typeof tx.is_ask === "boolean") return tx.is_ask ? "ASK" : "BID";
    if (typeof tx.is_seller_maker === "boolean")
      return tx.is_seller_maker ? "ASK" : "BID";
    // prevBest(베스트 호가) 유추 로직은 필요 시 확장 가능
    return "BID";
  }

  /** 체결 sequential_id 생성 (id 우선, 없으면 timestamp*10000) */
  _makeSeqId(tx) {
    if (tx.id != null) {
      const s = String(tx.id).replace(/\D/g, "");
      if (s) {
        try {
          return Number(BigInt(s));
        } catch {
          return Number(s);
        }
      }
    }
    return this.makeSequentialId(tx.timestamp);
  }

  /** Ticker → Upbit 스타일 1원소 배열 (최근 체결 시각 우선, 52주 고저 옵션/캐시) */
  async _buildUpbitLikeTicker(quote, target) {
    const [t, trades] = await Promise.all([
      this._fetchTicker(quote, target, { utc: false, additional_data: false }),
      this._fetchTrades(quote, target, 10),
    ]);

    // 52주 고저(옵션/캐시)
    let w52 = {
      highest_52_week_price: null,
      lowest_52_week_price: null,
      highest_52_week_date: null,
      lowest_52_week_date: null,
    };
    if (this.opts.include52w) {
      const key = `${quote}-${target}`;
      const now = Date.now();
      const cached = this._w52Cache.get(key);
      if (cached && now - cached.t < this.opts.cache52wMs) {
        w52 = cached.v;
      } else {
        const v = await this._get52WeekStats(quote, target);
        this._w52Cache.set(key, { t: now, v });
        w52 = v;
      }
    }

    const lastTrade = (trades.transactions && trades.transactions[0]) || null;

    const trade_price = this.n(t.last);
    const prev_closing_price = this.n(t.first); // 24h 시가를 prev로 간주
    const delta = trade_price - prev_closing_price;

    const change = delta > 0 ? "RISE" : delta < 0 ? "FALL" : "EVEN";
    const change_price = Math.abs(delta);
    const signed_change_price = delta;
    const change_rate = prev_closing_price
      ? Math.abs(delta / prev_closing_price)
      : 0;
    const signed_change_rate = prev_closing_price
      ? delta / prev_closing_price
      : 0;

    // 최근 체결 시각 우선 (없으면 티커 timestamp)
    const baseTs = lastTrade ? lastTrade.timestamp : t.timestamp;
    const { date: trade_date, time: trade_time } = this.fmtUTC(baseTs);
    const { date: trade_date_kst, time: trade_time_kst } = this.fmtKST(baseTs);

    // 24h 누적
    const acc_trade_price_24h = this.n(t.quote_volume);
    const acc_trade_volume_24h = this.n(t.target_volume);

    // 단일 체결 볼륨(최신 1건)
    const trade_volume = lastTrade ? this.n(lastTrade.qty) : 0;

    // 일중 누적(acc_trade_price/volume)은 별도 제공X → 24h로 폴백
    const acc_trade_price = acc_trade_price_24h;
    const acc_trade_volume = acc_trade_volume_24h;

    const opening_price = prev_closing_price;

    return [
      {
        change,
        market: `${quote}-${target}`,
        low_price: this.n(t.low),
        timestamp: t.timestamp, // ms
        high_price: this.n(t.high),
        trade_date,
        trade_time,
        change_rate: this.round(change_rate, 4),
        trade_price,
        change_price: this.round(change_price, 8),
        trade_volume: this.round(trade_volume, 8),
        opening_price,
        trade_date_kst,
        trade_time_kst,
        acc_trade_price: this.round(acc_trade_price, 8),
        trade_timestamp: baseTs,
        acc_trade_volume: this.round(acc_trade_volume, 8),
        prev_closing_price,
        signed_change_rate: this.round(signed_change_rate, 4),
        acc_trade_price_24h: this.round(acc_trade_price_24h, 8),
        lowest_52_week_date: w52.lowest_52_week_date,
        signed_change_price: this.round(signed_change_price, 8),
        acc_trade_volume_24h: this.round(acc_trade_volume_24h, 8),
        highest_52_week_date: w52.highest_52_week_date,
        lowest_52_week_price: w52.lowest_52_week_price,
        highest_52_week_price: w52.highest_52_week_price,
      },
    ];
  }

  /** 체결 목록 → Upbit 스타일 배열 */
  async _buildUpbitLikeTrades(quote, target) {
    const [trades, ticker] = await Promise.all([
      this._fetchTrades(quote, target, 10),
      this._fetchTicker(quote, target, { utc: false, additional_data: false }),
    ]);
    const prev = this.n(ticker.first); // 24h 시가를 전일종가로 간주
    const out = [];
    for (const tx of trades.transactions || []) {
      const price = this.n(tx.price);
      const qty = this.n(tx.qty);
      const delta = price - prev;
      const { date, time } = this.fmtUTC(tx.timestamp);
      out.push({
        market: `${quote}-${target}`,
        ask_bid: this._makeAskBid(tx),
        timestamp: tx.timestamp,
        trade_price: price,
        change_price: this.round(delta, 8),
        trade_volume: qty,
        sequential_id: this._makeSeqId(tx),
        trade_date_utc: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(
          6,
          8
        )}`,
        trade_time_utc: `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(
          4,
          6
        )}`,
        prev_closing_price: prev,
      });
    }
    return out;
  }

  /* ========== 공개 메서드 (메인 코드와 동일 시그니처) ========== */

  /** KRW-MOC 티커(Upbit 스타일 1원소 배열) */
  async getTickerKrw() {
    const { quote, target } = this.parseMarket(this.krwMarket);
    return await this._buildUpbitLikeTicker(quote, target);
  }

  /** KRW-MOC 오더북(Upbit 스타일) */
  async getOrderbookKrw(size = 15) {
    const { quote, target } = this.parseMarket(this.krwMarket);
    const raw = await this._fetchOrderbook(quote, target, { size });
    return this._normalizeOrderbook(raw, {
      depth: this._nearestAllowed(size, this.opts.orderbookAllowed),
      roundPrice: 2,
      roundSize: 8,
    });
  }

  /** KRW-MOC 최근 체결(Upbit 스타일 배열) */
  async getLastKrwTx() {
    const { quote, target } = this.parseMarket(this.krwMarket);
    return await this._buildUpbitLikeTrades(quote, target);
  }

  /* ---- 캔들 요약 (Bithumb 모듈과 동일 구조: {volume, low_price, high_price}) ---- */

  async getDayKrw() {
    const { quote, target } = this.parseMarket(this.krwMarket);
    const cs = await this._fetchChart(quote, target, "1d", 1);
    return this._infoFromCandles(cs);
  }

  async getWeekKrw() {
    const { quote, target } = this.parseMarket(this.krwMarket);
    const cs = await this._fetchChart(quote, target, "1d", 7);
    return this._infoFromCandles(cs);
  }

  async getMonthKrw() {
    const { quote, target } = this.parseMarket(this.krwMarket);
    const cs = await this._fetchChart(quote, target, "1d", 31);
    return this._infoFromCandles(cs);
  }

  async getYearKrw() {
    const { quote, target } = this.parseMarket(this.krwMarket);
    const cs = await this._fetchChart(quote, target, "1w", 53);
    return this._infoFromCandles(cs);
  }

  async getAccTradeVolumeKrw() {
    const { quote, target } = this.parseMarket(this.krwMarket);
    const cs = await this._fetchChart(quote, target, "1mon", 200);
    return this._infoFromCandles(cs);
  }

  /* ========== 보조: 캔들 요약 계산 ========== */
  _infoFromCandles(candles = []) {
    let volume = 0,
      low = -1,
      high = -1;
    for (const c of candles) {
      const v = this.n(c.target_volume);
      const lo = this.n(c.low);
      const hi = this.n(c.high);
      volume += v;
      if (low < 0 || lo < low) low = lo;
      if (high < 0 || hi > high) high = hi;
    }
    return { volume, low_price: low, high_price: high };
  }

  /* ========== (선택) 한 줄 로그 포맷터 ========== */
  /**
   * "메서드","JSON","YYYY-MM-DD HH:mm:ss" 형식 반환
   * @param {string} methodName - 예: 'getTickerKrw'
   * @param {any} payload - 위 메서드들의 반환값
   * @param {'UTC'|'KST'} [zone='UTC']
   */
  formatLine(methodName, payload, zone = "UTC") {
    const json = JSON.stringify(payload);
    const stamp =
      zone === "KST"
        ? (() => {
            const ms = Date.now() + 9 * 3600 * 1000;
            const d = new Date(ms);
            const yyyy = d.getUTCFullYear();
            const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
            const dd = String(d.getUTCDate()).padStart(2, "0");
            const HH = String(d.getUTCHours()).padStart(2, "0");
            const MM = String(d.getUTCMinutes()).padStart(2, "0");
            const SS = String(d.getUTCSeconds()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
          })()
        : this.nowLineStampUTC();
    return `${methodName},"${json.replaceAll('"', '\\"')}","${stamp}"`;
  }

  /* ========== (선택) 원시 캔들 접근자(호환 목적) ========== */
  async getCandle(candleType, marketType, count, opts = {}) {
    const { quote, target } = this.parseMarket(marketType);
    const mapInterval = (type) => {
      switch (type) {
        case "days":
          return "1d";
        case "weeks":
          return "1w";
        case "months":
          return "1mon";
        case "minutes":
          return "1m";
        case "hours":
          return "1h";
        default:
          return "1d";
      }
    };
    const interval = mapInterval(candleType);
    const size = Math.max(1, Math.min(500, Number(count) || 200));
    return await this._fetchChart(
      quote,
      target,
      interval,
      size,
      opts.timestamp
    );
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
}

module.exports = Coinone;
