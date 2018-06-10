using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using WebAPI.DBClasses;
using static WebAPI.Models.Enums;

namespace WebAPI.Models
{
    public class Automobil
    {
        public string Driver { get; set; }
        public DateTime YearOfCar { get; set; }
        public string Registration { get; set; }
        public string UniqueID { get; set; }
        [NotMapped]
        public TypeOfCar Type { get; set; }

        [Column("Car_Type")]
        public string TypeString
        {
            get { return Type.ToString(); }
            private set { Type = value.ParseEnum<TypeOfCar>(); }
        }
    }
}