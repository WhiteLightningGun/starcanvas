
import React, { useRef, useEffect } from 'react'

const Canvas = props => {
  
  const { draw, ...rest } = props
  const canvasRef = useRef(null) // changing the ref data, unlike state, will not trigger a re-render, important... 
  
  useEffect(() => { // use effect allows us to synchronise component with outside dependency after component has mounted
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frameCount = 0
    let animationFrameId
    
    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])
  
  return <canvas ref={canvasRef} {...rest}/>
}

export default Canvas