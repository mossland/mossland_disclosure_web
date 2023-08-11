var BASE_URL = 'https://disclosure.moss.land';
var TRANSFER_TIMER = null;
var TRANSACTION_TIMER = null;
var ORDER_BOOK_TIMER = null;
var MOSSLAND_MAX_SUPPLY = 500000000;
var MOSSLAND_CIRCULATING_SUPPLY = 0;

$.lang = {};

$.lang.ko = {
    0: '홈페이지',
    1: '깃허브',
    2: '트위터',
    3: '시가총액',
    4: '(실시간)',
    5: '모스랜드 제공',
    6: '코인마켓캡 제공',
    7: '코인게코 제공',
    8: '현재 유통량',
    9: '최초발행',
    10: '총 발행 한도 (추가 발행 불가능)',
    11: '연락처',
    12: '다운로드',
    13: '유통량 계획',
    14: '재단 보유 지갑 리스트',
    15: '(유통되지 않는 모스코인을 보관하는 지갑)',
    16: '재단 관리 지갑 #1',
    17: '재단 관리 지갑 #2',
    18: '최근 유통량 변동 상세',
    19: '(최근 3개월)',
    20: '예정 유통량 변동 상세',
    21: '(향후 3개월)',
    22: '모스랜드 공시',
    23: '모스랜드 공개 문서',
    24: '모스코인 트랜잭션 활성화',
    25: '모스코인 (MOC)',
    26: '트랜잭션',
    27: '모스코인 마켓 활성화',
    28: '거래량 (24h)',
    29: '거래대금 (24h)',
    30: '52주 최고/52주 최저',
    31: '거래량/총발행량 (24h)',
    32: '유통량/총발행량 (24h)',
    33: '체결시간',
    34: '체결가격(KRW)',
    35: '체결량(MOC)',
    36: '체결금액(KRW)',
    37: '모스코인 오픈소스 활성화',
    38: '기본 정보',
    39: '가격 지표',
    40: '홀더',
    41: '컨트랙트 주소',
    42: '컨트랙트 소스코드',
    43: '기간',
    44: '전체 기간',
    45: '최근 24시간',
    46: '최근 30일',
    47: '최근 365일',
    48: '최고가(KRW)',
    49: '최저가(KRW)',
    50: '토큰 전송 기록',
    51: '트랜잭션 해시',
    52: '시간',
    53: '보낸사람',
    54: '받는사람',
    55: '값(MOC)',
    56: '실시간 호가',

    57: '수량(MOC)',
    58: '누적량(MOC)',
    59: '평균매수호가(KRW)',
    60: '평균매도호가(KRW)',
    61: '체결 이력',

    62: 'Github Code Frequency',
    63: 'Github Commits',
    64: '추가 항목',
    65: '삭제 항수',
    66: '횟수',

    67: '이번주',
    68: '저번주',
    69: '지난 4주간',
    70: '지난 1년간',

    71: '&nbsp;모스랜드 DAO 활동',
    72: '전체 안건 수',
    73: '건',
    74: '누적 투표 수',
    75: '회',
    76: '누적 투표 MMOC',
    77: '최근 DAO 안건',
    78: '진행중',
    79: '마감',
    80: '표',
    81: '최근 투표',
    82: '(including private repository)',
    83: '블로그'
};

