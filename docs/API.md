# API Interna - TripFood Manager

## Indice

1. [Introduccion](#1-introduccion)
2. [Interfaces de Repositorios](#2-interfaces-de-repositorios)
3. [DTOs (Data Transfer Objects)](#3-dtos-data-transfer-objects)
4. [Servicios de Aplicacion](#4-servicios-de-aplicacion)
5. [Ejemplos de Uso](#5-ejemplos-de-uso)
6. [Tipos de Dominio](#6-tipos-de-dominio)
7. [Errores](#7-errores)

---

## 1. Introduccion

Esta documentacion describe la API interna de TripFood Manager, incluyendo las interfaces de repositorios, DTOs, y servicios de aplicacion.

### Convenciones

- Todas las operaciones son **asincronas** (devuelven `Promise`)
- Los IDs son **strings UUID v4**
- Las fechas usan el tipo nativo `Date`
- Las entidades son **inmutables** (updates devuelven nuevas instancias)
- Los metodos con prefijo `get` no modifican estado
- Los metodos con prefijo `create/update/delete` modifican estado

---

## 2. Interfaces de Repositorios

### 2.1 IBaseRepository<T>

Interfaz base para todos los repositorios. Define operaciones CRUD genericas.

```typescript
interface IBaseRepository<T> {
  // Lectura
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;

  // Escritura
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;

  // Operaciones en lote
  saveMany(entities: T[]): Promise<T[]>;
  deleteMany(ids: string[]): Promise<void>;
}
```

---

### 2.2 ITripRepository

```typescript
interface ITripRepository extends IBaseRepository<Trip> {
  // Busqueda
  findByName(name: string): Promise<Trip[]>;
  findByDate(date: Date): Promise<Trip[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Trip[]>;

  // Ordenacion
  findAllOrderedByStartDate(): Promise<Trip[]>;

  // Estado
  findActive(): Promise<Trip[]>;     // Viajes en curso
  findUpcoming(): Promise<Trip[]>;   // Viajes futuros
  findPast(): Promise<Trip[]>;       // Viajes pasados

  // Validacion
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  // Update parcial
  partialUpdate(id: string, updates: ITripUpdateDTO): Promise<Trip | null>;

  // Filtros complejos
  findWithFilters(filters: ITripQueryFilters): Promise<Trip[]>;
}

interface ITripQueryFilters {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'active' | 'upcoming' | 'past' | 'all';
}
```

---

### 2.3 IParticipantRepository

```typescript
interface IParticipantRepository extends IBaseRepository<Participant> {
  // Por viaje
  findByTripId(tripId: string): Promise<Participant[]>;
  countByTripId(tripId: string): Promise<number>;
  deleteByTripId(tripId: string): Promise<number>;

  // Busqueda
  findByName(name: string): Promise<Participant[]>;
  findByEmail(email: string): Promise<Participant[]>;
  findByTripIdAndName(tripId: string, name: string): Promise<Participant | null>;
}
```

---

### 2.4 IProductRepository

```typescript
interface IProductRepository extends IBaseRepository<Product> {
  // Por categoria/tipo
  findByCategory(category: ProductCategory): Promise<Product[]>;
  findByType(type: ProductType): Promise<Product[]>;

  // Busqueda
  findByName(name: string): Promise<Product[]>;

  // Conteo
  countByCategory(category: ProductCategory): Promise<number>;
}
```

---

### 2.5 IConsumptionRepository

```typescript
interface IConsumptionRepository extends IBaseRepository<Consumption> {
  // Por entidad relacionada
  findByTripId(tripId: string): Promise<Consumption[]>;
  findByParticipantId(participantId: string): Promise<Consumption[]>;
  findByProductId(productId: string): Promise<Consumption[]>;

  // Filtros compuestos
  findByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]>;
  findByTripIdAndMeal(tripId: string, meal: MealType): Promise<Consumption[]>;
  findByParticipantIdAndDate(participantId: string, date: Date): Promise<Consumption[]>;

  // Eliminacion en cascada
  deleteByTripId(tripId: string): Promise<number>;
  deleteByParticipantId(participantId: string): Promise<number>;
  deleteByProductId(productId: string): Promise<number>;

  // Conteo
  countByTripId(tripId: string): Promise<number>;
}
```

---

### 2.6 IAvailabilityRepository

```typescript
interface IAvailabilityRepository extends IBaseRepository<Availability> {
  // Por entidad relacionada
  findByParticipantId(participantId: string): Promise<Availability[]>;
  findByTripId(tripId: string): Promise<Availability[]>;

  // Filtros compuestos
  findByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]>;
  findByParticipantIdAndDate(participantId: string, date: Date): Promise<Availability | null>;
  findByParticipantIdAndTripId(participantId: string, tripId: string): Promise<Availability[]>;

  // Upsert (crear o actualizar)
  upsert(availability: Availability): Promise<Availability>;

  // Eliminacion en cascada
  deleteByTripId(tripId: string): Promise<number>;
  deleteByParticipantId(participantId: string): Promise<number>;
}
```

---

## 3. DTOs (Data Transfer Objects)

### 3.1 Trip DTOs

#### CreateTripDTO
```typescript
interface CreateTripDTO {
  readonly name: string;                    // Requerido, 3-100 chars
  readonly description?: string;            // Opcional, max 500 chars
  readonly startDate: Date;                 // Requerido
  readonly endDate: Date;                   // Requerido, >= startDate
}
```

#### UpdateTripDTO
```typescript
interface UpdateTripDTO {
  readonly name?: string;
  readonly description?: string | null;     // null para eliminar
  readonly startDate?: Date;
  readonly endDate?: Date;
}
```

#### TripResponseDTO
```typescript
interface TripResponseDTO {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly durationDays: number;            // Calculado
  readonly participantCount: number;        // Calculado
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

#### TripDetailResponseDTO
```typescript
interface TripDetailResponseDTO extends TripResponseDTO {
  readonly participants: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
  readonly productCount: number;
  readonly consumptionCount: number;
}
```

---

### 3.2 Participant DTOs

#### CreateParticipantDTO
```typescript
interface CreateParticipantDTO {
  readonly tripId: string;                  // Requerido
  readonly name: string;                    // Requerido, 2-100 chars
  readonly email?: string;                  // Opcional, formato email
  readonly notes?: string;                  // Opcional, max 500 chars
}
```

#### UpdateParticipantDTO
```typescript
interface UpdateParticipantDTO {
  readonly name?: string;
  readonly email?: string | null;
  readonly notes?: string | null;
}
```

#### ParticipantResponseDTO
```typescript
interface ParticipantResponseDTO {
  readonly id: string;
  readonly tripId: string;
  readonly name: string;
  readonly email?: string;
  readonly notes?: string;
  readonly dietaryRestrictions: ReadonlyArray<string>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

#### ParticipantWithAvailabilityDTO
```typescript
interface ParticipantWithAvailabilityDTO extends ParticipantResponseDTO {
  readonly availableDates: ReadonlyArray<Date>;
  readonly availabilityPercentage: number;
}
```

---

### 3.3 Product DTOs

#### CreateProductDTO
```typescript
interface CreateProductDTO {
  readonly name: string;                    // Requerido, 2-100 chars
  readonly category: ProductCategory;       // Requerido: 'food' | 'beverage' | 'other'
  readonly type: ProductType;               // Requerido: ver tipos abajo
  readonly unit: ProductUnit;               // Requerido: ver unidades abajo
  readonly defaultQuantityPerPerson?: number; // Opcional, 0.01-1000
  readonly notes?: string;                  // Opcional, max 500 chars
}
```

#### UpdateProductDTO
```typescript
interface UpdateProductDTO {
  readonly name?: string;
  readonly category?: ProductCategory;
  readonly type?: ProductType;
  readonly unit?: ProductUnit;
  readonly defaultQuantityPerPerson?: number | null;
  readonly notes?: string | null;
}
```

#### ProductResponseDTO
```typescript
interface ProductResponseDTO {
  readonly id: string;
  readonly tripId: string;                  // Vacio (productos son globales)
  readonly name: string;
  readonly category: ProductCategory;
  readonly unit: ProductUnit;
  readonly defaultQuantityPerPerson: number;
  readonly notes?: string;
  readonly isEssential: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

---

### 3.4 Availability DTOs

#### CreateAvailabilityDTO
```typescript
interface CreateAvailabilityDTO {
  readonly participantId: string;           // Requerido
  readonly tripId: string;                  // Requerido
  readonly date: Date;                      // Requerido
  readonly meals: ReadonlyArray<MealType>;  // Requerido: array de meals
}
```

#### UpdateAvailabilityDTO
```typescript
interface UpdateAvailabilityDTO {
  readonly date?: Date;
  readonly meals?: ReadonlyArray<MealType>;
}
```

#### AvailabilityResponseDTO
```typescript
interface AvailabilityResponseDTO {
  readonly id: string;
  readonly participantId: string;
  readonly tripId: string;
  readonly date: Date;
  readonly meals: ReadonlyArray<MealType>;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}
```

---

### 3.5 Consumption DTOs

#### CreateConsumptionDTO
```typescript
interface CreateConsumptionDTO {
  readonly tripId: string;                  // Requerido
  readonly participantId: string;           // Requerido
  readonly productId: string;               // Requerido
  readonly date: Date;                      // Requerido
  readonly meal: MealType;                  // Requerido
  readonly quantity: number;                // Requerido, 0.01-10000
}
```

#### UpdateConsumptionDTO
```typescript
interface UpdateConsumptionDTO {
  readonly participantId?: string;
  readonly productId?: string;
  readonly date?: Date;
  readonly meal?: MealType;
  readonly quantity?: number;
  readonly notes?: string | null;
}
```

---

### 3.6 Shopping DTOs

#### ShoppingListDTO
```typescript
interface ShoppingListDTO {
  readonly tripId: string;
  readonly tripName: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly totalDays: number;
  readonly participantCount: number;
  readonly items: ReadonlyArray<ShoppingListItemDTO>;
  readonly byCategory: ReadonlyArray<ShoppingListByCategoryDTO>;
  readonly totalItems: number;
  readonly totalEstimatedCost: number;
  readonly essentialItemsCount: number;
  readonly optionalItemsCount: number;
  readonly generatedAt: Date;
}
```

#### ShoppingListItemDTO
```typescript
interface ShoppingListItemDTO {
  readonly productId: string;
  readonly productName: string;
  readonly category: ProductCategory;
  readonly totalQuantity: number;
  readonly unit: ProductUnit;
  readonly isEssential: boolean;
  readonly notes?: string;
  readonly estimatedUnitPrice?: number;
  readonly totalEstimatedCost?: number;
  readonly byDate: ReadonlyArray<QuantityByDateDTO>;
}
```

#### ShoppingListByCategoryDTO
```typescript
interface ShoppingListByCategoryDTO {
  readonly category: ProductCategory;
  readonly categoryDisplayName: string;
  readonly items: ReadonlyArray<ShoppingListItemDTO>;
  readonly categoryTotalCost: number;
  readonly itemCount: number;
}
```

#### GenerateShoppingListOptionsDTO
```typescript
interface GenerateShoppingListOptionsDTO {
  readonly essentialOnly?: boolean;         // Solo productos esenciales
  readonly categories?: ProductCategory[];  // Filtrar por categorias
  readonly groupByCategory?: boolean;       // Agrupar resultado
  readonly quantityMultiplier?: number;     // Multiplicador (ej: 1.1 = +10%)
}
```

---

## 4. Servicios de Aplicacion

### 4.1 TripService

```typescript
class TripService {
  constructor(
    tripRepository: ITripRepository,
    participantRepository?: IParticipantRepository,
    consumptionRepository?: IConsumptionRepository,
    availabilityRepository?: IAvailabilityRepository
  );

  // CRUD
  create(dto: CreateTripDTO): Promise<Trip>;
  getById(id: string): Promise<Trip | null>;
  getTripById(id: string): Promise<Trip>;           // Throws NotFoundError
  getAll(): Promise<Trip[]>;
  getAllTrips(): Promise<Trip[]>;
  getAllTripsOrderedByStartDate(): Promise<Trip[]>;
  getAllAsResponseDTO(): Promise<TripResponseDTO[]>;
  update(id: string, dto: UpdateTripDTO): Promise<Trip>;
  delete(id: string, force?: boolean): Promise<void>;

  // Busqueda
  searchByName(name: string): Promise<Trip[]>;
  findTripsByDate(date: Date): Promise<Trip[]>;
  findTripsByDateRange(startDate: Date, endDate: Date): Promise<Trip[]>;

  // Detalles
  getDetails(id: string): Promise<TripDetailResponseDTO>;

  // Utilidades
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
}
```

---

### 4.2 ParticipantService

```typescript
class ParticipantService {
  constructor(
    participantRepository: IParticipantRepository,
    tripRepository: ITripRepository,
    consumptionRepository?: IConsumptionRepository,
    availabilityRepository?: IAvailabilityRepository
  );

  // CRUD
  create(dto: CreateParticipantDTO): Promise<Participant>;
  getById(id: string): Promise<Participant | null>;
  getParticipantById(id: string): Promise<Participant>;  // Throws NotFoundError
  getByTripId(tripId: string): Promise<Participant[]>;
  getParticipantsByTripId(tripId: string): Promise<Participant[]>;
  update(id: string, dto: UpdateParticipantDTO): Promise<Participant>;
  delete(id: string, force?: boolean): Promise<void>;

  // Con disponibilidad
  getParticipantsWithAvailability(tripId: string): Promise<ParticipantWithAvailabilityDTO[]>;

  // Busqueda
  searchByName(name: string): Promise<Participant[]>;
  searchByEmail(email: string): Promise<Participant[]>;

  // Operaciones de viaje
  deleteByTripId(tripId: string): Promise<number>;
  countByTripId(tripId: string): Promise<number>;

  // Utilidades
  exists(id: string): Promise<boolean>;
}
```

---

### 4.3 ProductService

```typescript
class ProductService {
  constructor(
    productRepository: IProductRepository,
    consumptionRepository?: IConsumptionRepository
  );

  // CRUD
  create(dto: CreateProductDTO): Promise<Product>;
  getById(id: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product>;      // Throws NotFoundError
  getAll(): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  update(id: string, dto: UpdateProductDTO): Promise<Product>;
  delete(id: string, force?: boolean): Promise<void>;

  // Filtrado
  getFiltered(filters: ProductFilterOptions): Promise<Product[]>;
  getByCategory(category: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getByType(type: string): Promise<Product[]>;
  getProductsByType(type: string): Promise<Product[]>;
  getGroupedByCategory(): Promise<Map<ProductCategory, Product[]>>;

  // Con consumo
  getProductsWithConsumption(tripId: string): Promise<ProductWithConsumptionDTO[]>;

  // Busqueda
  searchByName(name: string): Promise<Product[]>;

  // Utilidades
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
}

interface ProductFilterOptions {
  category?: ProductCategory;
  type?: ProductType;
  name?: string;
  hasDefaultQuantity?: boolean;
}
```

---

### 4.4 AvailabilityService

```typescript
class AvailabilityService {
  constructor(
    availabilityRepository: IAvailabilityRepository,
    participantRepository: IParticipantRepository
  );

  // CRUD
  setAvailability(dto: CreateAvailabilityDTO): Promise<Availability>;
  getById(id: string): Promise<Availability | null>;
  update(id: string, dto: UpdateAvailabilityDTO): Promise<Availability>;
  delete(id: string): Promise<void>;

  // Por participante
  getByParticipantId(participantId: string): Promise<Availability[]>;

  // Por viaje
  getByTripId(tripId: string): Promise<Availability[]>;
  getByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]>;

  // Operaciones en lote
  bulkSetAvailability(dtos: CreateAvailabilityDTO[]): Promise<Availability[]>;

  // Cascada
  deleteByParticipantId(participantId: string): Promise<number>;
  deleteByTripId(tripId: string): Promise<number>;
}
```

---

### 4.5 ConsumptionService

```typescript
class ConsumptionService {
  constructor(
    consumptionRepository: IConsumptionRepository,
    participantRepository: IParticipantRepository,
    productRepository: IProductRepository
  );

  // CRUD
  create(dto: CreateConsumptionDTO): Promise<Consumption>;
  getById(id: string): Promise<Consumption | null>;
  update(id: string, dto: UpdateConsumptionDTO): Promise<Consumption>;
  delete(id: string): Promise<void>;

  // Por entidad
  getByTripId(tripId: string): Promise<Consumption[]>;
  getByParticipantId(participantId: string): Promise<Consumption[]>;
  getByProductId(productId: string): Promise<Consumption[]>;

  // Filtros
  getByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]>;
  getByTripIdAndMeal(tripId: string, meal: MealType): Promise<Consumption[]>;

  // Cascada
  deleteByTripId(tripId: string): Promise<number>;
  deleteByParticipantId(participantId: string): Promise<number>;

  // Conteo
  countByTripId(tripId: string): Promise<number>;
}
```

---

### 4.6 ShoppingService

```typescript
class ShoppingService {
  constructor(
    consumptionRepository: IConsumptionRepository,
    productRepository: IProductRepository,
    availabilityRepository: IAvailabilityRepository,
    tripRepository?: ITripRepository,
    participantRepository?: IParticipantRepository
  );

  // Generacion de lista
  generate(tripId: string, options?: GenerateShoppingListOptionsDTO): Promise<ShoppingListDTO>;
  getShoppingList(tripId: string): Promise<ShoppingListDTO>;
  generateShoppingList(tripId: string): Promise<ShoppingList>;  // Legacy
  getShoppingListByCategory(tripId: string): Promise<ShoppingListByCategoryDTO[]>;

  // Exportacion
  exportToCSV(tripId: string, options?: CSVExportOptions): Promise<string>;
  exportToJSON(tripId: string, options?: { prettyPrint?: boolean }): Promise<string>;

  // Analisis
  getConsumptionSummaryByProduct(tripId: string): Promise<ProductConsumptionSummary[]>;
  calculateEstimatedQuantities(tripId: string, date: Date): Promise<Map<string, number>>;
  calculateTotalEstimatedQuantities(tripId: string): Promise<Map<string, number>>;
  getConsumptionVariance(tripId: string): Promise<ConsumptionVariance[]>;
  getShoppingSuggestions(tripId: string): Promise<ShoppingSuggestion[]>;
  getLowStockProducts(tripId: string, threshold?: number): Promise<LowStockProduct[]>;
  getShoppingListSummary(tripId: string): Promise<ShoppingListSummary>;
}

interface CSVExportOptions {
  includeDailyBreakdown?: boolean;
  includeNotes?: boolean;
  sortByCategory?: boolean;
  includeHeader?: boolean;
}
```

---

## 5. Ejemplos de Uso

### 5.1 Crear un Viaje con Participantes

```typescript
import { tripService, participantService } from '@shared/di/container';

// Crear viaje
const trip = await tripService.create({
  name: 'Vacaciones Playa 2024',
  description: 'Viaje anual con amigos',
  startDate: new Date('2024-07-15'),
  endDate: new Date('2024-07-22'),
});

console.log(`Viaje creado: ${trip.id}`);

// Añadir participantes
const participantes = [
  { name: 'Maria Garcia', email: 'maria@email.com' },
  { name: 'Juan Perez', email: 'juan@email.com' },
  { name: 'Ana Lopez', notes: 'Vegetariana' },
];

for (const p of participantes) {
  await participantService.create({
    tripId: trip.id,
    ...p,
  });
}

console.log(`Participantes añadidos: ${participantes.length}`);
```

### 5.2 Configurar Disponibilidad

```typescript
import { availabilityService, participantService } from '@shared/di/container';

const tripId = 'trip-123';
const participants = await participantService.getByTripId(tripId);

// Configurar disponibilidad para todos los participantes
for (const participant of participants) {
  // Maria estara todos los dias completos
  await availabilityService.setAvailability({
    participantId: participant.id,
    tripId,
    date: new Date('2024-07-15'),
    meals: ['breakfast', 'lunch', 'dinner'],
  });

  // Juan llega el segundo dia
  if (participant.name !== 'Juan Perez') {
    await availabilityService.setAvailability({
      participantId: participant.id,
      tripId,
      date: new Date('2024-07-16'),
      meals: ['breakfast', 'lunch', 'dinner'],
    });
  }
}
```

### 5.3 Generar Lista de Compras

```typescript
import { shoppingService } from '@shared/di/container';

// Generar lista con 10% de margen
const shoppingList = await shoppingService.generate('trip-123', {
  quantityMultiplier: 1.1,
  groupByCategory: true,
});

console.log(`Total productos: ${shoppingList.totalItems}`);
console.log(`Participantes: ${shoppingList.participantCount}`);

// Mostrar por categoria
for (const category of shoppingList.byCategory) {
  console.log(`\n${category.categoryDisplayName}:`);
  for (const item of category.items) {
    console.log(`  - ${item.productName}: ${item.totalQuantity} ${item.unit}`);
  }
}
```

### 5.4 Exportar a CSV

```typescript
import { shoppingService } from '@shared/di/container';

const csv = await shoppingService.exportToCSV('trip-123', {
  includeDailyBreakdown: true,
  includeNotes: true,
  sortByCategory: true,
});

// Descargar en el navegador
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = 'lista-compras.csv';
link.click();
```

### 5.5 Uso con React Hooks

```typescript
// En un componente React
function TripsPage() {
  const { tripService } = useServices();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    tripService.getAllTripsOrderedByStartDate()
      .then(setTrips)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [tripService]);

  const handleCreate = async (data: CreateTripDTO) => {
    try {
      const newTrip = await tripService.create(data);
      setTrips(prev => [newTrip, ...prev]);
      return { success: true };
    } catch (err) {
      if (err instanceof ValidationError) {
        return { success: false, error: err.message, field: err.field };
      }
      throw err;
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <TripList
      trips={trips}
      onCreate={handleCreate}
    />
  );
}
```

---

## 6. Tipos de Dominio

### 6.1 MealType

```typescript
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_TYPES: ReadonlyArray<MealType> = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_TYPE_DISPLAY_NAMES: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_TYPE_ORDER: Record<MealType, number> = {
  breakfast: 1,
  lunch: 2,
  snack: 3,
  dinner: 4,
};

// Type guard
function isMealType(value: unknown): value is MealType;

// Sort helper
function sortMealsByOrder(meals: MealType[]): MealType[];
```

### 6.2 ProductCategory

```typescript
type ProductCategory = 'food' | 'beverage' | 'other';

const PRODUCT_CATEGORIES: ReadonlyArray<ProductCategory> = ['food', 'beverage', 'other'];

const PRODUCT_CATEGORY_DISPLAY_NAMES: Record<ProductCategory, string> = {
  food: 'Food',
  beverage: 'Beverage',
  other: 'Other',
};

// Type guard
function isProductCategory(value: unknown): value is ProductCategory;
```

### 6.3 ProductType

```typescript
type ProductType =
  // Food
  | 'meat' | 'dairy' | 'vegetables' | 'fruits'
  | 'grains' | 'snacks' | 'condiments' | 'prepared_food'
  // Beverage
  | 'water' | 'soft_drink' | 'alcohol' | 'hot_beverage'
  // Other
  | 'miscellaneous';

const PRODUCT_TYPE_TO_CATEGORY: Record<ProductType, ProductCategory> = {
  meat: 'food',
  dairy: 'food',
  vegetables: 'food',
  fruits: 'food',
  grains: 'food',
  snacks: 'food',
  condiments: 'food',
  prepared_food: 'food',
  water: 'beverage',
  soft_drink: 'beverage',
  alcohol: 'beverage',
  hot_beverage: 'beverage',
  miscellaneous: 'other',
};

// Helpers
function isProductType(value: unknown): value is ProductType;
function getCategoryForType(type: ProductType): ProductCategory;
function getTypesForCategory(category: ProductCategory): ProductType[];
```

### 6.4 ProductUnit

```typescript
type ProductUnit =
  // Weight
  | 'kg' | 'g' | 'lb' | 'oz'
  // Volume
  | 'l' | 'ml' | 'gal'
  // Count
  | 'unit' | 'pack' | 'box' | 'bottle' | 'can' | 'bag'
  // Portions
  | 'serving' | 'portion' | 'slice' | 'piece';

const UNIT_GROUPS: Record<string, ProductUnit[]> = {
  weight: ['kg', 'g', 'lb', 'oz'],
  volume: ['l', 'ml', 'gal'],
  count: ['unit', 'pack', 'box', 'bottle', 'can', 'bag'],
  portion: ['serving', 'portion', 'slice', 'piece'],
};

// Type guard
function isProductUnit(value: unknown): value is ProductUnit;
```

---

## 7. Errores

### 7.1 Jerarquia de Errores

```typescript
// Error base de dominio
class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: DomainErrorCode,
    public readonly details?: Record<string, unknown>
  );
}

// Codigos de error
enum DomainErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  BUSINESS_RULE_ERROR = 'BUSINESS_RULE_ERROR',
}
```

### 7.2 ValidationError

```typescript
class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly constraint?: string
  );

  // Factory methods
  static required(field: string, entity: string): ValidationError;
  static invalidLength(field: string, min?: number, max?: number, actual?: number): ValidationError;
  static invalidFormat(field: string, expectedFormat: string, actualValue?: string): ValidationError;
  static invalidDateRange(startField: string, endField: string): ValidationError;
  static outOfRange(field: string, min?: number, max?: number, actual?: number): ValidationError;
}
```

### 7.3 NotFoundError

```typescript
class NotFoundError extends DomainError {
  constructor(entity: string, identifier: string);

  // Factory methods
  static withId(entity: string, id: string): NotFoundError;
  static withField(entity: string, field: string, value: string): NotFoundError;
}
```

### 7.4 DuplicateError

```typescript
class DuplicateError extends DomainError {
  constructor(entity: string, field: string, value: string);

  // Factory methods
  static withField(entity: string, field: string, value: string): DuplicateError;
}
```

### 7.5 Errores de Infraestructura

```typescript
class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  );
}

class DatabaseError extends InfrastructureError {
  constructor(operation: string, originalError?: Error);
}
```

### 7.6 Manejo de Errores

```typescript
try {
  const trip = await tripService.create({
    name: '',  // Invalido
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-10'),  // Antes de inicio
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Error de validacion en ${error.field}: ${error.message}`);
    // Mostrar en UI
  } else if (error instanceof NotFoundError) {
    console.error(`No encontrado: ${error.message}`);
    // Redirigir a 404
  } else if (error instanceof DuplicateError) {
    console.error(`Duplicado: ${error.message}`);
    // Mostrar mensaje
  } else if (error instanceof DatabaseError) {
    console.error(`Error de base de datos: ${error.message}`);
    // Mostrar error generico
  } else {
    throw error;  // Error inesperado
  }
}
```

---

*Documentacion de API v1.0 - TripFood Manager*
