/**
 * Calculates the geodesic, specifically the angular distance between the two given points on a sphere.
 * Arguments phi and L correspond to latitude/Declination and longitude/RightAscension respectively.
 * @param Fov field of view, will range from about 30-180 degrees
 * @param phi1 Latitude/Declination in radians, phi1 corresponds to current setting of view port
 * @param L1 Longitude/Right Ascenion in radians, L1 corresponds to current setting of view port
 * @param phi2 Latitude/Declination in radians, corresponds to location of object
 * @param L2 Longitude/Right Ascenion in radians, corresponds to location of object
 * @returns
 */

function angularDistanceCheck(Fov, phi1, L1, phi2, L2) {
  let FovRad = Fov * 0.00872664625; // 0.00872664625 is pi/360, this converts a FOV argument in degrees to radians without using a division operator

  let angularDistance = Math.acos(
    Math.cos(phi1) * Math.cos(phi2) * Math.cos(L1 - L2) +
      Math.sin(phi1) * Math.sin(phi2)
  );

  return angularDistance < FovRad;
}
export default angularDistanceCheck;