$.lang.en = {
    0: 'Website',
    1: 'GitHub',
    2: 'Twitter',
    3: 'Market Cap',
    4: '(Real-time)',
    5: 'Mossland',
    6: 'CoinMarketCap',
    7: 'CoinGecko',
    8: 'Circulating Supply',
    9: 'Date of issuance',
    10: 'total issuance (No Extra Issuances Allowed)',
    11: 'E-Mail',
    12: 'Download',
    13: 'Circulating Supply Plan',
    14: 'Foundation Wallet List',
    15: '(Wallets to hold Non-Circulating Mosscoin)',
    16: 'Foundation Wallet #1',
    17: 'Foundation Wallet #2',
    18: 'Expected Changes in the Circulating Supply',
    19: '(Within Next 3 Months)',
    20: 'Recent Changes in the Circulating Supply',
    21: '(Within 3 months)',
    22: 'Mossland Disclosure',
    23: 'Mossland Materials',
    24: 'MossCoin Transaction Activity',
    25: 'MossCoin (MOC)',
    26: 'Trades',
    27: 'MossCoin Market Activity',
    28: 'Volume (24h)',
    29: 'Value (24h)',
    30: '52w High/52w Low',
    31: 'Volume/Market cap (24h)',
    32: 'Circulating supply/Market cap (24h)',
    33: 'Time',
    34: 'Price(KRW)',
    35: 'Amount(MOC)',
    36: 'Total(KRW)',
    37: 'Mossland Opensource Activity',
    38: 'Information',
    39: 'Price performance',
    40: 'Holders',
    41: 'Contract Address',
    42: 'Contract Source Code',
    43: 'Period',
    44: 'Total',
    45: 'Last 24 hours',
    46: 'Last 30 days',
    47: 'Last 365 days',
    48: 'All-time high(KRW)',
    49: 'All-time low(KRW)',
    50: 'Token Transfer',
    51: 'TX Hash',
    52: 'Age',
    53: 'From',
    54: 'To',
    55: 'Value(MOC)',
    56: 'Order Book',

    57: 'Amount(MOC)',
    58: 'Total(MOC)',
    59: 'Bid Price(KRW)',
    60: 'Ask Price(KRW)',
    61: 'Transactions',

    62: 'Github Code Frequency',
    63: 'Github Commits',
    64: 'The number of additions',
    65: 'The number of deletions',
    66: 'Counts',

    67: 'The current week',
    68: 'The previous week',
    69: 'Last 4 weeks',
    70: 'Last 1 year',

    71: '&nbsp;Mossland DAO Activity',
    72: 'Total Proposal Count',
    73: 'Proposals',
    74: 'Total Vote Count',
    75: 'Votes',
    76: 'Total Vote MMOC',
    77: 'Recent DAO Proposals',
    78: 'Active',
    79: 'Closed',
    80: 'Votes',
    81: 'Recent Votes',
    82: '(including private repository)',
    83: 'Blog'
};


