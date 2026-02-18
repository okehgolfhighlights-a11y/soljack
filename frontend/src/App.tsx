import { useMemo } from "react"
import HomePage from "./components/HomePage"
import DevWatch from "./components/DevWatch"
import { GameProvider } from "./context/GameContext"

/*
  Ultra-light routing (no react-router)
  - /devwatch  → DevWatch stream UI
  - everything else → main app
*/

function App() {
  const page = useMemo(() => {
    const path = window.location.pathname || "/"
    if (path.toLowerCase().startsWith("/devwatch")) return "devwatch"
    return "home"
  }, [])

  return (
    <GameProvider>
      {page === "devwatch" ? <DevWatch /> : <HomePage />}
    </GameProvider>
  )
}

export default App