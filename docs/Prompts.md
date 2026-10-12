Este archivo almacena los prompts utilizados en el desarrollo de la App y documentación.

### Para crear diagramas:

Tome el archivo docs/NutriTrack_Project_Plan_ESP.docx lea el documento verifique la sección de Arquitectura, ayudame a
  desarrollar un diagrama de la arquitectura, crea un Diagrama C4 básico (Mermaid), crea un Diagrama de secuencia (Mermaid).
  
### Para actualizar el Indice del ReadMe
Actualiza el archivo README.md creando la sección de indice, introducelo luego del título Índice, éste debe estár basado en
  el mismo archivo Readme tomando cada punto.
  
### Crear el documento PRD.md
Toma el archivo @docs/NutriTrack_Project_Plan_ESP.docx a partir de los US agrega al documento @docs/PRD.md la definicion
  del producto, separandolo por Epics y agrupando en cada uno de estos los US correspondientes
  
### Creacion del Backlog
Se utiliza la skill de decompose-prd para generar el archivo de backlog, esta skill es tomada de las clases brindadas por L1dr.

### Creacion de archivo de US
Tome el @docs/backlog-NutriTrack.md cree una carpeta nueva llamada docs/UserStories, en esta agregue un archivo nuevo por cada
  US del @docs/backlog-NutriTrack.md no tome en cuenta los US del primer Epic, el nombre de cada archivo es el agregado en el
  archivo de backlog y debe agregar cada descripcion del US.
  
La idea es tomar cada use story e introducir en este una descripción más detallade como por ejemplo tablas y campos
Definicion de UI y acciones de ésta para luego solicitar a claude que ayude a mejorar el US y con esto depurar para  luego ejecutar cada US.

### Mejora de un US que fue modificado a mano
Toma el archivo @"docs/UserStories/US-004 - Registrar un nuevo cliente.md" y ayudame a mejorar la definición del US,
  crea un nuevo archivo en docs/US-004-CRUD-Cliente.md
  
### Creacion de SKILL para la mejora de US
Ayudame a crear una Skill que ejecute la acción anterior de mejorar un US, el usuario proporcionará el nombre del
  archivo, este puede ser ubicacion y nombre, si solo se proporciona el nombre buscar el archivo en la carpeta de
  docs/UserStories/ tomar en cuenta el formato del US y agregar siempre Criterios de Aceptacion del tipo
  GIVEN/WHEN/THEN, al terminar consultar al usuario el nombre del nuevo archivo a crear, este debe ser un archivo
  Markdown(.md) y guardarse siempre en la carpeta docs/. El nombre para la Skill es improve-us.
  
### Creación del Diagrama Entidad Relacion
Basandose en el archivo de @docs/PRD.md pero principalmente en los archivos de US-004, US-008 y US-009 de la capeta docs/ 
creame el diagrama entidad relacion y adjuntalo en el archivo de Readme.md en la sección de Arquitectura como punto 4.8 Diagrama de Base de datos

### Creación de URL de los Controllers del API.
Basandose en el archivo @docs/PRD.md y en los archivos en docs\ US-004, US-008 y US-009, creame un nuevo archivo "docs\API-Controlles.md" donde se muestren para el API los nombres de los Controlles las rutas de estos y el método.

### Openspec
Antes de que instalara el Openspec ya habia creado el archivo Claude.md, que lo cree con el comando init, luego manualmente le hice ajustes en especial para la fuente de verdad. Luego apliqué un cambio para que se utilizara el archivo Agents.md como estandar, para esto cree el archivo y le copie todo lo del archivo Claude.md, eliminé el archivo Claude.md y cree un link llamado Claude.md que hace referencia al Agents.md, esto para que si el proyecto se ejecuta en otra IA pueda leer el contexto sin problema.
Luego de esto realizé la instalacion del Openspec y le solicité con la misma IA (claude code) que me indicara como hacer para que el "spec" tambien fuera fuente de verdad y la IA me ayudó a hacer los ajustes del Agents.md y del config.yaml de configuración del Openspec.

### Creacion subagente para frontEnd
Ayudame a crear un agente de implementación y mejora de la UI/UX donde actue como un experto en FrontEnd Engineer especializado en React JS, Typescript y UI/UX moderno con las mejores practicas. El rol debe ser ayudarme a mejorar, implementar componentes UI manteniendo un codigo limpio y accesible y con buen rendimiento, utilizando CSS, HTML y el framework Bootstrap 5.3.8. El agente debe ejecutarse de forma automática cuando en un requerimiento se esté necesitando implementar, desarrollar UI/UX y ejecutarse tambien manualmente solicitando la mejora o estandarización de un componente ya implementado que no cumple con el estandar de UI/UX ya implementado. Además crea en la carpeta docs un archivo llamado estandarUI-UX.md en el cual el agente escribirá cuales fueron las desiciones de diseño, patrones, aquello que ayude al agente a recordar o tener memoria de como implementar para el proyecto. El agente se llamará frontend-designer.