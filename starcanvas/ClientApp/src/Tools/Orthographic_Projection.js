/*
    l0, l1 : longitude, or raRad
    phi0, phi1 : latitude, or decRa

    phi0 and l0 are the central points, the angular arguments currently assigned to viewscreen centre

    https://en.wikipedia.org/wiki/Orthographic_map_projection
*/

function Orthographic_Project(radius, phi0, l0, phi1, l1){

    //console.log(`orthographic_project args: ${radius}, ${phi0}, ${l0} ,${phi1} , ${l1}  `)
    let x = radius*Math.cos(phi1)*Math.sin(l1 - l0)
    let y = radius*(Math.cos(phi0)*Math.sin(phi1) - Math.sin(phi0)*Math.cos(phi1)*Math.cos(l1 - l0))

    return [-x, -y];

} //return coords x, y suitable for current canvas configuration

export default Orthographic_Project;