import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import FormularioCliente from './components/FormularioCliente'
import HistorialCliente from './components/HistorialCliente'
import LayoutApp from './components/LayoutApp'
import ListadoClientes from './components/ListadoClientes'
import NuevaMedicion from './components/NuevaMedicion'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutApp />}>
          <Route path="/clientes" element={<ListadoClientes />} />
          <Route path="/clientes/nuevo" element={<FormularioCliente />} />
          <Route path="/clientes/:id/editar" element={<FormularioCliente />} />
          <Route path="/clientes/:id/mediciones/nueva" element={<NuevaMedicion />} />
          <Route path="/clientes/:id/historial" element={<HistorialCliente />} />
        </Route>
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
