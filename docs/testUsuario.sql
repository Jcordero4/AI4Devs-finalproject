-- =============================================================================
-- NutriTrack - Datos de prueba: cliente con historial de mediciones
-- Motor: MySQL 8      Base de datos: nutritrackdb
--
-- Requisito: haber aplicado las migraciones antes de ejecutar este script
--   dotnet ef database update --project Infrastructure --startup-project API
--
-- Uso:
--   mysql -u USUARIO -p nutritrackdb < docs/testUsuario.sql
--
-- Es re-ejecutable: borra primero el cliente de prueba (y su historial) y lo
-- vuelve a crear. Solo toca el cliente con Id 'TEST-001'.
--
-- Tablas (ver Infrastructure/Migrations): Clientes, Mediciones,
-- Tratamientos, PlanesNutricionales. El IMC es peso / (altura en m)^2.
-- =============================================================================

USE nutritrackdb;

START TRANSACTION;

-- ---------------------------------------------------------------------------
-- 0. Limpieza previa (hijos primero por las llaves foráneas)
-- ---------------------------------------------------------------------------
DELETE FROM Tratamientos        WHERE ClienteId = 'TEST-001';
DELETE FROM PlanesNutricionales WHERE ClienteId = 'TEST-001';
DELETE FROM Mediciones          WHERE ClienteId = 'TEST-001';
DELETE FROM Clientes            WHERE Id        = 'TEST-001';

-- ---------------------------------------------------------------------------
-- 1. Cliente
-- ---------------------------------------------------------------------------
INSERT INTO Clientes (Id, Nombre, FechaNacimiento, Genero, Altura, Telefono, Email, FechaIngreso, Activo)
VALUES ('TEST-001', 'Cliente Prueba Historial', '1990-05-20', 'M', 170, '+50688887777', 'test001@correo.com', '2026-06-01', 1);

-- ---------------------------------------------------------------------------
-- 2. Mediciones (una cada ~4 semanas; tendencia de bajada de peso y grasa)
--    Altura 170 cm  ->  IMC = Peso / 2.89
-- ---------------------------------------------------------------------------
INSERT INTO Mediciones (ClienteId, FechaMedicion, Peso, Grasa, MasaMuscular, Agua, GrasaVisceral, Imc) VALUES
('TEST-001', '2026-06-01', 85.00, 30.50, 35.20, 50.10, 11.00, 29.41),
('TEST-001', '2026-06-29', 83.20, 29.40, 35.60, 51.00, 10.50, 28.79),
('TEST-001', '2026-07-27', 81.50, 28.10, 36.00, 51.80, 10.00, 28.20),
('TEST-001', '2026-08-24', 79.80, 26.90, 36.40, 52.60,  9.00, 27.61),
('TEST-001', '2026-09-21', 78.40, 25.70, 36.90, 53.30,  8.50, 27.13),
('TEST-001', '2026-10-19', 77.00, 24.60, 37.30, 54.00,  8.00, 26.64);

-- ---------------------------------------------------------------------------
-- 3. Plan de nutrición por medición (porciones por grupo; 1 fila por medición)
-- ---------------------------------------------------------------------------
INSERT INTO PlanesNutricionales (ClienteId, FechaMedicion, Lacteo, Fruta, Vegetales, Harinas, Proteina, Grasa, Agua) VALUES
('TEST-001', '2026-06-01', 2, 3, 4, 6, 5, 4, 8),
('TEST-001', '2026-06-29', 2, 3, 4, 5, 5, 4, 8),
('TEST-001', '2026-07-27', 2, 3, 5, 5, 5, 3, 8),
('TEST-001', '2026-08-24', 2, 3, 5, 4, 6, 3, 9),
('TEST-001', '2026-09-21', 2, 2, 5, 4, 6, 3, 9),
('TEST-001', '2026-10-19', 2, 2, 6, 4, 6, 2, 10);

-- ---------------------------------------------------------------------------
-- 4. Tratamientos (0..N filas por medición; Secuencia empieza en 1)
-- ---------------------------------------------------------------------------
INSERT INTO Tratamientos (ClienteId, FechaMedicion, Secuencia, Producto, Dosis) VALUES
('TEST-001', '2026-06-01', 1, 'Proteína en polvo',  '1 scoop (30 g) después del entrenamiento'),
('TEST-001', '2026-06-01', 2, 'Multivitamínico',    '1 tableta con el desayuno'),
('TEST-001', '2026-06-29', 1, 'Proteína en polvo',  '1 scoop (30 g) después del entrenamiento'),
('TEST-001', '2026-06-29', 2, 'Multivitamínico',    '1 tableta con el desayuno'),
('TEST-001', '2026-07-27', 1, 'Proteína en polvo',  '1 scoop (30 g) después del entrenamiento'),
('TEST-001', '2026-07-27', 2, 'Omega 3',            '2 cápsulas con el almuerzo'),
('TEST-001', '2026-08-24', 1, 'Proteína en polvo',  '1 scoop (30 g) después del entrenamiento'),
('TEST-001', '2026-08-24', 2, 'Omega 3',            '2 cápsulas con el almuerzo'),
('TEST-001', '2026-09-21', 1, 'Omega 3',            '2 cápsulas con el almuerzo'),
('TEST-001', '2026-10-19', 1, 'Omega 3',            '2 cápsulas con el almuerzo');

COMMIT;

-- ---------------------------------------------------------------------------
-- Verificación rápida
-- ---------------------------------------------------------------------------
SELECT c.Id, c.Nombre, COUNT(m.FechaMedicion) AS Mediciones
FROM Clientes c
LEFT JOIN Mediciones m ON m.ClienteId = c.Id
WHERE c.Id = 'TEST-001'
GROUP BY c.Id, c.Nombre;
