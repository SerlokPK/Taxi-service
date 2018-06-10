
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using WebAPI.DBClasses;
using WebAPI.Interfaces;
using static WebAPI.Models.Enums;

namespace WebAPI.Models
{
    public class Vozac : Korisnik
    {
        [Key]
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Lastname { get; set; }
        [NotMapped]
        public Genders Gender { get; set; }
        public string Jmbg { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        [NotMapped]
        public Roles Role { get; set; }
        public Lokacija Location { get; set; }
        public Automobil Car { get; set; }
        [NotMapped]
        public DrivingStatus DriveStatus { get; set; }

        [Column("Gender")]
        public string GenderString
        {
            get { return Gender.ToString(); }
            private set { Gender = value.ParseEnum<Genders>(); }
        }

        [Column("Role")]
        public string RoleString
        {
            get { return Role.ToString(); }
            private set { Role = value.ParseEnum<Roles>(); } //stavimo private da ne moze rucno da se setuje
        }

        [Column("DriveStatus")]
        public string DriveString
        {
            get { return DriveStatus.ToString(); }
            private set { DriveStatus = value.ParseEnum<DrivingStatus>(); }
        }
    }
}