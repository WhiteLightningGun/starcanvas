import angularDistanceCheck from './angular_distance_check';
import orthographicProjection from './orthographic_projection';
import MaxMagnitudeForFOV from './max_magnitude_for_fov';

function drawStars(ref, data, radius, RadiusCoFactor, windowWidth, windowHeight, Fov, Dec, Ra){

    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let maxMagnitude =  MaxMagnitudeForFOV(Fov);
    let dataLength = Object.keys(data).length;

    for(let i = 0 ; i < dataLength ; i++){

        //select colour for this star
        ctx.strokeStyle = data[i].color;
        ctx.fillStyle = data[i].color;
        
        if(angularDistanceCheck(Fov, Dec, Ra, data[i].decRad, data[i].raRad)) 
        {
            let coords = orthographicProjection(radius*RadiusCoFactor, Dec, Ra, data[i].decRad, data[i].raRad ) 

            if(data[i].name) {
            // if the star has a name, it is drawn with larger radius
            ctx.fillText(data[i].name, coords[0] + 0.5*windowWidth + 8, coords[1] + 0.5*windowHeight + 10);
            ctx.beginPath()
            ctx.lineWidth = 2;
            ctx.arc(coords[0] + 0.5*windowWidth , coords[1] + 0.5*windowHeight, data[i].magnitude*0.8, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.fill()
            }
            else if(data[i].magnitude <  maxMagnitude ){
            //do nothing if star is not bright and has radius < maxMagnitude
            }
            else {

            ctx.beginPath()
            ctx.lineWidth = 2;
            ctx.arc(coords[0] + 0.5*windowWidth , coords[1] + 0.5*windowHeight, data[i].magnitude*0.05, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.fill()
            }
        }
    }
}

export default drawStars;