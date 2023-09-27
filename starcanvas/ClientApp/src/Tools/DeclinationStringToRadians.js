// 0.01745329252 is 2pi/360 and is used to convert degrees to radians


function DeclinationToRadians(dec){

    let result = parseFloat(dec.replace('+', ''))*0.01745329252;

    return result;
}
export default DeclinationToRadians;