const { createApp } = Vue;
createApp({
    data() {
        return {
            surveyData: {
                "success": true,
                "totalSurveyCount": 52,
                "totalVoteCount": { "count": "107298", "num": "10380118.036661600000752" },
                "lastVote": [],
                "lastResponse": [],
            },
            voteShowSize: 5,
            voteSlideSize: 1,
            startIdx: 0,

            respShowSize: 10,
            respSlideSize: 1,
            respStartIdx: 0,
        }
    },
    computed: {
        locale() {
            return window.currentLanguage || 'ko';
        },
        accVoteCount() {
            return commaNumber(Big(this.surveyData.totalVoteCount.count).toString());
        },
        accVoteMmoc() {
            return commaNumber(Big(this.surveyData.totalVoteCount.num).toFixed(2, 0));
        },
        dupVoteList() {
            const data = [...this.surveyData.lastVote, ...this.surveyData.lastVote];
            return data.slice(
                this.startIdx % this.surveyData.lastVote.length,
                (this.startIdx % this.surveyData.lastVote.length) + this.voteShowSize
            );
        },
        dupRespList() {
            const data = [...this.surveyData.lastResponse, ...this.surveyData.lastResponse];
            return data.slice(
                this.respStartIdx % this.surveyData.lastResponse.length,
                (this.respStartIdx % this.surveyData.lastResponse.length) + this.respShowSize
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
                        }
                    });
                }

                const totalResponse = v.responses.length;
                let ratioSum = Big(0);
                let percentSum = Big(0);
                v.responses.forEach((r, ridx) => {
                    acc[v.id][r.selection].count += 1;
                    const rat = Big(acc[v.id][r.selection].count).div(totalResponse).toFixed(2, 0);
                    acc[v.id][r.selection].ratio = rat;
                    ratioSum = ratioSum.plus(rat);
                    const perc = Big(acc[v.id][r.selection].ratio).times(100).toFixed(2, 0);
                    acc[v.id][r.selection].percent = perc;
                    percentSum = percentSum.plus(perc);

                    if (ridx === r.length - 1) {
                        const diff = Big(100).sub(percentSum);
                        acc[v.id][r.selection].percent = Big(acc[v.id][r.selection].percent).plus(diff).toString();

                        const ratDiff = Big(1).sub(ratioSum);
                        acc[v.id][r.selection].ratio = Big(acc[v.id][r.selection].ratio).plus(ratDiff).toString();
                    }
                });

                return acc;
            }, {});
        }
    },
    async created() {
        try {
            const data = await $.getJSON('/metaverse/survey-list');
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
                    const data = await $.getJSON('/metaverse/survey-list');
                    this.surveyData = data;
                } catch (e) {

                } finally {
                    this.fetchSurvey();
                }
            }, 1000 * 60 * 5);
        },
        onAfterEnter(el, done) {
            const vid = el.getAttribute('data-id');
            const ele = Array.from(el.querySelector('.figure').querySelectorAll('.selection__ele'));
            ele.forEach((e, idx) => {
                this.$nextTick(() => {
                    const sidx = e.getAttribute('data-idx');
                    e.style.flex = `${Math.max(1, parseFloat(this.selectionData[vid][idx].percent))} 1`;
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
                return dayjs(val).format('YYYY-MM-DD');
            } catch (e) {
                return val;
            }
        }
    }
}).mount('#app');

function setLanguage(currentLanguage) {
    console.log('setLanguage', arguments);

    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }

    $('[data-langNum]').each(function () {
        var $this = $(this);

        $this.html($.lang[currentLanguage][$this.data('langnum')]);
    });

    if (currentLanguage == 'ko') {
        $('.current_date').html('(' + today.toISOString().replace('T', ' ').substring(0, 10) + ' 기준)');
    }
    else if (currentLanguage == 'en') {
        $('.current_date').html('(Updated on ' + today.toISOString().replace('T', ' ').substring(0, 10) + ')');
    }

    loadData(currentLanguage);
    window.currentLanguage = currentLanguage;
};


function getCurrentDateString(lang) {

    var today = new Date();
    if (lang == 'en') {
        return '(Updated on ' + today.toISOString().replace('T', ' ').replace('T', ' ').replace('Z', ' ').substring(0, 19) + ')';
    }

    return '(' + today.toISOString().replace('T', ' ').replace('Z', ' ').substring(0, 19) + ' 기준)';
}

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}

