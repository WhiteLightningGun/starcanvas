import React from 'react'
import {memo} from 'react';
import useCanvas from './use_canvas'
import './Components/css/canvas.css';
import orthographicProjection from './Tools/orthographic_projection';
import distanceMagnitude from './Tools/distance_magnitude';
import newCoFactor from './Tools/new_cofactor';
import writeCurrentDecRa from './Tools/write_current_dec_ra';
import DrawConstellations from './Tools/draw_constellations';
import clearCanvas from './Tools/clear_canvas';
import DrawStars from './Tools/draw_stars';
import DrawIndicator from './Tools/draw_indicator';

let fovAdjustTime; //keeps track of the last time the fov was adjusted, after a certain period with no change then the api will be called again
let expectingDataUpdate = false;
let permitZooming = true;

const Canvas = props => {  
  const {width, height, clickX, clickY, starData, currentDecRa , changeDecRa, radiusCofactor, fov, setCoFactor, setFov, UpdateModalWithStarData, GeneralUpdate, activeStar, lockedOut, setLockOut, ...rest } = props

  let Fov = fov;
  let Ra = currentDecRa.RaCurrent;
  let Dec = currentDecRa.DecCurrent;
  let clickActive = false; 
  let currentMousePosition = [0, 0]; // stores (x,y) coordinates as [x,y]
  let mouseDownPositionDecRa = [0, 0, 0, 0]; // stores (x,y) coordinates and Declination, Right Ascension at moment of mouse click
  let RadiusCoFactor = radiusCofactor; //scales the orthographic calculation results to fit neatly to the current screen proportions
  expectingDataUpdate = false; // back to false upon reinitialisation
  //let expectingDataUpdate = false; // if true then the api will be called after alloted time relative to that stored in fovAdjustTime
  permitZooming = true;
  let fovHysteresis = 500; // units are ms
  let bgColour = '#02071a' // dark blue


  const draw = (ctx, frameCount) => {
    
    //console.log(`radiusCofactor: ${radiusCofactor}, locally: ${RadiusCoFactor} `)
    if(expectingDataUpdate && Date.now() > (fovAdjustTime + fovHysteresis)){
      GeneralUpdate(Fov, Dec, Ra, RadiusCoFactor, window.innerWidth/2, window.innerHeight/2);
      permitZooming = false;
      setLockOut(true);
    }

    if(clickActive && !expectingDataUpdate && !lockedOut){
      AdjustDecRa();
    }

    let radius = window.innerWidth >= window.innerHeight ?  window.innerWidth : window.innerHeight //will choose the longest dimension

    clearCanvas(canvasRef, bgColour);
    writeCurrentDecRa(canvasRef, Dec, Ra, 1, window.innerHeight -25);
    DrawConstellations(canvasRef, Fov, Dec, Ra, radius, RadiusCoFactor);

    // Indicator
    if(activeStar){

    DrawIndicator(canvasRef, activeStar, Fov, radius, RadiusCoFactor, Dec, Ra);
    }
    DrawStars(canvasRef, starData, radius, RadiusCoFactor, window.innerWidth, window.innerHeight, Fov, Dec, Ra);

  }

  // UTILITIES FOR HTML EVENTS 
  const canvasRef = useCanvas(draw)

  const handleClick = (e) => {

    if(lockedOut){
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    //call coordsChange function here

    //look compare x,y location to all stars in current draw pipeline
    LookUpStarLocation(x,y);
  }

  const mousedowned = (e) => {
    if(lockedOut){
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    mouseDownPositionDecRa = [x, y, Dec, Ra]
    clickActive = true;
  }

  const mouseUpped = (e) => {

    if(lockedOut){
      return;
    }

    clickActive = false;
    changeDecRa(Dec, Ra);

  }

  const currentMousPos = (e) => {

    if(lockedOut){
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    currentMousePosition = [x, y];
  }

  const mouseWheeled = (e) =>{

    if(lockedOut){
      return;
    }

    if(expectingDataUpdate && Date.now() > (fovAdjustTime + fovHysteresis)){
      console.log('mouse wheel officially stopped')
      return;
    }
    if(e.deltaY > 0 && Fov > 40){ // Min Fov is now 40 degrees
      Fov = Fov - 14;
      RadiusCoFactor = newCoFactor(Fov); // this is not a react state change and does not trigger re-render
      fovAdjustTime = Date.now();
      expectingDataUpdate = true;
    }
    else if (e.delta > 0 && Fov === 40){
      return;
    }
    else if (e.deltaY < 0 && Fov < 180) {
      Fov = Fov + 14;
      RadiusCoFactor = newCoFactor(Fov); // this is not a react state change and does not trigger re-render
      fovAdjustTime = Date.now();
      expectingDataUpdate = true;
    }
  }

  const DoubleClick = () => {

    if(lockedOut){
      return;
    }
    changeDecRa(Dec, Ra);
    setCoFactor(RadiusCoFactor);
    setFov(Fov);
  }

  // UTILITY CLASSES FOR USE BY THE CANVAS
  //Changes the Declination and Right Ascension setting of the canvas class according to mouse clicks and movements
  const AdjustDecRa = () => {

    if(lockedOut){
      return;
    }
  
    if(currentMousePosition[0] === 0 && currentMousePosition[1] === 0){
      // this fixes edge case where clicking in the same place twice without moving pointer causes bad stuff to happen
    }
    else{
    let relativeX = 0.5*(mouseDownPositionDecRa[0] - currentMousePosition[0])/window.innerWidth;
    let relativeY = -0.5*(mouseDownPositionDecRa[1] - currentMousePosition[1])/window.innerHeight;

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

    if(lockedOut){
      return;
    }

    let objectLength = Object.keys(starData).length;
    let radius = window.innerWidth >= window.innerHeight ?  window.innerWidth : window.innerHeight 

    for(let i = 0 ; i < objectLength ; i++){
    
      let coords = orthographicProjection(radius*RadiusCoFactor, Dec, Ra, starData[i].decRad, starData[i].raRad )

      if ( distanceMagnitude(coords[0] + 0.5*window.innerWidth, coords[1]  + 0.5*window.innerHeight, x, y) < 10){
        UpdateModalWithStarData(starData[i].id);
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