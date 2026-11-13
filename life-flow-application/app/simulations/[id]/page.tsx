import { SimulationCanvas } from "@/components/simulation-canvas"
import { Suspense } from "react"

export default function SimulationRoute() {
  return (
    <Suspense fallback={<div className="canvas-page"><div className="loading-list"><div /><div /><div /></div></div>}>
      <SimulationCanvas />
    </Suspense>
  )
}
