# CLAUDE.md - Centro de Comando del Proyecto

## Proyecto: TripFood Manager - Sistema de Gestión de Compras para Viajes

**Valor del Contrato:** $10,000 USD
**Estándar de Calidad:** Enterprise Grade
**Metodología:** Orquestación por Agentes Especializados Senior

---

## 1. CONTEXTO DEL PROYECTO

### 1.1 Descripción
Sistema web MVP para gestionar compras de comida y bebida en viajes de grupo. Desplegable en GitHub Pages con persistencia en IndexedDB.

### 1.2 Documentación Clave
- **RPD Completo:** `docs/RPD.md`
- **Arquitectura:** `docs/ARCHITECTURE.md`
- **API Interna:** `docs/API.md`
- **Guía de Contribución:** `docs/CONTRIBUTING.md`

---

## 2. ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTACIÓN                             │
│                    (React + TypeScript)                          │
│   Pages → Components → Hooks → Context                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         APLICACIÓN                               │
│              (Services + Use Cases + DTOs)                       │
│   TripService │ ParticipantService │ ProductService │ etc        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DOMINIO                                 │
│              (Entities + Interfaces + Types)                     │
│   Trip │ Participant │ Product │ Consumption                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       INFRAESTRUCTURA                            │
│             (Repositories + Adapters + DB)                       │
│   IndexedDB (Dexie) │ LocalStorage │ Exporters                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. SISTEMA DE AGENTES ESPECIALIZADOS

### 3.1 Protocolo de Orquestación

**ROL DEL ORQUESTADOR (Claude Principal):**
- NO escribe código directamente
- Coordina y asigna tareas a agentes especializados
- Revisa y valida entregables de cada agente
- Mantiene coherencia arquitectónica global
- Documenta decisiones y progreso

### 3.2 Catálogo de Agentes Senior

| Agente | Especialidad | Responsabilidades |
|--------|--------------|-------------------|
| **ARCH-001** | Arquitecto de Software | Estructura, patrones, decisiones técnicas |
| **DOM-001** | Especialista de Dominio | Entidades, interfaces, reglas de negocio |
| **INFRA-001** | Ingeniero de Infraestructura | Repositorios, persistencia, adaptadores |
| **UI-001** | Ingeniero Frontend Senior | Componentes React, hooks, context |
| **UX-001** | Especialista UX/UI | Diseño de interfaces, experiencia usuario |
| **QA-001** | Ingeniero de Calidad | Tests, validación, code review |
| **DOC-001** | Documentalista Técnico | Documentación, API docs, guías |
| **SEC-001** | Especialista en Seguridad | Validación de seguridad, sanitización |

### 3.3 Protocolo de Comunicación con Agentes

```markdown
## PROMPT TEMPLATE PARA AGENTES

### CONTEXTO DE PROYECTO
[Proporcionar contexto relevante del RPD]

### ROL ASIGNADO
Eres {AGENT_ID} - {ESPECIALIDAD}.
Nivel: Senior (10+ años experiencia).
Estándar: Enterprise Grade ($10K proyecto).

### PRINCIPIOS OBLIGATORIOS
1. Código TypeScript estricto (strict mode)
2. Principios SOLID en cada decisión
3. Documentación inline completa (JSDoc)
4. Manejo de errores exhaustivo
5. Tipos explícitos (nunca `any`)
6. Nombrado descriptivo en inglés
7. Tests unitarios cuando aplique

### TAREA ESPECÍFICA
[Descripción detallada de la tarea]

### ENTREGABLES ESPERADOS
[Lista de archivos/código a producir]

### CRITERIOS DE ACEPTACIÓN
[Condiciones que debe cumplir]
```

---

## 4. ESTÁNDARES DE CÓDIGO

### 4.1 Convenciones de Nombrado
```typescript
// Interfaces: Prefijo 'I'
interface ITrip { ... }
interface ITripRepository { ... }

// Types: PascalCase descriptivo
type MealType = 'breakfast' | 'lunch' | 'dinner';
type ProductCategory = 'bebida' | 'comida';

// Clases/Servicios: PascalCase
class TripService { ... }
class IndexedDBTripRepository { ... }

// Funciones/Métodos: camelCase verbales
function createTrip() { ... }
function getParticipantsByTrip() { ... }

// Constantes: UPPER_SNAKE_CASE
const MAX_PARTICIPANTS = 50;
const DEFAULT_MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];

// Archivos: kebab-case o PascalCase para componentes
trip-service.ts / TripService.ts
TripCard.tsx
use-trips.ts
```

### 4.2 Estructura de Archivos por Capa

```
src/
├── domain/
│   ├── entities/           # Clases de entidad puras
│   ├── interfaces/         # Contratos (repos, services)
│   ├── types/              # Tipos y enums
│   └── errors/             # Errores de dominio custom
│
├── application/
│   ├── services/           # Lógica de negocio
│   ├── use-cases/          # Casos de uso específicos
│   ├── dtos/               # Data Transfer Objects
│   └── mappers/            # Conversión entidad ↔ DTO
│
├── infrastructure/
│   ├── persistence/        # Implementaciones de repos
│   │   ├── indexeddb/
│   │   └── memory/         # Para tests
│   ├── adapters/           # Adaptadores externos
│   └── config/             # Configuración de infra
│
├── presentation/
│   ├── components/         # Componentes React
│   ├── pages/              # Vistas/Páginas
│   ├── hooks/              # Custom hooks
│   ├── context/            # Providers de estado
│   ├── styles/             # CSS/Estilos
│   └── utils/              # Utilidades de UI
│
└── shared/
    ├── utils/              # Utilidades compartidas
    └── constants/          # Constantes globales
```

