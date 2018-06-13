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
    public class AddressController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage GetVozac(int id)
        {
            HttpResponseMessage msg;
            LokacijaRepository repo = new LokacijaRepository();

            try
            {
                Lokacija loc = repo.GetOneLocation(id);

                if (loc == null)
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Location doesn't exist");
                }
                else
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, loc.Address.FullAddress); //vracam full adresu da bih je prikazao
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Location doesn't exist");
            }

            return msg;
        }

        [HttpPut]
        public HttpResponseMessage PutLocation([FromBody]JToken token) //klasa da mozes da iscitavas prosledjene primitivne tipove
        {
            HttpResponseMessage msg = new HttpResponseMessage();

            var id = token.Value<int>("id");
            var address = token.Value<string>("address");

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Lokacija lk = db.Lokacije.FirstOrDefault(x => x.LocationId == id);

                    lk.Address.FullAddress = address;

                    db.SaveChanges();
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
            }

            return msg;
        }

        [HttpPost]
        public HttpResponseMessage PostLocation([FromBody]Adresa address)
        {
            HttpResponseMessage msg = new HttpResponseMessage();
            LokacijaRepository repo = new LokacijaRepository();

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Lokacija lk = new Lokacija()
                    {
                        Address = new Adresa() { FullAddress = address.FullAddress },
                        CoordinateX = 0,
                        CoordinateY = 0,
                        LocationId = repo.GetLokacije().Count + 1
                    };

                    db.Lokacije.Add(lk);
                    db.SaveChanges();
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
            }

            return msg;
        }
    }
}
