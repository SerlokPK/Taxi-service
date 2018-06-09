using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class AdminRepository
    {
        public List<Admin> GetAdmins()
        {
            SystemDBContext context = new SystemDBContext();

            return context.Admini.ToList();
        }

        public Admin GetOneAdmin(string username)
        {
            List<Admin> list = GetAdmins();

            return list.FirstOrDefault(x => x.Username == username);
        }

        public bool AdminLogged(Admin a, string pw)
        {
            if (a != null && pw == a.Password)
            {
                return true;
            }

            return false;
        }
    }
}