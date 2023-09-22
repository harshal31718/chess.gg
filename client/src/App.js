import React from 'react'
import Background from "./assets/background.jpg"
import Game from './Game'

const App = () => {
  return (
    <div className="p-1"style={{
      backgroundImage: `url(${Background})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      height: "100vh"
    }}>
      <Game/>
    </div>
  )
}

export default App
