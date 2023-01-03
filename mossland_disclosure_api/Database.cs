using System;
using System.Collections.Generic;
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
    }
}
