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
    public class Smart4Controller : ApiController
    {
        [HttpPut]
        public HttpResponseMessage PutChangeType(JToken token)
        {
            HttpResponseMessage msg = new HttpResponseMessage();

            var type = token.Value<string>("type");
            var username = token.Value<string>("username");

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Vozac vozac = db.Vozaci.FirstOrDefault(x => x.Username == username);

                    if (vozac != null)
                    {
                        vozac.Car.Type = GetType(type);

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

        private TypeOfCar GetType(string type)
        {
            switch (type)
            {
                case "RegularCar":
                    {
                        return TypeOfCar.RegularCar;
                    }
                    break;
                case "MiniVan":
                    {
                        return TypeOfCar.MiniVan;
                    }
                    break;
                default:
                    {
                        return TypeOfCar.MiniVan;
                    }
            }
        }
    }
}
