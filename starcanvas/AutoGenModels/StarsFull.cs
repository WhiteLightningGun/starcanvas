using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace starcanvas.data;

[Table("stars_full")]
public partial class StarsFull
{
    [Key]
    [Column("ID", TypeName = "INT")]
    public long Id { get; set; }

    public string? Hipparcos { get; set; }

    [Column("HD")]
    public string? Hd { get; set; }

    [Column("HR")]
    public string? Hr { get; set; }

    public string? Gliese { get; set; }

    [Column("Bayer_Flamsteed")]
    public string? BayerFlamsteed { get; set; }

    public string? ProperName { get; set; }

    [Column("RA_RAD")]
    public string RaRad { get; set; } = null!;

    [Column("DEC_RAD")]
    public string DecRad { get; set; } = null!;

    [Column(TypeName = "FLOAT")]
    public double Distance { get; set; }

    [Column("Distance_LY", TypeName = "FLOAT")]
    public double DistanceLy { get; set; }

    [Column(TypeName = "FLOAT")]
    public double Magnitude { get; set; }

    [Column("Absolute_Magnitude", TypeName = "FLOAT")]
    public double AbsoluteMagnitude { get; set; }

    public string? Spectrum { get; set; }

    public string? ColorIndex { get; set; }
}
