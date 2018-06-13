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
        public DbSet<Voznja> Voznje { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Vozac>().HasRequired(x => x.Location).WithMany().HasForeignKey(y => y.LocationID);
            modelBuilder.Entity<Voznja>().HasOptional(x => x.Admin).WithMany().HasForeignKey(y => y.AdminID);
            modelBuilder.Entity<Voznja>().HasOptional(x => x.Driver).WithMany().HasForeignKey(y => y.DriverID);
            //modelBuilder.Entity<Voznja>().HasRequired(c => c.FinalPointID).WithMany().WillCascadeOnDelete(false);
            modelBuilder.Entity<Voznja>().HasOptional(x => x.FinalPoint).WithMany().HasForeignKey(y => y.FinalPointID);
            modelBuilder.Entity<Voznja>().HasOptional(x => x.StartPoint).WithMany().HasForeignKey(y => y.StartPointID);
            modelBuilder.Entity<Voznja>().HasOptional(x => x.UserCaller).WithMany().HasForeignKey(y => y.UserCallerID);

            base.OnModelCreating(modelBuilder);
        }
    }
}