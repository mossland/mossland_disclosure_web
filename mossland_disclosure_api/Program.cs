using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mossland_disclosure_api
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Random GUID: " + Guid.NewGuid().ToString());
            Console.WriteLine("Press Enter key to stop the server...");
            Console.WriteLine();

            Config.Instance.Run();
            Console.ReadLine();
        }
    }
}
