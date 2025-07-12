"use client"

import dynamic from 'next/dynamic'

const AppLayout = dynamic(() => import('@/components/layout/app-layout'), { ssr: false })

export default AppLayout
