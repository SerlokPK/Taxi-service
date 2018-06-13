using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace WebAPI.Controllers
{
    public class VoznjaController : ApiController
    {
        //[HttpPost]
        //public HttpResponseMessage PostMusterija([FromBody] Musterija k)
        //{
        //    HttpResponseMessage msg;
        //    MusterijaRepository repo = new MusterijaRepository();
        //    VozacRepository vrep = new VozacRepository();

        //    try
        //    {
        //        using (var db = new SystemDBContext())
        //        {
        //            Musterija must = repo.GetOneMusterija(k.Username);
        //            Vozac v = vrep.GetOneVozac(k.Username);

        //            if (must == null && v == null)
        //            {
        //                db.Musterije.Add(k);
        //                db.SaveChanges();

        //                msg = Request.CreateResponse(HttpStatusCode.Created, k);
        //                msg.Headers.Location = new Uri(Request.RequestUri + k.Username);
        //            }
        //            else
        //            {
        //                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User already exist");
        //            }

        //            return msg;
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        return Request.CreateErrorResponse(HttpStatusCode.BadRequest, e);
        //    }
        //}
    }
}
