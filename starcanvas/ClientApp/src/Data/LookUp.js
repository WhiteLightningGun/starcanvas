
/*
async function LookUp() {


const response = await fetch('stars');
const data = await response.json();
//console.log(data);
return data;
}

export default LookUp;

*/

async function LookUp(fov, dec, ra) {

const response = await fetch(`stars/StarFOV/${fov}/${dec}/${ra}`);
const data = await response.json();
//console.log(data);
return data;
}

export default LookUp;

// [HttpGet("StarFOV/{fov}/{dec}/{ra}")]