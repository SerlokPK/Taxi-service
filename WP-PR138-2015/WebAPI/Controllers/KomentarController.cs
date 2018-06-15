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
    public class KomentarController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage PostMusterija([FromBody]Komentar kom)
        {
            HttpResponseMessage msg = new HttpResponseMessage();
            KomentarRepository repo = new KomentarRepository();

            try
            {
                using (var db = new SystemDBContext())
                {
                    kom.PostingTime = DateTime.Now;
                    kom.Id = repo.GetKomentari().Count + 1;

                    db.Komentari.Add(kom);
                    db.SaveChanges();

                    msg = Request.CreateResponse(HttpStatusCode.Created, kom);
                    msg.Headers.Location = new Uri(Request.RequestUri + kom.Id.ToString());

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
