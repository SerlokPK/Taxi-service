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
    public class Smart3Controller : ApiController
    {
        [HttpGet]
        public HttpResponseMessage GetKomentar(string sortType)
        {
            HttpResponseMessage msg;
            VoznjaRepository repo = new VoznjaRepository();
            KomentarRepository lrepo = new KomentarRepository();
            List<Voznja> voznje = repo.GetVoznje();
            List<Komentar> komentari = new KomentarRepository().GetKomentari();
            List<Voznja> temp = new List<Voznja>();

            try
            {
                if (sortType == "Date")
                {
                    voznje = voznje.OrderBy(x => x.TimeOfReservation).ToList();
                }
                else if (sortType == "Grade")
                {
                    //voznje.Sort((a, b) => (lrepo.GetOneKomentar(a.StartPointID.Value).Grade.CompareTo(lrepo.GetOneKomentar(b.StartPointID.Value).Grade)));
                    komentari = komentari.OrderByDescending(x => x.Grade).ToList();
                    komentari.ForEach(x => {
                        voznje.ForEach(c => {
                            if(x.Id == c.CommentID)
                            {
                                temp.Add(c);
                            }
                        });
                    });
                    voznje = temp;
                }

                msg = Request.CreateResponse(HttpStatusCode.OK, voznje);

            }
            catch (Exception e)
            {
                msg = Request.CreateErrorResponse(HttpStatusCode.BadRequest, $"Error - {e.Message}");
            }

            return msg;
        }

        [HttpPut]
        public HttpResponseMessage PutStatusForDrive(Voznja voznja)
        {
            HttpResponseMessage msg = new HttpResponseMessage();

            try
            {
                using (SystemDBContext db = new SystemDBContext())
                {
                    Voznja v = db.Voznje.FirstOrDefault(x => x.Id == voznja.Id);
                    Musterija must = db.Musterije.FirstOrDefault(x => x.Username == v.UserCallerID);

                    Vozac vozac = db.Vozaci.FirstOrDefault(x => x.Username == voznja.DriverID);
                    Admin ad = db.Admini.FirstOrDefault(x => x.Username == voznja.AdminID);

                    if (v != null)
                    {
                        v.Status = DrivingStatus.Processed;
                        vozac.DriveStatus = DrivingStatus.InProgress;
                        ad.DriveStatus = DrivingStatus.Processed;
                        must.DriveStatus = DrivingStatus.Processed;

                        v.AdminID = ad.Username;
                        v.DriverID = vozac.Username;

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
