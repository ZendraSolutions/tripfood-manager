# Guia de Usuario - TripFood Manager

## Indice

1. [Introduccion](#1-introduccion)
2. [Primeros Pasos](#2-primeros-pasos)
3. [Crear un Viaje](#3-crear-un-viaje)
4. [Gestionar Participantes](#4-gestionar-participantes)
5. [Añadir Productos](#5-anadir-productos)
6. [Configurar Disponibilidad](#6-configurar-disponibilidad)
7. [Ver Lista de Compras](#7-ver-lista-de-compras)
8. [Exportar Datos](#8-exportar-datos)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)

---

## 1. Introduccion

### Que es TripFood Manager?

TripFood Manager es una aplicacion web que te ayuda a planificar las compras de comida y bebida para viajes en grupo. Automatiza el calculo de cantidades basandose en:

- Numero de participantes
- Dias del viaje
- Disponibilidad de cada persona (desayuno, almuerzo, cena)
- Productos que se consumiran

### Para quien es util?

- Organizadores de viajes grupales
- Coordinadores de eventos con catering
- Familias que planifican vacaciones
- Grupos de amigos que van de camping/casa rural
- Cualquiera que necesite calcular cantidades de comida para grupos

---

## 2. Primeros Pasos

### 2.1 Acceder a la Aplicacion

1. Abre tu navegador web (Chrome, Firefox, Edge, Safari)
2. Ve a: **https://zendrasolutions.github.io/tripfood-manager/**
3. La aplicacion se cargara automaticamente

> **Nota:** No necesitas crear cuenta ni iniciar sesion. Todos los datos se guardan localmente en tu navegador.

### 2.2 Pantalla Principal (Home)

Al entrar veras la pantalla principal con:

```
+--------------------------------------------------+
|  TripFood Manager                    [+ Nuevo]   |
+--------------------------------------------------+
|                                                   |
|     [Icono de viaje]                              |
|                                                   |
|     Bienvenido a TripFood Manager                 |
|                                                   |
|     Organiza las compras de tu proximo viaje      |
|     de forma facil y eficiente.                   |
|                                                   |
|     [Crear primer viaje]                          |
|                                                   |
+--------------------------------------------------+
```

### 2.3 Navegacion Principal

La aplicacion tiene las siguientes secciones principales:

| Seccion | Descripcion |
|---------|-------------|
| **Inicio** | Pantalla principal y resumen |
| **Viajes** | Lista de todos tus viajes |
| **Detalle Viaje** | Informacion de un viaje especifico |
| **Participantes** | Personas que asisten al viaje |
| **Productos** | Catalogo de comida y bebida |
| **Disponibilidad** | Configurar que dias asiste cada persona |
| **Lista de Compras** | Lista consolidada de lo que comprar |

---

## 3. Crear un Viaje

### 3.1 Pasos para Crear un Viaje

1. **Hacer clic en "Nuevo Viaje"** o en el boton **[+]** de la barra superior

2. **Completar el formulario:**

```
+--------------------------------------------------+
|  Crear Nuevo Viaje                               |
+--------------------------------------------------+
|                                                   |
|  Nombre del viaje *                               |
|  [Vacaciones en la playa 2024          ]          |
|                                                   |
|  Descripcion (opcional)                           |
|  [Viaje anual con amigos a la costa    ]          |
|                                                   |
|  Fecha de inicio *                                |
|  [15/07/2024]                                     |
|                                                   |
|  Fecha de fin *                                   |
|  [22/07/2024]                                     |
|                                                   |
|  [Cancelar]                    [Crear Viaje]      |
|                                                   |
+--------------------------------------------------+
```

3. **Hacer clic en "Crear Viaje"**

### 3.2 Campos del Formulario

| Campo | Obligatorio | Descripcion |
|-------|-------------|-------------|
| Nombre | Si | Nombre descriptivo del viaje (3-100 caracteres) |
| Descripcion | No | Informacion adicional sobre el viaje (max 500 caracteres) |
| Fecha inicio | Si | Primer dia del viaje |
| Fecha fin | Si | Ultimo dia del viaje |

### 3.3 Ver Detalles del Viaje

Despues de crear el viaje, seras llevado a la pantalla de detalle:

```
+--------------------------------------------------+
|  Vacaciones en la playa 2024                     |
+--------------------------------------------------+
|                                                   |
|  [i] 15 Jul - 22 Jul 2024 (8 dias)               |
|                                                   |
|  Viaje anual con amigos a la costa               |
|                                                   |
|  +------------+  +------------+  +------------+  |
|  | 0          |  | 0          |  | 0          |  |
|  | Participan |  | Productos  |  | Consumos   |  |
|  +------------+  +------------+  +------------+  |
|                                                   |
|  [Participantes] [Disponibilidad] [Lista Compra] |
|                                                   |
+--------------------------------------------------+
```

---

## 4. Gestionar Participantes

### 4.1 Añadir un Participante

1. Desde el detalle del viaje, hacer clic en **"Participantes"**
2. Hacer clic en **"Añadir Participante"** o **[+]**

```
+--------------------------------------------------+
|  Añadir Participante                             |
+--------------------------------------------------+
|                                                   |
|  Nombre *                                         |
|  [Maria Garcia                         ]          |
|                                                   |
|  Email (opcional)                                 |
|  [maria@email.com                      ]          |
|                                                   |
|  Notas (opcional)                                 |
|  [Vegetariana, no come mariscos        ]          |
|                                                   |
|  [Cancelar]                    [Guardar]          |
|                                                   |
+--------------------------------------------------+
```

3. Hacer clic en **"Guardar"**

### 4.2 Lista de Participantes

```
+--------------------------------------------------+
|  Participantes (5)                    [+ Añadir] |
+--------------------------------------------------+
|                                                   |
|  +---------------------------------------------+ |
|  | Maria Garcia                                | |
|  | maria@email.com                             | |
|  | Vegetariana, no come mariscos     [E] [X]  | |
|  +---------------------------------------------+ |
|                                                   |
|  +---------------------------------------------+ |
|  | Juan Perez                                  | |
|  | juan@email.com                              | |
|  |                                   [E] [X]  | |
|  +---------------------------------------------+ |
|                                                   |
|  ...                                              |
+--------------------------------------------------+

[E] = Editar    [X] = Eliminar
```

### 4.3 Editar o Eliminar Participante

- **Editar:** Hacer clic en el icono de lapiz [E]
- **Eliminar:** Hacer clic en el icono de X [X] y confirmar

> **Importante:** Al eliminar un participante se eliminan tambien sus registros de disponibilidad y consumo.

---

## 5. Añadir Productos

Los productos son globales (no estan asociados a un viaje especifico) y representan los items de comida y bebida que podras usar en tus viajes.

### 5.1 Acceder al Catalogo de Productos

1. Desde el detalle del viaje, hacer clic en **"Productos"**
2. O desde el menu principal seleccionar **"Productos"**

### 5.2 Crear un Producto

```
+--------------------------------------------------+
|  Añadir Producto                                 |
+--------------------------------------------------+
|                                                   |
|  Nombre *                                         |
|  [Agua mineral 1.5L                    ]          |
|                                                   |
|  Categoria *                                      |
|  [Bebida                          v]              |
|                                                   |
|  Tipo *                                           |
|  [Agua                            v]              |
|                                                   |
|  Unidad de medida *                               |
|  [Botella                         v]              |
|                                                   |
|  Cantidad por persona (opcional)                  |
|  [2                                    ]          |
|                                                   |
|  Notas (opcional)                                 |
|  [Comprar marca sin gas               ]           |
|                                                   |
|  [Cancelar]                    [Guardar]          |
|                                                   |
+--------------------------------------------------+
```

### 5.3 Categorias Disponibles

| Categoria | Descripcion |
|-----------|-------------|
| **Comida (Food)** | Alimentos solidos |
| **Bebida (Beverage)** | Liquidos |
| **Otro (Other)** | Miscelaneos |

### 5.4 Tipos de Producto

**Comida:**
- Carnes (meat)
- Lacteos (dairy)
- Verduras (vegetables)
- Frutas (fruits)
- Granos/Pan (grains)
- Snacks (snacks)
- Condimentos (condiments)
- Comida preparada (prepared_food)

**Bebida:**
- Agua (water)
- Refrescos (soft_drink)
- Alcohol (alcohol)
- Bebidas calientes (hot_beverage)

### 5.5 Unidades de Medida

| Tipo | Unidades |
|------|----------|
| Peso | kg, g, lb, oz |
| Volumen | l, ml, gal |
| Conteo | unidad, pack, caja, botella, lata, bolsa |
| Porciones | racion, porcion, rebanada, pieza |

---

## 6. Configurar Disponibilidad

La disponibilidad indica que dias y en que comidas estara presente cada participante.

### 6.1 Acceder a Disponibilidad

1. Desde el detalle del viaje, hacer clic en **"Disponibilidad"**

### 6.2 Vista de Calendario

```
+--------------------------------------------------+
|  Disponibilidad - Vacaciones Playa               |
+--------------------------------------------------+
|                                                   |
|         | Lun 15 | Mar 16 | Mie 17 | Jue 18 |... |
|  -------+--------+--------+--------+--------+    |
|  Maria  |        |        |        |        |    |
|    Des  |  [x]   |  [x]   |  [x]   |  [x]   |    |
|    Alm  |  [x]   |  [x]   |  [x]   |  [x]   |    |
|    Cen  |  [x]   |  [x]   |  [x]   |  [x]   |    |
|  -------+--------+--------+--------+--------+    |
|  Juan   |        |        |        |        |    |
|    Des  |  [ ]   |  [x]   |  [x]   |  [x]   |    |
|    Alm  |  [ ]   |  [x]   |  [x]   |  [x]   |    |
|    Cen  |  [ ]   |  [x]   |  [x]   |  [x]   |    |
|  -------+--------+--------+--------+--------+    |
|                                                   |
+--------------------------------------------------+

[x] = Presente    [ ] = Ausente
Des = Desayuno    Alm = Almuerzo    Cen = Cena
```

### 6.3 Marcar Disponibilidad

1. **Hacer clic en una casilla** para marcar/desmarcar presencia
2. **Usar "Seleccionar todo"** para marcar todos los dias/comidas
3. **Usar "Limpiar"** para quitar todas las marcas

### 6.4 Tipos de Comida

| Comida | Codigo | Horario tipico |
|--------|--------|----------------|
| Desayuno | breakfast | 7:00 - 10:00 |
| Almuerzo | lunch | 12:00 - 15:00 |
| Cena | dinner | 19:00 - 22:00 |
| Snack | snack | Entre comidas |

---

## 7. Ver Lista de Compras

La lista de compras se genera automaticamente basandose en los participantes, su disponibilidad, y los productos configurados.

### 7.1 Acceder a la Lista de Compras

1. Desde el detalle del viaje, hacer clic en **"Lista de Compras"**

### 7.2 Vista de Lista de Compras

```
+--------------------------------------------------+
|  Lista de Compras                    [Exportar]  |
+--------------------------------------------------+
|                                                   |
|  Vacaciones Playa 2024                            |
|  15 Jul - 22 Jul (8 dias) | 5 participantes      |
|                                                   |
|  +---------------------------------------------+ |
|  | BEBIDAS                           3 items   | |
|  +---------------------------------------------+ |
|  | Agua mineral 1.5L         | 80 botellas    | |
|  | Refrescos variados        | 40 latas       | |
|  | Cafe molido               | 2 paquetes     | |
|  +---------------------------------------------+ |
|                                                   |
|  +---------------------------------------------+ |
|  | COMIDA                            5 items   | |
|  +---------------------------------------------+ |
|  | Pan de molde              | 8 bolsas       | |
|  | Jamon serrano             | 2 kg           | |
|  | Queso manchego            | 1.5 kg         | |
|  | Frutas variadas           | 10 kg          | |
|  | Snacks                    | 20 paquetes    | |
|  +---------------------------------------------+ |
|                                                   |
|  RESUMEN                                          |
|  Total productos: 8                               |
|  Productos esenciales: 5                          |
|  Productos opcionales: 3                          |
|                                                   |
+--------------------------------------------------+
```

### 7.3 Como se Calculan las Cantidades

El sistema calcula las cantidades usando esta formula:

```
Cantidad Total = Cantidad por persona x Comidas totales

Donde:
- Comidas totales = Suma de todas las disponibilidades
                    (participante x dia x tipo_comida)
```

**Ejemplo:**
- 5 participantes
- 8 dias
- Todos presentes en desayuno, almuerzo y cena
- Agua: 2 botellas por persona por comida

```
Total = 2 x 5 x 8 x 3 = 240 botellas
```

### 7.4 Ajustar Cantidades

Puedes aplicar un **multiplicador** para añadir margen de seguridad:

- **1.0x** = Cantidad exacta
- **1.1x** = 10% extra (recomendado)
- **1.2x** = 20% extra

---

## 8. Exportar Datos

### 8.1 Exportar Lista de Compras

1. Ir a **"Lista de Compras"**
2. Hacer clic en **"Exportar"**
3. Seleccionar formato:
   - **CSV** - Para Excel/Google Sheets
   - **JSON** - Para uso tecnico

### 8.2 Formato CSV

El archivo CSV incluye:

```csv
Categoria,Producto,Cantidad,Unidad,Notas
Bebidas,Agua mineral 1.5L,80,botella,Marca sin gas
Bebidas,Refrescos variados,40,lata,
Comida,Pan de molde,8,bolsa,
...

--- RESUMEN ---
Viaje,Vacaciones Playa 2024
Fecha inicio,2024-07-15
Fecha fin,2024-07-22
Total dias,8
Participantes,5
Total productos,8
```

### 8.3 Usar en Excel

1. Abrir Excel
2. Archivo > Abrir
3. Seleccionar el archivo CSV descargado
4. Listo para editar/imprimir

---

## 9. Preguntas Frecuentes

### Donde se guardan mis datos?

Todos los datos se guardan **localmente en tu navegador** usando IndexedDB. No se envian a ningun servidor.

### Puedo usar la aplicacion sin internet?

**Si**, una vez cargada la aplicacion funciona completamente offline.

### Como hago backup de mis datos?

Puedes exportar las listas de compras a CSV/JSON. Proximamente se añadira funcion de backup completo.

### Se borran mis datos si cierro el navegador?

**No**, los datos persisten entre sesiones. Solo se pierden si:
- Limpias los datos del navegador
- Usas navegacion privada/incognito
- Desinstalas el navegador

### Puedo compartir un viaje con otras personas?

Actualmente no hay funcion de compartir. Cada persona debe crear su propia copia del viaje.

### La cantidad calculada es exacta?

Las cantidades son **estimaciones** basadas en la cantidad por persona configurada. Se recomienda:
- Añadir 10-20% de margen
- Ajustar segun conocimiento del grupo
- Considerar preferencias especiales

### Como elimino un viaje?

1. Ir a la lista de viajes
2. Hacer clic en el icono de eliminar del viaje
3. Confirmar la eliminacion

> **Atencion:** Eliminar un viaje borra todos sus participantes, disponibilidades y consumos.

### Hay limite de viajes/participantes?

No hay limite artificial. El limite practico depende del almacenamiento del navegador (generalmente varios MB).

### Funciona en movil?

**Si**, la aplicacion es responsive y funciona en smartphones y tablets.

### Como reporto un error?

Puedes abrir un issue en el repositorio de GitHub:
https://github.com/ZendraSolutions/tripfood-manager/issues

---

## Atajos de Teclado

| Atajo | Accion |
|-------|--------|
| `Esc` | Cerrar modal/dialogo |
| `Enter` | Confirmar formulario |
| `Tab` | Navegar entre campos |

---

## Glosario

| Termino | Definicion |
|---------|------------|
| **Viaje** | Un evento con fechas de inicio y fin donde participan personas |
| **Participante** | Persona que asiste al viaje |
| **Producto** | Item de comida o bebida |
| **Disponibilidad** | Registro de que dias/comidas asiste un participante |
| **Consumo** | Registro de producto consumido por un participante |
| **Lista de Compras** | Resumen consolidado de productos a comprar |

---

*Guia de Usuario v1.0 - TripFood Manager*
