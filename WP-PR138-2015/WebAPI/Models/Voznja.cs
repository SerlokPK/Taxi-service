using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using static WebAPI.Models.Enums;

namespace WebAPI.Models
{
    public class Voznja
    {
        public DateTime TimeOfReservation { get; set; }
        public Lokacija StartPoint { get; set; }
        public TypeOfCar TypeOfCar { get; set; }
        public Musterija UserCaller { get; set; } //ako je musterija zakazala voznju
        public Lokacija FinalPoint { get; set; } //postavlja vozac na kraju voznje
        public Admin Admin { get; set; } //ako je sredio voznju, u suprotnom je null
        public Vozac Driver { get; set; } //onaj koji vozi ili kome je sredjena voznja od admina
        public double Payment { get; set; }
        public string Comment { get; set; } //unosi se opcino, osim za otkazane voznje
        public DrivingStatus Status { get; set; }
    }
}