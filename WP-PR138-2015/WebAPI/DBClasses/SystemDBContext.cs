using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using WebAPI.Models;

namespace WebAPI.DBClasses
{
    public class SystemDBContext : DbContext
    {
        public DbSet<Musterija> Musterije { get; set; }
        public DbSet<Admin> Admini { get; set; }
        public DbSet<Vozac> Vozaci { get; set; }
        public DbSet<Lokacija> Lokacije { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Vozac>().HasRequired(x => x.Location).WithMany().HasForeignKey(y => y.LocationID);

            base.OnModelCreating(modelBuilder);
        }
    }
}