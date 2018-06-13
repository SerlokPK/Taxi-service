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
        public HttpResponseMessage GetMusterija(string carType)
        {
            HttpResponseMessage msg;
            VozacRepository repo = new VozacRepository();

            try
            {
                List<Vozac> list = repo.GetVozace();
                Vozac v=list.Find(x => x.Car.TypeString == carType);

                if (v == null)
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Selected car is not available.");
                }
                else
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, v);
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error - {e.Message}");
            }

            return msg;
        }


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
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User doesn't exist");
                }else
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK,list);
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User doesn't exist");
            }

            return msg;
        }

        [HttpPut]
        public HttpResponseMessage PutMusterija(Vozac m) //ako prosledjujes u PUT-u objekat, ne moras da stavljas frombody, a ako hoces, moras prvi ID param
        {
            HttpResponseMessage msg=new HttpResponseMessage();

            try
            {
                msg = UpdateUser(m,m.Role,msg);                
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error occured while updating");
            }

            return msg;
        }

        private HttpResponseMessage UpdateUser(Vozac sentObj,Roles role, HttpResponseMessage msg)
        { 
            using (SystemDBContext db = new SystemDBContext())
            {
                if (role == Roles.Admin)
                {
                    Admin a = db.Admini.FirstOrDefault(x => x.Username == sentObj.Username);

                    a.PhoneNumber = sentObj.PhoneNumber;
                    a.Password = sentObj.Password;
                    a.Name = sentObj.Name;
                    a.Lastname = sentObj.Lastname;
                    a.Jmbg = sentObj.Jmbg;
                    a.Gender = sentObj.Gender;
                    a.Email = sentObj.Email;

                    msg = Request.CreateResponse(HttpStatusCode.OK, a);
                    msg.Headers.Location = new Uri(Request.RequestUri + a.Username);
                }
                else if(role == Roles.Customer)
                {
                    Musterija m = db.Musterije.FirstOrDefault(x => x.Username == sentObj.Username);

                    m.PhoneNumber = sentObj.PhoneNumber;
                    m.Password = sentObj.Password;
                    m.Name = sentObj.Name;
                    m.Lastname = sentObj.Lastname;
                    m.Jmbg = sentObj.Jmbg;
                    m.Gender = sentObj.Gender;
                    m.Email = sentObj.Email;

                    msg = Request.CreateResponse(HttpStatusCode.OK, m);
                    msg.Headers.Location = new Uri(Request.RequestUri + m.Username);
                }
                else
                {
                    Vozac v = db.Vozaci.FirstOrDefault(x => x.Username == sentObj.Username);

                    v.PhoneNumber = sentObj.PhoneNumber;
                    v.Password = sentObj.Password;
                    v.Name = sentObj.Name;
                    v.Lastname = sentObj.Lastname;
                    v.Jmbg = sentObj.Jmbg;
                    v.Gender = sentObj.Gender;
                    v.Email = sentObj.Email;

                    v.Location = sentObj.Location;

                    msg = Request.CreateResponse(HttpStatusCode.OK, v);
                    msg.Headers.Location = new Uri(Request.RequestUri + v.Username);
                }         

                db.SaveChanges();
            }

            return msg;
        }

    }
}
