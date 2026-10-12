import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

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
        <div className="nt-sidebar__marca">NutriTrack</div>
        <nav aria-label="Navegación principal" className="nt-sidebar__nav">
          <ul className="nt-nav-lista">
            <li>
              <NavLink to="/clientes" className="nt-nav-item" onClick={cerrarMenu}>
                <span className="nt-nav-item__icono" aria-hidden="true">👥</span>
                Clientes
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="nt-sidebar__pie">
          <button type="button" className="nt-nav-item nt-nav-item--deshabilitado" disabled>
            <span className="nt-nav-item__icono" aria-hidden="true">⚙</span>
            Configuración
          </button>
        </div>
      </aside>

      {menuAbierto && <div className="nt-backdrop" aria-hidden="true" onClick={cerrarMenu} />}

      <div className="nt-main">
        <header className="nt-topbar">
          <button
            ref={botonMenuRef}
            type="button"
            className="nt-topbar__menu btn btn-outline-secondary d-lg-none"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            aria-controls="nt-sidebar"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div className="nt-topbar__buscador">
            <span className="nt-topbar__lupa" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar..."
              aria-label="Búsqueda global (no disponible)"
              disabled
            />
          </div>
          <div className="nt-topbar__usuario">
            <span className="nt-avatar" aria-hidden="true">U</span>
            <span className="d-none d-sm-inline">Usuario</span>
          </div>
        </header>
        <main className="nt-contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
