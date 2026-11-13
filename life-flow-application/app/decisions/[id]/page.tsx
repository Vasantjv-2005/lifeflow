import { DecisionDetail } from "@/components/decision-detail"
import { Suspense } from "react"

export default function DecisionDetailRoute() {
  return (
    <Suspense fallback={<div className="page-content"><div className="decision-card-skeleton" /></div>}>
      <DecisionDetail />
    </Suspense>
  )
}
