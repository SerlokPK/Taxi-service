using Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Musterija : Korisnik
    {
        public string Username { get => Username; set => Username = value; }
        public string Password { get => Password; set => Password = value; }
        public string Name { get => Name; set => Name = value; }
        public string Lastname { get => Lastname; set => Lastname = value; }
        public Enums.Genders Gender { get => Gender; set => Gender = value; }
        public string Jmbg { get => Jmbg; set => Jmbg = value; }
        public string PhoneNumber { get => PhoneNumber; set => PhoneNumber = value; }
        public string Email { get => Email; set => Email = value; }
        public Enums.Roles Role { get => Role; set => Role = value; }
    }
}