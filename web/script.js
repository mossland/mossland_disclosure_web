var BASE_URL = "https://disclosure.moss.land";
var TRANSFER_TIMER = null;
var TRANSACTION_TIMER = null;
var ORDER_BOOK_TIMER = null;
var MOSSLAND_MAX_SUPPLY = 500000000;
var MOSSLAND_CIRCULATING_SUPPLY = 0;

// 공통 거래소 정의
const EXCHANGES = [
  { key: "upbit", exchange: null }, // 기본(Upbit)
  { key: "bithumb", exchange: "bithumb" },
  { key: "coinone", exchange: "coinone" },
  { key: "gopax", exchange: "gopax" },
];

// KRW 구간(1d/1m/1y/total)용
const KRW_RANGE_MARKETS = EXCHANGES.map(({ key, exchange }) => ({
  exchange,
  prefix: key === "upbit" ? "" : key + "_", // 예: '', 'bithumb_', 'coinone_'
}));

// 체결 이력 테이블용
const TX_MARKETS = EXCHANGES.map(({ key, exchange }) => ({
  exchange,
  prefix: key, // upbit, bithumb, coinone, gopax
}));

// 호가창 테이블용
const ORDERBOOK_MARKETS = EXCHANGES.map(({ key, exchange }) => {
  const isUpbit = key === "upbit";
  return {
    exchange,
    rowClass: isUpbit
      ? "order_book_table_item"
      : key + "_order_book_table_item",
    bidTable: isUpbit
      ? ".order_book_bid_table"
      : "." + key + "_order_book_bid_table",
    askTable: isUpbit
      ? ".order_book_ask_table"
      : "." + key + "_order_book_ask_table",
  };
});

// Ticker(52주, 24h, 퍼센트 등)용
const TICKER_MARKETS = EXCHANGES.map(({ key, exchange }) => {
  const isUpbit = key === "upbit";
  const prefix = isUpbit ? "" : key + "_";
  return {
    exchange,
    w52HighClass: "." + prefix + "w52_high",
    w52HighDateClass: "." + prefix + "w52_high_date",
    w52LowClass: "." + prefix + "w52_low",
    w52LowDateClass: "." + prefix + "w52_low_date",
    volumeClass: "." + prefix + "acc_trade_volume_24h",
    priceClass: "." + prefix + "acc_trade_price_24h",
    volumePerClass: "." + prefix + "acc_trade_volume_24h_per",
    pricePerClass: "." + prefix + "acc_trade_price_24h_per",
  };
});

// 공통 $.getJSON 래퍼 (exchange 파라미터 옵션)
function getJSONWithOptionalExchange(path, exchange, cb) {
  if (exchange) {
    $.getJSON(BASE_URL + path, { exchange: exchange }, cb);
  } else {
    $.getJSON(BASE_URL + path, cb);
  }
}

$.lang = {};

