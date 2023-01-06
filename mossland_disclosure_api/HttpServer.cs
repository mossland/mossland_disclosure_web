using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Net;
using System.Text;

namespace mossland_disclosure_api
{
    class HttpServer
    {
        private HttpListenerResponse response;
        private HttpListener listener;

        private BackgroundWorker worker;

        public HttpServer(int port)
        {
            if (!HttpListener.IsSupported)
            {
                Console.WriteLine("HttpListener requires at least Windows XP SP2 or Windows Server 2003.");
                return;
            }

            listener = new HttpListener();
            listener.Prefixes.Add("http://+:" + port + "/");
            listener.Prefixes.Add("http://*:" + port + "/");

            //listener.Prefixes.Add("https://+:" + port + "/");
            //listener.Prefixes.Add("https://*:" + port + "/");

            listener.Start();

            worker = new BackgroundWorker();
            worker.DoWork += Worker_DoWork;
            worker.RunWorkerAsync();
        }

        private void Worker_DoWork(object sender, DoWorkEventArgs e)
        {
            try
            {
                while (true)
                {
                    var context = listener.GetContext();
                    var clientIP = context.Request.RemoteEndPoint.ToString();
                    var request = context.Request;
                    
                    response = context.Response;
                    response.Headers.Add("Access-Control-Allow-Origin", "*");   // TODO: security
                    //response.Headers.Add("Access-Control-Allow-Methods", "POST, GET");
                    response.Headers.Add("Access-Control-Allow-Methods", "GET");

                    if (request.HttpMethod.ToUpper() != "GET")
                    {
                        SendErrorResponse(405, "Method must be GET");
                        continue;
                    }

                    try
                    {
                        string[] urls = request.RawUrl.Split('/');
                        Console.WriteLine("RawUrl: " + request.RawUrl);

                        if (urls == null || urls.Length < 3)
                        {
                            SendErrorResponse(404, "Unexpected Param");
                            continue;
                        }

                        string type = urls[1];

                        if (type.Equals("market") == true)
                        {
                            JArray jArray = Config.Instance.GetDatabase().SelectMarketData();
                            string json = jArray.ToString();

                            StreamWriter writer = new StreamWriter(response.OutputStream);
                            writer.Write(json);
                            writer.Close();

                            continue;
                        }
                        else if (type.Equals("recent_release") == true)
                        {
                            JArray jArray = Config.Instance.GetDatabase().SelectRecentReleaseSchedule();
                            string json = jArray.ToString();

                            StreamWriter writer = new StreamWriter(response.OutputStream);
                            writer.Write(json);
                            writer.Close();

                            continue;
                        }
                        else if (type.Equals("expected_release") == true)
                        {
                            JArray jArray = Config.Instance.GetDatabase().SelectExpectedReleaseSchedule();
                            string json = jArray.ToString();

                            StreamWriter writer = new StreamWriter(response.OutputStream);
                            writer.Write(json);
                            writer.Close();

                            continue;
                        }

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("[ERROR] HttpServer/Worker_DoWork:", ex.Message);
                    }

                    SendErrorResponse(404, "Undefined Param");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                if (response != null)
                {
                    SendErrorResponse(500, "Internal server error");
                }
            }
        }

        private void SendErrorResponse(int statusCode, string statusResponse)
        {
            response.ContentLength64 = 0;
            response.StatusCode = statusCode;
            response.StatusDescription = statusResponse;
            response.OutputStream.Close();
            //Console.WriteLine("*** Sent error: {0} {1}", statusCode, statusResponse);
        }
    }
}
