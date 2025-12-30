# RPD - Requirements and Product Definition
## Sistema de Gestión de Compras para Viajes de Grupo

**Versión:** 1.0.0 - MVP
**Fecha:** 2025-12-30
**Estado:** Borrador Inicial

---

## 1. Resumen Ejecutivo

Sistema web para gestionar las compras de comida y bebida en viajes de grupo. Permite organizar participantes, sus preferencias alimenticias, y calcular las necesidades totales de aprovisionamiento para cada día del viaje.

### 1.1 Objetivos del MVP
- Gestionar múltiples viajes independientes
- Administrar participantes y su disponibilidad por días/comidas
- Mantener un catálogo de productos (comidas y bebidas)
- Asociar consumos a participantes
- Visualizar resúmenes y estadísticas en dashboard

---

## 2. Arquitectura del Sistema

### 2.1 Stack Tecnológico
| Componente | Tecnología |
|------------|------------|
| Frontend | React 18 + TypeScript |
| Bundler | Vite |
| Estilos | CSS Modules / Tailwind CSS |
| Estado | Context API + useReducer |
| Persistencia | IndexedDB (Dexie.js) |
| Despliegue | GitHub Pages |

### 2.2 Arquitectura de Software
```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
│  (React Components - Solo renderizado, sin lógica de negocio)│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN                       │
│         (Services / Use Cases - Lógica de negocio)          │
│   TripService | ParticipantService | ProductService | etc   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE DOMINIO                        │
│              (Entities / Models / Interfaces)               │
│     Trip | Participant | Product | Consumption | etc        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE INFRAESTRUCTURA                    │
│            (Repositories - Acceso a datos)                  │
│   IndexedDB Repositories implementando interfaces           │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Principios SOLID Aplicados
- **S** - Single Responsibility: Cada servicio/componente tiene una única responsabilidad
- **O** - Open/Closed: Entidades extensibles sin modificar código existente
- **L** - Liskov Substitution: Repositorios intercambiables (IndexedDB ↔ API REST)
- **I** - Interface Segregation: Interfaces específicas por dominio
- **D** - Dependency Inversion: Servicios dependen de abstracciones, no implementaciones

---

## 3. Modelo de Datos

### 3.1 Entidades Principales

```typescript
// Viaje
interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Participante
interface Participant {
  id: string;
  tripId: string;
  name: string;
  email?: string;
  notes?: string;
  createdAt: Date;
}

// Disponibilidad del participante por día/comida
interface ParticipantAvailability {
  id: string;
  participantId: string;
  date: Date;
  meals: MealType[]; // ['breakfast', 'lunch', 'dinner']
}

// Tipos de comida
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Producto (comida o bebida)
interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  type: 'food' | 'beverage';
  unit: string; // 'unidad', 'litro', 'kg', etc.
  defaultQuantityPerPerson?: number;
  notes?: string;
  createdAt: Date;
}

// Categorías de productos
type ProductCategory =
  | 'bebida_alcoholica'
  | 'bebida_no_alcoholica'
  | 'carnes'
  | 'lacteos'
  | 'frutas_verduras'
  | 'panaderia'
  | 'snacks'
  | 'condimentos'
  | 'otros';

// Consumo (asociación participante-producto)
interface Consumption {
  id: string;
  tripId: string;
  participantId: string;
  productId: string;
  date: Date;
  meal: MealType;
  quantity: number;
  createdAt: Date;
}

// Resumen de compras
interface ShoppingSummary {
  tripId: string;
  productId: string;
  productName: string;
  totalQuantity: number;
  unit: string;
  byDate: { date: Date; quantity: number }[];
}
```

### 3.2 Diagrama de Relaciones

```
┌──────────┐       ┌───────────────┐       ┌─────────────────────────┐
│   Trip   │──1:N──│  Participant  │──1:N──│ ParticipantAvailability │
└──────────┘       └───────────────┘       └─────────────────────────┘
     │                    │
     │                    │
     │              ┌─────┴─────┐
     │              │           │
     └──────1:N─────┤Consumption├───N:1────┌─────────┐
                    │           │          │ Product │
                    └───────────┘          └─────────┘
