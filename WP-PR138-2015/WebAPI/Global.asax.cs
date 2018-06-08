using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using WebAPI.DBClasses;
using WebAPI.Models;
using static WebAPI.Models.Enums;

namespace WebAPI
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            //ukoliko menjamo tabelu nakon sto je napravljena, mora da se dropuje i kreira nova
            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<SystemDBContext>());

            //programsko ucitavanje admina
            string[] info = new string[10];
            string path = AppDomain.CurrentDomain.BaseDirectory + "Admini.txt";//Path.Combine(Directory.GetCurrentDirectory(), "Admini.txt");
            using (StreamReader sr = File.OpenText(path))
            {
                string s = String.Empty;
                while ((s = sr.ReadLine()) != null)
                {
                    info = s.Split(';');
                    try
                    {
                        using (SystemDBContext db = new SystemDBContext())
                        {
                            Admin a = new Admin()
                            {
                                Username = info[0],
                                Password = info[1],
                                Name = info[2],
                                Lastname = info[3],
                                Gender = (Genders)Enum.Parse(typeof(Genders), info[4]),
                                Jmbg = info[5],
                                PhoneNumber = info[6],
                                Email = info[7],
                                Role = (Roles)Enum.Parse(typeof(Roles), info[8]),
                                DriveStatus = (DrivingStatus)Enum.Parse(typeof(DrivingStatus), info[9]),
                            };

                            db.Admini.Add(a);
                            db.SaveChanges();
                        }
                    }
                    catch (Exception e)
                    {
                        Trace.WriteLine($"Error - {e.Message}");
                    }
                }
            }
        }
    }
}
