/**
 *
 * @param radius scales the result;
 * @param phi0 phi0, phi1 : latitude, or decRa
 * @param l0 l0, l1 : longitude, or raRad
 * @param phi1 phi0, phi1 : latitude, or decRa
 * @param l1 l0, l1 : longitude, or raRad
 * @returns
 */

function orthographicProjection(radius, phi0, l0, phi1, l1) {
  let x = radius * Math.cos(phi1) * Math.sin(l1 - l0);
  let y =
    radius *
    (Math.cos(phi0) * Math.sin(phi1) -
      Math.sin(phi0) * Math.cos(phi1) * Math.cos(l1 - l0));

  return [-x, -y];
} //return coords x, y suitable for current canvas configuration

export default orthographicProjection;
