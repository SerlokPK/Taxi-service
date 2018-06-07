
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using WebAPI.Interfaces;
using static WebAPI.Models.Enums;

namespace WebAPI.Models
{
    public class Musterija : Korisnik
    {
        [Key]
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Lastname { get; set; }
        public Genders Gender { get; set; }
        public string Jmbg { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public Roles Role { get; set; }
        public DrivingStatus DriveStatus { get; set; }
    }
}