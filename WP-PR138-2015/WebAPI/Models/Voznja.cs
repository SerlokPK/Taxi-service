using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using WebAPI.DBClasses;
using static WebAPI.Models.Enums;

namespace WebAPI.Models
{
    public class Voznja
    {
        [Key]
        public int Id { get; set; }
        public DateTime TimeOfReservation { get; set; }
        public Lokacija StartPoint { get; set; }
        public int? StartPointID { get; set; }
        [NotMapped]
        public TypeOfCar TypeOfCar { get; set; }
        public Musterija UserCaller { get; set; } //ako je musterija zakazala voznju
        public string UserCallerID { get; set; }
        public Lokacija FinalPoint { get; set; } //postavlja vozac na kraju voznje
        public int? FinalPointID { get; set; }
        public Admin Admin { get; set; } //ako je sredio voznju, u suprotnom je null
        public string AdminID { get; set; }
        public Vozac Driver { get; set; } //onaj koji vozi ili kome je sredjena voznja od admina
        public string DriverID { get; set; }
        public double? Payment { get; set; }
        public int? CommentID { get; set; } //unosi se opcino, osim za otkazane voznje
        [NotMapped]
        public DrivingStatus Status { get; set; }

        [Column("TypeOfCar")]
        public string TypeString
        {
            get { return TypeOfCar.ToString(); }
            private set { TypeOfCar = value.ParseEnum<TypeOfCar>(); }
        }

        [Column("Status")]
        public string StatusString
        {
            get { return Status.ToString(); }
            private set { Status = value.ParseEnum<DrivingStatus>(); }
        }
    }
}