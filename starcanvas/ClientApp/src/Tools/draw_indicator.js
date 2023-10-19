import angularDistanceCheck from "./angular_distance_check";
import orthographicProjection from "./orthographic_projection";

const drawIndicator = (
  ref,
  activeStar,
  Fov,
  radius,
  RadiusCoFactor,
  Dec,
  Ra
) => {
  // activeStar has form [dec_RAD, ra_RAD]

  //first, check to see if activeStar coords are within current Fov and viewer Dec, Ra settings
  if (angularDistanceCheck(Fov, Dec, Ra, activeStar[0], activeStar[1])) {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    let activeStarCoords = orthographicProjection(
      radius * RadiusCoFactor,
      Dec,
      Ra,
      activeStar[0],
      activeStar[1]
    );

    ctx.strokeStyle = "lightgrey";
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(
      activeStarCoords[0] + 0.5 * window.innerWidth,
      activeStarCoords[1] + 0.5 * window.innerHeight,
      10,
      0,
      2 * Math.PI
    ); // + 2 * Math.sin(frameCount * 0.1) ** 2
    ctx.stroke();
  }
};

export default drawIndicator;