```

---

## 4. Funcionalidades del MVP

### 4.1 Gestión de Viajes (CRUD)
| Operación | Descripción |
|-----------|-------------|
| Crear | Nuevo viaje con nombre, fechas inicio/fin |
| Leer | Listar todos los viajes, ver detalle |
| Actualizar | Modificar datos del viaje |
| Eliminar | Borrar viaje y datos asociados |

### 4.2 Gestión de Participantes (CRUD)
| Operación | Descripción |
|-----------|-------------|
| Crear | Añadir participante a un viaje |
| Leer | Ver participantes del viaje |
| Actualizar | Modificar datos y disponibilidad |
| Eliminar | Quitar participante del viaje |

### 4.3 Gestión de Disponibilidad
- Matriz de días × comidas por participante
- Marcar/desmarcar asistencia a cada comida
- Vista calendario del viaje

### 4.4 Catálogo de Productos (CRUD)
| Operación | Descripción |
|-----------|-------------|
| Crear | Nuevo producto con categoría y tipo |
| Leer | Listar productos, filtrar por categoría |
| Actualizar | Modificar datos del producto |
| Eliminar | Borrar producto del catálogo |

### 4.5 Gestión de Consumos
- Asignar productos a participantes
- Especificar cantidad por comida/día
- Editar/eliminar asignaciones

### 4.6 Dashboard
- Resumen del viaje activo
- Total de participantes por día
- Lista de compras consolidada
- Gráficos de distribución por categoría
- Exportar lista de compras (CSV/PDF)

---

## 5. Interfaz de Usuario

### 5.1 Estructura de Navegación
```
/                       → Página inicio (selección de viaje)
/trips                  → Lista de viajes
/trips/new              → Crear nuevo viaje
/trips/:id              → Dashboard del viaje
/trips/:id/participants → Gestión de participantes
/trips/:id/availability → Matriz de disponibilidad
/trips/:id/products     → Catálogo de productos
/trips/:id/consumptions → Asignación de consumos
/trips/:id/shopping     → Lista de compras generada
```

### 5.2 Wireframes Conceptuales

#### Dashboard del Viaje
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Viaje a la Playa 2025          [Configuración] [☰]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Participantes│ │    Días      │ │   Productos  │        │
│  │     12       │ │      5       │ │      47      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  ┌─────────────────────────────┐ ┌─────────────────────┐   │
│  │    Participantes por día    │ │  Top 5 Productos    │   │
│  │         [Gráfico]           │ │    [Lista]          │   │
│  └─────────────────────────────┘ └─────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Lista de Compras Resumida              │   │
│  │  [Ver completa]                    [Exportar CSV]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Matriz de Disponibilidad
```
┌─────────────────────────────────────────────────────────────┐
│  Disponibilidad - Viaje a la Playa                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│            │  Vie 15  │  Sáb 16  │  Dom 17  │  Lun 18  │   │
│  ──────────┼──────────┼──────────┼──────────┼──────────│   │
│  Juan      │ D A C    │ D A C    │ D A C    │ D A      │   │
│  María     │   A C    │ D A C    │ D A C    │ D A C    │   │
│  Pedro     │ D A C    │ D A C    │ D A      │          │   │
│  Ana       │ D A C    │ D A C    │ D A C    │ D A C    │   │
│                                                             │
│  Leyenda: D=Desayuno  A=Almuerzo  C=Cena                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Estructura del Proyecto

