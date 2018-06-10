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
        [HttpGet]
        public HttpResponseMessage GetMusterija()
        {
            HttpResponseMessage msg;
            MusterijaRepository repo = new MusterijaRepository();

            try
            {
                List<Musterija> list = repo.GetMusterije();

                if(list == null)
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
                }else
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK,list);
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
            }

            return msg;
        }

        [HttpPut]
        public HttpResponseMessage PutMusterija(Musterija m) //ako prosledjujes u PUT-u objekat, ne moras da stavljas frombody, a ako hoces, moras prvi ID param
        {
            HttpResponseMessage msg;
            MusterijaRepository repo = new MusterijaRepository();

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Musterija mus = db.Musterije.FirstOrDefault(x => x.Username == m.Username);

                    mus.PhoneNumber = m.PhoneNumber;
                    mus.Password = m.Password;
                    mus.Name = m.Name;
                    mus.Lastname = m.Lastname;
                    mus.Jmbg = m.Jmbg;
                    mus.Gender = m.Gender;
                    mus.Email = m.Email;

                    db.SaveChanges();

                    msg = Request.CreateResponse(HttpStatusCode.OK, mus);
                    msg.Headers.Location = new Uri(Request.RequestUri + mus.Username);
                }

            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
            }

            return msg;
        }

        //private Genders GetEnum(int number)
        //{
        //    switch (number)
        //    {
        //        case 0:
        //            {
        //                return Genders.Male;
        //            }
        //        case 1:
        //            {
        //                return Genders.Female;
        //            }
        //        default:
        //            {
        //                return Genders.Male;
        //            }
        //    }
        //}
    }
}
