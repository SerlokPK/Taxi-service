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
            MusterijaRepository musRepo = new MusterijaRepository();
            AdminRepository adminRepo = new AdminRepository();
            VozacRepository vozacRepo = new VozacRepository();

            Musterija m = musRepo.GetOneMusterija(mus.Username);
            Admin a = adminRepo.GetOneAdmin(mus.Username);
            Vozac v = vozacRepo.GetOneVozac(mus.Username);

            if(musRepo.MusterijaLogged(m,mus.Password))
            {
                msg = Request.CreateResponse(HttpStatusCode.Created, m);
                msg.Headers.Location = new Uri(Request.RequestUri + m.Username);
            }else if(adminRepo.AdminLogged(a,mus.Password))
            {
                msg = Request.CreateResponse(HttpStatusCode.Created, a);
                msg.Headers.Location = new Uri(Request.RequestUri + a.Username);
            }else if(vozacRepo.VozacLogged(v,mus.Password))
            {
                msg = Request.CreateResponse(HttpStatusCode.Created, v);
                msg.Headers.Location = new Uri(Request.RequestUri + v.Username);
            }
            else
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User isn't registered.");
            }

            return msg;
        }
    }
}