$.lang.ko = {
  0: "홈페이지",
  1: "깃허브",
  2: "트위터",
  3: "시가총액",
  4: "(실시간)",
  5: "모스랜드 제공",
  6: "코인마켓캡 제공",
  7: "코인게코 제공",
  8: "현재 유통량",
  9: "최초발행",
  10: "총 발행 한도 (추가 발행 불가능)",
  11: "연락처",
  12: "다운로드",
  13: "유통량 계획",
  14: "재단 보유 지갑 리스트",
  15: "(유통되지 않는 모스코인을 보관하는 지갑)",
  16: "재단 관리 지갑 #1",
  17: "재단 관리 지갑 #2",
  18: "최근 유통량 변동 상세",
  19: "(최근 3개월)",
  20: "예정 유통량 변동 상세",
  21: "(향후 3개월)",
  22: "모스랜드 공시",
  23: "모스랜드 공개 문서",
  24: "모스코인 트랜잭션 활성화",
  25: "모스코인 (MOC)",
  26: "트랜잭션",
  27: "모스코인 마켓 활성화 (Upbit)",
  28: "거래량 (24h)",
  29: "거래대금 (24h)",
  30: "52주 최고/52주 최저",
  31: "거래량/총발행량 (24h)",
  32: "유통량/총발행량 (24h)",
  33: "체결시간",
  34: "체결가격(KRW)",
  35: "체결량(MOC)",
  36: "체결금액(KRW)",
  37: "모스코인 오픈소스 활성화",
  38: "기본 정보",
  39: "가격 지표",
  40: "홀더",
  41: "컨트랙트 주소",
  42: "컨트랙트 소스코드",
  43: "기간",
  44: "전체 기간",
  45: "최근 24시간",
  46: "최근 30일",
  47: "최근 365일",
  48: "최고가(KRW)",
  49: "최저가(KRW)",
  50: "토큰 전송 기록",
  51: "트랜잭션 해시",
  52: "시간",
  53: "보낸사람",
  54: "받는사람",
  55: "값(MOC)",
  56: "실시간 호가",

  57: "수량(MOC)",
  58: "누적량(MOC)",
  59: "평균매수호가(KRW)",
  60: "평균매도호가(KRW)",
  61: "체결 이력",

  62: "Github Code Frequency",
  63: "Github Commits",
  64: "추가 항목",
  65: "삭제 항수",
  66: "횟수",

  67: "지난 4주간",
  68: "지난 8주간",
  69: "지난 4주간",
  70: "지난 1년간",

  71: "&nbsp;모스랜드 DAO 활동",
  72: "전체 안건 수",
  73: "건",
  74: "누적 투표 수",
  75: "회",
  76: "누적 투표 MMOC",
  77: "최근 DAO 안건",
  78: "진행중",
  79: "마감",
  80: "표",
  81: "최근 투표",
  82: "(including private repository)",
  83: "블로그",

  84: "Wrapped MOC (WMOC) 실시간 정보",
  85: "랩드 모스코인 (WMOC)",

  86: "실시간 스왑 시스템 정보",
  87: "(락업 지갑 예치로 모스코인 발행량과 유통량은 증가하지 않습니다)",

  88: "WMOC 총 발행량",
  89: "WMOC 유통량",
  90: "락업된 WMOC 수량",
  91: "락업된 MOC 수량",
  92: "보정된 MOC 유통량",

  93: "MOC 락업 지갑",
  94: "WMOC 락업 지갑",
  95: "스왑 시스템",
  96: "실시간 유통량 모니터",
  97: "값(WMOC)",
  98: "1) WMOC 총 발행량에서 락업된 WMOC 수량을 제외한 실제 WMOC 유통량",
  99: "2) 유통 가능한 MOC와 WMOC의 합산 값으로 MOC 유통량을 초과하면 안됨",
  100: "락업 지갑 (swap.moss.land)",
  101: "전체",
  102: "모스코인 마켓 활성화 (Bithumb)",
  103: "모스코인 마켓 활성화 (Bithumb)",
  104: "전체 트랜잭션",
  105: "일일 트랜잭션 수 (어제)",
  106: "모스코인 마켓 활성화 (Gopax)",
};

$.lang.en = {
  0: "Website",
  1: "GitHub",
  2: "Twitter",
  3: "Market Cap",
  4: "(Real-time)",
  5: "Mossland",
  6: "CoinMarketCap",
  7: "CoinGecko",
  8: "Circulating Supply",
  9: "Date of issuance",
  10: "total issuance (No Extra Issuances Allowed)",
  11: "E-Mail",
  12: "Download",
  13: "Circulating Supply Plan",
  14: "Foundation Wallet List",
  15: "(Wallets to hold Non-Circulating Mosscoin)",
  16: "Foundation Wallet #1",
  17: "Foundation Wallet #2",
  18: "Expected Changes in the Circulating Supply",
  19: "(Within Next 3 Months)",
  20: "Recent Changes in the Circulating Supply",
  21: "(Within 3 months)",
  22: "Mossland Disclosure",
  23: "Mossland Materials",
  24: "MossCoin Transaction Activity",
  25: "MossCoin (MOC)",
  26: "Trades",
  27: "MossCoin Market Activity(Upbit)",
  28: "Volume (24h)",
  29: "Value (24h)",
  30: "52w High/52w Low",
  31: "Volume/Market cap (24h)",
  32: "Circulating supply/Market cap (24h)",
  33: "Time",
  34: "Price(KRW)",
  35: "Amount(MOC)",
  36: "Total(KRW)",
  37: "Mossland Opensource Activity",
  38: "Information",
  39: "Price performance",
  40: "Holders",
  41: "Contract Address",
  42: "Contract Source Code",
  43: "Period",
  44: "Total",
  45: "Last 24 hours",
  46: "Last 30 days",
  47: "Last 365 days",
  48: "All-time high(KRW)",
  49: "All-time low(KRW)",
  50: "Token Transfer",
  51: "TX Hash",
  52: "Age",
  53: "From",
  54: "To",
  55: "Value(MOC)",
  56: "Order Book",

  57: "Amount(MOC)",
  58: "Total(MOC)",
  59: "Bid Price(KRW)",
  60: "Ask Price(KRW)",
  61: "Transactions",

  62: "Github Code Frequency",
  63: "Github Commits",
  64: "The number of additions",
  65: "The number of deletions",
  66: "Counts",

  67: "Last 4 weeks",
  68: "Last 8 weeks",
  69: "Last 4 weeks",
  70: "Last 1 year",

  71: "&nbsp;Mossland DAO Activity",
  72: "Total Proposal Count",
  73: "Proposals",
  74: "Total Vote Count",
  75: "Votes",
  76: "Total Vote MMOC",
  77: "Recent DAO Proposals",
  78: "Active",
  79: "Closed",
  80: "Votes",
  81: "Recent Votes",
  82: "(including private repository)",
  83: "Blog",

  84: "Wrapped MOC (WMOC) Status (Real-time)",
  85: "Wrapped MOC (WMOC)",

  86: "Swap System Status",
  87: "(Locked-up wallet deposits maintain stable MossCoin total supply and circulating supply)",

  88: "Total supply of WMOC",
  89: "Circulating supply of WMOC",
  90: "Quantity of Locked-up WMOC",
  91: "Quantity of Locked-up MOC",
  92: "Adjusted Circulating supply",

  93: "Locked-up Wallet of MOC",
  94: "Locked-up Wallet of WMOC",
  95: "Swap system",
  96: "Circulating supply monitor",
  97: "Value(WMOC)",
  98: "1) The circulating supply of WMOC, excluding the quantity of locked-up WMOC, from the total supply of WMOC.",
  99: "2) The combined value of tradable MOC and WMOC in circulation must not exceed the circulating supply of MOC.",
  100: "Locked-up Wallet (swap.moss.land)",
  101: "Total Transfers",
  102: "MossCoin Market Activity (Bithumb)",
  103: "MossCoin Market Activity (Coinone)",
  104: "Total Transactions",
  105: "Daily Transfers (Previous Day)",
  106: "MossCoin Market Activity (Gopax)",
};

