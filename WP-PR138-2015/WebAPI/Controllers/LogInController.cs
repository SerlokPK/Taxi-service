using Newtonsoft.Json.Linq;
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
    public class LogInController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage GetAddress(string UserCaller)
        {
            HttpResponseMessage msg;
            VoznjaRepository repo = new VoznjaRepository();

            try
            {
                List<Voznja> list = repo.GetVoznje();
                Voznja v = list.LastOrDefault(x => x.UserCallerID == UserCaller && (x.Status == DrivingStatus.Successful || x.Status == DrivingStatus.Failed));    //za musteriju
                //Voznja voz = list.Find(x => x.DriverID == UserCaller && (x.Status == DrivingStatus.Accepted || x.Status == DrivingStatus.InProgress));      //za vozaca

                if (v != null)
                {
                    msg = Request.CreateResponse(HttpStatusCode.OK, v);
                }
                //else if (voz != null)
                //{
                //    msg = Request.CreateResponse(HttpStatusCode.OK, voz);
                //}
                else
                {
                    msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, "No request in database.");
                }
            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error - {e.Message}");
            }

            return msg;
        }

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

        [HttpPut]
        public HttpResponseMessage PutFinalDest(JToken token)
        {
            HttpResponseMessage msg = new HttpResponseMessage();

            var id = token.Value<int>("Id");
            var payment = token.Value<double>("Payment");
            var finalPoint = token.Value<int>("FinalPointID");

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Voznja v = db.Voznje.FirstOrDefault(x => x.Id == id);
                    Vozac vozac = db.Vozaci.FirstOrDefault(x => x.Username == v.DriverID);
                    Musterija must = db.Musterije.FirstOrDefault(x => x.Username == v.UserCallerID);

                    if (v != null)
                    {
                        v.Payment = payment;
                        v.FinalPointID = finalPoint;
                        v.Status = DrivingStatus.Successful;

                        vozac.DriveStatus = DrivingStatus.Successful;

                        if(must != null)
                        {
                            must.DriveStatus = DrivingStatus.Successful;
                        }

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
