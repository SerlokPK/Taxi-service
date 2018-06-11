using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Adresa
    {
        
        public string FullAddress { get; set; }
        public Adresa(string address,int number1,string city,int number2,int phoneNumber)
        {
            this.FullAddress = $"{address} {number1}, {city} {number2} - {phoneNumber}";
        }

        public Adresa() { }
    }
}