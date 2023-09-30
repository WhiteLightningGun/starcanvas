//write current dec and ra values to lower left of canvas converted degrees, hours, rounded to two decimals
function WriteCurrentDecRa(ref, Dec, Ra, x, y){
    const canvas = ref.current
    const context = canvas.getContext('2d')

    context.strokeStyle = 'white';
    context.fillStyle = 'white';
    context.fillText(`Dec: ${(Dec*57.29577951).toFixed(2)} deg, Ra: ${(Ra*3.819718634).toFixed(2)} hours`, x, y)
}

export default WriteCurrentDecRa;