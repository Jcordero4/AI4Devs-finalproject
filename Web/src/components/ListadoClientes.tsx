import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / resultado.tamanoPagina)) : 1

  return (
    <>
      <div className="nt-encabezado">
        <div>
          <h1 className="h3 mb-0">Listado de clientes</h1>
          <p className="nt-encabezado__subtitulo">Consulta, filtra y administra los clientes registrados.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/clientes/nuevo')}>
          <span aria-hidden="true">+ </span>Nuevo
        </button>
      </div>
      {aviso && <div className="alert alert-info" role="alert">{aviso}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <section className="card mb-3">
        <div className="card-header">Filtros</div>
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
              <button type="button" className="btn btn-primary" onClick={filtrar}>Filtrar</button>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">Clientes</div>
        <div className="card-body">
          <div className="mb-2 d-flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={editar}>Editar</button>
          </div>
          <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th aria-label="Selección" />
                <th>Id</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
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
                  <td>{c.id}</td>
                  <td>{c.nombre}</td>
                  <td>{c.email}</td>
                  <td><input type="checkbox" checked={c.activo} disabled readOnly aria-label="Activo" /></td>
                </tr>
              ))}
              {resultado?.items.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted">Sin resultados.</td></tr>
              )}
            </tbody>
          </table>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <span>Página {pagina} de {totalPaginas} ({resultado?.total ?? 0} clientes)</span>
            <div className="btn-group">
              <button type="button" className="btn btn-outline-secondary" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
              <button type="button" className="btn btn-outline-secondary" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
