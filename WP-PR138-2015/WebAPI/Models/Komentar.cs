using Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebAPI.Models
{
    public class Komentar
    {
        public string Description { get; set; }
        public DateTime PostingTime { get; set; }
        public Musterija User { get; set; }
        public Voznja Drive { get; set; }
        public int Grade { get; set; } = 0; //0 se tumaci kao da osoba nije ocenila voznju
    }
}