using MlkPwgen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebAPI.DBClasses;
using WebAPI.Models;
using static WebAPI.Models.Enums;

namespace WebAPI.Controllers
{
    public class VozacController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage GetMusterija(string username)
        {
            HttpResponseMessage msg;
            MusterijaRepository repo = new MusterijaRepository();
            AdminRepository arepo = new AdminRepository();
            VozacRepository vrepo = new VozacRepository();

            try
            {
                Musterija m = repo.GetOneMusterija(username);
                Admin a = arepo.GetOneAdmin(username);
                Vozac v = vrepo.GetOneVozac(username);

                if (m != null)
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, m);
                }else if(a != null)
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, a);
                }else if(v != null)
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, v);
                }
                else
                {   
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User is not registered.");
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error - {e.Message}");
            }

            return msg;
        }

        [HttpGet]
        public HttpResponseMessage GetVozac()
        {
            HttpResponseMessage msg;
            VozacRepository repo = new VozacRepository();

            try
            {
                List<Vozac> list = repo.GetVozace();

                if (list == null)
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error in GET");
                }
                else
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, list);
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error in GET");
            }

            return msg;
        }

        [HttpPut]
        public HttpResponseMessage PutChangedRole(Musterija m)  //kada admin menja ulogu korisnika (musterija - vozac)
        {
            HttpResponseMessage msg;
            MusterijaRepository repo = new MusterijaRepository();
            VozacRepository repoV = new VozacRepository();

            Musterija mus = repo.GetOneMusterija(m.Username);
            Vozac voz = repoV.GetOneVozac(m.Username);

            try
            {
                if (mus != null)
                {
                    if (m.Role == Enums.Roles.Driver)
                    {
                        DeleteEntityMusterija(mus, m);

                        msg = Request.CreateResponse(HttpStatusCode.OK, mus);
                        msg.Headers.Location = new Uri(Request.RequestUri + mus.Username);
                    }
                    else
                    {
                        msg = Request.CreateResponse(HttpStatusCode.OK, mus);
                        msg.Headers.Location = new Uri(Request.RequestUri + mus.Username);
                    }

                }
                else if (voz != null)
                {
                    if (m.Role == Enums.Roles.Customer)
                    {
                        DeleteEntityVozac(voz, m);

                        msg = Request.CreateResponse(HttpStatusCode.OK, voz);
                        msg.Headers.Location = new Uri(Request.RequestUri + voz.Username);
                    }
                    else
                    {
                        msg = Request.CreateResponse(HttpStatusCode.OK, voz);
                        msg.Headers.Location = new Uri(Request.RequestUri + voz.Username);
                    }
                }else
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
            }

            return msg;
        }

        private void DeleteEntityMusterija(Musterija mus, Musterija m)
        {
            using (SystemDBContext db = new SystemDBContext())
            {
                mus = db.Musterije.FirstOrDefault(x => x.Username == m.Username);
                mus.Role = m.Role;
                System.Random ran = new System.Random();

                Vozac v = new Vozac()
                {
                    Username = mus.Username,
                    Email = mus.Email,
                    Gender = mus.Gender,
                    Jmbg = mus.Jmbg,
                    Lastname = mus.Lastname,
                    Name = mus.Name,
                    Password = mus.Password,
                    PhoneNumber = mus.PhoneNumber,
                    Role = mus.Role,
                    Car = new Automobil()
                    {
                        Driver = mus.Username,
                        Registration = $"NS{ran.Next(1000, 9999)}{PasswordGenerator.Generate(length: 2, allowed: Sets.Upper)}",
                        UniqueID = System.Web.Security.Membership.GeneratePassword(6, 2),
                        Type = GetRandomCar(),
                        YearOfCar = GetRandomTime(ran)
                    },
                    LocationID = db.Vozaci.Count() + 1,
                    Location = null
                };

                Lokacija Location = new Lokacija()
                {
                    CoordinateX = 0.0,
                    CoordinateY = 0.0,
                    Address = new Adresa("Partizanska", 19, "Novi Sad", 21000, 838531),
                    LocationId = v.LocationID
                };

                db.Vozaci.Add(v);
                db.Musterije.Remove(mus);
                db.Lokacije.Add(Location);

                db.SaveChanges();
            }
        }

        private TypeOfCar GetRandomCar()
        {
            Array values = Enum.GetValues(typeof(TypeOfCar));
            System.Random random = new System.Random();
            TypeOfCar randomBar = (TypeOfCar)values.GetValue(random.Next(values.Length));

            return randomBar;
        }

        private DateTime GetRandomTime(System.Random gen)
        {
            DateTime start = new DateTime(1990, 1, 1);
            int range = (DateTime.Today - start).Days;

            return start.AddDays(gen.Next(range));
        }

        private void DeleteEntityVozac(Vozac voz, Musterija m)
        {
            VoznjaRepository repo = new VoznjaRepository();
            List<Voznja> list = repo.GetVoznje();

            using (SystemDBContext db = new SystemDBContext())
            {
                voz = db.Vozaci.FirstOrDefault(x => x.Username == m.Username);
                voz.Role = m.Role;
                
                foreach(Voznja voznja in list)              //ako brisemo vozaca, moramo i njegove voznje iz sistema, zbog RF u EF
                {
                    if (voznja.DriverID == voz.Username)
                    {
                        db.Voznje.Remove(db.Voznje.FirstOrDefault(x => x.Id == voznja.Id));
                    }
                }
                    
                Musterija mm = new Musterija()
                {
                    Username = voz.Username,
                    Email = voz.Email,
                    Gender = voz.Gender,
                    Jmbg = voz.Jmbg,
                    Lastname = voz.Lastname,
                    Name = voz.Name,
                    Password = voz.Password,
                    PhoneNumber = voz.PhoneNumber,
                    Role = voz.Role
                };

                db.Musterije.Add(mm);
                db.Vozaci.Remove(voz);

                db.SaveChanges();
            }
        }
    }
}
