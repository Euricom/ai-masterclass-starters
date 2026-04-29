import { NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Animals } from './pages/Animals';
import './styles.css';

export function App() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <nav className="mb-6 flex gap-4 text-sm">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'font-bold' : '')}>
          Home
        </NavLink>
        <NavLink to="/animals" className={({ isActive }) => (isActive ? 'font-bold' : '')}>
          Animals
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/animals" element={<Animals />} />
      </Routes>
    </div>
  );
}
