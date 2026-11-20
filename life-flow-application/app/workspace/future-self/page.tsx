"use client"

import { DashboardLayout } from "@/components/lifeflow-dashboard"
import { FutureSelfInterviewExperience } from "@/components/future-self-interview"
import { Suspense } from "react"

export default function FutureSelfRoute() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="page-content"><div className="loading-list"><div /><div /><div /></div></div>}>
        <FutureSelfInterviewExperience />
      </Suspense>
    </DashboardLayout>
  )
}
