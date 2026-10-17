import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { IconoAjustes, IconoMenu, IconoUsuarios } from './Iconos'

export default function LayoutApp() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenuRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuAbierto) return
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuAbierto(false)
        botonMenuRef.current?.focus()
      }
    }
    document.addEventListener('keydown', alPresionarTecla)
    return () => document.removeEventListener('keydown', alPresionarTecla)
  }, [menuAbierto])

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <div className="nt-app">
      <aside id="nt-sidebar" className={`nt-sidebar${menuAbierto ? ' nt-sidebar--abierto' : ''}`}>
        <div className="nt-sidebar__marca">
          <img
            className="nt-sidebar__logo"
            src="/logo-nutritrack.png"
            alt="NutriTrack — Nutrition Software"
            width={700}
            height={200}
          />
        </div>
        <nav aria-label="Navegación principal" className="nt-sidebar__nav">
          <ul className="nt-nav-lista">
            <li>
              <NavLink to="/clientes" className="nt-nav-item" onClick={cerrarMenu}>
                <IconoUsuarios />
                Clientes
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="nt-sidebar__pie">
          <button type="button" className="nt-nav-item nt-nav-item--deshabilitado" disabled>
            <IconoAjustes />
            Configuración
            <span className="nt-nav-item__nota">Próximamente</span>
          </button>
        </div>
      </aside>

      {menuAbierto && <div className="nt-backdrop" aria-hidden="true" onClick={cerrarMenu} />}

      <div className="nt-main">
        <header className="nt-topbar d-lg-none">
          <button
            ref={botonMenuRef}
            type="button"
            className="nt-topbar__menu btn btn-outline-secondary"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            aria-controls="nt-sidebar"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <IconoMenu />
          </button>
          <span className="nt-topbar__titulo">NutriTrack</span>
        </header>
        <main className="nt-contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
