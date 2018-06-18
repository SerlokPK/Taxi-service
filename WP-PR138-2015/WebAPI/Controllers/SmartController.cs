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
    public class SmartController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage PostMusterija([FromBody] JToken token)
        {
            HttpResponseMessage msg;
            VoznjaRepository repo = new VoznjaRepository();

            var start = token.Value<int>("start");
            var driver = token.Value<string>("user");
            var type = token.Value<string>("type");
            var admin = token.Value<string>("admin");
            var adminSts = token.Value<int>("adminStatus");
            var driverSts = token.Value<int>("driverStatus");

            TypeOfCar typeC = GetTypeInEnum(type); 

            try
            {
                using (var db = new SystemDBContext())
                {
                    Voznja v = new Voznja()
                    {
                        StartPointID = start,
                        DriverID = driver,
                        TypeOfCar = typeC,
                        Id = repo.GetVoznje().Count + 1,
                        Status = GetStatus(adminSts),
                        TimeOfReservation = DateTime.Now,
                        AdminID=admin
                    };

                    Vozac voz = db.Vozaci.FirstOrDefault(x => x.Username == driver);
                    voz.DriveStatus = GetStatus(driverSts);
                    Admin a = db.Admini.FirstOrDefault(x => x.Username == admin);
                    a.DriveStatus = GetStatus(adminSts);

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

        [HttpPut]
        public HttpResponseMessage PutStatusForDrive(Voznja voznja)
        {
            HttpResponseMessage msg = new HttpResponseMessage();

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Voznja v = db.Voznje.FirstOrDefault(x => x.Id == voznja.Id);
                    Vozac vozac = db.Vozaci.FirstOrDefault(x => x.Username == v.DriverID);
                    Musterija must = db.Musterije.FirstOrDefault(x => x.Username == v.UserCallerID);

                    if (v != null)
                    {
                        v.Status = voznja.Status;

                        vozac.DriveStatus = voznja.Status;

                        if (must != null)
                        {
                            must.DriveStatus = voznja.Status;
                        }

                        db.SaveChanges();

                        msg = Request.CreateResponse(HttpStatusCode.NoContent);
                    }
                    else
                    {
                        msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "There was internal error, drive is deleted.");
                    }

                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while finishing");
            }

            return msg;
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

        private DrivingStatus GetStatus(int status)
        {//Created, Declined, Formed, Processed, Accepted, Failed, Successful,InProgress
            switch (status)
            {
                case 1:
                    {
                        return DrivingStatus.Created;
                    }
                    break;
                case 2:
                    {
                        return DrivingStatus.Declined;
                    }
                    break;
                case 3:
                    {
                        return DrivingStatus.Formed;
                    }
                    break;
                case 4:
                    {
                        return DrivingStatus.Processed;
                    }
                    break;
                case 5:
                    {
                        return DrivingStatus.Accepted;
                    }
                    break;
                case 6:
                    {
                        return DrivingStatus.Failed;
                    }
                    break;
                case 7:
                    {
                        return DrivingStatus.Successful;
                    }break;
                case 8:
                    {
                        return DrivingStatus.InProgress;
                    }break;
                default:
                    {
                        return DrivingStatus.None;
                    }
            }
        }
    }
}
