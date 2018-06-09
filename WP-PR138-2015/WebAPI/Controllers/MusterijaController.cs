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
    public class MusterijaController : ApiController
    {
        [HttpPut]
        public HttpResponseMessage PutMusterija(string uname,[FromBody]Musterija m)
        {
            HttpResponseMessage msg;
            MusterijaRepository repo = new MusterijaRepository();

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Musterija mus = repo.GetOneMusterija(m.Username);
                    mus.PhoneNumber = m.PhoneNumber;
                    mus.Password = m.Password;
                    mus.Name = m.Name;
                    mus.Lastname = m.Lastname;
                    mus.Jmbg = m.Jmbg;
                    //mus.Gender = GetEnum(m.Gender);

                    msg = Request.CreateResponse(HttpStatusCode.Created, mus);
                    msg.Headers.Location = new Uri(Request.RequestUri + mus.Username);
                }

            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
            }

            return msg;
        }

        private Genders GetEnum(int number)
        {
            switch (number)
            {
                case 0:
                    {
                        return Genders.Male;
                    }
                case 1:
                    {
                        return Genders.Female;
                    }
                default:
                    {
                        return Genders.Male;
                    }
            }
        }
    }
}
