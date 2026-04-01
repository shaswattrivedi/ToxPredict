import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function Header({ title }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 pointer-events-none">
      
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity pointer-events-auto">
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">{title}</h1>
      </Link>
      
      <div className="flex items-center gap-6 pointer-events-auto">
        <Link
          to="/about"
          className="rounded-full bg-white/10 border border-white/20 px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-[1.05] hover:shadow-xl active:scale-[0.95]"
        >
          About Us
        </Link>
      </div>
    </div>
  )
}

Header.propTypes = {
  title: PropTypes.string,
}

Header.defaultProps = {
  title: 'ToxPredict',
}

export default Header
