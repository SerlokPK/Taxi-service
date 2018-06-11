using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class LokacijaRepository
    {
        public List<Lokacija> GetLokacije()
        {
            SystemDBContext context = new SystemDBContext();

            return context.Lokacije.ToList();
        }

        public Lokacija GetOneLocation(int id)
        {
            List<Lokacija> list = GetLokacije();

            return list.FirstOrDefault(x => x.LocationId == id);
        }
    }
}