### 4.3 Patrones Obligatorios

**Repository Pattern:**
```typescript
// Interface en domain/
interface ITripRepository {
  findById(id: string): Promise<Trip | null>;
  findAll(): Promise<Trip[]>;
  save(trip: Trip): Promise<Trip>;
  delete(id: string): Promise<void>;
}

// Implementación en infrastructure/
class IndexedDBTripRepository implements ITripRepository {
  // Implementación concreta
}
```

**Service Pattern:**
```typescript
// Servicios inyectan repositorios via constructor
class TripService {
  constructor(private readonly tripRepository: ITripRepository) {}

  async createTrip(data: CreateTripDTO): Promise<Trip> {
    // Lógica de negocio aquí
  }
}
```

**Dependency Injection:**
```typescript
// Contenedor de dependencias
const tripRepository = new IndexedDBTripRepository(db);
const tripService = new TripService(tripRepository);
```

---

## 5. GESTIÓN DE ESTADO

### 5.1 Estructura de Context
```typescript
// Cada dominio tiene su propio context
TripContext      → Gestión de viajes
ParticipantContext → Gestión de participantes
ProductContext   → Gestión de productos
UIContext        → Estado de UI (modales, loading, etc.)
```

### 5.2 Patrón de Hooks
```typescript
// Hook encapsula lógica de acceso al context
function useTrips() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrips must be within TripProvider');
  return context;
}
```

---

## 6. COMANDOS DEL PROYECTO

```bash
# Desarrollo
npm run dev          # Iniciar servidor desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build

# Calidad
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
npm run test         # Ejecutar tests

# Despliegue
npm run deploy       # Deploy a GitHub Pages
```

---

## 7. CHECKLIST DE VALIDACIÓN POR ENTREGABLE

### Para cada archivo de código:
- [ ] TypeScript strict sin errores
- [ ] Sin uso de `any`
- [ ] JSDoc completo en funciones públicas
- [ ] Manejo de errores apropiado
- [ ] Sigue convenciones de nombrado
- [ ] Principios SOLID aplicados
- [ ] No hay código duplicado
- [ ] Imports organizados

### Para cada componente React:
- [ ] Props tipadas con interface
- [ ] Manejo de estados de carga/error
- [ ] Sin lógica de negocio (solo presentación)
- [ ] Accesibilidad básica (aria labels)
- [ ] Responsive considerado

### Para cada servicio:
- [ ] Inyección de dependencias
- [ ] Métodos con responsabilidad única
- [ ] Errores específicos del dominio
- [ ] Documentación de parámetros/retorno

---

## 8. FLUJO DE TRABAJO DE AGENTES

```
┌─────────────────┐
│   ORQUESTADOR   │ ← Coordina todo
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   ARCH-001      │────▶│    DOM-001      │
│  (Arquitectura) │     │    (Dominio)    │
└─────────────────┘     └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   INFRA-001     │     │    UI-001       │     │    UX-001       │
│(Infraestructura)│     │   (Frontend)    │     │   (Diseño)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │    QA-001       │
                        │   (Calidad)     │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   DOC-001       │
                        │(Documentación)  │
                        └─────────────────┘
```

---

## 9. REGISTRO DE DECISIONES ARQUITECTÓNICAS (ADR)

### ADR-001: Uso de IndexedDB sobre LocalStorage
**Estado:** Aprobado
**Contexto:** Necesidad de persistencia en cliente para GitHub Pages
**Decisión:** IndexedDB con Dexie.js
**Razón:** Mayor capacidad, soporte para queries complejas, mejor rendimiento

### ADR-002: React con Context sobre Redux
**Estado:** Aprobado
**Contexto:** Gestión de estado en MVP
**Decisión:** Context API + useReducer
**Razón:** Menor complejidad para MVP, suficiente para el scope actual

### ADR-003: Arquitectura Hexagonal Adaptada
**Estado:** Aprobado
**Contexto:** Necesidad de código mantenible y testeable
**Decisión:** 4 capas (Domain, Application, Infrastructure, Presentation)
**Razón:** Separación clara de responsabilidades, facilita testing y cambios

---

## 10. NOTAS PARA EL ORQUESTADOR

1. **Antes de asignar tarea:** Verificar que el agente tiene todo el contexto necesario
2. **Durante ejecución:** Monitorear que sigue los estándares definidos
3. **Post-entrega:** Validar contra checklist antes de integrar
4. **Conflictos:** El orquestador tiene la última palabra en decisiones técnicas
5. **Documentación:** Todo cambio significativo debe documentarse

---

*Este documento es la fuente de verdad para el proyecto. Actualizar conforme evolucione.*
