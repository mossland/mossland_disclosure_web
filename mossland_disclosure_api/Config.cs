using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Web;

namespace mossland_disclosure_api
{
    class Config
    {
        // Http Server
        public readonly int http_server_port = 8000;

        // Coinmarketcap
        public readonly string coinmarketcap_key = "";

        // Database
        public readonly string db_username = "mossland_disclosure";
        public readonly string db_password = "";
        public readonly string db_scheme = "mossland_disclosure";

        // internal use
        private HttpServer httpServer;
        private Database db;
        private BackgroundWorker worker;

        public void Init()
        {
            httpServer = new HttpServer(http_server_port);
            db = new Database(db_username, db_password, db_scheme);
        }

        public void Run()
        {
            Console.WriteLine("[Config] Run");

            worker = new BackgroundWorker();
            worker.DoWork += Worker_DoWork;
            worker.RunWorkerAsync();
        }

        private void Worker_DoWork(object sender, DoWorkEventArgs e)
        {
            while (true)
            {
                try {
                    QueryCirculatingSupplyCoinGecko();
                }
                catch (Exception ex) {
                    Console.WriteLine("[ERR] QueryCirculatingSupplyCoinGecko() - " + ex.Message);
                }

                try {
                    QueryCirculatingSupplyCoinmarketcap();
                }
                catch (Exception ex) {
                    Console.WriteLine("[ERR] QueryCirculatingSupplyCoinmarketcap() - " + ex.Message);
                }

                try {
                    QueryCirculatingSupplyMossland();
                }
                catch (Exception ex) {
                    Console.WriteLine("[ERR] QueryCirculatingSupplyMossland() - " + ex.Message);
                }

                Thread.Sleep(1000 * 60 * 10);   // 10 min
            }
        }

        private void QueryCirculatingSupplyCoinGecko()
        {
            if (db == null)
                return;

            var URL = new UriBuilder("https://api.coingecko.com/api/v3/coins/mossland?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false");

            var client = new WebClient();
            client.Headers.Add("Accepts", "application/json");
            string json = client.DownloadString(URL.ToString());

            JObject jObject = JObject.Parse(json);
            double marketcap_usd = jObject["market_data"]["market_cap"]["usd"].ToObject<double>();
            double marketcap_krw = jObject["market_data"]["market_cap"]["krw"].ToObject<double>();
            double circulating_supply = jObject["market_data"]["circulating_supply"].ToObject<double>();

            db.UpsertMarketData("coingecko_marketcap_usd", marketcap_usd);
            db.UpsertMarketData("coingecko_marketcap_krw", marketcap_krw);
            db.UpsertMarketData("coingecko_circulating_supply", circulating_supply);
        }

        private void QueryCirculatingSupplyCoinmarketcap()
        {
            var URL = new UriBuilder("https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest");

            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["symbol"] = "MOC";
            queryString["convert"] = "USD";
            URL.Query = queryString.ToString();

            // request USD
            var client = new WebClient();
            client.Headers.Add("X-CMC_PRO_API_KEY", Config.Instance.coinmarketcap_key);
            client.Headers.Add("Accepts", "application/json");
            string json = client.DownloadString(URL.ToString());

            JObject jObject = JObject.Parse(json);
            double market_cap_usd = jObject["data"]["MOC"][0]["quote"]["USD"]["market_cap"].ToObject<double>();
            double circulating_supply = jObject["data"]["MOC"][0]["circulating_supply"].ToObject<double>();

            db.UpsertMarketData("coinmarketcap_marketcap_usd", market_cap_usd);
            db.UpsertMarketData("coinmarketcap_circulating_supply", circulating_supply);

            // request KRW
            queryString["convert"] = "KRW";
            URL.Query = queryString.ToString();
            json = client.DownloadString(URL.ToString());
            jObject = JObject.Parse(json);
            double market_cap_krw = jObject["data"]["MOC"][0]["quote"]["KRW"]["market_cap"].ToObject<double>();

            db.UpsertMarketData("coinmarketcap_marketcap_krw", market_cap_krw);
        }

        private void QueryCirculatingSupplyMossland()
        {
            var URL = new UriBuilder("https://api.moss.land/MOC/info");

            var client = new WebClient();
            client.Headers.Add("Accepts", "application/json");
            string json = client.DownloadString(URL.ToString());

            JArray jArray = JArray.Parse(json);
            double market_cap_usd = jArray[1]["marketCap"].ToObject<double>();
            double market_cap_krw = jArray[0]["marketCap"].ToObject<double>();
            double circulating_supply = jArray[0]["circulatingSupply"].ToObject<double>();
            double max_supply = jArray[0]["maxSupply"].ToObject<double>();


            db.UpsertMarketData("mossland_marketcap_usd", market_cap_usd);
            db.UpsertMarketData("mossland_marketcap_krw", market_cap_krw);
            db.UpsertMarketData("mossland_circulating_supply", circulating_supply);
            db.UpsertMarketData("mossland_max_supply", max_supply);
        }


        private static Config _instance = null;

        public static Config Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new Config();
                    _instance.Init();
                }
                return _instance;
            }
        }

    }
}
