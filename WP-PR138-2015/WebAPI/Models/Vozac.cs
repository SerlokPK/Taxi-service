
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebAPI.Interfaces;

namespace WebAPI.Models
{
    public class Vozac : Korisnik
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Lastname { get; set; }
        public Enums.Genders Gender { get; set; }
        public string Jmbg { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public Enums.Roles Role { get; set; }
        public Lokacija Location { get; set; }
        public Automobil Car { get; set; }
    }
}