function loadTransferList(lang) {

    if (TRANSFER_TIMER != null) {
        clearInterval(TRANSFER_TIMER);
    }

    $.getJSON(BASE_URL + '/api/getHolderCount', function (data) {
        $('.holder_count').html(numberWithCommas(data['count']));
        // setTimeout(() => counter($('.holder_count'), data["count"], ''), 1);
    });

    $.getJSON(BASE_URL + '/api/getLastYearTx', function (data) {
        $('.transactions_1y').html(numberWithCommas(data['count']));
        // setTimeout(() => counter($('.transactions_1y'), data["count"], ''), 1);
    });
    $.getJSON(BASE_URL + '/api/getLastDayTx', function (data) {
        $('.transactions_1d').html(numberWithCommas(data['count']));
        // setTimeout(() => counter($('.transactions_1d'), data["count"], ''), 1);
    });
    // $.getJSON(BASE_URL + '/api/getTotalTx', function(data){
    // $('.transactions_total').html(numberWithCommas(data['count']));
    // setTimeout(() => counter($('.transactions_total'), data["count"], ''), 1);
    // });

    $.getJSON(BASE_URL + '/api/getLastTx', function (data) {

        $('.transfer_list_table_item').remove();

        if (data != null) {

            $.each(data, function (i, item) {

                var ts = item['timestamp'];
                var nowTs = new Date().getTime() / 1000;


                var totalSec = Math.floor(nowTs - ts);
                var sec = totalSec % 60;
                var min = Math.floor(totalSec / 60) % 60;
                var hr = Math.floor(totalSec / 3600);


                var age = '-';

                if (lang === 'en') {

                    if (hr > 0) {
                        age = hr + ' hr' + (hr > 1 ? 's' : '') + ' ' + min + ' min' + (min > 1 ? 's' : '') + ' ago';
                    } else if (min > 0) {
                        age = min + ' min' + (min > 1 ? 's' : '') + ' ' + sec + ' sec' + (sec > 1 ? 's' : '') + ' ago';
                    } else {
                        age = sec + ' sec' + (sec > 1 ? 's' : '') + ' ago';
                    }

                } else {

                    if (hr > 0) {
                        age = hr + '시간 ' + min + '분' + ' 전';
                    } else if (min > 0) {
                        age = min + '분 ' + sec + '초' + ' 전';
                    } else {
                        age = sec + '초 전';
                    }
                }

                var $item = $('<tr class="transfer_list_table_item">\n' +
                    '<td><div class="ellipsis">' +
                    '<a href="https://scan.luniverse.io/transactions/' + item['txHash'] + '" target="_blank">' + item['txHash'] + '</a>' +
                    '</div></td>\n' +

                    '<td>' +
                    age +
                    '</td>\n' +

                    '<td class="pc_show"><div class="ellipsis">' +
                    item['from'] +
                    '</div></td>\n' +
                    '<td class="pc_show"><div class="ellipsis">' +
                    item['to'] +
                    '</div></td>\n' +
                    '<td>' +
                    (Big(item['value']).div(1000000000000000000).toString()) +
                    '</td>\n' +
                    '</tr>');

                $('.transfer_list_table').append($item);

            });

        }

        $('.transfer_list_date').html(getCurrentDateString(lang));

        TRANSFER_TIMER = setTimeout(function () {
            loadTransferList(lang);
        }, 5000);
    });
}


function pad0(x) {

    if (x < 10) {
        return '0' + x;
    } else {
        return x;
    }
}

function loadTransactionList(lang) {

    if (TRANSACTION_TIMER != null) {
        clearInterval(TRANSACTION_TIMER);
    }

    $.getJSON(BASE_URL + '/api/getYearKrw', function (data) {
        $('.krw_1y_high').html(numberWithCommas(data['high_price']));
        $('.krw_1y_low').html(numberWithCommas(data['low_price']));
    });

    $.getJSON(BASE_URL + '/api/getMonthKrw', function (data) {
        $('.krw_1m_high').html(numberWithCommas(data['high_price']));
        $('.krw_1m_low').html(numberWithCommas(data['low_price']));
    });


    $.getJSON(BASE_URL + '/api/getDayKrw', function (data) {
        $('.krw_1d_high').html(numberWithCommas(data['high_price']));
        $('.krw_1d_low').html(numberWithCommas(data['low_price']));
    });

    $.getJSON(BASE_URL + '/api/getAccTradeVolumeKrw', function (data) {
        $('.krw_total_high').html(numberWithCommas(data['high_price']));
        $('.krw_total_low').html(numberWithCommas(data['low_price']));
    });

    $.getJSON(BASE_URL + '/api/getLastKrwTx', function (data) {

        $('.transaction_list_table_item').remove();

        if (data != null) {

            $.each(data, function (i, item) {

                // "trade_price": 105,
                //     "trade_volume": 172.5,

                var tradePrice = item['trade_price'];
                var tradeVolume = item['trade_volume'];
                var tradeAmount = numberWithCommas(Math.round(tradePrice * tradeVolume));

                var d = new Date(item['timestamp']);
                var tradeDate = d.getFullYear() + '-' + pad0(d.getMonth() + 1) + '-' + pad0(d.getDate()) + ' ' + pad0(d.getHours()) + ':' + pad0(d.getMinutes());

                var $item = $('<tr class="transaction_list_table_item">\n' +
                    '                    <td>' + tradeDate + '</td>\n' +
                    '                    <td>' + tradePrice + '</td>\n' +
                    '                    <td>' + tradeVolume + '</td>\n' +
                    '                    <td>' + tradeAmount + '</td>\n' +
                    '                    </tr>');

                $('.transaction_list_table').append($item);

            });

        }

        $('.transaction_list_date').html(getCurrentDateString(lang));

        TRANSACTION_TIMER = setTimeout(function () {
            loadTransactionList(lang);
        }, 5000);
    });
}

