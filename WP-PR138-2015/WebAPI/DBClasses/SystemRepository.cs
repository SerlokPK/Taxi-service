using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class SystemRepository
    {
        public List<Musterija> GetMusterije()
        {
            SystemDBContext context = new SystemDBContext();

            return context.Musterije.ToList();
        }
    }
}