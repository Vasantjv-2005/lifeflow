"use client"

import { DashboardLayout } from "@/components/lifeflow-dashboard"
import { ResumeTimeMachine } from "@/components/resume-time-machine/resume-time-machine"
import { Suspense } from "react"

export default function ResumeTimeMachinePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="page-content"><div className="loading-list"><div /><div /><div /></div></div>}>
        <ResumeTimeMachine />
      </Suspense>
    </DashboardLayout>
  )
}
