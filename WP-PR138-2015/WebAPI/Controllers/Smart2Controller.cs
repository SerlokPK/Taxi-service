using Newtonsoft.Json.Linq;
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
    public class Smart2Controller : ApiController
    {
        [HttpPut]
        public HttpResponseMessage PutIdForComm(JToken token)
        {
            HttpResponseMessage msg = new HttpResponseMessage();

            var komId = token.Value<int>("komId");
            var vozId = token.Value<int>("id");

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    //Komentar k = db.Komentari.FirstOrDefault(x => x.Id == komId);
                    Voznja v = db.Voznje.FirstOrDefault(x => x.Id == vozId);

                    if (v != null)
                    {
                        v.CommentID = komId;

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
    }
}
