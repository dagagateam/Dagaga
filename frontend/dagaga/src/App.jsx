import { useState, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './layout/Navbar/Navbar'
import LoadingSpinner from './components/common/LoadingSpinner'


function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet key={location.pathname} />
        </Suspense>
      </AnimatePresence>
    </div>
  )
}

export default App
