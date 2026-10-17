import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDatosMedicion } from '../hooks/useDatosMedicion'
import { ApiError } from '../services/apiClient'
import { actualizarMedicion, crearMedicion } from '../services/medicionService'
import {
  CAMPOS_MEDICION,
  MEDICION_VACIA,
  PLAN_VACIO,
  TRATAMIENTO_INICIAL,
  aDatosMedicion,
  fechaHoy,
  formatearFecha,
  instantanea,
  validarBloques,
  type CampoMedicion,
  type CategoriaPlan,
  type FilaTratamiento,
  type ValoresMedicion,
  type ValoresPlan,
} from '../utils/medicionFormulario'
import { IconoFlechaIzquierda } from './Iconos'
import ModalConfirmacion from './ModalConfirmacion'
import ModalPlanNutricion from './ModalPlanNutricion'
import ModalTratamiento from './ModalTratamiento'

const INSTANTANEA_INICIAL = instantanea(MEDICION_VACIA, TRATAMIENTO_INICIAL, PLAN_VACIO)
const formatoNumero = new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const GENEROS: Record<string, string> = { M: 'Masculino', F: 'Femenino' }

type ModalActivo = 'tratamiento' | 'plan' | 'salir' | null

function mensajesDeError(e: unknown, actualizando: boolean): string[] {
  if (e instanceof ApiError) {
    if (e.status === 404) return ['El cliente no existe.']
    if (e.status === 409) {
      return [
        actualizando
          ? 'Solo se puede actualizar la medición del día de hoy.'
          : 'Ya existe una medición registrada hoy para este cliente. Solo puede modificarse durante la sesión de captura en que se creó.',
      ]
    }
    if (e.errores.length > 0) return e.errores
  }
  return ['No se pudo guardar la medición.']
}

