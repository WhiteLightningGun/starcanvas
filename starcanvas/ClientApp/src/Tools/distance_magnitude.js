// calculates the magnitude of distance between two points (x,y) on the canvas

const distanceMagnitude = (x1, y1, x2, y2) => {
  let res = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  //console.log(res);
  return res;
};

export default distanceMagnitude;
