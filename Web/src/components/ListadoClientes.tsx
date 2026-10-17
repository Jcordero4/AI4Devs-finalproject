import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BadgeEstado from './BadgeEstado'
import { IconoActividad, IconoBandeja, IconoEditar, IconoLupa, IconoMas } from './Iconos'
import { listarClientes, type ClienteListado, type ResultadoPaginado } from '../services/clienteService'

export default function ListadoClientes() {
  const navigate = useNavigate()
  const location = useLocation()
  const [nombre, setNombre] = useState('')
  const [id, setId] = useState('')
  const [aplicados, setAplicados] = useState({ nombre: '', id: '' })
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState<ResultadoPaginado<ClienteListado> | null>(null)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>((location.state as { mensaje?: string } | null)?.mensaje ?? null)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try {
      setError(null)
      setResultado(await listarClientes({ ...aplicados, pagina }))
      setSeleccionado(null)
    } catch {
      setError('No se pudo cargar el listado de clientes.')
    }
  }, [aplicados, pagina])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const filtrar = () => {
    setAviso(null)
    setPagina(1)
    setAplicados({ nombre, id })
  }

  const editar = () => {
    if (!seleccionado) {
      setAviso('Debe seleccionar el cliente a editar.')
      return
    }
    navigate(`/clientes/${encodeURIComponent(seleccionado)}/editar`)
  }

  const nuevaMedicion = () => {
    if (!seleccionado) {
      setAviso('Debe seleccionar el cliente al que desea registrar la medición.')
      return
    }
    navigate(`/clientes/${encodeURIComponent(seleccionado)}/mediciones/nueva`)
  }

  const hayFiltros = aplicados.nombre !== '' || aplicados.id !== ''
  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / resultado.tamanoPagina)) : 1

  return (
    <>
      <div className="nt-encabezado">
        <div>
          <h1 className="h3 mb-0">Listado de clientes</h1>
          <p className="nt-encabezado__subtitulo">Consulta, filtra y administra los clientes registrados.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/clientes/nuevo')}>
          <IconoMas />Nuevo
        </button>
      </div>
      {aviso && <div className="alert alert-info" role="alert">{aviso}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <section className="card nt-card--azul mb-3">
        <h2 className="card-header h6 mb-0">Buscar clientes</h2>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-sm">
              <label htmlFor="filtro-nombre" className="form-label">Nombre</label>
              <input id="filtro-nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="col-12 col-sm">
              <label htmlFor="filtro-id" className="form-label">Id</label>
              <input id="filtro-id" className="form-control" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-primary" onClick={filtrar}><IconoLupa />Filtrar</button>
            </div>
          </div>
        </div>
      </section>

      <section className="card nt-card--azul">
        <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h2 className="h6 mb-0">Clientes</h2>
          {resultado && (
            <span className="nt-chip" role="status">
              {resultado.total} {resultado.total === 1 ? 'resultado' : 'resultados'}
            </span>
          )}
        </div>
        <div className="card-body">
          <div className="mb-2 d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-primary" onClick={editar}><IconoEditar />Editar</button>
            <button type="button" className="btn btn-accent" onClick={nuevaMedicion}><IconoActividad />Nueva Medición</button>
          </div>
          <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th aria-label="Selección" />
                <th>Id</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {!resultado && !error && (
                <tr>
                  <td colSpan={6} className="text-center text-muted" role="status">
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    Cargando...
                  </td>
                </tr>
              )}
              {resultado?.items.map((c) => (
                <tr
                  key={c.id}
                  className={`nt-fila-seleccionable${seleccionado === c.id ? ' table-primary' : ''}`}
                  onClick={() => {
                    setSeleccionado(c.id)
                    setAviso(null)
                  }}
                >
                  <td>
                    <input type="radio" name="cliente" aria-label={`Seleccionar ${c.nombre}`} checked={seleccionado === c.id} onChange={() => setSeleccionado(c.id)} />
                  </td>
                  <td className="nt-celda-id">{c.id}</td>
                  <td>{c.nombre}</td>
                  <td>{c.telefono}</td>
                  <td>{c.email}</td>
                  <td><BadgeEstado estado={c.activo ? 'Activo' : 'Inactivo'} /></td>
                </tr>
              ))}
              {resultado?.items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="nt-vacio">
                      <span className="nt-vacio__icono"><IconoBandeja /></span>
                      <p className="nt-vacio__titulo">
                        {hayFiltros ? 'No se encontraron clientes con esos filtros.' : 'Aún no hay clientes registrados.'}
                      </p>
                      <p className="nt-vacio__texto">
                        {hayFiltros
                          ? 'Revisa el nombre o el Id, o deja los campos vacíos y pulsa Filtrar para ver todos los clientes.'
                          : 'Usa el botón Nuevo para registrar al primer cliente.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <span>Página {pagina} de {totalPaginas} ({resultado?.total ?? 0} clientes)</span>
            <div className="btn-group">
              <button type="button" className="btn btn-outline-primary" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
              <button type="button" className="btn btn-outline-primary" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
