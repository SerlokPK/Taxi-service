using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Lokacija
    {
        public double CoordinateX { get; set; }
        public double CoordinateY { get; set; }
        public Adresa Address { get; set; }
    }
}