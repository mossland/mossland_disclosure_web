// server.js (fixed: define updateAllMarketCaps before scheduling)

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mysql = require("mysql2");
const https = require("https");
const fs = require("fs");

const Luniverse = require("./luniverse.js");
const Upbit = require("./upbit.js");
const Bithumb = require("./bithumb.js");
const GitHub = require("./github.js");
const Database = require("./database.js");
const SwapInfo = require("./swapInfo.js");
const Coinone = require("./coinone.js"); // 선택

const app = express();

/* ---------------------------
 * App & DB 기본 설정
 * ------------------------- */
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SCHEMA,
  connectionLimit: 10,
};
const pool = mysql.createPool(config);
const poolP = pool.promise();

const db = new Database();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 외부 API 공용 axios
const http = axios.create({
  timeout: 10_000,
  headers: { "Accept-Encoding": "gzip,deflate,compress" },
});

/* ---------------------------
 * 유틸리티 & 스케줄러
 * ------------------------- */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 안전 스케줄러: setTimeout 재귀 + 중복 방지 + 기동 지연 + 지터 + (선택) DB 쓰로틀
function scheduleJob(name, fn, intervalMs, opts = {}) {
  const {
    runAtStart = false,
    startupHoldoffMs = 0,
    startupJitterMs = 0,
    jitterPct = 0,
    dbThrottleMinIntervalMs = 0,
  } = opts;

  let running = false;
  let stopped = false;

  const jittered = () => {
    if (!jitterPct) return intervalMs;
    const r = (Math.random() * 2 - 1) * jitterPct;
    return Math.max(50, Math.floor(intervalMs * (1 + r)));
  };

  const scheduleNext = (delay) => {
    if (stopped) return;
    setTimeout(tick, delay ?? jittered());
  };

  const canRunNow = async () => {
    if (!dbThrottleMinIntervalMs) return true;
    try {
      await poolP.execute(
        "CREATE TABLE IF NOT EXISTS scheduler_meta (job VARCHAR(64) PRIMARY KEY, last_run_ms BIGINT NOT NULL)"
      );
      const now = Date.now();
      await poolP.execute(
        "INSERT INTO scheduler_meta (job, last_run_ms) VALUES (?, ?) " +
          "ON DUPLICATE KEY UPDATE last_run_ms = IF(VALUES(last_run_ms) - last_run_ms >= ?, VALUES(last_run_ms), last_run_ms)",
        [name, now, dbThrottleMinIntervalMs]
      );
      const [rows] = await poolP.execute(
        "SELECT last_run_ms FROM scheduler_meta WHERE job = ?",
        [name]
      );
      return rows?.[0]?.last_run_ms === now;
    } catch (e) {
      console.error(`[${name}] db-throttle error:`, e?.message || e);
      return true; // fail-open
    }
  };

  async function tick() {
    if (stopped) return;
    if (running) return scheduleNext();
    const ok = await canRunNow();
    if (!ok) return scheduleNext();

    running = true;
    try {
      await fn();
    } catch (e) {
      console.error(`[${name}]`, e);
    } finally {
      running = false;
      scheduleNext();
    }
  }

  const initialDelay =
    (runAtStart ? 0 : intervalMs) +
    startupHoldoffMs +
    Math.floor(Math.random() * (startupJitterMs || 0));

  scheduleNext(initialDelay);
  return () => {
    stopped = true;
  };
}

/* ---------------------------
 * 마켓캡 갱신 로직 (스케줄러보다 위에 둠)
 * ------------------------- */
async function updateMarketCap(marketInfo) {
  const sql =
    "UPDATE `mossland_disclosure`.`market_data` SET `number` = ? WHERE (`market_type` = ?)";
  try {
    const jobs = [
      poolP.execute(sql, [
        marketInfo.circulatingSupply,
        `${marketInfo.name}_circulating_supply`,
      ]),
      poolP.execute(sql, [
        marketInfo.marketCap_krw,
        `${marketInfo.name}_marketcap_krw`,
      ]),
      poolP.execute(sql, [
        marketInfo.marketCap_usd,
        `${marketInfo.name}_marketcap_usd`,
      ]),
    ];
    if (marketInfo.name === "mossland") {
      jobs.push(
        poolP.execute(sql, [
          marketInfo.maxSupply,
          `${marketInfo.name}_max_supply`,
        ])
      );
    }
    await Promise.all(jobs);
  } catch (err) {
    console.error("[updateMarketCap] error:", err?.message || err);
  }
}