const { createApp } = Vue;
createApp({
  data() {
    return {
      surveyData: {
        success: true,
        totalSurveyCount: 52,
        totalVoteCount: { count: "107298", num: "10380118.036661600000752" },
        lastVote: [],
        lastResponse: [],
      },
      voteShowSize: 5,
      voteSlideSize: 1,
      startIdx: 0,

      respShowSize: 10,
      respSlideSize: 1,
      respStartIdx: 0,
    };
  },
  computed: {
    locale() {
      return window.currentLanguage || "ko";
    },
    accVoteCount() {
      return commaNumber(Big(this.surveyData.totalVoteCount.count).toString());
    },
    accVoteMmoc() {
      return commaNumber(Big(this.surveyData.totalVoteCount.num).toFixed(2, 0));
    },
    dupVoteList() {
      const data = [...this.surveyData.lastVote, ...this.surveyData.lastVote];
      if (!this.surveyData.lastVote.length) return [];
      return data.slice(
        this.startIdx % this.surveyData.lastVote.length,
        (this.startIdx % this.surveyData.lastVote.length) + this.voteShowSize
      );
    },
    dupRespList() {
      const data = [
        ...this.surveyData.lastResponse,
        ...this.surveyData.lastResponse,
      ];
      if (!this.surveyData.lastResponse.length) return [];
      return data.slice(
        this.respStartIdx % this.surveyData.lastResponse.length,
        (this.respStartIdx % this.surveyData.lastResponse.length) +
          this.respShowSize
      );
    },
    selectionData() {
      return this.surveyData.lastVote.reduce((acc, v) => {
        if (!acc[v.id]) {
          acc[v.id] = v.selections.map((s) => {
            return {
              text: s,
              count: 0,
              ratio: Big(0).toString(),
              percent: Big(0).toString(),
            };
          });
        }

        // For = 0
        acc[v.id][0].count = v.voteCount.forMoc;
        acc[v.id][0].ratio = Big(v.voteCount.forMocPercentage)
          .div(100)
          .toFixed(2, 0);
        acc[v.id][0].percent = Big(v.voteCount.forMocPercentage)
          .div(100)
          .times(100)
          .toFixed(2, 0);

        // Against = 1
        acc[v.id][1].count = v.voteCount.againstMoc;
        acc[v.id][1].ratio = Big(v.voteCount.againstMocPercentage)
          .div(100)
          .toFixed(2, 0);
        acc[v.id][1].percent = Big(v.voteCount.againstMocPercentage)
          .div(100)
          .times(100)
          .toFixed(2, 0);

        // Abstain = 2
        acc[v.id][2].count = v.voteCount.abstainMoc;
        acc[v.id][2].ratio = Big(v.voteCount.abstainMoc).eq(0)
          ? "0"
          : Big(1)
              .sub(Big(acc[v.id][0].ratio).plus(Big(acc[v.id][1].ratio)))
              .toFixed(2, 0);
        acc[v.id][2].percent = Big(v.voteCount.abstainMoc).eq(0)
          ? "0"
          : Big(100)
              .sub(Big(acc[v.id][0].percent).plus(Big(acc[v.id][1].percent)))
              .toFixed(2, 0);

        return acc;
      }, {});
    },
  },
  async created() {
    try {
      const data = await $.getJSON("/metaverse/survey-list");
      this.surveyData = data;
    } catch (e) {
    } finally {
      this.fetchSurvey();
      this.incrementList();
      this.incrementRespList();
    }
  },
  methods: {
    async fetchSurvey() {
      setTimeout(async () => {
        try {
          const data = await $.getJSON("/metaverse/survey-list");
          this.surveyData = data;
        } catch (e) {
        } finally {
          this.fetchSurvey();
        }
      }, 1000 * 60 * 5);
    },
    onAfterEnter(el, done) {
      const vid = el.getAttribute("data-id");
      const ele = Array.from(
        el.querySelector(".figure").querySelectorAll(".selection__ele")
      );
      ele.forEach((e, idx) => {
        this.$nextTick(() => {
          const sidx = e.getAttribute("data-idx");
          e.style.flex = `${Math.max(
            1,
            parseFloat(this.selectionData[vid][idx].percent)
          )} 1`;
        });
      });
    },
    incrementList() {
      setTimeout(() => {
        this.startIdx = this.startIdx + this.voteSlideSize;
        this.incrementList();
      }, 6000);
    },
    incrementRespList() {
      setTimeout(() => {
        this.respStartIdx = this.respStartIdx + this.respSlideSize;
        this.incrementRespList();
      }, 4000);
    },
    toDateFormat(val) {
      try {
        return dayjs(val).format("YYYY-MM-DD");
      } catch (e) {
        return val;
      }
    },
  },
}).mount("#app");

