// Calculates the geodesic, specifically the angular distance between the two given points.
//arguments phi and L correspond to latitude/Declination and longitude/RightAscension respectively.

function AngularDistanceCheck(Fov, phi1,  L1,  phi2,  L2){

    let FovRad = Fov*0.00872664625; // 0.00872664625 is pi/360, this converts a FOV argument in degrees to radians without using a division operator

    let angularDistance = Math.acos(
        Math.cos(phi1)*Math.cos(phi2)*Math.cos(L1 - L2) 
        + Math.sin(phi1)*Math.sin(phi2)
    );

    return angularDistance < FovRad;
}
export default AngularDistanceCheck;