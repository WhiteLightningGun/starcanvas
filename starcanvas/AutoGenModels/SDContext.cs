using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace starcanvas.data;

public partial class SDContext : DbContext
{
    public SDContext()
    {
    }

    public SDContext(DbContextOptions<SDContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Star DB contains star data already converted into radians
    /// </summary>
    public virtual DbSet<Star> Star { get; set; }
    /// <summary>
    /// StarDraw pertains to only the data required for drawing a star on a canvas
    /// </summary>
    public virtual DbSet<StarsDraw> StarDraw { get; set; }
    /// <summary>
    /// StarFull is the full database, almost original save for the addition of distance in lightyears after parsecs column
    /// </summary>
    public virtual DbSet<StarsFull> StarFull { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)

        => optionsBuilder.UseSqlite("Filename=Data/stars2.db");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Star>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<StarsDraw>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<StarsFull>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
