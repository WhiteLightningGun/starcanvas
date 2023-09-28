import React, { useState, useEffect} from 'react'
import Canvas from './Canvas'
import Modal from './Components/Modal';
import LookUp from './Data/LookUp';
import LookUpID from './Data/LookUpId';
import DeclinationToRadians from './Tools/DeclinationStringToRadians';
import RAToRadians from './Tools/RightAscensionToRadians';

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


function App() {

  //STAR DATA FOR CURRENT FOV AND DEC/RA ARGUMENTS
  const firstStar = [{color: "#F3F8FA", decRad: -0.052839475014189084, id: 107, magnitude: 2.107819904933649, name: "", raRad: 0.007958510275541049}]

  const [starData, setStarData] = useState(firstStar) // initial data to create canvas with before api has responded

  //VIEWPORT SETTINGS
  const [currentDecRa, setDecRa] = useState({DecCurrent: 1.57, RaCurrent: 0.7})
  const [fov, setFov] = useState(180);
  const [radiusCofactor, setCoFactor] = useState(0.4);

  //MODAL WINDOW VARIABLES
  const [modalActive, setModal] = useState(false);
  const [modalMessage, setMessage] = useState('Click star for data');
  const [modalData, setModalData] = useState('No data available');

  const UpdateModalWithStarData = (starId) => {
    LookUpID(starId).then( (result) => {
      
      let dec_RAD = DeclinationToRadians(result[0].decRad);
      let ra_RAD = RAToRadians(result[0].raRad);
      setMessage(` Dec: ${dec_RAD}, Ra: ${ra_RAD}, Constellation: ${result[0].bayerFlamsteed} `);
      setModalData(result[0]);
      console.log(result);
    });
    setModal(true);
    setMessage(`Retrieving Data... `)
    //
    
  }

  const GeneralUpdate = (fov, dec, ra, radiuscofactor, x, y) => {

    setFov(fov);
    setDecRa({DecCurrent: dec, RaCurrent: ra});
    setCoFactor(radiuscofactor);
    //coordsChanger(x, y);


    LookUp(fov, ra, dec).then( (result) => {
      setStarData({...result});
      } );

  }

  //CANVAS DIMENSIONS

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });

  const [currentCoords, setCurrentCoords] = useState({x: window.innerWidth, y: window.innerHeight});
  const [centreCoords, setCurrentCentre] = useState({centreX: 0.5*window.innerWidth, centreY: 0.5*window.innerHeight});

  useEffect(() => {
    console.log(`useEffect LookUp was called, ${currentDecRa.DecCurrent}, ${currentDecRa.RaCurrent}`)
    //Grab data from API using current canvas conditions
    LookUp(fov, currentDecRa.DecCurrent, currentDecRa.RaCurrent).then( (result) => {

      setStarData({...result});
      } );
    
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({ height: window.innerHeight, width: window.innerWidth })
      setCurrentCoords({ x: dimensions.width * Math.random(), y: dimensions.height * Math.random() });
      setCurrentCentre({ centreX: dimensions.width * 0.5, centreY: dimensions.height * 0.5 });
      setMessage(`fov: ${fov} `)
      }, 100)

    window.addEventListener('resize', debouncedHandleResize)
    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [centreCoords, dimensions, currentDecRa.DecCurrent, currentDecRa.RaCurrent, fov])

  //HANDLER FUNCTIONS

  function handleModalClick() {
    setModal(false);
    
  }

  function updateData(fov, ra, dec){
    //use this function to grab data from api using fov, ra, and dec
    console.log('updateData called')
    LookUp(fov, ra, dec).then( (result) => {
      setStarData({...result});
      } );
  }

  const coordsChanger = (x,y) => {
    setCurrentCoords({ x: x, y: y })
    setCurrentCentre({ centreX: dimensions.width * 0.5, centreY: dimensions.height * 0.5 })
    //modalActive ? setModal(false) : setModal(true) ;
    //setMessage(`fov: ${fov} radiusCoFactor: ${radiusCofactor} Dec: ${currentDecRa.DecCurrent}, Ra: ${currentDecRa.RaCurrent} `)
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
    data = {starData}
    currentDecRa = {currentDecRa}
    changeDecRa={changeDecRa}
    radiusCofactor={radiusCofactor}
    fov={fov}
    setCoFactor={setCoFactor}
    setFov={setFov}
    UpdateModalWithStarData={UpdateModalWithStarData}
    GeneralUpdate= {GeneralUpdate}

    />
    
    <Modal active={modalActive} handleClick={handleModalClick} message={modalMessage} modalData={modalData} /> </>
}

export default App