async function getCoinmarketCap() {
  try {
    const cmcUSD = await http.get(
      "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest",
      {
        params: { id: 2915, convert: "USD" },
        headers: { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY },
      }
    );
    const cmcKRW = await http.get(
      "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest",
      {
        params: { id: 2915, convert: "KRW" },
        headers: { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY },
      }
    );

    const usd = cmcUSD.data?.data?.["2915"];
    const krw = cmcKRW.data?.data?.["2915"];
    if (!usd || !krw) throw new Error("CMC data missing");

    const ret = {
      name: "coinmarketcap",
      maxSupply: usd.max_supply ?? 0,
      circulatingSupply: usd.circulating_supply ?? 0,
      marketCap_usd: usd.quote?.USD?.market_cap ?? 0,
      marketCap_krw: krw.quote?.KRW?.market_cap ?? 0,
    };

    await updateMarketCap(ret);
    console.log("[CMC]", ret);
    return ret;
  } catch (ex) {
    console.error("[CMC] error:", ex?.message || ex);
  }
}

async function getCoingeckoCap() {
  try {
    const usd = await http.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      { params: { vs_currency: "usd", ids: "mossland" } }
    );
    const krw = await http.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      { params: { vs_currency: "krw", ids: "mossland" } }
    );

    const u = usd.data?.[0];
    const k = krw.data?.[0];
    if (!u || !k) throw new Error("Coingecko data missing");

    const ret = {
      name: "coingecko",
      maxSupply: u.max_supply ?? 0,
      circulatingSupply: u.circulating_supply ?? 0,
      marketCap_usd: u.market_cap ?? 0,
      marketCap_krw: k.market_cap ?? 0,
    };

    await updateMarketCap(ret);
    console.log("[Coingecko]", ret);
    return ret;
  } catch (ex) {
    console.error("[Coingecko] error:", ex?.message || ex);
  }
}

async function getMosslandCap() {
  try {
    const resp = await http.get("https://api.moss.land/MOC/info");
    const arr = resp.data || [];
    const ret = {
      name: "mossland",
      maxSupply: 0,
      circulatingSupply: 0,
      marketCap_usd: 0,
      marketCap_krw: 0,
    };

    for (const row of arr) {
      if (row.currencyCode === "USD") {
        ret.maxSupply = row.maxSupply ?? 0;
        ret.circulatingSupply = row.circulatingSupply ?? 0;
        ret.marketCap_usd = row.marketCap ?? 0;
      } else if (row.currencyCode === "KRW") {
        ret.marketCap_krw = row.marketCap ?? 0;
      }
    }

    await updateMarketCap(ret);
    console.log("[Mossland]", ret);
    return ret;
  } catch (ex) {
    console.error("[Mossland] error:", ex?.message || ex);
  }
}

async function updateAllMarketCaps() {
  await Promise.allSettled([
    getCoinmarketCap(),
    getCoingeckoCap(),
    getMosslandCap(),
  ]);
}

/* ---------------------------
 * 데이터 적재 루틴들
 * ------------------------- */
async function setWmocInfo() {
  /*
  const si = new SwapInfo();
  const ret = await si.getWmocInfo();
  await db.setWmocInfo(ret);
  */
}

async function setUpbitInfo() {
  const ub = new Upbit();
  const plan = [
    "getTickerKrw",
    "getYearKrw",
    "getMonthKrw",
    "getWeekKrw",
    "getDayKrw",
    "getOrderbookKrw",
    "getLastKrwTx",
    "getAccTradeVolumeKrw",
  ];
  for (const key of plan) {
    try {
      const ret = await ub[key]();
      await db.setUpbitData(key, JSON.stringify(ret));
    } catch (err) {
      console.error(`[Upbit] ${key} failed:`, err?.message || err);
    }
  }
}

