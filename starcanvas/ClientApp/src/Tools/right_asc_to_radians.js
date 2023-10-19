// 0.2617993878 is 2pi/24 and is used to convert hours to radians

function RAToRadians(Ra) {
  let result = parseFloat(Ra) * 0.2617993878;

  return result;
}
export default RAToRadians;
