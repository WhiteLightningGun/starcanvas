import React from 'react'
import useCanvas from './use_canvas'
import './Components/css/canvas.css';
import Orthographic_Project from './Tools/orthographic_projection';
import DistanceMagnitude from './Tools/distance_magnitude';
import NewCoFactor from './Tools/new_cofactor';
import writeCurrentDecRa from './Tools/write_current_dec_ra';
import DrawConstellations from './Tools/draw_constellations';
import clearCanvas from './Tools/clear_canvas';
import DrawStars from './Tools/draw_stars';
import DrawIndicator from './Tools/draw_indicator';

//import AngularDistanceCheck from './Tools/AngularDistanceCheck';

const Canvas = props => {  
  const {width, height, clickX, clickY, coordsChanger, data, updateData, currentDecRa , changeDecRa, radiusCofactor, fov, setCoFactor, setFov, UpdateModalWithStarData, GeneralUpdate, activeStar, ...rest } = props

  let Fov = fov;
  let Ra = currentDecRa.RaCurrent;
  let Dec = currentDecRa.DecCurrent;
  let clickActive = false; 
  let currentMousePosition = [0, 0]; // stores (x,y) coordinates as [x,y]
  let mouseDownPositionDecRa = [0, 0, 0, 0]; // stores (x,y) coordinates and Declination, Right Ascension at moment of mouse click
  let RadiusCoFactor = radiusCofactor; //scales the orthographic calculation results to fit neatly to the current screen proportions
  let fovAdjustTime; //keeps track of the last time the fov was adjusted, after a certain period with no change then the api will be called again
  let expectingDataUpdate = false; // if true then the api will be called after alloted time relative to that stored in fovAdjustTime
  let fovHysteresis = 800; // units are ms
  let bgColour = '#02071a' // dark blue

  const draw = (ctx, frameCount) => {

    if(expectingDataUpdate && Date.now() > (fovAdjustTime + fovHysteresis)){
      //call api if current time exceeds fovAdjustTime by the hysteresis setting
      //expectingDataUpdate = false;
      GeneralUpdate(Fov, Dec, Ra, RadiusCoFactor, window.innerWidth/2, window.innerHeight/2);
    }

    if(clickActive){
      AdjustDecRa();
    }

    let radius = window.innerWidth >= window.innerHeight ?  window.innerWidth : window.innerHeight //will choose the longest dimension
    
    //Text and labels
    ctx.font = "12px Arial";

    clearCanvas(canvasRef, bgColour);
    writeCurrentDecRa(canvasRef, Dec, Ra, 1, window.innerHeight -25);
    DrawConstellations(canvasRef, Fov, Dec, Ra, radius, RadiusCoFactor);

    // Indicator
    if(activeStar){

      DrawIndicator(canvasRef, activeStar, Fov, radius, RadiusCoFactor, Dec, Ra);
    }
    DrawStars(canvasRef, data, radius, RadiusCoFactor, window.innerWidth, window.innerHeight, Fov, Dec, Ra);

  }

  // UTILITIES FOR HTML EVENTS 
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

  const mouseWheeled = (e) =>{

    if(e.deltaY > 0 && Fov > 30){ // Min Fov is now 30 degrees
      Fov = Fov - 10;
      RadiusCoFactor = NewCoFactor(Fov); // this is not a react state change and does not trigger re-render
      fovAdjustTime = Date.now();
      expectingDataUpdate = true;
    }
    else if (e.delta > 0 && Fov === 30){
      return;
    }
    else if (e.deltaY < 0 && Fov < 180) {
      Fov = Fov + 10;
      RadiusCoFactor = NewCoFactor(Fov); // this is not a react state change and does not trigger re-render
      fovAdjustTime = Date.now();
      expectingDataUpdate = true;
    }

  }

  const DoubleClick = () =>{
    changeDecRa(Dec, Ra);
    setCoFactor(RadiusCoFactor);
    setFov(Fov);
  }

  // UTILITY CLASSES FOR USE BY THE CANVAS
  //Changes the Declination and Right Ascension setting of the canvas class according to mouse clicks and movements
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

    //confine Ra argument to 0 - 2Pi domain
    if(Ra > 2*Math.PI){
      Ra -= 2*Math.PI; 
    }
    else if(Ra < 0){
      Ra += 2*Math.PI;
    }
    }
  }

  // uses coordinates of mouse click to identify which star was clicked
  const LookUpStarLocation = (x,y) => {

    let objectLength = Object.keys(data).length;
    let radius = window.innerWidth >= window.innerHeight ?  window.innerWidth : window.innerHeight 

    for(let i = 0 ; i < objectLength ; i++){
    
      let coords = Orthographic_Project(radius*RadiusCoFactor, Dec, Ra, data[i].decRad, data[i].raRad )

      if ( DistanceMagnitude(coords[0] + 0.5*window.innerWidth, coords[1]  + 0.5*window.innerHeight, x, y) < 10){
        console.log(`Found star with DB id: ${data[i].id}, names: ${data[i].name} `);
        UpdateModalWithStarData(data[i].id);
        return;
      }
    }
  }

  return <>
    <canvas ref={canvasRef} {...rest} 
    width={width} 
    height={height} 
    className="canvas" 
    onClick={handleClick} 
    onMouseDown={mousedowned} 
    onMouseUp={mouseUpped} 
    onMouseMove={currentMousPos}
    onWheel= {mouseWheeled} 
    onDoubleClick={DoubleClick}/>
  </>
}

export default Canvas

/*

N.B. Objects returned from API stars_draw database have form:

color : "#F3F8FA"
decRad: -0.052839475014189084
id: 107
magnitude: 2.107819904933649
name: ""
raRad: 0.007958510275541049

*/