async function setBithumbInfo() {
  const bt = new Bithumb();
  const plan = [
    "getTickerKrw",
    "getYearKrw",
    "getMonthKrw",
    "getWeekKrw",
    "getDayKrw",
    "getOrderbookKrw",
    "getLastKrwTx",
    "getAccTradeVolumeKrw",
  ];
  for (const key of plan) {
    try {
      const ret = await bt[key]();
      await db.setBithumbData(key, JSON.stringify(ret));
    } catch (err) {
      console.error(`[Bithumb] ${key} failed:`, err?.message || err);
    }
  }
}

async function setCoinoneInfo() {
  const bt = new Coinone();
  const plan = [
    "getTickerKrw",
    "getYearKrw",
    "getMonthKrw",
    "getWeekKrw",
    "getDayKrw",
    "getOrderbookKrw",
    "getLastKrwTx",
    "getAccTradeVolumeKrw",
  ];
  for (const key of plan) {
    try {
      const ret = await bt[key]();
      await db.setCoinoneData(key, JSON.stringify(ret));
    } catch (err) {
      console.error(`[Coinone] ${key} failed:`, err?.message || err);
    }
  }
}

async function setGitHubInfo() {
  const gb = new GitHub();
  try {
    const codeFreq = await gb.getWeeklyCodeCount();
    await db.setGithubData("getCodeFrequency", JSON.stringify(codeFreq));
  } catch (e) {
    console.error("[GitHub] getCodeFrequency failed:", e?.message || e);
  }
  try {
    const commits = await gb.getWeeklyCommitCount();
    await db.setGithubData("getCommitCount", JSON.stringify(commits));
  } catch (e) {
    console.error("[GitHub] getCommitCount failed:", e?.message || e);
  }
}

async function setLuniverseInfo() {
  const ln = new Luniverse();
  const tasks = [
    ["getTotalTx", () => ln.getTotalTx(), (v) => ({ count: String(v) })],
    ["getLastDayTx", () => ln.getLastOneDay(), (v) => ({ count: String(v) })],
    [
      "getHolderCount",
      () => ln.getHolderCount(),
      (v) => ({ count: String(v) }),
    ],
    ["getLastTx", () => ln.getLastTx(), (v) => v],
  ];
  for (const [key, fn, map] of tasks) {
    try {
      const raw = await fn();
      await db.setLuniverseData(key, JSON.stringify(map(raw)));
    } catch (e) {
      console.error(`[Luniverse] ${key} failed:`, e?.message || e);
    }
  }
}

/* ---------------------------
 * 라우터 (원본과 동일)
 * ------------------------- */
app.get(
  "/api/getWmocInfo",
  asyncHandler(async (req, res) => {
    res.send(await db.getWmocInfo());
  })
);

app.get(
  "/api/getTotalTx",
  asyncHandler(async (req, res) => {
    res.send(await db.getLuniverseData("getTotalTx"));
  })
);
app.get(
  "/api/getLastYearTx",
  asyncHandler(async (req, res) => {
    res.send(await db.getLuniverseData("getLastYearTx"));
  })
);
app.get(
  "/api/getLastMonthTx",
  asyncHandler(async (req, res) => {
    res.send(await db.getLuniverseData("getLastMonthTx"));
  })
);
app.get(
  "/api/getLastWeekTx",
  asyncHandler(async (req, res) => {
    res.send(await db.getLuniverseData("getLastWeekTx"));
  })
);
app.get(
  "/api/getLastDayTx",
  asyncHandler(async (req, res) => {
    res.send(await db.getLuniverseData("getLastDayTx"));
  })
);
app.get(
  "/api/getHolderCount",
  asyncHandler(async (req, res) => {
    res.send(await db.getLuniverseData("getHolderCount"));
  })
);
app.get(
  "/api/getLastTx",
  asyncHandler(async (req, res) => {
    res.send(await db.getLuniverseData("getLastTx"));
  })
);

