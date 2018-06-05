using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Adresa
    {//Ulica broj, Naseljeno mesto Pozivni broj mesta (npr. Sutjeska 3, Novi Sad 21000)
        public string FullAddress { get; set; }
        public Adresa(string address,int number1,string city,int number2,string phoneNumber)
        {
            this.FullAddress = $"{address} {number1}, {city} {number2} - {phoneNumber}";
        }
    }
}