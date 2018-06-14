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
        [HttpGet]
        public HttpResponseMessage GetAddress(string UserCaller)
        {
            HttpResponseMessage msg;
            VoznjaRepository repo = new VoznjaRepository();

            try
            {
                List<Voznja> list = repo.GetVoznje();
                Voznja v = list.Find(x => x.UserCallerID == UserCaller);

                if (v == null)
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "No request in database.");
                }
                else
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, v);
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
            var driver = token.Value<string>("driver");
            var type = token.Value<string>("type");

            TypeOfCar typeC = GetTypeInEnum(type);

            try
            {
                using (var db = new SystemDBContext())
                {
                    Voznja v = new Voznja()
                    {
                        DriverID = driver,
                        StartPointID = start,
                        UserCallerID = user,
                        TypeOfCar = typeC,
                        Id=repo.GetVoznje().Count+1,
                        Status=DrivingStatus.Created,
                        TimeOfReservation=DateTime.Now
                    };

                    db.Voznje.Add(v);
                    db.SaveChanges();

                    msg = Request.CreateResponse(HttpStatusCode.Created,v);
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
