import React, { useState, useEffect} from 'react'
import Canvas from './Canvas'
import Modal from './Components/Modal';
import LookUp from './Data/lookup';
import LookUpID from './Data/lookupid';
import DeclinationToRadians from './Tools/declination_string_to_radians';
import RAToRadians from './Tools/right_asc_to_radians';
import angularDistanceCheck from './Tools/angular_distance_check';
import newCoFactor from './Tools/new_cofactor';

function debounce(fn, ms) {
  let timer
  return _ => {
    clearTimeout(timer)
    timer = setTimeout(_ => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  };
}

let lastData; // literally, the last starData blob received from the API
let lastDataCoords; // the coords [Dec, Ra, Fov] on which lastData is centered
let dataAge; // the unix era timestamp associated with lastData and lastDataCoords
let promising; // used to monitor whether a LookUp (api call) is currently in progress

function App() {

  //STAR DATA FOR INITIAL FOV AND DEC/RA ARGUMENTS
  const firstStar = [{color: "#F3F8FA", decRad: -0.052839475014189084, id: 107, magnitude: 2.107819904933649, name: "", raRad: 0.007958510275541049}]
  const [starData, setStarData] = useState(firstStar) // initial data to create canvas with firstStar before api has responded
  const [activeStar, setActiveStar] = useState(false); // use this to store coords of active star with form [dec_RAD, ra_RAD]

  //VIEWPORT SETTINGS
  const [currentDecRa, setDecRa] = useState({DecCurrent: 1.57, RaCurrent: 0.7})
  const [fov, setFov] = useState(180);
  const [radiusCofactor, setCoFactor] = useState(0.4);

  //MODAL WINDOW VARIABLES
  const [modalActive, setModal] = useState(false);
  const [modalMessage, setMessage] = useState('Click star for data');
  const [modalData, setModalData] = useState('No data available');

  //CONTROL VARIABLES
  const [lockedOut, setLockOut] = useState(false);

  const UpdateModalWithStarData = (starId) => {
    LookUpID(starId).then( (result) => {
      let dec_RAD = DeclinationToRadians(result[0].decRad);
      let ra_RAD = RAToRadians(result[0].raRad);
      setActiveStar([dec_RAD, ra_RAD]);
      setMessage(` ** [${dec_RAD}, ${ra_RAD}], // Constellation: ${result[0].bayerFlamsteed} `);
      setModalData(result[0]);
      setLockOut(false);
    });

    // while awaiting LookUpID to finishing fetching data 
    setModal(true);
    setMessage(`Retrieving Data... `);
    setLockOut(true);

  }

  const GeneralUpdate = (fov, dec, ra, radiuscofactor) => {

    setFov(fov);
    setDecRa({DecCurrent: dec, RaCurrent: ra});
    setCoFactor(radiuscofactor);
  }

  //CANVAS DIMENSIONSs
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });

  const [currentCoords, setCurrentCoords] = useState({x: window.innerWidth, y: window.innerHeight});
  const [centreCoords, setCurrentCentre] = useState({centreX: 0.5*window.innerWidth, centreY: 0.5*window.innerHeight});


  useEffect(() => {
    
    if(!lastData && !(promising instanceof Promise)){ // when program is first loaded and lastData is empty/undefined

      promising = LookUp(fov, currentDecRa.DecCurrent, currentDecRa.RaCurrent).then( (result) => {
          lastData = {...result};
          dataAge = Date.now();
          lastDataCoords = [currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov]
          setStarData(lastData);
          setLockOut(false);
          setMessage(`done`);
          } );
        setLockOut(true);
        setMessage(`loading...`); 
        lastDataCoords = [currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov]
    }
    else if((dataAge + 1000 < Date.now() && !angularDistanceCheck(fov*0.20, lastDataCoords[0], lastDataCoords[1], currentDecRa.DecCurrent, currentDecRa.RaCurrent)) || fov !== lastDataCoords[2] ){

      lastDataCoords = [currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov]
      LookUp(fov, currentDecRa.DecCurrent, currentDecRa.RaCurrent).then( (result) => {

        lastData = {...result}; 
        setStarData(lastData); 
        dataAge = Date.now();
        setMessage(`done`);
        setLockOut(false);
        } );
        setLockOut(true);
        setMessage(`loading...`); 
    }

    const finalCheck = setTimeout( () => {

      if((dataAge + 1000 < Date.now() && !angularDistanceCheck(fov*0.20, lastDataCoords[0], lastDataCoords[1], currentDecRa.DecCurrent, currentDecRa.RaCurrent)) && lastDataCoords[2] === fov ){

        setLockOut(true);
        lastDataCoords = [currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov]
        LookUp(fov, currentDecRa.DecCurrent, currentDecRa.RaCurrent).then( (result) => {
  
          lastData = {...result}; 
          setStarData(lastData); 
          dataAge = Date.now();
          setMessage(`done, lastData updated`);
          setLockOut(false);
          } );
          setLockOut(true);
          setMessage(`waiting for api return...`); 
      }
    }, 1500)

      
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({ height: window.innerHeight, width: window.innerWidth })
      setCurrentCentre({ centreX: dimensions.width * 0.5, centreY: dimensions.height * 0.5 });
      setMessage(`fov: ${fov} `)
      }, 200)

    window.addEventListener('resize', debouncedHandleResize)

    //CLEAN UP FUNCTION 
    return _ => {
      clearTimeout(finalCheck);
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [centreCoords, dimensions, currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov])

  //HANDLER FUNCTIONS

  function handleModalClick() {
    setModal(false);
    setActiveStar(false);
  }

  function changeDecRa(dec, ra){

    if(currentDecRa.DecCurrent === dec && currentDecRa.RaCurrent === ra){
      return;
    }
    setDecRa({DecCurrent: dec, RaCurrent: ra});
  }

  return <><Canvas
    width={dimensions.width}
    height={dimensions.height}
    starData = {starData}
    currentDecRa = {currentDecRa}
    changeDecRa={changeDecRa}
    radiusCofactor={radiusCofactor}
    fov={fov}
    setCoFactor={setCoFactor}
    setFov={setFov}
    UpdateModalWithStarData={UpdateModalWithStarData}
    GeneralUpdate={GeneralUpdate}
    activeStar={activeStar}
    lockedOut={lockedOut}
    setLockOut={setLockOut}

    />
    
    <Modal active={modalActive} handleModalClick={handleModalClick} message={modalMessage} modalData={modalData} /> 
    </>
}

export default App