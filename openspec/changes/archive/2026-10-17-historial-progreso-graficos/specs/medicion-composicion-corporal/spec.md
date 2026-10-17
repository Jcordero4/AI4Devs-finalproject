## MODIFIED Requirements

### Requirement: Histórico de mediciones del cliente
El sistema SHALL mostrar el histórico de mediciones del cliente con las mismas columnas de captura (Fecha, Peso, % Grasa, M. Muscular, % Agua, G. Visceral, IMC), ordenado de la fecha más reciente a la más antigua, cargando todos los registros pero mostrando 10 visibles, con scroll para el resto y encabezado fijo durante el scroll. La consulta `GET /api/clientes/{clienteId}/mediciones` SHALL admitir los parámetros opcionales `desde` y `hasta` (`yyyy-MM-dd`) para limitar el resultado a un rango de fechas, ambos extremos incluidos; sin parámetros devuelve todas las mediciones.

#### Scenario: Histórico con más de 10 registros
- **GIVEN** el cliente tiene más de 10 mediciones
- **WHEN** se abre la pantalla de Nueva Medición
- **THEN** la tabla de histórico lista todas ordenadas de la más reciente a la más antigua, muestra 10 filas visibles, permite scroll para ver el resto y mantiene el encabezado fijo

#### Scenario: Cliente sin mediciones
- **GIVEN** el cliente no tiene mediciones previas
- **WHEN** se abre la pantalla de Nueva Medición
- **THEN** la tabla de histórico se muestra vacía con un mensaje de sin resultados

#### Scenario: Consulta del detalle
- **GIVEN** existe una medición del cliente en una fecha dada
- **WHEN** se consulta `GET /api/clientes/{clienteId}/mediciones/{fecha}`
- **THEN** la API responde 200 con la medición, sus tratamientos y su plan nutricional; si no existe, responde 404

#### Scenario: Consulta con rango de fechas
- **GIVEN** el cliente tiene mediciones dentro y fuera de un rango
- **WHEN** se consulta `GET /api/clientes/{clienteId}/mediciones?desde=2026-10-01&hasta=2026-10-31`
- **THEN** la API responde 200 solo con las mediciones cuya fecha está entre `desde` y `hasta` inclusive, ordenadas de la más reciente a la más antigua

#### Scenario: Rango con un solo extremo
- **WHEN** se consulta con solo `desde` o solo `hasta`
- **THEN** la API responde 200 filtrando únicamente por el extremo indicado

#### Scenario: Rango sin mediciones
- **GIVEN** el cliente no tiene mediciones dentro del rango
- **WHEN** se consulta con `desde` y `hasta`
- **THEN** la API responde 200 con un arreglo vacío

#### Scenario: Rango invertido
- **WHEN** se consulta con `desde` posterior a `hasta`
- **THEN** la API responde 400 con el error de rango de fechas inválido y no devuelve datos

#### Scenario: Cliente inexistente con rango
- **WHEN** se consulta el histórico con o sin rango de un cliente que no existe
- **THEN** la API responde 404
