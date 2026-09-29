import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import { Logo } from '../components/ui'
import Lottie from '../components/Lottie'

export default function NotFound() {
  return (
    <div className="hero-surface grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center"><Logo size="lg" /></div>
        <Lottie
          src="/animations/search.json"
          className="mx-auto mt-2 aspect-square w-44"
          fallback={
            <span className="mt-8 inline-grid h-14 w-14 place-items-center rounded-2xl bg-white text-ink-muted shadow-card">
              <Compass size={24} aria-hidden />
            </span>
          }
        />
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          The prototype has three workspaces — student, teacher and administrator. Pick one to continue.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/" className="btn btn-secondary btn-md"><ArrowLeft size={15} /> Home</Link>
          <Link to="/login" className="btn btn-primary btn-md">Choose a role</Link>
        </div>
      </div>
    </div>
  )
}
