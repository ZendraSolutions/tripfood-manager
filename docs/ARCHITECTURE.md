# Arquitectura del Sistema - TripFood Manager

## 1. Visión General

### 1.1 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                     │
│                         (Navegador Web)                                  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     PRESENTATION LAYER                              │ │
│  │                                                                      │ │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │   │  Pages   │  │Components│  │  Hooks   │  │ Context  │          │ │
│  │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │ │
│  │        │              │              │              │               │ │
│  │        └──────────────┴──────────────┴──────────────┘               │ │
│  │                              │                                       │ │
│  └──────────────────────────────┼───────────────────────────────────────┘ │
│                                 │                                        │
│  ┌──────────────────────────────▼───────────────────────────────────────┐ │
│  │                     APPLICATION LAYER                                │ │
│  │                                                                      │ │
│  │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │ │
│  │   │  TripService  │  │ParticipantSvc │  │ ProductService│          │ │
│  │   └───────────────┘  └───────────────┘  └───────────────┘          │ │
│  │   ┌───────────────┐  ┌───────────────┐                              │ │
│  │   │ConsumptionSvc │  │ShoppingService│                              │ │
│  │   └───────────────┘  └───────────────┘                              │ │
│  │                              │                                       │ │
│  └──────────────────────────────┼───────────────────────────────────────┘ │
│                                 │                                        │
│  ┌──────────────────────────────▼───────────────────────────────────────┐ │
│  │                       DOMAIN LAYER                                   │ │
│  │                                                                      │ │
│  │   ┌─────────┐  ┌─────────────┐  ┌─────────┐  ┌───────────┐         │ │
│  │   │  Trip   │  │ Participant │  │ Product │  │Consumption│         │ │
│  │   └─────────┘  └─────────────┘  └─────────┘  └───────────┘         │ │
│  │   ┌─────────────────────────────────────────────────────────┐      │ │
│  │   │              Interfaces (Contracts)                      │      │ │
│  │   └─────────────────────────────────────────────────────────┘      │ │
│  │                              │                                       │ │
│  └──────────────────────────────┼───────────────────────────────────────┘ │
│                                 │                                        │
│  ┌──────────────────────────────▼───────────────────────────────────────┐ │
│  │                   INFRASTRUCTURE LAYER                               │ │
│  │                                                                      │ │
│  │   ┌─────────────────────────────────────────────────────────┐      │ │
│  │   │              IndexedDB Repositories                      │      │ │
│  │   │   TripRepo │ ParticipantRepo │ ProductRepo │ etc        │      │ │
│  │   └─────────────────────────────────────────────────────────┘      │ │
│  │   ┌─────────────────────┐  ┌─────────────────────┐                 │ │
│  │   │    Dexie.js DB      │  │     Exporters       │                 │ │
│  │   │   (IndexedDB)       │  │   CSV │ PDF │ JSON  │                 │ │
│  │   └─────────────────────┘  └─────────────────────┘                 │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Principios Arquitectónicos

| Principio | Aplicación |
|-----------|------------|
| **Separation of Concerns** | 4 capas claramente separadas |
| **Dependency Inversion** | Capas superiores dependen de abstracciones |
| **Single Responsibility** | Cada servicio/componente tiene una función |
| **Open/Closed** | Extensible sin modificar código existente |
| **Interface Segregation** | Interfaces pequeñas y específicas |

---

## 2. Capas del Sistema

### 2.1 Domain Layer (Capa de Dominio)

**Responsabilidad:** Contiene la lógica de negocio pura, independiente de frameworks.

```
src/domain/
├── entities/
│   ├── Trip.ts
│   ├── Participant.ts
│   ├── Product.ts
│   ├── Consumption.ts
│   └── Availability.ts
│
├── interfaces/
│   ├── repositories/
│   │   ├── ITripRepository.ts
│   │   ├── IParticipantRepository.ts
│   │   ├── IProductRepository.ts
│   │   └── IConsumptionRepository.ts
│   └── services/
│       └── IExportService.ts
│
├── types/
│   ├── common.ts
│   ├── meal.ts
│   └── product.ts
│
└── errors/
    ├── DomainError.ts
    ├── ValidationError.ts
    └── NotFoundError.ts
```

**Reglas:**
- NO importa de otras capas
- NO depende de frameworks (React, Dexie, etc.)
- Entidades son inmutables o con métodos de mutación controlados
- Validaciones de negocio dentro de las entidades

