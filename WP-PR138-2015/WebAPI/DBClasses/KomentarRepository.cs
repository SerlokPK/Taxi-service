using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class KomentarRepository
    {
        public List<Komentar> GetKomentari()
        {
            SystemDBContext context = new SystemDBContext();

            return context.Komentari.ToList();
        }

        public Komentar GetOneKomentar(int id)
        {
            List<Komentar> list = GetKomentari();

            return list.FirstOrDefault(x => x.Id == id);
        }
    }
}