function setLanguage(currentLanguage) {
  console.log("setLanguage", arguments);

  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }

  $("[data-langNum]").each(function () {
    var $this = $(this);

    $this.html($.lang[currentLanguage][$this.data("langnum")]);
  });

  if (currentLanguage == "ko") {
    $(".current_date").html(
      "(" + today.toISOString().replace("T", " ").substring(0, 10) + " 기준)"
    );
  } else if (currentLanguage == "en") {
    $(".current_date").html(
      "(Updated on " +
        today.toISOString().replace("T", " ").substring(0, 10) +
        ")"
    );
  }

  loadData(currentLanguage);
  window.currentLanguage = currentLanguage;
}

function getCurrentDateString(lang) {
  var today = new Date();
  if (lang == "en") {
    return (
      "(Updated on " +
      today
        .toISOString()
        .replace("T", " ")
        .replace("T", " ")
        .replace("Z", " ")
        .substring(0, 19) +
      ")"
    );
  }

  return (
    "(" +
    today.toISOString().replace("T", " ").replace("Z", " ").substring(0, 19) +
    " 기준)"
  );
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}

function stringToNumber(str) {
  return parseFloat(str.replaceAll(",", ""));
}

function loadTransferList(lang) {
  if (TRANSFER_TIMER != null) {
    clearInterval(TRANSFER_TIMER);
  }

  $.getJSON(BASE_URL + "/api/getHolderCount", function (data) {
    $(".holder_count").html(numberWithCommas(data["count"]));
  });

  $.getJSON(BASE_URL + "/api/getTotalTx", function (data) {
    $(".transactions_1y").html(numberWithCommas(data["count"]));
  });

  $.getJSON(BASE_URL + "/api/getLastDayTx", function (data) {
    $(".transactions_1d").html(numberWithCommas(data["count"]));
  });

  $.getJSON(BASE_URL + "/api/getLastTx", function (data) {
    $(".transfer_list_table_item").remove();

    if (data != null) {
      $.each(data, function (i, item) {
        var ts = item["timestamp"];
        var nowTs = new Date().getTime() / 1000;

        var totalSec = Math.floor(nowTs - ts);
        var sec = totalSec % 60;
        var min = Math.floor(totalSec / 60) % 60;
        var hr = Math.floor(totalSec / 3600);

        var age = "-";

        if (lang === "en") {
          if (hr > 0) {
            age =
              hr +
              " hr" +
              (hr > 1 ? "s" : "") +
              " " +
              min +
              " min" +
              (min > 1 ? "s" : "") +
              " ago";
          } else if (min > 0) {
            age =
              min +
              " min" +
              (min > 1 ? "s" : "") +
              " " +
              sec +
              " sec" +
              (sec > 1 ? "s" : "") +
              " ago";
          } else {
            age = sec + " sec" + (sec > 1 ? "s" : "") + " ago";
          }
        } else {
          if (hr > 0) {
            age = hr + "시간 " + min + "분 전";
          } else if (min > 0) {
            age = min + "분 " + sec + "초 전";
          } else {
            age = sec + "초 전";
          }
        }

        var $item = $(
          '<tr class="transfer_list_table_item">\n' +
            '<td><div class="ellipsis">' +
            '<a href="https://etherscan.io/tx/' +
            item["txHash"] +
            '" target="_blank">' +
            item["txHash"] +
            "</a>" +
            "</div></td>\n" +
            "<td>" +
            age +
            "</td>\n" +
            '<td class="pc_show"><div class="ellipsis">' +
            item["from"] +
            "</div></td>\n" +
            '<td class="pc_show"><div class="ellipsis">' +
            item["to"] +
            "</div></td>\n" +
            "<td>" +
            Big(item["value"]).div(1000000000000000000).toString() +
            "</td>\n" +
            "</tr>"
        );

        $(".transfer_list_table").append($item);
      });
    }

    $(".transfer_list_date").html(getCurrentDateString(lang));
    TRANSFER_TIMER = setTimeout(function () {
      loadTransferList(lang);
    }, 5000);
  });
}