### 2.2 Application Layer (Capa de Aplicación)

**Responsabilidad:** Orquesta los casos de uso, coordina entidades y repositorios.

```
src/application/
├── services/
│   ├── TripService.ts
│   ├── ParticipantService.ts
│   ├── ProductService.ts
│   ├── ConsumptionService.ts
│   └── ShoppingService.ts
│
├── dtos/
│   ├── trip/
│   │   ├── CreateTripDTO.ts
│   │   ├── UpdateTripDTO.ts
│   │   └── TripResponseDTO.ts
│   ├── participant/
│   └── product/
│
├── mappers/
│   ├── TripMapper.ts
│   ├── ParticipantMapper.ts
│   └── ProductMapper.ts
│
└── use-cases/
    ├── trip/
    │   ├── CreateTripUseCase.ts
    │   ├── GetTripWithParticipantsUseCase.ts
    │   └── DeleteTripUseCase.ts
    ├── shopping/
    │   └── GenerateShoppingListUseCase.ts
    └── export/
        └── ExportToCSVUseCase.ts
```

**Reglas:**
- Importa de Domain Layer
- NO conoce detalles de UI ni de infraestructura
- Recibe repositorios por inyección de dependencias
- Usa DTOs para entrada/salida

### 2.3 Infrastructure Layer (Capa de Infraestructura)

**Responsabilidad:** Implementaciones concretas de repositorios y servicios externos.

```
src/infrastructure/
├── persistence/
│   ├── indexeddb/
│   │   ├── database.ts           # Config de Dexie
│   │   ├── TripRepository.ts
│   │   ├── ParticipantRepository.ts
│   │   ├── ProductRepository.ts
│   │   └── ConsumptionRepository.ts
│   └── memory/                    # Para testing
│       └── InMemoryTripRepository.ts
│
├── export/
│   ├── CSVExporter.ts
│   └── JSONExporter.ts
│
└── config/
    └── database.config.ts
```

**Reglas:**
- Implementa interfaces definidas en Domain
- Contiene detalles técnicos (IndexedDB, formato CSV, etc.)
- Fácilmente intercambiable (ej: cambiar IndexedDB por API REST)

### 2.4 Presentation Layer (Capa de Presentación)

**Responsabilidad:** Interfaz de usuario, componentes React, manejo de estado de UI.

```
src/presentation/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Form/
│   │   ├── Card/
│   │   └── Loading/
│   ├── trip/
│   ├── participant/
│   ├── product/
│   └── dashboard/
│
├── pages/
│   ├── HomePage.tsx
│   ├── TripsPage.tsx
│   ├── TripDetailPage.tsx
│   ├── ParticipantsPage.tsx
│   ├── ProductsPage.tsx
│   └── ShoppingListPage.tsx
│
├── hooks/
│   ├── useTrips.ts
│   ├── useParticipants.ts
│   ├── useProducts.ts
│   └── useShoppingList.ts
│
├── context/
│   ├── AppContext.tsx
│   ├── ServiceContext.tsx
│   └── TripContext.tsx
│
├── routes/
│   └── AppRouter.tsx
│
└── styles/
    ├── global.css
    ├── variables.css
    └── reset.css
```

**Reglas:**
- Solo lógica de presentación
- Llama a servicios via hooks/context
- NO accede directamente a repositorios
- Componentes "tontos" (solo props, sin lógica de negocio)

---

## 3. Flujo de Datos

### 3.1 Flujo de Lectura (Query)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UI        │────▶│   Hook      │────▶│   Service   │────▶│ Repository  │
│ Component   │     │ useTrips()  │     │ TripService │     │ TripRepo    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       ▲                   │                   │                   │
       │                   │                   │                   │
       │                   │                   │                   ▼
       │                   │                   │            ┌─────────────┐
       │                   │                   │            │  IndexedDB  │
       │                   │                   │            └─────────────┘
       │                   │                   │                   │
       │                   │                   ◀───────────────────┘
       │                   │                   │
       │                   │        ┌──────────▼──────────┐
       │                   │        │  Mapper: Record→    │
       │                   │        │  Entity→DTO         │
       │                   │        └──────────┬──────────┘
       │                   │                   │
       │                   ◀───────────────────┘
       │                   │
       └───────────────────┘
         (trips[], loading, error)
