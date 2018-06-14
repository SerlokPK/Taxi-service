using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class VoznjaRepository
    {
        public List<Voznja> GetVoznje()
        {
            SystemDBContext context = new SystemDBContext();

            return context.Voznje.ToList();
        }

        public Voznja GetOneVoznja(int id)
        {
            List<Voznja> list = GetVoznje();

            return list.FirstOrDefault(x => x.Id == id);
        }
    }
}