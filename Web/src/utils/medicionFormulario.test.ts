import { describe, expect, it } from 'vitest'
import {
  MEDICION_VACIA,
  PLAN_VACIO,
  aDatosMedicion,
  esEnteroNoNegativo,
  esPositivo,
  formatearFecha,
  validarBloques,
  type ValoresMedicion,
} from './medicionFormulario'

const medicionValida: ValoresMedicion = {
  peso: '70',
  grasa: '20',
  masaMuscular: '30',
  agua: '55',
  grasaVisceral: '5',
  imc: '22',
}
const filas = [{ clave: 1, producto: ' Proteína ', dosis: ' 1 scoop ' }]

describe('esPositivo', () => {
  it.each([['1', true], ['0.5', true], ['0', false], ['-3', false], ['', false], ['abc', false]])(
    '%j -> %s',
    (valor, esperado) => expect(esPositivo(valor)).toBe(esperado),
  )
})

describe('esEnteroNoNegativo', () => {
  it.each([['0', true], ['12', true], ['1.5', false], ['-1', false], ['', false]])(
    '%j -> %s',
    (valor, esperado) => expect(esEnteroNoNegativo(valor)).toBe(esperado),
  )
})

describe('validarBloques', () => {
  it('sin errores con datos completos', () => {
    expect(validarBloques(medicionValida, filas, PLAN_VACIO)).toEqual([])
  })

  it('reporta los tres bloques incompletos', () => {
    const mensajes = validarBloques(MEDICION_VACIA, [{ clave: 1, producto: '', dosis: '' }], { ...PLAN_VACIO, fruta: '-1' })
    expect(mensajes).toHaveLength(3)
    expect(mensajes[0]).toContain('Peso')
  })
})

describe('aDatosMedicion', () => {
  it('convierte a números y recorta textos', () => {
    const datos = aDatosMedicion(medicionValida, filas, { ...PLAN_VACIO, lacteo: '2' })
    expect(datos.peso).toBe(70)
    expect(datos.tratamientos).toEqual([{ producto: 'Proteína', dosis: '1 scoop' }])
    expect(datos.plan.lacteo).toBe(2)
  })
})

describe('formatearFecha', () => {
  it('yyyy-MM-dd a dd/MM/yyyy', () => {
    expect(formatearFecha('2026-11-05')).toBe('05/11/2026')
    expect(formatearFecha('2026-11-05T10:30:00')).toBe('05/11/2026')
  })
})
