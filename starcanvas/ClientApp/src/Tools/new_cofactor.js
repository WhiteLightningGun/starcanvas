//Scales the results of the Orthographic projections to always fill the entire canvas
const newCoFactor = (newFov) => {
  let res = -newFov * 0.008125 + 1.8625; // −0.008125x + 1.8625,  a straight line interpolation
  return res;
};

export default newCoFactor;
