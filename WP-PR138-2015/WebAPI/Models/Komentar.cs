
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Komentar
    {
        [Key]
        public int Id { get; set; }
        public string Description { get; set; }
        public DateTime PostingTime { get; set; }   //kad je postavljen kom
        public string UserID { get; set; }      //ko je postovao
        public int? DriveID { get; set; }       //voznja
        public int Grade { get; set; } = 0; //0 se tumaci kao da osoba nije ocenila voznju
    }
}