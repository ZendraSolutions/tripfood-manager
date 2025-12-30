# TripFood Manager

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?logo=github)](https://zendrasolutions.github.io/tripfood-manager/)

Sistema de planificacion de compras de comida y bebida para viajes de grupo.

**[Ver Demo en Vivo](https://zendrasolutions.github.io/tripfood-manager/)**

---

## Descripcion

TripFood Manager es una aplicacion web progresiva (PWA) diseñada para organizar las compras de aprovisionamiento en viajes grupales. Permite gestionar participantes, su disponibilidad por dias y comidas, mantener un catalogo de productos, y generar listas de compras consolidadas automaticamente.

### Problema que Resuelve

Cuando se organiza un viaje en grupo, calcular cuanta comida y bebida comprar puede ser complicado:
- ¿Cuantas personas asistiran cada dia?
- ¿Quien estara en el desayuno, almuerzo o cena?
- ¿Cuantas unidades de cada producto necesitamos?

TripFood Manager automatiza estos calculos y genera una lista de compras optimizada.

---

## Caracteristicas Principales

| Funcionalidad | Descripcion |
|---------------|-------------|
| **Gestion de Viajes** | Crear y administrar multiples viajes con fechas de inicio y fin |
| **Participantes** | Añadir participantes con informacion de contacto y notas |
| **Disponibilidad** | Configurar que dias y comidas estara presente cada participante |
| **Catalogo de Productos** | Base de datos de productos organizados por categoria (comida, bebida) |
| **Lista de Compras** | Generacion automatica de lista consolidada basada en disponibilidad |
| **Exportacion CSV** | Exportar la lista de compras para usar en otras aplicaciones |
| **Persistencia Local** | Datos almacenados localmente en IndexedDB (sin servidor) |
| **Offline Ready** | Funciona sin conexion a internet |

---

## Tecnologias

### Frontend
- **React 18** - Biblioteca de UI con hooks y componentes funcionales
- **TypeScript 5** - Tipado estatico para mayor robustez
- **Vite 6** - Bundler ultrarapido para desarrollo y produccion
- **CSS Modules** - Estilos encapsulados por componente
- **React Router 7** - Navegacion SPA

### Persistencia
- **IndexedDB** - Base de datos del navegador
- **Dexie.js 4** - Wrapper elegante para IndexedDB

### Arquitectura
- **Arquitectura Hexagonal** (Clean Architecture)
- **Domain-Driven Design** (DDD)
- **SOLID Principles**

### Despliegue
- **GitHub Pages** - Hosting estatico gratuito
- **gh-pages** - Automatizacion de deploy

---

## Estructura del Proyecto

```
tripfood-manager/
├── docs/                    # Documentacion
│   ├── ARCHITECTURE.md      # Documentacion de arquitectura
│   ├── TECHNICAL.md         # Documentacion tecnica detallada
│   ├── USER_GUIDE.md        # Guia de usuario
│   ├── API.md               # Documentacion de API interna
│   └── RPD.md               # Requisitos del producto
│
├── src/
│   ├── domain/              # Capa de Dominio (reglas de negocio)
│   │   ├── entities/        # Entidades: Trip, Participant, Product, etc.
│   │   ├── interfaces/      # Contratos de repositorios
│   │   ├── types/           # Tipos de dominio (MealType, ProductCategory)
│   │   └── errors/          # Errores de dominio
│   │
│   ├── application/         # Capa de Aplicacion (casos de uso)
│   │   ├── services/        # Servicios: TripService, ShoppingService, etc.
│   │   └── dtos/            # Data Transfer Objects
│   │
│   ├── infrastructure/      # Capa de Infraestructura (implementaciones)
│   │   ├── persistence/     # Repositorios IndexedDB
│   │   │   ├── indexeddb/   # Implementacion con Dexie
│   │   │   └── mappers/     # Mappers Entity <-> Record
│   │   ├── export/          # Exportadores CSV/JSON
│   │   └── errors/          # Errores de infraestructura
│   │
│   ├── presentation/        # Capa de Presentacion (UI)
│   │   ├── components/      # Componentes React
│   │   │   ├── common/      # Componentes reutilizables
│   │   │   └── layout/      # Layout principal
│   │   ├── pages/           # Paginas de la aplicacion
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React Context (estado global)
│   │   ├── routes/          # Configuracion de rutas
│   │   └── styles/          # Estilos globales
│   │
│   └── shared/              # Codigo compartido
│       ├── di/              # Contenedor de inyeccion de dependencias
│       └── utils/           # Utilidades genericas
│
├── public/                  # Archivos estaticos
├── index.html               # HTML principal
├── vite.config.ts           # Configuracion de Vite
├── tsconfig.json            # Configuracion de TypeScript
└── package.json             # Dependencias y scripts
```

---

## Instalacion

### Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o yarn/pnpm)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ZendraSolutions/tripfood-manager.git
   cd tripfood-manager
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173/tripfood-manager/
   ```

---

## Comandos Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con hot-reload |
| `npm run build` | Genera build de produccion en `/dist` |
| `npm run build:strict` | Build con verificacion de tipos estricta |
| `npm run preview` | Preview local del build de produccion |
| `npm run lint` | Ejecuta ESLint para verificar codigo |
| `npm run type-check` | Verifica tipos de TypeScript |
| `npm run deploy` | Despliega a GitHub Pages |

---

## Build y Deploy

### Build de Produccion

```bash
# Build estandar
npm run build

# Build con verificacion estricta de tipos
npm run build:strict
```

El build se genera en la carpeta `dist/`.

### Deploy a GitHub Pages

```bash
# Ejecuta build y despliega automaticamente
npm run deploy
```

Este comando:
1. Ejecuta `npm run build`
2. Publica el contenido de `dist/` en la rama `gh-pages`
3. GitHub Pages sirve automaticamente el sitio

### URL del Sitio Desplegado

**https://zendrasolutions.github.io/tripfood-manager/**

---

## Documentacion

| Documento | Descripcion |
|-----------|-------------|
| [Arquitectura](./docs/ARCHITECTURE.md) | Diagrama y explicacion de la arquitectura hexagonal |
| [Tecnico](./docs/TECHNICAL.md) | Documentacion tecnica detallada |
| [Guia de Usuario](./docs/USER_GUIDE.md) | Como usar la aplicacion paso a paso |
| [API Interna](./docs/API.md) | Documentacion de servicios y repositorios |
| [Requisitos](./docs/RPD.md) | Requisitos del producto |

---

## Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---

## Licencia

Este proyecto esta bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para mas detalles.

```
MIT License

Copyright (c) 2024 TripFood Manager

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Desarrollado con metodologia de orquestacion de agentes especializados.
