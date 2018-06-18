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
