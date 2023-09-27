using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace starcanvas.data;

[Table("stars_draw")]
public partial class StarsDraw
{
    [Key]
    [Column("ID", TypeName = "INT")]
    public long Id { get; set; }

    [Column("NAME")]
    public string? Name { get; set; }

    [Column("RA_RAD", TypeName = "FLOAT")]
    public double RaRad { get; set; }

    [Column("DEC_RAD", TypeName = "FLOAT")]
    public double DecRad { get; set; }

    [Column(TypeName = "FLOAT")]
    public double Magnitude { get; set; }

    public string? Color { get; set; }
}
