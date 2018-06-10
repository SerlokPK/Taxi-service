using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class VozacRepository
    {
        public List<Vozac> GetVozace()
        {
            SystemDBContext context = new SystemDBContext();

            return context.Vozaci.ToList();
        }

        public Vozac GetOneVozac(string username)
        {
            List<Vozac> list = GetVozace();

            return list.FirstOrDefault(x => x.Username == username);
        }

        public bool VozacLogged(Vozac m, string pw)
        {
            if (m != null && pw == m.Password)
            {
                return true;
            }

            return false;
        }
    }
}