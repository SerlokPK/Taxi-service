using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static WebAPI.Models.Enums;

namespace WebAPI.Interfaces
{
    public interface Korisnik
    {
        string Username { get; set; }
        string Password { get; set; }
        string Name { get; set; }
        string Lastname { get; set; }
        Genders Gender { get; set; }
        string Jmbg { get; set; }
        string PhoneNumber { get; set; }
        string Email { get; set; }
        Roles Role { get; set; }
        DrivingStatus DriveStatus { get; set; }
    }
}
