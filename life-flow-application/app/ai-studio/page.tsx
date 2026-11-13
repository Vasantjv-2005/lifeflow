import { AIStudioPage } from "@/components/decision-pages"
import { Suspense } from "react"

export default function AIStudioRoute() {
  return (
    <Suspense fallback={<div className="page-content"><div className="loading-list"><div /><div /><div /></div></div>}>
      <AIStudioPage />
    </Suspense>
  )
}
