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
            SystemRepository repo = new SystemRepository();

            List<Musterija> musterije = repo.GetMusterije();

            Musterija m=musterije.FirstOrDefault(x => x.Username == mus.Username && x.Password == mus.Password);

            if(m != null)
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