```

### 3.2 Flujo de Escritura (Command)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UI Form   │────▶│   Hook      │────▶│   Service   │
│ onSubmit()  │     │createTrip() │     │   create()  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   Validación        │
                                    │   DTO → Entity      │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   Repository.save() │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   Entity → Record   │
                                    │   IndexedDB.put()   │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   Return Trip       │
                                    │   (created)         │
                                    └─────────────────────┘
```

---

## 4. Modelo de Datos

### 4.1 Esquema de IndexedDB

```typescript
// database.ts
export class TripFoodDatabase extends Dexie {
  trips!: Table<TripRecord>;
  participants!: Table<ParticipantRecord>;
  availabilities!: Table<AvailabilityRecord>;
  products!: Table<ProductRecord>;
  consumptions!: Table<ConsumptionRecord>;

  constructor() {
    super('tripfood-db');

    this.version(1).stores({
      // Primary key + indexed fields
      trips: 'id, name, startDate, endDate, createdAt',
      participants: 'id, tripId, name, createdAt',
      availabilities: 'id, participantId, [tripId+date]',
      products: 'id, name, category, type, createdAt',
      consumptions: 'id, tripId, participantId, productId, date, meal'
    });
  }
}
```

### 4.2 Relaciones

```
                    ┌─────────────────┐
                    │      Trip       │
                    │─────────────────│
                    │ id (PK)         │
                    │ name            │
                    │ description     │
                    │ startDate       │
                    │ endDate         │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              │              ▼
    ┌─────────────────┐     │    ┌─────────────────┐
    │  Participant    │     │    │   Consumption   │
    │─────────────────│     │    │─────────────────│
    │ id (PK)         │     │    │ id (PK)         │
    │ tripId (FK)     │◄────┼────│ tripId (FK)     │
    │ name            │     │    │ participantId   │──┐
    │ email           │     │    │ productId (FK)  │  │
    └────────┬────────┘     │    │ date            │  │
             │              │    │ meal            │  │
             │              │    │ quantity        │  │
             ▼              │    └─────────────────┘  │
    ┌─────────────────┐     │              ▲          │
    │  Availability   │     │              │          │
    │─────────────────│     │    ┌─────────┴───────┐  │
    │ id (PK)         │     │    │    Product      │  │
    │ participantId   │◄────┘    │─────────────────│  │
    │ date            │          │ id (PK)         │◄─┘
    │ meals[]         │          │ name            │
    └─────────────────┘          │ category        │
                                 │ type            │
                                 │ unit            │
                                 └─────────────────┘
```

---

## 5. Inyección de Dependencias

### 5.1 Container de Servicios

```typescript
// src/shared/di/container.ts

import { TripFoodDatabase } from '@/infrastructure/persistence/indexeddb/database';
import { IndexedDBTripRepository } from '@/infrastructure/persistence/indexeddb/TripRepository';
import { TripService } from '@/application/services/TripService';
// ... other imports

// Database instance
const database = new TripFoodDatabase();

// Repositories
const tripRepository = new IndexedDBTripRepository(database);
const participantRepository = new IndexedDBParticipantRepository(database);
const productRepository = new IndexedDBProductRepository(database);
const consumptionRepository = new IndexedDBConsumptionRepository(database);

// Services
export const tripService = new TripService(tripRepository);
export const participantService = new ParticipantService(
  participantRepository,
  tripRepository
);
export const productService = new ProductService(productRepository);
export const consumptionService = new ConsumptionService(
  consumptionRepository,
  participantRepository,
  productRepository
);
export const shoppingService = new ShoppingService(
  consumptionRepository,
  productRepository
);

// Service container for Context
export const services = {
  tripService,
  participantService,
  productService,
  consumptionService,
  shoppingService,
};

export type ServiceContainer = typeof services;
```

### 5.2 Service Context

```typescript
// src/presentation/context/ServiceContext.tsx

const ServiceContext = createContext<ServiceContainer | null>(null);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = (): ServiceContainer => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return context;
};
```

---

## 6. Manejo de Errores

### 6.1 Jerarquía de Errores

```typescript
// Domain Errors (src/domain/errors/)

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends DomainError {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} '${value}' already exists`);
    this.name = 'DuplicateError';
  }
}

// Infrastructure Errors (src/infrastructure/)

export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'InfrastructureError';
  }
}

