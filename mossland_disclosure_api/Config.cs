using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
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
                int coingecko = 0;
                int coinmarketcap = 0;

                try
                {
                    coingecko = QueryCirculatingSupplyCoinGecko();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                try
                {
                    coinmarketcap = QueryCirculatingSupplyCoinmarketcap();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                Thread.Sleep(1000 * 3);
            }
        }

        private int QueryCirculatingSupplyCoinGecko()
        {
            var URL = new UriBuilder("https://api.coingecko.com/api/v3/coins/mossland?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false");

            var client = new WebClient();
            client.Headers.Add("Accepts", "application/json");
            string json = client.DownloadString(URL.ToString());

            JObject jObject = JObject.Parse(json);
            return jObject["market_data"]["circulating_supply"].ToObject<int>();
        }

        private int QueryCirculatingSupplyCoinmarketcap()
        {
            var URL = new UriBuilder("https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest");

            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["symbol"] = "MOC";

            URL.Query = queryString.ToString();

            var client = new WebClient();
            client.Headers.Add("X-CMC_PRO_API_KEY", Config.Instance.coinmarketcap_key);
            client.Headers.Add("Accepts", "application/json");
            string json = client.DownloadString(URL.ToString());

            JObject jObject = JObject.Parse(json);
            return jObject["data"]["MOC"][0]["circulating_supply"].ToObject<int>();
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
