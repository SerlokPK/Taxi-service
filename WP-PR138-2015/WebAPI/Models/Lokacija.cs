using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Lokacija
    {
        [Key]
        public int LocationId { get; set; }
        public double? CoordinateX { get; set; }
        public double? CoordinateY { get; set; }
        public Adresa Address { get; set; }

        //public virtual Vozac Vozac { get; set; }
    }
}