export class DatabaseError extends InfrastructureError {
  constructor(operation: string, originalError?: Error) {
    super(`Database operation '${operation}' failed`, originalError);
    this.name = 'DatabaseError';
  }
}
```

### 6.2 Manejo en UI

```typescript
// En hooks
const [error, setError] = useState<Error | null>(null);

try {
  await tripService.create(data);
} catch (err) {
  if (err instanceof ValidationError) {
    // Mostrar error de validación en el campo específico
  } else if (err instanceof DuplicateError) {
    // Mostrar toast de duplicado
  } else {
    // Error genérico
    setError(err as Error);
  }
}
```

---

## 7. Routing

### 7.1 Estructura de Rutas

```typescript
// src/presentation/routes/routes.ts

export const ROUTES = {
  HOME: '/',
  TRIPS: '/trips',
  TRIP_NEW: '/trips/new',
  TRIP_DETAIL: '/trips/:tripId',
  TRIP_EDIT: '/trips/:tripId/edit',
  PARTICIPANTS: '/trips/:tripId/participants',
  PARTICIPANT_NEW: '/trips/:tripId/participants/new',
  AVAILABILITY: '/trips/:tripId/availability',
  PRODUCTS: '/trips/:tripId/products',
  PRODUCT_NEW: '/trips/:tripId/products/new',
  CONSUMPTIONS: '/trips/:tripId/consumptions',
  SHOPPING_LIST: '/trips/:tripId/shopping',
} as const;

// Helper para generar rutas con parámetros
export const buildRoute = {
  tripDetail: (tripId: string) => `/trips/${tripId}`,
  tripEdit: (tripId: string) => `/trips/${tripId}/edit`,
  participants: (tripId: string) => `/trips/${tripId}/participants`,
  // ... etc
};
```

### 7.2 Router Configuration

```typescript
// src/presentation/routes/AppRouter.tsx

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter basename="/APP-GESTION-VIAJES">
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.TRIPS} element={<TripsPage />} />
        <Route path={ROUTES.TRIP_NEW} element={<TripFormPage />} />
        <Route path={ROUTES.TRIP_DETAIL} element={<TripDetailPage />} />
        {/* Nested routes for trip context */}
        <Route path="/trips/:tripId/*" element={<TripLayout />}>
          <Route path="participants" element={<ParticipantsPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="consumptions" element={<ConsumptionsPage />} />
          <Route path="shopping" element={<ShoppingListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

---

## 8. Consideraciones de Rendimiento

### 8.1 Lazy Loading

```typescript
// Cargar páginas bajo demanda
const TripsPage = lazy(() => import('@/presentation/pages/TripsPage'));
const TripDetailPage = lazy(() => import('@/presentation/pages/TripDetailPage'));
```

### 8.2 Memoization

```typescript
// En componentes con renders costosos
const TripList = memo(({ trips, onSelect }: TripListProps) => {
  // ...
});

// En hooks con cálculos pesados
const totalQuantities = useMemo(() => {
  return consumptions.reduce((acc, c) => acc + c.quantity, 0);
}, [consumptions]);
```

### 8.3 Virtualización (para listas largas)

```typescript
// Usar react-window o similar para listas de +100 items
import { FixedSizeList } from 'react-window';
```

---

## 9. Testing Strategy

### 9.1 Pirámide de Tests

```
        ┌───────────────┐
        │    E2E       │  (Pocos, críticos)
        │   Tests      │
        └───────────────┘
       ┌─────────────────┐
       │  Integration    │  (Servicios + Repos)
       │    Tests        │
       └─────────────────┘
      ┌───────────────────┐
      │    Unit Tests     │  (Entidades, Servicios)
      │                   │
      └───────────────────┘
```

### 9.2 Ejemplos

```typescript
// Unit test de entidad
describe('Trip', () => {
  it('should throw ValidationError when end date is before start date', () => {
    expect(() => Trip.create({
      name: 'Test',
      startDate: new Date('2025-07-20'),
      endDate: new Date('2025-07-15')
    })).toThrow(ValidationError);
  });
});

// Integration test de servicio
describe('TripService', () => {
  let service: TripService;
  let mockRepo: jest.Mocked<ITripRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new TripService(mockRepo);
  });

  it('should create a trip and return it', async () => {
    const dto = { name: 'Beach', startDate: new Date(), endDate: new Date() };
    const result = await service.create(dto);
    expect(result.name).toBe('Beach');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

---

*Documento de arquitectura v1.0 - TripFood Manager*
