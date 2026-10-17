import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../services/apiClient'
import { IconoFlechaIzquierda } from './Iconos'
import { crearCliente, editarCliente, obtenerCliente, type DatosCliente } from '../services/clienteService'

const MENSAJE_SALIR = 'Está seguro que desea salir de la pantalla, se perderán los datos si no los guarda primero.'

const vacio: DatosCliente = { nombre: '', fechaNacimiento: '', genero: '', altura: null, telefono: '', email: '' }

const PATRON_TELEFONO = /^\+?\d{7,15}$/
const MENSAJE_TELEFONO = "El teléfono solo admite dígitos y un '+' inicial (7 a 15 caracteres)."

// Conserva solo dígitos y un '+' en la primera posición.
const soloTelefono = (valor: string) => valor.replace(/(?!^\+)\D/g, '')

const hoy = () => new Date().toISOString().slice(0, 10)

function calcularEdad(fechaNacimiento: string): number | null {
  if (!fechaNacimiento) return null
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`)
  const ahora = new Date()
  let edad = ahora.getFullYear() - nacimiento.getFullYear()
  const cumple = new Date(ahora.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())
  if (ahora < cumple) edad--
  return Math.max(edad, 0)
}

const Obligatorio = () => <span className="campo-obligatorio" aria-hidden="true">*</span>

export default function FormularioCliente() {
  const { id: idRuta } = useParams()
  const esEdicion = idRuta !== undefined
  const navigate = useNavigate()
  const [id, setId] = useState(idRuta ?? '')
  const [datos, setDatos] = useState<DatosCliente>(vacio)
  const [original, setOriginal] = useState<{ id: string; datos: DatosCliente }>({ id: '', datos: vacio })
  const [errores, setErrores] = useState<string[]>([])
  const [cargando, setCargando] = useState(esEdicion)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!idRuta) return
    obtenerCliente(idRuta)
      .then((c) => {
        const cargado: DatosCliente = {
          nombre: c.nombre,
          fechaNacimiento: c.fechaNacimiento,
          genero: c.genero,
          altura: c.altura,
          telefono: c.telefono ?? '',
          email: c.email ?? '',
        }
        setDatos(cargado)
        setOriginal({ id: c.id, datos: cargado })
      })
      .catch(() => setErrores(['No se pudo cargar el cliente.']))
      .finally(() => setCargando(false))
  }, [idRuta])

  const modificado = id !== original.id || JSON.stringify(datos) !== JSON.stringify(original.datos)
  const cambiar = <K extends keyof DatosCliente>(campo: K, valor: DatosCliente[K]) =>
    setDatos((anterior) => ({ ...anterior, [campo]: valor }))

  const volver = () => {
    if (modificado && !window.confirm(MENSAJE_SALIR)) return
    navigate('/clientes')
  }

  const guardar = async () => {
    const faltantes =
      (!esEdicion && !id.trim()) || !datos.nombre.trim() || !datos.fechaNacimiento || !datos.genero || !datos.altura || datos.altura <= 0
    if (faltantes) {
      setErrores(['Faltan datos obligatorios por completar (Id, Nombre, Fecha de Nacimiento, Género y Altura).'])
      return
    }
    const telefono = datos.telefono.trim()
    if (telefono !== '' && !PATRON_TELEFONO.test(telefono)) {
      setErrores([MENSAJE_TELEFONO])
      return
    }
    if (enviando) return
    try {
      setErrores([])
      setEnviando(true)
      if (idRuta) await editarCliente(idRuta, datos)
      else await crearCliente(id, datos)
      navigate('/clientes', { state: { mensaje: 'Cliente guardado con éxito' } })
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setErrores(['El Id ya está registrado.'])
      else if (e instanceof ApiError && e.errores.length > 0) setErrores(e.errores)
      else setErrores(['No se pudo guardar el cliente.'])
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div role="status" aria-live="polite">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Cargando...
      </div>
    )
  }

  const edad = calcularEdad(datos.fechaNacimiento)

  return (
    <>
      <div className="nt-encabezado">
        <div>
          <h1 className="h3 mb-0">{esEdicion ? 'Editar cliente' : 'Nuevo cliente'}</h1>
          <p className="nt-encabezado__subtitulo">
            Los campos marcados con <span className="campo-obligatorio" aria-hidden="true">*</span> son obligatorios.
          </p>
        </div>
      </div>
      {errores.length > 0 && (
        <div className="alert alert-danger" role="alert">
          {errores.map((m) => <div key={m}>{m}</div>)}
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void guardar()
        }}
      >
        <section className="card nt-card--azul mb-3" aria-labelledby="titulo-datos-cliente">
          <h2 id="titulo-datos-cliente" className="card-header h6 mb-0">Datos del cliente</h2>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label htmlFor="id" className="form-label">Id {!esEdicion && <Obligatorio />}</label>
                <input id="id" className="form-control" maxLength={15} value={id} disabled={esEdicion} required={!esEdicion} aria-required={!esEdicion} onChange={(e) => setId(e.target.value)} />
              </div>
              <div className="col-12 col-md-8">
                <label htmlFor="nombre" className="form-label">Nombre <Obligatorio /></label>
                <input id="nombre" className="form-control" maxLength={50} value={datos.nombre} required aria-required onChange={(e) => cambiar('nombre', e.target.value)} />
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento <Obligatorio /></label>
                <input id="fechaNacimiento" type="date" className="form-control" max={hoy()} value={datos.fechaNacimiento} required aria-required onChange={(e) => cambiar('fechaNacimiento', e.target.value)} />
              </div>
              <div className="col-6 col-sm-3 col-md-2">
                <label htmlFor="edad" className="form-label">Edad</label>
                <input id="edad" className="form-control" value={edad ?? ''} disabled readOnly />
              </div>
              <div className="col-6 col-sm-3 col-md-3">
                <label htmlFor="genero" className="form-label">Género <Obligatorio /></label>
                <select id="genero" className="form-select" value={datos.genero} required aria-required onChange={(e) => cambiar('genero', e.target.value)}>
                  <option value="" />
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <label htmlFor="altura" className="form-label">Altura (cm) <Obligatorio /></label>
                <input id="altura" type="number" min={1} className="form-control" value={datos.altura ?? ''} required aria-required onChange={(e) => cambiar('altura', e.target.value === '' ? null : Number(e.target.value))} />
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input id="telefono" type="tel" inputMode="tel" className="form-control" maxLength={15} value={datos.telefono} onChange={(e) => cambiar('telefono', soloTelefono(e.target.value))} />
              </div>
              <div className="col-12 col-md-8">
                <label htmlFor="email" className="form-label">Email</label>
                <input id="email" className="form-control" maxLength={320} value={datos.email} onChange={(e) => cambiar('email', e.target.value)} />
              </div>
              <div className="col-12 col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input id="activo" type="checkbox" className="form-check-input" checked disabled readOnly />
                  <label htmlFor="activo" className="form-check-label">Activo</label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={volver} disabled={enviando}>
            <IconoFlechaIzquierda />Volver
          </button>
          <button type="submit" className="btn btn-success" disabled={enviando}>
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </>
  )
}