function pad0(x) {
  if (x < 10) {
    return "0" + x;
  } else {
    return x;
  }
}

// 특정 거래소의 1d/1m/1y/total high/low 로딩
function loadKrwRangeForExchange(prefix, exchange) {
  // 1년
  getJSONWithOptionalExchange("/api/getYearKrw", exchange, function (data) {
    $("." + prefix + "krw_1y_high").html(numberWithCommas(data["high_price"]));
    $("." + prefix + "krw_1y_low").html(numberWithCommas(data["low_price"]));
  });

  // 1개월
  getJSONWithOptionalExchange("/api/getMonthKrw", exchange, function (data) {
    $("." + prefix + "krw_1m_high").html(numberWithCommas(data["high_price"]));
    $("." + prefix + "krw_1m_low").html(numberWithCommas(data["low_price"]));
  });

  // 1일
  getJSONWithOptionalExchange("/api/getDayKrw", exchange, function (data) {
    $("." + prefix + "krw_1d_high").html(numberWithCommas(data["high_price"]));
    $("." + prefix + "krw_1d_low").html(numberWithCommas(data["low_price"]));
  });

  // 전체 기간
  getJSONWithOptionalExchange(
    "/api/getAccTradeVolumeKrw",
    exchange,
    function (data) {
      $("." + prefix + "krw_total_high").html(
        numberWithCommas(data["high_price"])
      );
      $("." + prefix + "krw_total_low").html(
        numberWithCommas(data["low_price"])
      );
    }
  );
}

// 특정 거래소 체결 이력 로딩
function loadTxListForExchange(lang, exchange, prefix) {
  getJSONWithOptionalExchange("/api/getLastKrwTx", exchange, function (data) {
    var rowSelector = "." + prefix + "_transaction_list_table_item";
    var tableSelector = "." + prefix + "_transaction_list_table";

    $(rowSelector).remove();

    if (data != null) {
      $.each(data, function (i, item) {
        var tradePrice = item["trade_price"];
        var tradeVolume = item["trade_volume"];
        var tradeAmount = numberWithCommas(
          Math.round(tradePrice * tradeVolume)
        );

        var d = new Date(item["timestamp"]);
        var tradeDate =
          d.getFullYear() +
          "-" +
          pad0(d.getMonth() + 1) +
          "-" +
          pad0(d.getDate()) +
          " " +
          pad0(d.getHours()) +
          ":" +
          pad0(d.getMinutes());

        var $item = $(
          '<tr class="' +
            prefix +
            '_transaction_list_table_item">\n' +
            "                    <td>" +
            tradeDate +
            "</td>\n" +
            "                    <td>" +
            tradePrice +
            "</td>\n" +
            "                    <td>" +
            tradeVolume +
            "</td>\n" +
            "                    <td>" +
            tradeAmount +
            "</td>\n" +
            "                    </tr>"
        );

        $(tableSelector).append($item);
      });
    }

    // Upbit(기본)에 대해서만 날짜 표시
    if (!exchange) {
      $(".transaction_list_date").html(getCurrentDateString(lang));
    }
  });
}

function loadTransactionList(lang) {
  if (TRANSACTION_TIMER != null) {
    clearInterval(TRANSACTION_TIMER);
  }

  // 1d/1m/1y/total high/low
  KRW_RANGE_MARKETS.forEach(function (m) {
    loadKrwRangeForExchange(m.prefix, m.exchange);
  });

  // 거래소별 체결 이력
  TX_MARKETS.forEach(function (m) {
    loadTxListForExchange(lang, m.exchange, m.prefix);
  });

  // 기존에도 자동 재호출은 주석 (원하면 여기서 타이머 추가 가능)
}

