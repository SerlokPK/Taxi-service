using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using static WebAPI.Models.Enums;

namespace WebAPI.Models
{
    public class Automobil
    {
        public string Driver { get; set; }
        public DateTime YearOfCar { get; set; }
        public string Registration { get; set; }
        public string UniqueID { get; set; }
        public TypeOfCar Type { get; set; }
    }
}