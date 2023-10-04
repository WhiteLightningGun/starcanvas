import React, { useState, useEffect} from 'react'
import Canvas from './Canvas'
import Modal from './Components/Modal';
import LookUp from './Data/lookup';
import LookUpID from './Data/lookupid';
import DeclinationToRadians from './Tools/declination_string_to_radians';
import RAToRadians from './Tools/right_asc_to_radians';
import angularDistanceCheck from './Tools/angular_distance_check';

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

let lastData;
let lastDataCoords;
let dataAge;
let promising;

function App() {

  //STAR DATA FOR CURRENT FOV AND DEC/RA ARGUMENTS
  const firstStar = [{color: "#F3F8FA", decRad: -0.052839475014189084, id: 107, magnitude: 2.107819904933649, name: "", raRad: 0.007958510275541049}]
  const [starData, setStarData] = useState(firstStar) // initial data to create canvas with firstStar before api has responded
  const [activeStar, setActiveStar] = useState(false); // use this to store coords of active star with form [dec_RAD, ra_RAD]

  //VIEWPORT SETTINGS
  const [currentDecRa, setDecRa] = useState({DecCurrent: 1.57, RaCurrent: 0.7})
  const [fov, setFov] = useState(180);
  const [radiusCofactor, setCoFactor] = useState(0.4);

  //MODAL WINDOW VARIABLES
  const [modalActive, setModal] = useState(true);
  const [modalMessage, setMessage] = useState('Click star for data');
  const [modalData, setModalData] = useState('No data available');

  const UpdateModalWithStarData = (starId) => {
    LookUpID(starId).then( (result) => {
      
      let dec_RAD = DeclinationToRadians(result[0].decRad);
      let ra_RAD = RAToRadians(result[0].raRad);
      setActiveStar([dec_RAD, ra_RAD]);
      setMessage(` ** [${dec_RAD}, ${ra_RAD}], // Constellation: ${result[0].bayerFlamsteed} `);
      setModalData(result[0]);
      console.log(result);
    });

    // while awaiting LookUpID to finishing fetching data 
    setModal(true);
    setMessage(`Retrieving Data... `)

  }

  const GeneralUpdate = (fov, dec, ra, radiuscofactor, x, y) => {

    setFov(fov);
    setDecRa({DecCurrent: dec, RaCurrent: ra});
    setCoFactor(radiuscofactor);

  }

  //CANVAS DIMENSIONS

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });

  const [currentCoords, setCurrentCoords] = useState({x: window.innerWidth, y: window.innerHeight});
  const [centreCoords, setCurrentCentre] = useState({centreX: 0.5*window.innerWidth, centreY: 0.5*window.innerHeight});


  useEffect(() => {
    
    //Grab data from API using current canvas conditions, this should only happen if the canvas declination + RA has changed sufficiently
    //clearTimeout(timeOut)

    if(!lastData && !(promising instanceof Promise)){ // when program is first loaded and lastData is empty/undefined
      console.log("calling lookup from if");
      promising = LookUp(fov, currentDecRa.DecCurrent, currentDecRa.RaCurrent).then( (result) => {
          lastData = {...result};
          dataAge = Date.now();
          lastDataCoords = [currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov]
          setMessage(`done, lastData updated`);
          //trigger update
          setStarData(lastData);
          } ); 
        setMessage(`waiting for api return`); 
        lastDataCoords = [currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov]
    }
    else if(dataAge + 1000 < Date.now() && !angularDistanceCheck(fov*0.33, lastDataCoords[0], lastDataCoords[1], currentDecRa.DecCurrent, currentDecRa.RaCurrent) || fov != lastDataCoords[2] ){

      //associate time stamp with lastData, only trigger api call + update if more than 1 second has passed since last download and fov,dec,ra have changed significantly
      console.log(`lastDataCoords[2]: ${lastDataCoords[2]}  fov: ${fov}`);
      lastDataCoords = [currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov]
      LookUp(fov, currentDecRa.DecCurrent, currentDecRa.RaCurrent).then( (result) => {

        lastData = {...result}; 
        setStarData(lastData); 
        dataAge = Date.now();
        setMessage(`done, lastData updated`);
        } );
        setMessage(`waiting for api return...`); 
    }


      
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({ height: window.innerHeight, width: window.innerWidth })
      setCurrentCoords({ x: dimensions.width * Math.random(), y: dimensions.height * Math.random() });
      setCurrentCentre({ centreX: dimensions.width * 0.5, centreY: dimensions.height * 0.5 });
      setMessage(`fov: ${fov} `)
      }, 200)

    window.addEventListener('resize', debouncedHandleResize)

    //CLEAN UP FUNCTION 
    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [centreCoords, dimensions, currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov])

  //HANDLER FUNCTIONS

  function handleModalClick() {
    setModal(false);
    setActiveStar(false);
  }

  function updateData(fov, ra, dec){
    //use this function to grab data from api using fov, ra, and dec
    console.log('updateData called')
    LookUp(fov, ra, dec).then( (result) => {
      //setStarData({...result});
      lastData = {...result};
      } );
  }

  const coordsChanger = (x,y) => {
    setCurrentCoords({ x: x, y: y })
    setCurrentCentre({ centreX: dimensions.width * 0.5, centreY: dimensions.height * 0.5 })
  }

  function changeDecRa(dec, ra){

    setDecRa({DecCurrent: dec, RaCurrent: ra});
  }

  return <><Canvas
    width={dimensions.width}
    height={dimensions.height}
    clickX={currentCoords.x}
    clickY={currentCoords.y} 
    coordsChanger={coordsChanger}
    updateData={updateData}
    starData = {starData}
    currentDecRa = {currentDecRa}
    changeDecRa={changeDecRa}
    radiusCofactor={radiusCofactor}
    fov={fov}
    setCoFactor={setCoFactor}
    setFov={setFov}
    UpdateModalWithStarData={UpdateModalWithStarData}
    GeneralUpdate= {GeneralUpdate}
    activeStar={activeStar}

    />
    
    <Modal active={modalActive} handleModalClick={handleModalClick} message={modalMessage} modalData={modalData} /> </>
}

export default App