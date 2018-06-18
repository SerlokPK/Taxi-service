using Newtonsoft.Json.Linq;
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
    public class VoznjaController : ApiController
    {
        [HttpPut]
        public HttpResponseMessage PutDriveRequest([FromBody] JToken token)
        {
            HttpResponseMessage msg;
            LokacijaRepository repo = new LokacijaRepository();
            VozacRepository vrepo = new VozacRepository();

            var id = token.Value<int>("id");
            var location = token.Value<string>("location");
            var type = token.Value<string>("type");

            try
            {
                Vozac vozac = vrepo.GetVozace().Find(x => x.Car.TypeString == type);

                if (vozac == null)
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"That type of car isn't available.");
                }
                else
                {
                    using (SystemDBContext db = new SystemDBContext())
                    {
                        Voznja v = db.Voznje.FirstOrDefault(x => x.Id == id);
                        Lokacija l = db.Lokacije.FirstOrDefault(x => x.LocationId == v.StartPointID);

                        v.TypeOfCar = GetTypeInEnum(type);
                        l.Address.FullAddress = location;

                        db.SaveChanges();

                        msg = Request.CreateResponse(HttpStatusCode.OK, v);
                    }
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error occured while updating drive - {e.Message}");
            }

            return msg;
        }

        [HttpDelete]
        public HttpResponseMessage DeleteAddress([FromBody]Komentar kom)
        {
            HttpResponseMessage msg;

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Voznja v = db.Voznje.FirstOrDefault(x => x.Id == kom.Id);
                    Musterija m = db.Musterije.FirstOrDefault(x => x.Username == v.UserCallerID);

                    if (v == null)
                    {
                        msg = Request.CreateErrorResponse(HttpStatusCode.NotFound, $"There's no drive with this id.");
                    }
                    else
                    {
                        m.DriveStatus = DrivingStatus.Declined;
                        v.Status = DrivingStatus.Declined;
                        db.SaveChanges();

                        msg = Request.CreateResponse(HttpStatusCode.NoContent);
                    }
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error - {e.Message}");
            }

            return msg;
        }

        [HttpGet]
        public HttpResponseMessage GetAddress(string UserCaller)
        {
            HttpResponseMessage msg;
            VoznjaRepository repo = new VoznjaRepository();

            try
            {
                List<Voznja> list = repo.GetVoznje();
                Voznja v = list.Find(x => x.UserCallerID == UserCaller && (x.Status == DrivingStatus.Accepted || x.Status == DrivingStatus.Created || x.Status == DrivingStatus.Processed));    //za musteriju
                Voznja voz = list.Find(x => x.DriverID == UserCaller && (x.Status== DrivingStatus.Accepted || x.Status == DrivingStatus.Formed || x.Status == DrivingStatus.Processed));      //za vozaca

                if (v != null)
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, v);
                }
                else if (voz != null)
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, voz);
                }
                else
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "No request in database.");
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error - {e.Message}");
            }

            return msg;
        }

        [HttpGet]
        public HttpResponseMessage GetVoznje()
        {
            HttpResponseMessage msg;
            VoznjaRepository repo = new VoznjaRepository();

            try
            {
                List<Voznja> list = repo.GetVoznje();

                if (list.Count == 0)
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "There's no available drive right now.");
                }
                else
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, list);
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error - {e.Message}");
            }

            return msg;
        }

        [HttpPost]
        public HttpResponseMessage PostMusterija([FromBody] JToken token)
        {
            HttpResponseMessage msg;
            VoznjaRepository repo = new VoznjaRepository();

            var start = token.Value<int>("start");
            var user = token.Value<string>("user");
            //var driver = token.Value<string>("driver");
            var type = token.Value<string>("type");

            TypeOfCar typeC = GetTypeInEnum(type); 

            try
            {
                using (var db = new SystemDBContext())
                {
                    Voznja v = new Voznja()
                    {
                        //DriverID = driver,
                        StartPointID = start,
                        UserCallerID = user,
                        TypeOfCar = typeC,
                        Id = repo.GetVoznje().Count + 1,
                        Status = DrivingStatus.Created,
                        TimeOfReservation = DateTime.Now
                    };

                    Musterija m = db.Musterije.FirstOrDefault(x => x.Username == user); //mora se i korisniku promeniti status kad inicira poziv
                    m.DriveStatus = DrivingStatus.Created;
                    m.Commented = false;

                    db.Voznje.Add(v);
                    db.SaveChanges();

                    msg = Request.CreateResponse(HttpStatusCode.Created, v);
                    msg.Headers.Location = new Uri(Request.RequestUri + v.Id.ToString());

                    return msg;
                }
            }
            catch (Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, e);
            }
        }

        private TypeOfCar GetTypeInEnum(string type)
        {
            switch (type)
            {
                case "MiniVan":
                    {
                        return TypeOfCar.MiniVan;
                    }
                    break;
                case "RegularCar":
                    {
                        return TypeOfCar.RegularCar;
                    }
                    break;
                default:
                    {
                        return TypeOfCar.RegularCar;
                    }
                    break;
            }
        }
    }
}
