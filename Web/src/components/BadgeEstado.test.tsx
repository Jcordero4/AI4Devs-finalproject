import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BadgeEstado from './BadgeEstado'

describe('BadgeEstado', () => {
  it.each([
    ['Activo', 'verde'],
    ['Pendiente', 'ambar'],
    ['Cancelado', 'rojo'],
    ['Inactivo', 'gris'],
  ])('%s -> tono %s', (estado, tono) => {
    render(<BadgeEstado estado={estado} />)
    expect(screen.getByText(estado)).toHaveClass(`nt-badge--${tono}`)
  })

  it('estado desconocido cae a gris', () => {
    render(<BadgeEstado estado="Otro" />)
    expect(screen.getByText('Otro')).toHaveClass('nt-badge--gris')
  })
})
