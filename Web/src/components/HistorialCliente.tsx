import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GraficoPeso from './GraficoPeso'
import { IconoFlechaIzquierda, IconoLupa } from './Iconos'
import { useCliente } from '../hooks/useCliente'
import { ApiError } from '../services/apiClient'
import { listarMediciones, type MedicionResumen } from '../services/medicionService'
import { generarPdfHistorial } from '../utils/generarPdfHistorial'
import { fechaHoyIso, formatearFecha, formatearNumero, validarRango } from '../utils/historialProgreso'

type EstadoConsulta = 'inicial' | 'cargando' | 'listo' | 'error'

export default function HistorialCliente() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { cargando: cargandoCliente, cliente, error: errorCliente } = useCliente(id)

  const [fechaInforme] = useState(() => fechaHoyIso())
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [errorFiltro, setErrorFiltro] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoConsulta>('inicial')
  const [errorApi, setErrorApi] = useState<string | null>(null)
  const [mediciones, setMediciones] = useState<MedicionResumen[]>([])
  const [rangoAplicado, setRangoAplicado] = useState<{ desde: string; hasta: string } | null>(null)
  const [generando, setGenerando] = useState(false)
  const [errorPdf, setErrorPdf] = useState<string | null>(null)
  const consultaActual = useRef(0)

  const volver = () => navigate('/clientes')

  const filtrar = async () => {
    const mensaje = validarRango(desde, hasta)
    setErrorFiltro(mensaje)
    if (mensaje) return

    const consulta = ++consultaActual.current
    setEstado('cargando')
    setErrorApi(null)
    setErrorPdf(null)
    setMediciones([])
    setRangoAplicado(null)
    try {
      const resultado = await listarMediciones(id, desde, hasta)
      if (consulta !== consultaActual.current) return
      setMediciones(resultado)
      setRangoAplicado({ desde, hasta })
      setEstado('listo')
    } catch (e: unknown) {
      if (consulta !== consultaActual.current) return
      setErrorApi(e instanceof ApiError ? e.errores[0] ?? e.message : 'No se pudo cargar el historial.')
      setEstado('error')
    }
  }

  const imprimir = async () => {
    if (!rangoAplicado || mediciones.length === 0) return
    setGenerando(true)
    setErrorPdf(null)
    try {
      await generarPdfHistorial({
        clienteId: id,
        nombreCliente: cliente?.nombre ?? id,
        fechaInforme,
        desde: rangoAplicado.desde,
        hasta: rangoAplicado.hasta,
        mediciones,
      })
    } catch {
      setErrorPdf('No se pudo generar el PDF.')
    } finally {
      setGenerando(false)
    }
  }

  const encabezado = (
    <div className="nt-encabezado">
      <div>
        <h1 className="h3 mb-0">Historial de progreso</h1>
        <p className="nt-encabezado__subtitulo">Consulta la evolución de las mediciones del cliente en un rango de fechas.</p>
      </div>
    </div>
  )

  const botonVolver = (
    <button type="button" className="btn btn-outline-secondary" onClick={volver} disabled={generando}>
      <IconoFlechaIzquierda />Volver
    </button>
  )

  if (cargandoCliente) {
    return (
      <>
        {encabezado}
        <p role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando...
        </p>
      </>
    )
  }

  if (errorCliente || !cliente) {
    return (
      <>
        {encabezado}
        <div className="alert alert-danger" role="alert">{errorCliente ?? 'No se pudo cargar la información del cliente.'}</div>
        {botonVolver}
      </>
    )
  }

  const cargando = estado === 'cargando'
  const datosGrafico = mediciones.map((m) => ({ fecha: m.fechaMedicion, peso: m.peso }))
  const mensajeTabla =
    estado === 'inicial'
      ? 'Aplique un filtro para ver el historial.'
      : estado === 'listo'
        ? 'No hay mediciones en el rango seleccionado.'
        : 'Sin datos para mostrar.'

  return (
    <>
      {encabezado}

      <section className="card nt-card--azul mb-3" aria-labelledby="historial-filtros">
        <h2 id="historial-filtros" className="card-header h6 mb-0">Filtros</h2>
        <div className="card-body">
          {errorFiltro && <div className="alert alert-danger" role="alert">{errorFiltro}</div>}
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void filtrar()
            }}
          >
            <div className="row g-2 align-items-end">
              <div className="col-12 col-sm">
                <label htmlFor="historial-desde" className="form-label">Fecha Inicial</label>
                <input id="historial-desde" type="date" className="form-control" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="col-12 col-sm">
                <label htmlFor="historial-hasta" className="form-label">Fecha Final</label>
                <input id="historial-hasta" type="date" className="form-control" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
              <div className="col-12 col-sm-auto">
                <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
                  <IconoLupa />Filtrar
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="card nt-card--azul mb-3" aria-labelledby="historial-generales">
        <h2 id="historial-generales" className="card-header h6 mb-0">Datos Generales</h2>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="historial-nombre" className="form-label">Nombre</label>
              <input id="historial-nombre" className="form-control" value={cliente.nombre} readOnly />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="historial-fecha-informe" className="form-label">Fecha del informe</label>
              <input id="historial-fecha-informe" className="form-control" value={formatearFecha(fechaInforme)} readOnly />
            </div>
          </div>
        </div>
      </section>

      <section className="card nt-card--verde mb-3" aria-labelledby="historial-resultados">
        <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h2 id="historial-resultados" className="h6 mb-0">Historial</h2>
          {estado === 'listo' && mediciones.length > 0 && (
            <span className="nt-chip" role="status">
              {mediciones.length} {mediciones.length === 1 ? 'medición' : 'mediciones'}
            </span>
          )}
        </div>
        <div className="card-body">
          {errorApi && <div className="alert alert-danger" role="alert">{errorApi}</div>}
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <caption className="visually-hidden">Mediciones del cliente en el rango seleccionado</caption>
                  <thead>
                    <tr>
                      <th scope="col">Fecha</th>
                      <th scope="col">Peso</th>
                      <th scope="col">M. Muscular</th>
                      <th scope="col">% Grasa</th>
                      <th scope="col">% Agua</th>
                      <th scope="col">IMC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted" role="status">
                          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                          Cargando...
                        </td>
                      </tr>
                    )}
                    {!cargando && mediciones.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">{mensajeTabla}</td>
                      </tr>
                    )}
                    {!cargando &&
                      mediciones.map((m) => (
                        <tr key={m.fechaMedicion}>
                          <td>{formatearFecha(m.fechaMedicion)}</td>
                          <td>{formatearNumero(m.peso)}</td>
                          <td>{formatearNumero(m.masaMuscular)}</td>
                          <td>{formatearNumero(m.grasa)}</td>
                          <td>{formatearNumero(m.agua)}</td>
                          <td>{formatearNumero(m.imc)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <GraficoPeso datos={datosGrafico} />
            </div>
          </div>
        </div>
      </section>

      <section className="card nt-card--naranja" aria-labelledby="historial-acciones">
        <h2 id="historial-acciones" className="card-header h6 mb-0">Acciones</h2>
        <div className="card-body">
          {errorPdf && <div className="alert alert-danger" role="alert">{errorPdf}</div>}
          <div className="d-flex flex-wrap gap-2">
            {botonVolver}
            <button type="button" className="btn btn-accent" onClick={() => void imprimir()} disabled={mediciones.length === 0 || generando}>
              {generando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Generando...
                </>
              ) : (
                'Imprimir a PDF'
              )}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
