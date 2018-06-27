using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class SystemSeeder : DropCreateDatabaseIfModelChanges<SystemDBContext>
    {
        protected override void Seed(SystemDBContext context)
        {
            Musterija m1 = new Musterija()
            {
                Commented = false,
                DriveStatus = Enums.DrivingStatus.Created,
                Email = "daca@gmail.com",
                Gender = Enums.Genders.Male,
                Jmbg = "4836849785773",
                Lastname = "Oletic",
                Name = "Dalibor",
                Password = "daca123",
                PhoneNumber = "0602985738",
                Role = Enums.Roles.Customer,
                Username = "Daca"
            };

            Musterija m2 = new Musterija()
            {
                Commented = false,
                DriveStatus = Enums.DrivingStatus.None,
                Email = "ana@gmail.com",
                Gender = Enums.Genders.Female,
                Jmbg = "4833349755743",
                Lastname = "Anicic",
                Name = "Ana",
                Password = "ana123",
                PhoneNumber = "0605585948",
                Role = Enums.Roles.Customer,
                Username = "Ana"
            };

            Lokacija l = new Lokacija()
            {
                Address = new Adresa("Partizanska", 19, "Novi Sad", 21000, 838521),
                CoordinateX = 0,
                CoordinateY = 0,
                LocationId = 1
            };

            context.Lokacije.Add(l);

            Vozac v1 = new Vozac()
            {
                DriveStatus = Enums.DrivingStatus.Failed,
                Email = "serpa@gmail.com",
                Gender = Enums.Genders.Male,
                Jmbg = "1306996800089",
                Lastname = "Serbula",
                Name = "Strahinja",
                Password = "serpa123",
                PhoneNumber = "0600139609",
                Role = Enums.Roles.Driver,
                Username = "Serlok",
                LocationID = 1,
                Car = new Automobil()
                {
                    Driver = "Serlok",
                    Registration = "NS2345PE",
                    Type = Enums.TypeOfCar.RegularCar,
                    UniqueID = "459k3j",
                    YearOfCar = new DateTime(2000, 1, 1)
                }
            };

            context.Vozaci.Add(v1);

            Komentar k1 = new Komentar()
            {
                DriveID = 2,
                Description = "Default komentar - customer",
                Grade = 1,
                Id = 1,
                PostingTime = DateTime.Now,
                UserID="Dalibor"
            };

            context.Komentari.Add(k1);

            Komentar k2 = new Komentar()
            {
                DriveID = 2,
                Description = "Default komentar - driver",
                Grade = 0,
                Id = 2,
                PostingTime = DateTime.Now,
                UserID = "Serlok"
            };

            context.Komentari.Add(k2);

            Lokacija l2 = new Lokacija()
            {
                Address = new Adresa("Scepanska", 56, "Novi Sad", 21000, 838521),
                CoordinateX = 0,
                CoordinateY = 0,
                LocationId = 2
            };

            context.Lokacije.Add(l2);

            Voznja voz = new Voznja()
            {
                CommentID = 1,
                DriverID = "Serlok",
                Id = 1,
                StartPointID = 2,
                Status = Enums.DrivingStatus.Failed,
                TimeOfReservation = DateTime.Now,
                TypeOfCar = Enums.TypeOfCar.RegularCar,
                UserCallerID = "Daca",
                
            };

            context.Voznje.Add(voz);

            Lokacija l3 = new Lokacija()
            {
                Address = new Adresa("Novopazarska", 88, "Novi Pazar", 25000, 838234),
                CoordinateX = 0,
                CoordinateY = 0,
                LocationId = 3
            };

            context.Lokacije.Add(l3);

            Voznja voz2 = new Voznja()
            {
                Id = 2,
                StartPointID = 3,
                Status = Enums.DrivingStatus.Created,
                TimeOfReservation = DateTime.Now,
                TypeOfCar = Enums.TypeOfCar.RegularCar,
                UserCallerID = "Daca",
                
            };

            context.Voznje.Add(voz2);

            context.Musterije.Add(m1);
            context.Musterije.Add(m2);

            base.Seed(context);
        }
    }
}