```
src/
├── domain/                    # Capa de Dominio
│   ├── entities/              # Entidades del negocio
│   │   ├── Trip.ts
│   │   ├── Participant.ts
│   │   ├── Product.ts
│   │   └── Consumption.ts
│   ├── interfaces/            # Contratos/Interfaces
│   │   ├── repositories/
│   │   │   ├── ITripRepository.ts
│   │   │   ├── IParticipantRepository.ts
│   │   │   └── IProductRepository.ts
│   │   └── services/
│   │       └── IStorageService.ts
│   └── types/                 # Tipos compartidos
│       └── index.ts
│
├── application/               # Capa de Aplicación
│   ├── services/              # Servicios de negocio
│   │   ├── TripService.ts
│   │   ├── ParticipantService.ts
│   │   ├── ProductService.ts
│   │   ├── ConsumptionService.ts
│   │   └── ShoppingService.ts
│   └── useCases/              # Casos de uso específicos
│       ├── trip/
│       ├── participant/
│       └── shopping/
│
├── infrastructure/            # Capa de Infraestructura
│   ├── persistence/           # Implementaciones de persistencia
│   │   ├── indexeddb/
│   │   │   ├── database.ts
│   │   │   ├── TripRepository.ts
│   │   │   ├── ParticipantRepository.ts
│   │   │   └── ProductRepository.ts
│   │   └── localStorage/      # Alternativa simple
│   │       └── ...
│   └── export/                # Exportación de datos
│       ├── CSVExporter.ts
│       └── PDFExporter.ts
│
├── presentation/              # Capa de Presentación
│   ├── components/            # Componentes React
│   │   ├── common/            # Componentes reutilizables
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   └── Form/
│   │   ├── trip/
│   │   ├── participant/
│   │   ├── product/
│   │   └── dashboard/
│   ├── pages/                 # Páginas/Vistas
│   │   ├── HomePage.tsx
│   │   ├── TripsPage.tsx
│   │   ├── TripDetailPage.tsx
│   │   └── ...
│   ├── hooks/                 # Custom hooks
│   │   ├── useTrips.ts
│   │   ├── useParticipants.ts
│   │   └── useProducts.ts
│   ├── context/               # Context providers
│   │   ├── TripContext.tsx
│   │   └── AppContext.tsx
│   └── styles/                # Estilos globales
│       └── global.css
│
├── config/                    # Configuración
│   └── constants.ts
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 7. Plan de Desarrollo

### Fase 1: Fundamentos (MVP Core)
- [ ] Setup proyecto (Vite + React + TS)
- [ ] Implementar capa de dominio (entidades e interfaces)
- [ ] Implementar capa de infraestructura (IndexedDB)
- [ ] Implementar servicios básicos CRUD

### Fase 2: Interfaz Base
- [ ] Componentes comunes (Button, Modal, Table, Form)
- [ ] Página de gestión de viajes
- [ ] Página de gestión de participantes
- [ ] Página de gestión de productos

### Fase 3: Funcionalidad Core
- [ ] Sistema de disponibilidad (matriz días/comidas)
- [ ] Asignación de consumos
- [ ] Cálculo de lista de compras

### Fase 4: Dashboard y Polish
- [ ] Dashboard con estadísticas
- [ ] Exportación CSV
- [ ] Responsive design
- [ ] Despliegue en GitHub Pages

---

## 8. Criterios de Aceptación MVP

- [ ] Usuario puede crear/editar/eliminar viajes
- [ ] Usuario puede añadir participantes a un viaje
- [ ] Usuario puede marcar disponibilidad de participantes
- [ ] Usuario puede gestionar catálogo de productos
- [ ] Usuario puede asignar productos a participantes
- [ ] Sistema genera lista de compras consolidada
- [ ] Datos persisten entre sesiones (IndexedDB)
- [ ] Aplicación desplegada y accesible en GitHub Pages

---

## 9. Consideraciones Técnicas

### 9.1 Rendimiento
- Lazy loading de componentes
- Virtualización para listas largas
- Debounce en búsquedas

### 9.2 UX
- Feedback visual en operaciones
- Confirmación en eliminaciones
- Estados de carga

### 9.3 Extensibilidad Futura
- Arquitectura preparada para API REST backend
- Repositorios intercambiables
- Sistema de plugins para exportadores

---

## 10. Glosario

| Término | Definición |
|---------|------------|
| Trip | Viaje organizado con fechas definidas |
| Participant | Persona que participa en el viaje |
| Availability | Días y comidas en que participa alguien |
| Product | Comida o bebida del catálogo |
| Consumption | Asociación de producto a participante |
| Shopping Summary | Lista consolidada de compras |

---

*Documento generado para el proyecto MVP de Gestión de Viajes*