function loadOrderBookList(lang) {

    if (ORDER_BOOK_TIMER != null) {
        clearInterval(ORDER_BOOK_TIMER);
    }

    $.getJSON(BASE_URL + '/api/getOrderbookKrw', function (data) {

        $('.order_book_table_item').remove();

        if (data != null) {

            var orderbook_units = data[0]['orderbook_units'];

            var bidTotal = 0;
            var askTotal = 0;

            for (var i = 0, l = 10; i < l; i++) {

                var item = orderbook_units[i];
                if (item == undefined) {
                    break;
                }

                bidTotal += item['bid_size'];
                askTotal += item['ask_size'];

                var $itemBid = $('<tr class="order_book_table_item">\n' +
                    '                    <td>' + numberWithCommas(Math.floor(item['bid_size'])) + '</td>\n' +
                    '                    <td>' + numberWithCommas(Math.floor(bidTotal)) + '</td>\n' +
                    '                    <td>' + numberWithCommas(item['bid_price']) + '</td>\n' +
                    '                    </tr>');

                $('.order_book_bid_table').append($itemBid);

                var $itemAsk = $('<tr class="order_book_table_item">\n' +
                    '                    <td>' + numberWithCommas(item['ask_price']) + '</td>\n' +
                    '                    <td>' + numberWithCommas(Math.floor(askTotal)) + '</td>\n' +
                    '                    <td>' + numberWithCommas(Math.floor(item['ask_size'])) + '</td>\n' +
                    '                    </tr>');

                $('.order_book_ask_table').append($itemAsk);
            }
        }

        ORDER_BOOK_TIMER = setTimeout(function () {
            loadOrderBookList(lang);
        }, 5000);
    });
}


