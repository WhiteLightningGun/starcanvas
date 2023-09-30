import AllConstellations from '../Constellations/AllConstellations';
import AngularDistanceCheck from './AngularDistanceCheck';
import Orthographic_Project from './Orthographic_Projection';

function DrawConstellations(ref, Fov, Dec, Ra, radius, RadiusCoFactor){
    const canvas = ref.current
    const ctx = canvas.getContext('2d')

    //draw constellations
    //ctx.strokeStyle = '#2d1a42';
    //ctx.fillStyle = '#2d1a42';
    ctx.lineWidth = 2;

    // // This should be switchable, and depend on a state variable located in App.js

    let allConstellationsLength = AllConstellations.length;

    for(let i = 0; i < allConstellationsLength ; i++)
    {
        let constellationLength = AllConstellations[i].length;

        for(let j = 0; j < constellationLength; j++)
        {
        let subConstellationLength = AllConstellations[i][j].length

        for(let k = 0; k < subConstellationLength - 1; k++ )
        {
            //Decide whether or not to calculate and draw line depending on if it is within current Fov
            if(AngularDistanceCheck(Fov, Dec, Ra, AllConstellations[i][j][k][0], AllConstellations[i][j][k][1]))
            { 
            let coord1 = Orthographic_Project(radius*RadiusCoFactor, Dec, Ra, AllConstellations[i][j][k][0], AllConstellations[i][j][k][1] )
            let coord2 = Orthographic_Project(radius*RadiusCoFactor, Dec, Ra, AllConstellations[i][j][k+1][0], AllConstellations[i][j][k+1][1] )

            ctx.beginPath();
            ctx.moveTo(coord1[0] + 0.5*window.innerWidth, coord1[1] + 0.5*window.innerHeight);
            ctx.lineTo(coord2[0] + 0.5*window.innerWidth, coord2[1]+ 0.5*window.innerHeight);

            ctx.strokeStyle = '#343742';
            ctx.stroke();
            }
        }
        }
    }
    

}

export default DrawConstellations;