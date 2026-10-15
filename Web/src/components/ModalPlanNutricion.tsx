import { CATEGORIAS_PLAN, esEnteroNoNegativo, type CategoriaPlan, type ValoresPlan } from '../utils/medicionFormulario'
import ModalBase from './ModalBase'

interface ModalPlanNutricionProps {
  valores: ValoresPlan
  onCambiar: (categoria: CategoriaPlan, valor: string) => void
  onCerrar: () => void
}

export default function ModalPlanNutricion({ valores, onCambiar, onCerrar }: ModalPlanNutricionProps) {
  return (
    <ModalBase
      titulo="Plan de Nutrición"
      onSolicitarCierre={onCerrar}
      pie={<button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cerrar</button>}
    >
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <caption className="visually-hidden">Porciones del plan de nutrición por categoría</caption>
          <tbody>
            {CATEGORIAS_PLAN.map(({ categoria, etiqueta }) => {
              const invalido = !esEnteroNoNegativo(valores[categoria])
              return (
                <tr key={categoria}>
                  <th scope="row" className="fw-normal">{etiqueta}</th>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className={`form-control${invalido ? ' is-invalid' : ''}`}
                      aria-label={`Porciones de ${etiqueta}`}
                      aria-invalid={invalido}
                      value={valores[categoria]}
                      onChange={(e) => onCambiar(categoria, e.target.value)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ModalBase>
  )
}