// 특정 거래소 오더북 로딩
function loadOrderBookForExchange(cfg) {
  getJSONWithOptionalExchange(
    "/api/getOrderbookKrw",
    cfg.exchange,
    function (data) {
      $("." + cfg.rowClass).remove();

      if (data != null) {
        var orderbook_units = data[0]["orderbook_units"];

        var bidTotal = 0;
        var askTotal = 0;

        for (var i = 0, l = 10; i < l; i++) {
          var item = orderbook_units[i];
          if (item == undefined) {
            break;
          }

          bidTotal += item["bid_size"];
          askTotal += item["ask_size"];

          var $itemBid = $(
            '<tr class="' +
              cfg.rowClass +
              '">\n' +
              "                    <td>" +
              numberWithCommas(Math.floor(item["bid_size"])) +
              "</td>\n" +
              "                    <td>" +
              numberWithCommas(Math.floor(bidTotal)) +
              "</td>\n" +
              "                    <td>" +
              numberWithCommas(item["bid_price"]) +
              "</td>\n" +
              "                    </tr>"
          );

          $(cfg.bidTable).append($itemBid);

          var $itemAsk = $(
            '<tr class="' +
              cfg.rowClass +
              '">\n' +
              "                    <td>" +
              numberWithCommas(item["ask_price"]) +
              "</td>\n" +
              "                    <td>" +
              numberWithCommas(Math.floor(askTotal)) +
              "</td>\n" +
              "                    <td>" +
              numberWithCommas(Math.floor(item["ask_size"])) +
              "</td>\n" +
              "                    </tr>"
          );

          $(cfg.askTable).append($itemAsk);
        }
      }
    }
  );
}

function loadOrderBookList(lang) {
  if (ORDER_BOOK_TIMER != null) {
    clearInterval(ORDER_BOOK_TIMER);
  }

  ORDERBOOK_MARKETS.forEach(function (cfg) {
    loadOrderBookForExchange(cfg);
  });

  ORDER_BOOK_TIMER = setTimeout(function () {
    loadOrderBookList(lang);
  }, 5000);
}

// 숫자 콤마: 정수부에만 콤마, 소수부는 원래대로(뒤 0 제거)
const numberWithCommas = (x) => {
  if (x === null || x === undefined || x === "") {
    return;
  }

  const num = Number(x);
  if (Number.isNaN(num)) {
    return x;
  }

  const str = num.toString();
  const [intPart, decPart] = str.split(".");

  const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decPart === undefined) {
    return intWithCommas;
  }

  const trimmedDec = decPart.replace(/0+$/, "");
  return trimmedDec ? `${intWithCommas}.${trimmedDec}` : intWithCommas;
};

const counter = ($counter, max, unit) => {
  let now = max;

  const handle = setInterval(() => {
    $counter.html(numberWithCommas(Math.ceil(max - now)) + unit);

    if (now < 1) {
      clearInterval(handle);
    }

    const step = now / 10;
    now -= step;
  }, 1);
};

// 모든 거래소 Ticker(52주/24h/퍼센트) 로딩
function loadAllTickerData(lang) {
  TICKER_MARKETS.forEach(function (cfg) {
    getJSONWithOptionalExchange(
      "/api/getTickerKrw",
      cfg.exchange,
      function (data) {
        if (!data || !data[0]) return;
        var item = data[0];

        // 52주 고저
        $(cfg.w52HighClass).html(
          numberWithCommas(item["highest_52_week_price"]) + " KRW"
        );
        $(cfg.w52HighDateClass).html(item["highest_52_week_date"]);
        $(cfg.w52LowClass).html(
          numberWithCommas(item["lowest_52_week_price"]) + " KRW"
        );
        $(cfg.w52LowDateClass).html(item["lowest_52_week_date"]);

        // 24h 거래량
        $(cfg.volumeClass).html(
          numberWithCommas(Math.floor(item["acc_trade_volume_24h"])) + " MOC"
        );

        // 24h 거래대금
        var priceText =
          numberWithCommas(Math.floor(item["acc_trade_price_24h"])) + " KRW";
        if (lang == "en") {
          priceText += " (24h)";
        }
        $(cfg.priceClass).html(priceText);

        // 퍼센트
        $(cfg.volumePerClass).html(
          numberWithCommas(
            (
              (item["acc_trade_volume_24h"] * 100) /
              MOSSLAND_MAX_SUPPLY
            ).toFixed(2)
          ) + "%"
        );
        $(cfg.pricePerClass).html(
          numberWithCommas(
            ((MOSSLAND_CIRCULATING_SUPPLY * 100) / MOSSLAND_MAX_SUPPLY).toFixed(
              2
            )
          ) + "%"
        );
      }
    );
  });
}

