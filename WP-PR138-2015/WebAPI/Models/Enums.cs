using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Enums
    {
        public enum Genders { Male = 0, Female };
        public enum Roles { Driver = 0, Customer, Admin }
        public enum TypeOfCar { MiniVan = 0, RegularCar }
        public enum DrivingStatus { None=0,Created, Declined, Formed, Processed, Accepted, Failed, Succesffull,InProgress }
    }
}