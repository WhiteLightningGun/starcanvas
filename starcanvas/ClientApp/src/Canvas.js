import React from 'react'
import useCanvas from './useCanvas'
import './Components/css/canvas.css';
import Orthographic_Project from './Tools/Orthographic_Projection';
import AngularDistanceCheck from './Tools/AngularDistanceCheck';
import UrsaMinor from './Constellations/UrsaMinor';
import UrsaMajor from './Constellations/UrsaMajor';
import Cassiopeia from './Constellations/Cassiopeia';
import AllConstellations from './Constellations/AllConstellations';

const Canvas = props => {  
  const {width, height, clickX, clickY, coordsChanger, data, updateData, currentDecRa , changeDecRa, radiusCofactor, fov, setCoFactor, setFov, UpdateModalWithStarData, GeneralUpdate,  ...rest } = props

  let Fov = fov;
  let Ra = currentDecRa.RaCurrent;
  let Dec = currentDecRa.DecCurrent;
  let clickActive = false;
  let currentMousePosition = [0, 0];
  let mouseDownPositionDecRa = [0, 0, 0, 0];
  let RadiusCoFactor = radiusCofactor; //scales the orthographic calculation results to fit neatly to the current screen proportions
  let maxMagnitude;
  let fovAdjustTime; //keeps track of the last time the fov was adjusted, after a certain period with no change then the api will be called again
  let expectingDataUpdate = false; // if true then the api will be called after alloted time, after successful call or a re-render it will be set to false again
  let fovHysteresis = 500; // 1000 ms

  const draw = (ctx, frameCount, width, height) => {

    if(expectingDataUpdate && Date.now() > (fovAdjustTime + fovHysteresis)){
      //call api if current time exceeds fovAdjustTime by the hysteresis setting
      console.log(`api was called!!!`);
      expectingDataUpdate = false;
      GeneralUpdate(Fov, Dec, Ra, RadiusCoFactor, window.innerWidth/2, window.innerHeight/2);
    }

    maxMagnitude =  0.013333333333333334*Fov + 0.6

    let radius = window.innerWidth >= window.innerHeight ?  window.innerWidth : window.innerHeight //will choose the longest dimension

    //clear and fill with dark blue
    ctx.fillStyle = '#02071a'
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    // Pulsing Red Circle thing
    /*
    ctx.strokeStyle = "red";
    ctx.beginPath()
    ctx.lineWidth = 10;
    ctx.arc(clickX, clickY, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fillStyle = 'red'
    ctx.fill()
    */
    
    //Text and labels
    ctx.font = "12px Arial";

    //write current dec and ra values to canvas converted degrees, hours, rounded to two decimals
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.fillText(`Dec: ${(Dec*57.29577951).toFixed(2)} deg, Ra: ${(Ra*3.819718634).toFixed(2)} hours`, 1,window.innerHeight -25); 

    //draw constellations
    ctx.strokeStyle = '#434343';
    ctx.fillStyle = '#434343';
    ctx.lineWidth = 1;

    //This should be switchable, and depend on a state variable located in App.js
    for(let i = 0; i < AllConstellations.length ; i++)
    {
      for(let j = 0; j < AllConstellations[i].length; j++)
      {
        for(let k = 0; k < AllConstellations[i][j].length - 1; k++ )
        {
          //Decide whether or not to calculate and draw line depending on if it is in Fov
          if(AngularDistanceCheck(Fov, Dec, Ra, AllConstellations[i][j][k][0], AllConstellations[i][j][k][1]))
          { 
            let coord1 = Orthographic_Project(radius*RadiusCoFactor, Dec, Ra, AllConstellations[i][j][k][0], AllConstellations[i][j][k][1] )
            let coord2 = Orthographic_Project(radius*RadiusCoFactor, Dec, Ra, AllConstellations[i][j][k+1][0], AllConstellations[i][j][k+1][1] )

            ctx.beginPath();
            ctx.moveTo(coord1[0] + 0.5*window.innerWidth, coord1[1] + 0.5*window.innerHeight);
            ctx.lineTo(coord2[0] + 0.5*window.innerWidth, coord2[1]+ 0.5*window.innerHeight);

            ctx.strokeStyle = '#1f253f';
            ctx.stroke();
          }
        }
      }
    }

    let dataLength = Object.keys(data).length;

    if(clickActive){
      AdjustDecRa();
    }

    for(let i = 0 ; i < dataLength ; i++){

      ctx.strokeStyle = data[i].color;
      ctx.fillStyle = data[i].color;
      
      if(AngularDistanceCheck(Fov, Dec, Ra, data[i].decRad, data[i].raRad)) 
      {
        let coords = Orthographic_Project(radius*RadiusCoFactor, Dec, Ra, data[i].decRad, data[i].raRad ) 

        if(data[i].name) {
          // if the star has a name, it is drawn with larger radius
          ctx.fillText(data[i].name, coords[0] + 0.5*window.innerWidth + 8, coords[1] + 0.5*window.innerHeight + 10);
          
          ctx.beginPath()
          ctx.lineWidth = 2;
          ctx.arc(coords[0] + 0.5*window.innerWidth , coords[1] + 0.5*window.innerHeight, data[i].magnitude*0.8, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.fill()
  
        }
        else if(data[i].magnitude <  maxMagnitude ){
          //do nothing if star is not bright and has radius < maxMagnitude
        }
        else {

          ctx.beginPath()
          ctx.lineWidth = 2;
          ctx.arc(coords[0] + 0.5*window.innerWidth , coords[1] + 0.5*window.innerHeight, data[i].magnitude*0.05, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.fill()
  
        }
        
      }
      
    }
      
  } //draw function ends here 


  const LookUpStarLocation = (x,y) => {
    let objectLength = Object.keys(data).length;

    for(let i = 0 ; i < objectLength ; i++){
      let radius = window.innerWidth >= window.innerHeight ?  window.innerWidth : window.innerHeight //will choose the longest dimension
      let coords = Orthographic_Project(radius*RadiusCoFactor, Dec, Ra, data[i].decRad, data[i].raRad )

      if (DistanceMagnitude(coords[0] + 0.5*window.innerWidth, coords[1]  + 0.5*window.innerHeight, x, y) < 10){
        console.log(`Found star with DB id: ${data[i].id}, names: ${data[i].name} `);

        UpdateModalWithStarData(data[i].id);

      }
    }

  }

  const DistanceMagnitude = (x1, y1, x2, y2) =>{
    let res = Math.sqrt(Math.pow((x2 - x1), 2 ) + Math.pow((y2 - y1), 2 ));
    //console.log(res);
    return res;
  }

  const canvasRef = useCanvas(draw)

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    //call coordsChange function here

    coordsChanger(x, y)

    //look compare x,y location to all stars in current draw pipeline
    LookUpStarLocation(x,y);
  }

  const mousedowned = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    mouseDownPositionDecRa = [x, y, Dec, Ra]

    clickActive = true;
  }

  const mouseUpped = (e) => {
    //const rect = canvasRef.current.getBoundingClientRect()
    //const x = e.clientX - rect.left
    //const y = e.clientY - rect.top

    clickActive = false;

    changeDecRa(Dec, Ra);
    setCoFactor(RadiusCoFactor);
    setFov(Fov);
  }

  const currentMousPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    currentMousePosition = [x, y];
  }

  const AdjustDecRa = () => {
    
    if(currentMousePosition[0] === 0 && currentMousePosition[1] === 0){
      // this fixes edge case where clicking in the same place twice without moving pointer causes bad stuff to happen
    }
    else{
    let relativeX = (mouseDownPositionDecRa[0] - currentMousePosition[0])/window.innerWidth;
    let relativeY = -(mouseDownPositionDecRa[1] - currentMousePosition[1])/window.innerHeight;

    if( // declination values are limited from 1.57 down to -1.57
        relativeY*Math.PI + mouseDownPositionDecRa[2] < 1.57 
        && 
        relativeY*Math.PI + mouseDownPositionDecRa[2] > -1.57
      )
      {
        Dec = relativeY*Math.PI + mouseDownPositionDecRa[2];
    }

    Ra = -relativeX*Math.PI + mouseDownPositionDecRa[3];

    if(Ra > 2*Math.PI){
      Ra -= 2*Math.PI;
    }
    else if( Ra < 0){
      Ra += 2*Math.PI;
    }

    }
    //change the way RA is handled here so as to prevent the bug where -1.57 is taken from RA for no apparent reason after clicking
  }

  const mouseWheeled = (e) =>{

    if(e.deltaY > 0 && Fov > 30){ // Min Fov is now 30 degrees
      Fov = Fov - 10;
      RadiusCoFactor = newCoFactor(Fov);
      fovAdjustTime = Date.now();
      expectingDataUpdate = true;
    }
    else if (e.deltaY < 0 && Fov < 180) {
      Fov = Fov + 10;
      RadiusCoFactor = newCoFactor(Fov);
      fovAdjustTime = Date.now();
      expectingDataUpdate = true;
    }

  }

  const DoubleClick = () =>{
    changeDecRa(Dec, Ra);
    setCoFactor(RadiusCoFactor);
    setFov(Fov);
  }

  const newCoFactor = (newFov) => {
    let res = -newFov*0.008125 + 1.8625; // −0.008125x + 1.8625
    return res;
  }
    
  return <canvas ref={canvasRef} {...rest} width={width} height={height} className="canvas" onClick={handleClick} onMouseDown={mousedowned} onMouseUp={mouseUpped} onMouseMove={currentMousPos} onWheel= {mouseWheeled} onDoubleClick={DoubleClick}/>
}

export default Canvas


/*

Objects returned from API stars_draw database have form:

color : "#F3F8FA"
decRad: -0.052839475014189084
id: 107
magnitude: 2.107819904933649
name: ""
raRad: 0.007958510275541049

*/