function loadData(lang) {
  // Market Data
  $.getJSON(BASE_URL + "/api/market/", function (data) {
    $.each(data, function (index, value) {
      if (lang === "en") {
        if (value["market_type"] === "mossland_marketcap_usd")
          setTimeout(
            () => counter($(".mossland_marketcap"), value["number"], " USD"),
            1
          );
        if (value["market_type"] === "coinmarketcap_marketcap_usd")
          setTimeout(
            () =>
              counter($(".coinmarketcap_marketcap"), value["number"], " USD"),
            1
          );
        if (value["market_type"] === "coingecko_marketcap_usd")
          setTimeout(
            () => counter($(".coingecko_marketcap"), value["number"], " USD"),
            1
          );
      } else {
        if (value["market_type"] === "mossland_marketcap_krw")
          setTimeout(
            () => counter($(".mossland_marketcap"), value["number"], " 원"),
            1
          );
        if (value["market_type"] === "coinmarketcap_marketcap_krw")
          setTimeout(
            () =>
              counter($(".coinmarketcap_marketcap"), value["number"], " 원"),
            1
          );
        if (value["market_type"] === "coingecko_marketcap_krw")
          setTimeout(
            () => counter($(".coingecko_marketcap"), value["number"], " 원"),
            1
          );
      }

      if (value["market_type"] === "mossland_circulating_supply") {
        MOSSLAND_CIRCULATING_SUPPLY = value["number"];
        setTimeout(
          () =>
            counter($(".mossland_circulating_supply"), value["number"], " moc"),
          1
        );
      }

      if (value["market_type"] === "coinmarketcap_circulating_supply")
        setTimeout(
          () =>
            counter(
              $(".coinmarketcap_circulating_supply"),
              value["number"],
              " moc"
            ),
          1
        );
      if (value["market_type"] === "coingecko_circulating_supply")
        setTimeout(
          () =>
            counter(
              $(".coingecko_circulating_supply"),
              value["number"],
              " moc"
            ),
          1
        );

      if (value["market_type"] === "mossland_max_supply") {
        MOSSLAND_MAX_SUPPLY = value["number"];
        setTimeout(
          () => counter($(".mossland_max_supply"), value["number"], " moc"),
          1
        );
      }
    });

    // 모든 거래소 Ticker 공통 처리
    loadAllTickerData(lang);
  });

  // Release Data
  $.getJSON(BASE_URL + "/api/recent_release/", function (data) {
    var html = "";
    $.each(data, function (index, value) {
      html += "<tr>";
      html += "<td>" + dayjs(value["date"]).format("YYYY.MM") + "</td>";
      if (lang === "en") html += "<td>" + value["desc_en"] + "</td>";
      else html += "<td>" + value["desc"] + "</td>";
      html +=
        "<td>" + "+" + (~~value["value"]).toLocaleString() + " moc" + "</td>";
      html += "</tr>";
    });
    $(".recent_release").html(html);
  });
  $.getJSON(BASE_URL + "/api/expected_release/", function (data) {
    var html = "";
    $.each(data, function (index, value) {
      html += "<tr>";
      html += "<td>" + dayjs(value["date"]).format("YYYY.MM") + "</td>";
      if (lang === "en") html += "<td>" + value["desc_en"] + "</td>";
      else html += "<td>" + value["desc"] + "</td>";
      html +=
        "<td>" + "+" + (~~value["value"]).toLocaleString() + " moc" + "</td>";
      html += "</tr>";
    });
    $(".expected_release").html(html);
  });

  // Disclosure & Materials
  $.getJSON(BASE_URL + "/api/disclosure/", function (data) {
    var html = "";
    $.each(data, function (index, value) {
      html += "<tr>";
      html +=
        '<td class="date">' + dayjs(value["date"]).format("YYYY.MM") + "</td>";
      if (lang === "en")
        html += '<td class="body">' + value["desc_en"] + "</td>";
      else html += '<td class="body">' + value["desc"] + "</td>";
      html +=
        '<td><button class="btn_view" onclick="window.open(\'' +
        value["link"] +
        "')\">View</button></td>";
      html += "</tr>";
    });
    $(".disclosure").html(html);
  });

  $.getJSON(BASE_URL + "/api/materials/", function (data) {
    var html = "";
    $.each(data, function (index, value) {
      html += "<tr>";
      html +=
        '<td class="date">' + dayjs(value["date"]).format("YYYY") + "</td>";
      if (lang === "en")
        html += '<td class="body">' + value["desc_en"] + "</td>";
      else html += '<td class="body">' + value["desc"] + "</td>";
      html +=
        '<td><button class="btn_view" onclick="window.open(\'' +
        value["link"] +
        "')\">View</button></td>";
      html += "</tr>";
    });
    $(".materials").html(html);
  });

  $.getJSON(BASE_URL + "/api/getCodeFrequency", function (data) {
    var list = data;

    var last4weekAdd = 0;
    var last4weekDel = 0;
    for (var i = list.length - 1; list.length - 5 < i; --i) {
      var item = list[i];
      last4weekAdd += item["add"];
      last4weekDel += item["del"];
    }

    $(".github_frq_tw_add").html(numberWithCommas(last4weekAdd));
    $(".github_frq_tw_del").html(numberWithCommas(Math.abs(last4weekDel)));

    var last8weekAdd = 0;
    var last8weekDel = 0;
    for (var i = list.length - 1; list.length - 9 < i; --i) {
      var item = list[i];
      last8weekAdd += item["add"];
      last8weekDel += item["del"];
    }
    $(".github_frq_pw_add").html(numberWithCommas(last8weekAdd));
    $(".github_frq_pw_del").html(numberWithCommas(Math.abs(last8weekDel)));

    var add1y = 0;
    var del1y = 0;

    for (var i = 0, l = 52; i < l; i++) {
      var item = list[list.length - 1 - i];
      add1y += item["add"];
      del1y += item["del"];
    }

    $(".github_frq_1y_add").html(numberWithCommas(add1y));
    $(".github_frq_1y_del").html(numberWithCommas(Math.abs(del1y)));
  });

  $.getJSON(BASE_URL + "/api/getCommitCount", function (data) {
    var list = data["all"];

    var initValue = 0;
    var last4weeks = list
      .slice(list.length - 4, list.length)
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        initValue
      );

    var initValue2 = 0;
    var last8weeks = list
      .slice(list.length - 8, list.length)
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        initValue2
      );

    $(".github_commit_tw").html(numberWithCommas(last4weeks));
    $(".github_commit_pw").html(numberWithCommas(last8weeks));

    var total = 0;

    for (var i = 0, l = 52; i < l; i++) {
      var item = list[list.length - 1 - i];
      total += item;
    }

    $(".github_commit_1y").html(numberWithCommas(total));
  });

  loadTransferList(lang);
  loadTransactionList(lang);
  loadOrderBookList(lang);
}