const exchangeGetter = {
  upbit: (key) => db.getUpbitData(key),
  bithumb: (key) => db.getBithumbData(key),
  coinone: (key) => db.getCoinoneData(key),
};
function registerExchangeRoute(path, key) {
  app.get(
    `/api/${path}`,
    asyncHandler(async (req, res) => {
      const ex = String(req.query.exchange || "upbit").toLowerCase();
      const getter = exchangeGetter[ex] || exchangeGetter.upbit;
      res.send(await getter(key));
    })
  );
}
[
  "getTickerKrw",
  "getYearKrw",
  "getMonthKrw",
  "getWeekKrw",
  "getDayKrw",
  "getOrderbookKrw",
  "getLastKrwTx",
  "getAccTradeVolumeKrw",
].forEach((key) => registerExchangeRoute(key, key));

app.get(
  "/api/getCommitCount",
  asyncHandler(async (req, res) => {
    res.send(await db.getGithubData("getCommitCount"));
  })
);
app.get(
  "/api/getCodeFrequency",
  asyncHandler(async (req, res) => {
    res.send(await db.getGithubData("getCodeFrequency"));
  })
);

app.get(
  "/api/market",
  asyncHandler(async (req, res) => {
    res.send(await db.getMarket());
  })
);
app.get(
  "/api/recent_release",
  asyncHandler(async (req, res) => {
    res.send(await db.getRecentRelease());
  })
);
app.get(
  "/api/expected_release",
  asyncHandler(async (req, res) => {
    res.send(await db.getExpectedEelease());
  })
);
app.get(
  "/api/disclosure",
  asyncHandler(async (req, res) => {
    res.send(await db.getDisclosure());
  })
);
app.get(
  "/api/materials",
  asyncHandler(async (req, res) => {
    res.send(await db.getMaterials());
  })
);

setLuniverseInfo();
/* ---------------------------
 * 스케줄링 (이제 정의 위반 없음)
 * ------------------------- */
scheduleJob("MarketCapLoop", updateAllMarketCaps, 10 * 60 * 1000, {
  runAtStart: true,
  startupHoldoffMs: 30_000,
  startupJitterMs: 15_000,
  jitterPct: 0.1,
  dbThrottleMinIntervalMs: 8 * 60 * 1000,
});
scheduleJob("LuniverseLoop", setLuniverseInfo, 30 * 60 * 1000, {
  runAtStart: true,
  startupHoldoffMs: 30_000,
  startupJitterMs: 15_000,
  jitterPct: 0.1,
  dbThrottleMinIntervalMs: 20 * 60 * 1000,
});
scheduleJob("GithubLoop", setGitHubInfo, 60 * 60 * 1000, {
  runAtStart: true,
  startupHoldoffMs: 30_000,
  startupJitterMs: 15_000,
  jitterPct: 0.1,
  dbThrottleMinIntervalMs: 45 * 60 * 1000,
});
scheduleJob("WmocLoop", setWmocInfo, 10 * 1000, {
  runAtStart: true,
  startupHoldoffMs: 30_000,
  startupJitterMs: 15_000,
  jitterPct: 0.2,
  dbThrottleMinIntervalMs: 7 * 1000,
});
scheduleJob("UpbitLoop", setUpbitInfo, 10 * 1000, {
  runAtStart: true,
  startupHoldoffMs: 30_000,
  startupJitterMs: 15_000,
  jitterPct: 0.2,
  dbThrottleMinIntervalMs: 7 * 1000,
});
scheduleJob("BithumbLoop", setBithumbInfo, 10 * 1000, {
  runAtStart: true,
  startupHoldoffMs: 30_000,
  startupJitterMs: 15_000,
  jitterPct: 0.2,
  dbThrottleMinIntervalMs: 7 * 1000,
});
scheduleJob("CoinoneLoop", setCoinoneInfo, 10 * 1000, {
  runAtStart: true,
  startupHoldoffMs: 30_000,
  startupJitterMs: 15_000,
  jitterPct: 0.2,
  dbThrottleMinIntervalMs: 7 * 1000,
});

/* ---------------------------
 * 에러 핸들러 & 서버 시작
 * ------------------------- */
app.use((err, req, res, next) => {
  console.error("[Express] unhandled:", err?.stack || err);
  res
    .status(500)
    .json({ ok: false, error: err?.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`Server start on :${PORT}`));