const numberWithCommas = (x) => {

    if (x == undefined || isNaN(x)) {
        return;
    }

    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const counter = ($counter, max, unit) => {
    let now = max;

    const handle = setInterval(() => {
        $counter.html(numberWithCommas(Math.ceil(max - now)) + unit);

        // 목표수치에 도달하면 정지
        if (now < 1) {
            clearInterval(handle);
        }

        // 증가되는 값이 계속하여 작아짐
        const step = now / 10;

        // 값을 적용시키면서 다음 차례에 영향을 끼침
        now -= step;
    }, 1);
}

function loadData(lang) {

    //setTimeout(() => counter($('.mossland_circulating_supply'), 382489688, 'moc'), 1);
    //setTimeout(() => counter($('.mossland_marketcap'), 999999, '억원'), 1);

    // Object.keys($.lang.en).length
    // data-langNum="0"

    /*
    var num = Object.keys($.lang.en).length;
    $('.mossland_marketcap').attr("data-langNum", num);
    $.lang.en.add({ num : '' });
    $.lang.ko.add({ num : '' });
    */


    // Market Data
    $.getJSON(BASE_URL + '/api/market/', function (data) {
        $.each(data, function (index, value) {
            if (lang === 'en') {
                if (value["market_type"] === "mossland_marketcap_usd")
                    setTimeout(() => counter($('.mossland_marketcap'), value["number"], ' USD'), 1);
                if (value["market_type"] === "coinmarketcap_marketcap_usd")
                    setTimeout(() => counter($('.coinmarketcap_marketcap'), value["number"], ' USD'), 1);
                if (value["market_type"] === "coingecko_marketcap_usd")
                    setTimeout(() => counter($('.coingecko_marketcap'), value["number"], ' USD'), 1);
            } else {
                if (value["market_type"] === "mossland_marketcap_krw")
                    setTimeout(() => counter($('.mossland_marketcap'), value["number"], ' 원'), 1);
                if (value["market_type"] === "coinmarketcap_marketcap_krw")
                    setTimeout(() => counter($('.coinmarketcap_marketcap'), value["number"], ' 원'), 1);
                if (value["market_type"] === "coingecko_marketcap_krw")
                    setTimeout(() => counter($('.coingecko_marketcap'), value["number"], ' 원'), 1);
            }

            if (value["market_type"] === "mossland_circulating_supply") {
                MOSSLAND_CIRCULATING_SUPPLY = value["number"];
                setTimeout(() => counter($('.mossland_circulating_supply'), value["number"], ' moc'), 1);
            }

            if (value["market_type"] === "coinmarketcap_circulating_supply")
                setTimeout(() => counter($('.coinmarketcap_circulating_supply'), value["number"], ' moc'), 1);
            if (value["market_type"] === "coingecko_circulating_supply")
                setTimeout(() => counter($('.coingecko_circulating_supply'), value["number"], ' moc'), 1);

            if (value["market_type"] === "mossland_max_supply") {
                MOSSLAND_MAX_SUPPLY = value['number'];
                setTimeout(() => counter($('.mossland_max_supply'), value["number"], ' moc'), 1);
            }
        });

        $.getJSON(BASE_URL + '/api/getTickerKrw', function (data) {
            var item = data[0];
            // setTimeout(() => counter($('.w52_high'), item["highest_52_week_price"], ''), 1);
            $('.w52_high').html(numberWithCommas(item['highest_52_week_price']) + ' KRW');
            $('.w52_high_date').html(item['highest_52_week_date']);
            // setTimeout(() => counter($('.w52_low'), item["lowest_52_week_price"], ''), 1);
            $('.w52_low').html(numberWithCommas(item['lowest_52_week_price']) + ' KRW');
            $('.w52_low_date').html(item['lowest_52_week_date']);

            $('.acc_trade_volume_24h').html(numberWithCommas(Math.floor(item['acc_trade_volume_24h'])) + ' MOC');

            if (lang == 'en') {
                $('.acc_trade_price_24h').html(numberWithCommas(Math.floor(item['acc_trade_price_24h'])) + ' KRW (24h)');
            } else {
                $('.acc_trade_price_24h').html(numberWithCommas(Math.floor(item['acc_trade_price_24h'])) + ' KRW');
            }

            $('.acc_trade_volume_24h_per').html(numberWithCommas((item['acc_trade_volume_24h'] * 100 / MOSSLAND_MAX_SUPPLY).toFixed(2)) + '%');
            $('.acc_trade_price_24h_per').html(numberWithCommas((MOSSLAND_CIRCULATING_SUPPLY * 100 / MOSSLAND_MAX_SUPPLY).toFixed(2)) + '%');

        });
    });

    // Release Data
    $.getJSON(BASE_URL + '/api/recent_release/', function (data) {
        var html = "";
        $.each(data, function (index, value) {
            html += "<tr>";
            html += "<td>" + dayjs(value["date"]).format('YYYY.MM') + "</td>";
            if (lang === 'en')
                html += "<td>" + value["desc_en"] + "</td>";
            else
                html += "<td>" + value["desc"] + "</td>";
            html += "<td>" + "+" + (~~value["value"]).toLocaleString() + " moc" + "</td>";
            html += "</tr>";
        });
        $('.recent_release').html(html);
    });
    $.getJSON(BASE_URL + '/api/expected_release/', function (data) {
        var html = "";
        $.each(data, function (index, value) {
            html += "<tr>";
            html += "<td>" + dayjs(value["date"]).format('YYYY.MM') + "</td>";
            if (lang === 'en')
                html += "<td>" + value["desc_en"] + "</td>";
            else
                html += "<td>" + value["desc"] + "</td>";
            html += "<td>" + "+" + (~~value["value"]).toLocaleString() + " moc" + "</td>";
            html += "</tr>";
        });
        $('.expected_release').html(html);
    });


    // Disclosure & Materials
    $.getJSON(BASE_URL + '/api/disclosure/', function (data) {
        var html = "";
        $.each(data, function (index, value) {
            html += "<tr>";
            html += "<td class=\"date\">" + dayjs(value["date"]).format('YYYY.MM') + "</td>";
            if (lang === 'en')
                html += "<td class=\"body\">" + value["desc_en"] + "</td>";
            else
                html += "<td class=\"body\">" + value["desc"] + "</td>";
            html += "<td><button class=\"btn_view\" onclick=\"window.open('" + value["link"] + "')\">View</button></td>";
            html += "</tr>";
        });
        $('.disclosure').html(html);
    });

    $.getJSON(BASE_URL + '/api/materials/', function (data) {
        var html = "";
        $.each(data, function (index, value) {
            html += "<tr>";
            html += "<td class=\"date\">" + dayjs(value["date"]).format('YYYY') + "</td>";
            if (lang === 'en')
                html += "<td class=\"body\">" + value["desc_en"] + "</td>";
            else
                html += "<td class=\"body\">" + value["desc"] + "</td>";
            html += "<td><button class=\"btn_view\" onclick=\"window.open('" + value["link"] + "')\">View</button></td>";
            html += "</tr>";
        });
        $('.materials').html(html);
    });


    $.getJSON(BASE_URL + '/api/getCodeFrequency', function (data) {

        var list = data;

        var lastItem = list[list.length - 1];
        $('.github_frq_tw_add').html(numberWithCommas(lastItem['add']));
        $('.github_frq_tw_del').html(numberWithCommas(Math.abs(lastItem['del'])));

        var prevItem = list[list.length - 2];
        $('.github_frq_pw_add').html(numberWithCommas(prevItem['add']));
        $('.github_frq_pw_del').html(numberWithCommas(Math.abs(prevItem['del'])));


        var add1y = 0;
        var del1y = 0;

        for (var i = 0, l = 52; i < l; i++) {

            var item = list[list.length - 1 - i];
            add1y += item['add'];
            del1y += item['del'];
        }

        $('.github_frq_1y_add').html(numberWithCommas(add1y));
        $('.github_frq_1y_del').html(numberWithCommas(Math.abs(del1y)));
    });


    $.getJSON(BASE_URL + '/api/getCommitCount', function (data) {

        var list = data['all'];

        var lastItem = list[list.length - 1];
        $('.github_commit_tw').html(numberWithCommas(lastItem));

        var prevItem = list[list.length - 2];
        $('.github_commit_pw').html(numberWithCommas(prevItem));

        var total = 0;

        for (var i = 0, l = 52; i < l; i++) {

            var item = list[list.length - 1 - i];
            total += item;
        }

        $('.github_commit_1y').html(numberWithCommas(total));
    })


    loadTransferList(lang);
    loadTransactionList(lang);
    loadOrderBookList(lang);
}

$(window).ready(function () {
    console.log('window.ready');
    Big.PE = 1000000;
    Big.NE = -1000000;

    $('.language_container').on('click', function (e) {
        e.preventDefault();
        $('.popup_language').toggleClass("on");

        var degreeValue = 180;
        if ($('.popup_language').is(':visible')) {
            degreeValue = 180;
        } else {
            degreeValue = 0;
        }
        rotate(degreeValue);
        function rotate(degree) {
            $('img.language_arrow').css({
                '-webkit-transform': 'rotate(' + degree + 'deg)',
                '-moz-transform': 'rotate(' + degree + 'deg)',
                '-ms-transform': 'rotate(' + degree + 'deg)',
                '-o-transform': 'rotate(' + degree + 'deg)',
                'transform': 'rotate(' + degree + 'deg)',
            }, 100);
        }
    });

    $('.language_type').on('click', function (e) {
        e.preventDefault();
        var jThis = $(this);
        var jValue = jThis.attr('value');

        if (jValue == 'en') {
            $('span.language_text').html('English');
        } else if (jValue == 'kr') {
            $('span.language_text').html('한국어');
        }

        setLanguage(jValue);

        $('.language_container').trigger('click');
    });

    loadData("ko");

    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    //$('.box_content.date').html(year + ' / ' + month );
    $('.current_date').html('(' + today.toISOString().replace('T', ' ').substring(0, 10) + ' 기준)');
});


function commaNumber(inputNumber, optionalSeparator, optionalDecimalChar) {

    // default `decimalChar` is a period
    const decimalChar = optionalDecimalChar || '.'

    let stringNumber // we assign this in the switch block and need it later.

    {
        let number // we assign this in the switch block and need it right after.

        switch (typeof inputNumber) {

            case 'string':

                // if there aren't enough digits to need separators then return it
                // NOTE: some numbers which are too small will get passed this
                //       when they have decimal values which make them too long here.
                //       but, the number value check after this switch will catch it.
                if (inputNumber.length < (inputNumber[0] === '-' ? 5 : 4)) {
                    return inputNumber
                }

                // remember it as a string in `stringNumber` and convert to a Number
                stringNumber = inputNumber

                // if they're not using the Node standard decimal char then replace it
                // before converting.
                number = Number(
                    (decimalChar !== '.') ? stringNumber.replace(decimalChar, '.') : stringNumber
                )
                break

            // convert to a string.
            // NOTE: don't check if the number is too small before converting
            //       because we'll need to return `stringNumber` anyway.
            case 'number':
                stringNumber = String(inputNumber)
                number = inputNumber
                // create the string version with the decimalChar they specified.
                // this matches what the above case 'string' produces,
                // and, fixes the bug *not* doing this caused.
                if ('.' !== decimalChar && !Number.isInteger(inputNumber)) {
                    stringNumber = stringNumber.replace('.', decimalChar)
                }
                break

            // return invalid type as-is
            default: return inputNumber
        }

        // when it doesn't need a separator or isn't a number then return it
        if ((-1000 < number && number < 1000) || isNaN(number) || !isFinite(number)) {
            return stringNumber
        }
    }

    {
        // strip off decimal value to add back in later
        const decimalIndex = stringNumber.lastIndexOf(decimalChar)
        let decimal
        if (decimalIndex > -1) {
            decimal = stringNumber.slice(decimalIndex)
            stringNumber = stringNumber.slice(0, decimalIndex)
        }

        // finally, parse the string. Note, default 'separator' is a comma.
        const parts = parse(stringNumber, optionalSeparator || ',')

        // if there's a decimal value then add it to the parts.
        if (decimal) {// NOTE: we sliced() it off including the decimalChar
            parts.push(decimal)
        }

        // combine all parts for the final string (note, has separators).
        return parts.join('')
    }
}

function parse(string, separator) {

    // find first index to split the string at (where 1st separator goes).
    let i = ((string.length - 1) % 3) + 1

    // above calculation is wrong when num is negative and a certain size.
    if (i === 1 && (string[0] === '-')) {
        i = 4  // example: -123,456,789  start at 4, not 1.
    }

    const strings = [ // holds the string parts
        string.slice(0, i) // grab part before the first separator
    ]

    // split remaining string in groups of 3 where a separator belongs
    for (; i < string.length; i += 3) {
        strings.push(separator, string.substr(i, 3))
    }

    return strings
}



function bindWith(separator, decimalChar) {
    return function (number) {
        return commaNumber(number, separator, decimalChar)
    }
}