$(window).ready(function () {
  console.log("window.ready");
  Big.PE = 1000000;
  Big.NE = -1000000;

  $(".language_container").on("click", function (e) {
    e.preventDefault();
    $(".popup_language").toggleClass("on");

    var degreeValue = 180;
    if ($(".popup_language").is(":visible")) {
      degreeValue = 180;
    } else {
      degreeValue = 0;
    }
    rotate(degreeValue);
    function rotate(degree) {
      $("img.language_arrow").css(
        {
          "-webkit-transform": "rotate(" + degree + "deg)",
          "-moz-transform": "rotate(" + degree + "deg)",
          "-ms-transform": "rotate(" + degree + "deg)",
          "-o-transform": "rotate(" + degree + "deg)",
          transform: "rotate(" + degree + "deg)",
        },
        100
      );
    }
  });

  $(".language_type").on("click", function (e) {
    e.preventDefault();
    var jThis = $(this);
    var jValue = jThis.attr("value");

    if (jValue == "en") {
      $("span.language_text").html("English");
    } else if (jValue == "kr") {
      $("span.language_text").html("한국어");
    }

    setLanguage(jValue);

    $(".language_container").trigger("click");
  });

  loadData("ko");

  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  $(".current_date").html(
    "(" + today.toISOString().replace("T", " ").substring(0, 10) + " 기준)"
  );
});

// 아래부터는 기존 commaNumber 유틸 (Vue에서 사용 중)

function commaNumber(inputNumber, optionalSeparator, optionalDecimalChar) {
  const decimalChar = optionalDecimalChar || ".";
  let stringNumber;
  {
    let number;
    switch (typeof inputNumber) {
      case "string":
        if (inputNumber.length < (inputNumber[0] === "-" ? 5 : 4)) {
          return inputNumber;
        }
        stringNumber = inputNumber;
        number = Number(
          decimalChar !== "."
            ? stringNumber.replace(decimalChar, ".")
            : stringNumber
        );
        break;
      case "number":
        stringNumber = String(inputNumber);
        number = inputNumber;
        if ("." !== decimalChar && !Number.isInteger(inputNumber)) {
          stringNumber = stringNumber.replace(".", decimalChar);
        }
        break;
      default:
        return inputNumber;
    }
    if (
      (-1000 < number && number < 1000) ||
      isNaN(number) ||
      !isFinite(number)
    ) {
      return stringNumber;
    }
  }
  {
    const decimalIndex = stringNumber.lastIndexOf(decimalChar);
    let decimal;
    if (decimalIndex > -1) {
      decimal = stringNumber.slice(decimalIndex);
      stringNumber = stringNumber.slice(0, decimalIndex);
    }
    const parts = parse(stringNumber, optionalSeparator || ",");
    if (decimal) {
      parts.push(decimal);
    }
    return parts.join("");
  }
}

function parse(string, separator) {
  let i = ((string.length - 1) % 3) + 1;
  if (i === 1 && string[0] === "-") {
    i = 4;
  }
  const strings = [string.slice(0, i)];
  for (; i < string.length; i += 3) {
    strings.push(separator, string.substr(i, 3));
  }
  return strings;
}

function bindWith(separator, decimalChar) {
  return function (number) {
    return commaNumber(number, separator, decimalChar);
  };
}
