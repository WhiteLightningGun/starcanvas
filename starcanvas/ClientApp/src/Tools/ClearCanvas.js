//clears canvas and sets a certain colour

function ClearCanvas(ref, colour){
    const canvas = ref.current
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = colour;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

}

export default ClearCanvas;