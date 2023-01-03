using System;
using System.Collections.Generic;
using System.Text;

namespace mossland_disclosure_api
{
    class Config
    {
        // Http Server
        public readonly int http_server_port = 8000;

        // Database
        public readonly string db_username = "mossland_disclosure";
        public readonly string db_password = "";
        public readonly string db_scheme = "mossland_disclosure";

        // internal use
        private HttpServer httpServer;
        private Database db;

        public void Init()
        {
            httpServer = new HttpServer(http_server_port);
            db = new Database(db_username, db_password, db_scheme);
        }

        public void Run()
        {
            Console.WriteLine("[Config] Run");
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
