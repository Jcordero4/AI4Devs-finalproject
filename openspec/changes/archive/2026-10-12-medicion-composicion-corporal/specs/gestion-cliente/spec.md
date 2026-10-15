## MODIFIED Requirements

### Requirement: Selección de fila y navegación desde el listado
El sistema SHALL permitir seleccionar una sola fila a la vez, marcando su radio button y resaltándola, y SHALL ofrecer los botones "Nuevo", "Editar" y "Nueva Medición".

#### Scenario: Seleccionar fila
- **WHEN** el usuario hace clic en cualquier parte de una fila
- **THEN** se marca el radio button de esa fila, se resalta con color y se deselecciona la anterior

#### Scenario: Editar sin selección
- **WHEN** ningún cliente está seleccionado y el usuario presiona "Editar"
- **THEN** se muestra "Debe seleccionar el cliente a editar." y no se navega

#### Scenario: Editar con selección
- **WHEN** hay un cliente seleccionado y el usuario presiona "Editar"
- **THEN** se navega a la pantalla de Edición con los datos de ese cliente cargados

#### Scenario: Nuevo
- **WHEN** el usuario presiona "Nuevo"
- **THEN** se navega a la pantalla de Nuevo con todos los campos vacíos

#### Scenario: Nueva Medición sin selección
- **GIVEN** ningún cliente está seleccionado
- **WHEN** el usuario presiona "Nueva Medición"
- **THEN** se muestra "Debe seleccionar el cliente al que desea registrar la medición." y no se navega

#### Scenario: Nueva Medición con selección
- **GIVEN** hay un cliente seleccionado
- **WHEN** el usuario presiona "Nueva Medición"
- **THEN** se navega a la pantalla de Nueva Medición de ese cliente
