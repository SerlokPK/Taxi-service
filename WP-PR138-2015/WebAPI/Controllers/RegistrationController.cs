using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebAPI.DBClasses;
using WebAPI.Models;

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
    }
}
