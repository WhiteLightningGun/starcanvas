// Calculates the max magnitude a star can have for a given FOV field of view
// uses a straight line graph to interpolate between limits of FOV, 
// with Fov = 30 producing result = 1, Fov = 180 producing result = 3 which means the smallest stars will be drawn with a radius of 3

function MaxMagnitudeForFOV(fov){
    let maxMagnitude;
    maxMagnitude = 0.013333333333333334*fov + 0.6;
    return maxMagnitude;
}

export default MaxMagnitudeForFOV;