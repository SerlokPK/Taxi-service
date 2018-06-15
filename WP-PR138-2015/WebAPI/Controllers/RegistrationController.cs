using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebAPI.DBClasses;
using WebAPI.Models;
using static WebAPI.Models.Enums;

namespace WebAPI.Controllers
{
    public class RegistrationController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage PostMusterija([FromBody] Musterija k)
        {
            HttpResponseMessage msg;
            MusterijaRepository repo = new MusterijaRepository();
            VozacRepository vrep = new VozacRepository();
            AdminRepository arep = new AdminRepository();

            try
            {
                using (var db = new SystemDBContext())
                {
                    Musterija must = repo.GetOneMusterija(k.Username);
                    Vozac v = vrep.GetOneVozac(k.Username);
                    Admin ad = arep.GetOneAdmin(k.Username);

                    if (must == null && v == null && ad == null)
                    {
                        db.Musterije.Add(k);
                        db.SaveChanges();

                        msg = Request.CreateResponse(HttpStatusCode.Created, k);
                        msg.Headers.Location = new Uri(Request.RequestUri + k.Username);
                    }
                    else
                    {
                        msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User already exist");
                    }

                    return msg;
                }
            }
            catch (Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, e);
            }
        }

        [HttpPut]
        public HttpResponseMessage PutVozac(JToken token) 
        {
            HttpResponseMessage msg = new HttpResponseMessage();

            var id= token.Value<int>("Id");
            var driver = token.Value<string>("Driver");

            try
            {
                using (SystemDBContext db= new SystemDBContext())
                {
                    Voznja v = db.Voznje.FirstOrDefault(x => x.Id == id);
                    Vozac voz = db.Vozaci.FirstOrDefault(x => x.Username == driver);

                    if(v != null)
                    {
                        Musterija m = db.Musterije.FirstOrDefault(x => x.Username == v.UserCallerID);
                        m.DriveStatus = DrivingStatus.Accepted;

                        voz.DriveStatus = DrivingStatus.InProgress;
                        v.Status = DrivingStatus.Accepted;
                        v.DriverID = voz.Username;

                        db.SaveChanges();

                        msg = Request.CreateResponse(HttpStatusCode.NoContent,v);
                    }
                    else
                    {
                        msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Drive is no longer available, choose other.");
                    }
                    
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while accepting");
            }

            return msg;
        }
    }
}
