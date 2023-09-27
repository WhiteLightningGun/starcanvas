using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using starcanvas.data;

namespace starcanvas.Controllers;

[ApiController]
[Route("[controller]")]
public class StarsController : ControllerBase
{
    private readonly ILogger<StarsController> _logger;

    public SDContext starsDBContext;

    public StarsController(ILogger<StarsController> logger, SDContext _SDContext)
    {
        _logger = logger;
        starsDBContext = _SDContext;
    }

    [HttpGet]
    public JsonResult Get()
    {
        // var Pisces = starsDBContext.Star.Where(x => x.BayerFlamsteed!.Contains("Psc")).Select( x => x.Id).ToList(); // list of ids associated with Psc, 
        // n.b. not possible to look up stars by constellation with stars_draw db which has names only

        //var res = starsDBContext.StarDraw.Select(x => x).Where(x => Pisces.Contains(x.Id)); // return all stars

        Span<StarsDraw> Brightest = starsDBContext.StarDraw.Select(x => x).Where(x => x.Magnitude > 3).ToArray(); // will return brightest stars Magnitude is actually radius here...

        List<StarsDraw> result = new();

        foreach(StarsDraw s in Brightest){
            if(true){ //AngularDistanceCheck(120, 1.57, 0, s.DecRad, s.RaRad) 
                result.Add(s);
            }
            
        }

        return new JsonResult(result);
    }

    [HttpGet("GetHello")] //defines route to this method
    public string GetHello()
    {
        Console.WriteLine("hello world, from StarsController/GetHello ?");
        return "hello world, from StarsController/GetHello";
    }

    [HttpGet("IDLookUp")]
    public JsonResult IdLookUp(int id1){

        var result = starsDBContext.StarFull.Select(x => x).Where(x => x.Id == id1);

        return new JsonResult(result);
    }

    /// <summary>
    /// Get collection of stars according to current declination, right ascension and fov setting.
    /// </summary>
    /// <param name="fov"></param>
    /// <param name="dec"></param>
    /// <param name="ra"></param>
    /// <returns></returns>
    [HttpGet("StarFOV/{fov}/{dec}/{ra}")]
    public JsonResult StarFOV(double fov, double dec, double ra){

        double maxMagnitude =  0.013333333333333334*fov + 0.6; //straight line function interpolating from maxMagnitude = 3 at fov = 180 to maxMangnitude = 1 at fov = 30
        double maxMagnitudeRounded = Math.Round(maxMagnitude, 1, MidpointRounding.AwayFromZero);

        Console.WriteLine($"maxMagnitudeRounded for this call: {maxMagnitudeRounded}");
        Console.WriteLine($"ARGS RECEIVED = fov: {fov}, dec: {dec}, ra: {ra}");


        Span<StarsDraw> Brightest = starsDBContext.StarDraw.Select(x => x).Where(x => x.Magnitude >= maxMagnitudeRounded).ToArray(); // will return brightest stars Magnitude is actually radius here...

        List<StarsDraw> result = new();

        foreach(StarsDraw s in Brightest){
            if(AngularDistanceCheck(fov, dec, ra, s.DecRad, s.RaRad))
            { 
                result.Add(s);
            }

            else if(s.Name!.Length > 0) //always include the named stars regardless of if they are in the current Fov
            {
                result.Add(s);
            }
        }

        return new JsonResult(result);
    }


    /// <summary>
    /// Calculates the geodesic, specifically the angular distance between the two given points.
    /// arguments phi and L correspond to latitude/Declination and longitude/RightAscension respectively.
    /// </summary>
    /// <returns>Boolean if angular distance is within the given FOV</returns>
    /// 
    private bool AngularDistanceCheck(double Fov, double phi1, double L1, double phi2, double L2){

        double FovRad = Fov*0.00872664625; // 0.00872664625 is pi/360, this converts a FOV argument in degrees to radians without using a division operator

        double angularDistance = Math.Acos(
            Math.Cos(phi1)*Math.Cos(phi2)*Math.Cos(L1 - L2) 
            + Math.Sin(phi1)*Math.Sin(phi2)
        );

        return angularDistance < FovRad;
    }

}