export default function NuevaMedicion() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { cargando, cliente, historial, error, recargarHistorial } = useDatosMedicion(id)

  const [valores, setValores] = useState<ValoresMedicion>(MEDICION_VACIA)
  const [filas, setFilas] = useState<FilaTratamiento[]>(TRATAMIENTO_INICIAL)
  const [plan, setPlan] = useState<ValoresPlan>(PLAN_VACIO)
  const [base, setBase] = useState(INSTANTANEA_INICIAL)
  const [fechaGuardada, setFechaGuardada] = useState<string | null>(null)
  const [errores, setErrores] = useState<string[]>([])
  const [aviso, setAviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [modal, setModal] = useState<ModalActivo>(null)

  const yaGuardado = fechaGuardada !== null
  const haCambiado = instantanea(valores, filas, plan) !== base
  const hoy = fechaHoy()

  const guardar = async (): Promise<boolean> => {
    if (guardando) return false
    setAviso(null)
    const problemas = validarBloques(valores, filas, plan)
    if (problemas.length > 0) {
      setErrores(problemas)
      return false
    }
    setErrores([])
    setGuardando(true)
    try {
      const datos = aDatosMedicion(valores, filas, plan)
      if (yaGuardado) {
        await actualizarMedicion(id, fechaGuardada, datos)
      } else {
        const creada = await crearMedicion(id, datos)
        setFechaGuardada(creada.fechaMedicion.slice(0, 10))
      }
      setBase(instantanea(valores, filas, plan))
      setAviso('Medición guardada con éxito.')
      try {
        await recargarHistorial()
      } catch {
        setErrores(['La medición se guardó, pero no se pudo actualizar el histórico.'])
      }
      return true
    } catch (e) {
      setErrores(mensajesDeError(e, yaGuardado))
      return false
    } finally {
      setGuardando(false)
    }
  }

  const volver = () => {
    if (haCambiado) setModal('salir')
    else navigate('/clientes')
  }

  const guardarYSalir = async () => {
    if (await guardar()) navigate('/clientes', { state: { mensaje: 'Medición guardada con éxito' } })
    else setModal(null)
  }

  const cambiarValor = (campo: CampoMedicion, valor: string) => setValores((anterior) => ({ ...anterior, [campo]: valor }))
  const cambiarPlan = (categoria: CategoriaPlan, valor: string) => setPlan((anterior) => ({ ...anterior, [categoria]: valor }))

  if (cargando) {
    return (
      <div role="status" aria-live="polite">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Cargando...
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <>
        <div className="alert alert-danger" role="alert">{error ?? 'No se pudo cargar la información del cliente.'}</div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/clientes')}>
          <IconoFlechaIzquierda />Volver
        </button>
      </>
    )
  }

  return (
    <>
      <div className="nt-encabezado">
        <div>
          <h1 className="h3 mb-0">Nueva medición</h1>
          <p className="nt-encabezado__subtitulo">
            Registra la composición corporal, el tratamiento y el plan de nutrición. Los campos de la medición son obligatorios.
          </p>
        </div>
      </div>

      <section className="card nt-card--azul mb-3" aria-labelledby="titulo-datos-generales">
        <h2 id="titulo-datos-generales" className="card-header h6 mb-0">Datos Generales</h2>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label htmlFor="dg-nombre" className="form-label">Nombre</label>
              <input id="dg-nombre" className="form-control" value={cliente.nombre} disabled readOnly />
            </div>
            <div className="col-4 col-md-2">
              <label htmlFor="dg-edad" className="form-label">Edad</label>
              <input id="dg-edad" className="form-control" value={cliente.edad} disabled readOnly />
            </div>
            <div className="col-8 col-md-3">
              <label htmlFor="dg-genero" className="form-label">Género</label>
              <input id="dg-genero" className="form-control" value={GENEROS[cliente.genero] ?? cliente.genero} disabled readOnly />
            </div>
            <div className="col-12 col-md-2">
              <label htmlFor="dg-altura" className="form-label">Altura (cm)</label>
              <input id="dg-altura" className="form-control" value={cliente.altura} disabled readOnly />
            </div>
          </div>
        </div>
      </section>

      <section className="card nt-card--verde mb-3" aria-labelledby="titulo-nueva-medicion">
        <h2 id="titulo-nueva-medicion" className="card-header h6 mb-0">Nueva Medición</h2>
        <div className="card-body">
          <div className="table-responsive mb-4">
            <table className="table align-middle mb-0 nt-tabla-captura">
              <caption className="visually-hidden">Captura de la medición del día</caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  {CAMPOS_MEDICION.map(({ campo, etiqueta }) => (
                    <th key={campo} scope="col">{etiqueta} <span className="campo-obligatorio" aria-hidden="true">*</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input className="form-control" aria-label="Fecha" value={formatearFecha(hoy)} disabled readOnly />
                  </td>
                  {CAMPOS_MEDICION.map(({ campo, etiqueta }) => (
                    <td key={campo}>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        className="form-control"
                        aria-label={etiqueta}
                        required
                        aria-required
                        value={valores[campo]}
                        onChange={(e) => cambiarValor(campo, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="h6">Histórico de mediciones</h3>
          <div className="table-responsive nt-tabla-scroll">
            <table className="table table-sm table-hover align-middle mb-0">
              <caption className="visually-hidden">Histórico de mediciones, de la más reciente a la más antigua</caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  {CAMPOS_MEDICION.map(({ campo, etiqueta }) => (
                    <th key={campo} scope="col">{etiqueta}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((m) => (
                  <tr key={m.fechaMedicion}>
                    <td>{formatearFecha(m.fechaMedicion)}</td>
                    {CAMPOS_MEDICION.map(({ campo }) => (
                      <td key={campo}>{formatoNumero.format(m[campo])}</td>
                    ))}
                  </tr>
                ))}
                {historial.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted">Aún no hay mediciones registradas para este cliente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="card nt-card--naranja" aria-labelledby="titulo-acciones">
        <h2 id="titulo-acciones" className="card-header h6 mb-0">Acciones</h2>
        <div className="card-body">
          {aviso && <div className="alert alert-info" role="alert">{aviso}</div>}
          {errores.length > 0 && (
            <div className="alert alert-danger" role="alert">
              {errores.map((m) => <div key={m}>{m}</div>)}
            </div>
          )}
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={volver} disabled={guardando}>
              <IconoFlechaIzquierda />Volver
            </button>
            <button type="button" className="btn btn-success" onClick={() => void guardar()} disabled={guardando}>
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
            <button type="button" className="btn btn-accent" onClick={() => setModal('tratamiento')} disabled={guardando}>
              Tratamiento
            </button>
            <button type="button" className="btn btn-accent" onClick={() => setModal('plan')} disabled={guardando}>
              Plan de Nutrición
            </button>
          </div>
        </div>
      </section>

      {modal === 'tratamiento' && (
        <ModalTratamiento filas={filas} onCambiarFilas={setFilas} onCerrar={() => setModal(null)} />
      )}
      {modal === 'plan' && <ModalPlanNutricion valores={plan} onCambiar={cambiarPlan} onCerrar={() => setModal(null)} />}
      {modal === 'salir' && (
        <ModalConfirmacion
          titulo="Cambios sin guardar"
          mensaje="No se han guardado los cambios. ¿Desea guardarlos?"
          etiquetaAfirmativa="Guardar"
          etiquetaNegativa="Omitir"
          ocupado={guardando}
          onAfirmativa={() => void guardarYSalir()}
          onNegativa={() => navigate('/clientes')}
          onCancelar={() => setModal(null)}
        />
      )}
    </>
  )
}
