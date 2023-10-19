/**
 * Calls the api with fetch, sends arguments in the form: HttpGet("StarFOV/{fov}/{dec}/{ra}"),
 * receives set of star data corresponding to specified fov and centered on specified declination and right ascension
 * @param {*} fov
 * @param {*} dec
 * @param {*} ra
 * @returns
 */

async function LookUp(fov, dec, ra) {
  const response = await fetch(`stars/StarFOV/${fov}/${dec}/${ra}`);
  const data = await response.json();
  //console.log(data);
  return data;
}

export default LookUp;
