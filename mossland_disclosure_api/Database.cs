using MySql.Data.MySqlClient;
using Org.BouncyCastle.Ocsp;
using Org.BouncyCastle.Utilities.Collections;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;
using System.Threading;

namespace mossland_disclosure_api
{
    class Database
    {
        private string connstring;

        private string UserID;
        private string Password;
        private string Scheme;

        public Database(string user, string password, string scheme)
        {
            this.UserID = user;
            this.Password = password;
            this.Scheme = scheme;

            connstring = string.Format("Server=localhost; database={0}; UID={1}; password={2}", Scheme, UserID, Password);
        }

        public bool UpsertMarketData(string market_type, double val)
        {
            bool ret = false;
            MySqlConnection connection = new MySqlConnection(connstring);

            try
            {
                connection.Open();

                MySqlCommand comm = connection.CreateCommand();
                comm.CommandText = "INSERT INTO market_data(market_type, number) VALUES(?market_type, ?number) ON DUPLICATE KEY UPDATE number=?number, timestamp=CURRENT_TIMESTAMP";
                comm.Parameters.AddWithValue("?market_type", market_type);
                comm.Parameters.AddWithValue("?number", val);

                if (comm.ExecuteNonQuery() > 0)
                    ret = true;

                comm.Dispose();
            }
            catch (Exception ex)
            {
                Console.WriteLine("[ERR] InsertMarketData() - " + ex.Message);
            }

            connection.Close();
            return ret;
        }

        public (double, DateTime) SelectMarketData(string market_type)
        {
            double val = -1;
            DateTime timestamp = DateTime.UtcNow;

            MySqlConnection connection = new MySqlConnection(connstring);

            try
            {
                connection.Open();

                MySqlCommand cmd = connection.CreateCommand();
                cmd.CommandText = "SELECT * FROM market_data WHERE market_type=?market_type";
                cmd.Parameters.AddWithValue("?market_type", market_type);
                var reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    val = reader.GetDouble("number");
                    timestamp = ConvertToUTC(reader.GetDateTime("timestamp"));
                }

                reader.Close();
                cmd.Dispose();
            }
            catch (Exception ex)
            {
                Console.WriteLine("[ERR] SelectMarketData() - " + ex.Message);
            }

            connection.Close();
            return (val, timestamp);
        }

        public static DateTime ConvertToUTC(DateTime dateTime)
        {
            return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, dateTime.Hour, dateTime.Minute, dateTime.Second, DateTimeKind.Utc);
        }
    }
}
