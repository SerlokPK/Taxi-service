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

            try
            {
                using (var db = new SystemDBContext())
                {
                    if (!db.Musterije.Contains(k))
                    {
                        db.Musterije.Add(k);
                        db.SaveChanges();

                        msg = Request.CreateResponse(HttpStatusCode.Created, k);
                        msg.Headers.Location = new Uri(Request.RequestUri + k.Username);
                    }
                    else
                    {
                        msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Korisnik already exist");
                    }

                    return msg;
                }
            }catch(Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, e);
            }
        }
    }
}
