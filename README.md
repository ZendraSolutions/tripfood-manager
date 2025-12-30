# TripFood Manager

Sistema de gestión de compras de comida y bebida para viajes de grupo.

## Descripci�n

MVP funcional para organizar las compras de aprovisionamiento en viajes grupales. Permite gestionar participantes, su disponibilidad por d�as y comidas, mantener un cat�logo de productos, y generar listas de compras consolidadas.

## Caracter�sticas

- **Gesti�n de Viajes:** Crear y administrar m�ltiples viajes
- **Participantes:** A�adir participantes y su disponibilidad (d�as/comidas)
- **Cat�logo de Productos:** Comidas y bebidas organizadas por categor�a
- **Consumos:** Asignar productos a participantes
- **Dashboard:** Panel de control con estad�sticas y res�menes
- **Lista de Compras:** Generaci�n autom�tica de lista consolidada
- **Exportaci�n:** Exportar datos a CSV

## Tecnolog�as

- **Frontend:** React 18 + TypeScript
- **Bundler:** Vite
- **Estilos:** CSS Modules
- **Persistencia:** IndexedDB (Dexie.js)
- **Despliegue:** GitHub Pages

## Arquitectura

El proyecto sigue una arquitectura hexagonal adaptada con 4 capas:

```
src/
├── domain/          # Entidades, interfaces, tipos
├── application/     # Servicios y casos de uso
├── infrastructure/  # Repositorios e implementaciones
└── presentation/    # Componentes React, hooks, pages
```

Ver [ARCHITECTURE.md](./docs/ARCHITECTURE.md) para detalles completos.

## Inicio R�pido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producci�n
npm run build

# Preview del build
npm run preview
```

## Comandos Disponibles

| Comando | Descripci�n |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producci�n |
| `npm run preview` | Preview local del build |
| `npm run lint` | Ejecutar ESLint |
| `npm run type-check` | Verificar tipos |
| `npm run deploy` | Desplegar a GitHub Pages |

## Documentaci�n

- [RPD - Requisitos del Producto](./docs/RPD.md)
- [Arquitectura](./docs/ARCHITECTURE.md)
- [Gu�a de Contribuci�n](./docs/CONTRIBUTING.md)

## Estructura del Proyecto

```
tripfood-manager/
├── docs/                # Documentaci�n
├── src/
│   ├── domain/          # Capa de dominio
│   ├── application/     # Capa de aplicaci�n
│   ├── infrastructure/  # Capa de infraestructura
│   ├── presentation/    # Capa de presentaci�n
│   └── shared/          # Utilidades compartidas
├── public/              # Archivos est�ticos
└── tests/               # Tests
```

## Licencia

MIT

---

Desarrollado con metodolog�a de orquestaci�n de agentes especializados.
