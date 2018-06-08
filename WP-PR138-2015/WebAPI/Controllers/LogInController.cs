using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebAPI.DBClasses;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    public class LogInController : ApiController
    {
        [HttpPost]
         public HttpResponseMessage PostMusterija([FromBody]Musterija mus)
        {
            HttpResponseMessage msg;
            MusterijaRepository repo = new MusterijaRepository();

            Musterija m = repo.GetOneMusterija(mus.Username);

            if(m != null && mus.Password == m.Password)
            {
                msg = Request.CreateResponse(HttpStatusCode.Created, m);
                msg.Headers.Location = new Uri(Request.RequestUri + m.Username);
            }else
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Korisnik isn't registered.");
            }

            return msg;
        }
    }
}
