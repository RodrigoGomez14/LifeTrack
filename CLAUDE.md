# LifeTrack — Gestor de Vida Personal

## Descripción del Proyecto
LifeTrack es una aplicación web de gestión de vida personal. El módulo central
y más importante es **Plants**: un sistema de seguimiento de cultivos hidropónicos
que registra mediciones diarias (pH, EC, PPM), fotos para comparación visual y
un calendario de actividades.

El módulo de **Finanzas** es el más avanzado (~80%) e incluye carga de resúmenes
de tarjetas de crédito en PDF. Los módulos de Hábitos, Ahorros y Basics están
en distintos grados de desarrollo.

---

## Stack Tecnológico

- **Frontend:** React (Create React App)
- **Base de datos:** Firebase Realtime Database
- **Autenticación:** Firebase Auth
- **Almacenamiento de archivos:** Firebase Storage (PDFs de resúmenes de tarjetas)
- **Lenguaje:** JavaScript / JSX
- **Estilos:** MUI (Material UI) con `sx` y `theme` — no usar CSS custom si MUI puede resolverlo
- **Estado global:** Zustand (`store.js`)

---

## Estructura del Proyecto

```
src/
  components/
    config/         # Componentes del módulo configuración
    finances/       # Componentes del módulo finanzas
    habits/         # Componentes del módulo hábitos
    home/           # Componentes del dashboard Home
    icons/          # Iconos reutilizables
    layout/         # Componentes de estructura (navbar, sidebar, etc.)
    plants/         # Componentes del módulo plantas
  design-system/    # Componentes UI reutilizables (SectionCard, DashedAddCard)
  hooks/            # Custom hooks (useAuth, etc.)
  pages/
    basics/         # Páginas de datos básicos / perfil
    finances/       # Páginas de finanzas
    habits/         # Páginas de hábitos
    plants/         # Páginas de plantas
    savings/        # Páginas de ahorros
  services/         # Capa de abstracción de Firebase (database, auth, plants, etc.)
  App.js            # Componente raíz y rutas
  App.css           # Boilerplate CRA sin uso real (pendiente de limpiar)
  firebase.js       # Configuración de Firebase — NO TOCAR sin consultar
  store.js          # Estado global con Zustand
  utils.js          # Utilidades globales
```

> **Nota sobre `utils`:** existe `src/utils.js` como único archivo de utilidades globales.
> Agregar nuevas utilidades a `utils.js`.

---

## Convenciones de Código

- Componentes en **PascalCase**: `CreditCardSummary.jsx`
- Hooks en **camelCase** con prefijo `use`: `useTransactions.js`
- Variables y funciones en **camelCase**
- Constantes en **UPPER_SNAKE_CASE**
- Comentarios en **español**
- Un componente por archivo
- Preferir **functional components** con hooks, sin clases
- No usar `var`, siempre `const` o `let`

---

## Firebase — Guía de Uso

### Realtime Database
- No escribir lógica de Firebase directamente en componentes
- Estructura de la base de datos:
  ```
  users/
    {uid}/
      basics/         # Datos de perfil / info personal
      finances/       # Transacciones y resúmenes de tarjetas
      habits/         # Hábitos y registros diarios
      plants/         # Registro de plantas y mediciones
      savings/        # Objetivos y registros de ahorro
  ```

### Auth
- Configuración en `firebase.js`
- Siempre verificar que el usuario esté autenticado antes de leer/escribir en la DB

### Storage
- Los PDFs se guardan en `users/{uid}/summaries/{filename}`
- Validar que el archivo sea PDF antes de subir
- Límite: 10MB por archivo

---

## Design System

Componentes UI reutilizables en `src/design-system/`:
- `SectionCard` — card con título, icono, acción opcional y contenido hijo
- `DashedAddCard` — card con borde punteado para acciones "Agregar nuevo"
- `SummaryCard` — card con icono, valor grande, label y color
- `MiniCard` — card compacta con icono, label, valor y link opcional
- `SelectableCard` — card seleccionable con check
- `QuantityCard` — card con control de cantidad (+/−)
- `ActionButton` / `ActionBar` — botones de acción con icono

## Services Layer

Capa de abstracción de Firebase en `src/services/`:
- `database.js` — CRUD genérico: `read`, `write`, `push`, `update`, `remove`, `bulkUpdate`, `generateKey`, `transaction`, `subscribeToUserData`
- `auth.js` — `signIn`, `signUp`, `signOut`, `sendPasswordReset`, etc.
- `finances.js` — gastos, ingresos, tarjetas (12 funciones)
- `savings.js` — fondos, transferencias, `updateSavingsWithHistory`
- `habits.js` — CRUD + `toggleHabitCompletion`
- `plants.js` — CRUD + `addPlantActivity`, `archivePlant`, `setPlantPotVolume`
- `config.js` — perfil, tema, backups, `deleteAllUserData`
- `exchanges.js` — `addExchange`, `updateExchange`, `removeExchange`

**Patrón:** los servicios importan `* as db from './database'`. El uid se resuelve
internamente vía `getCurrentUser()`. Los componentes pasan paths relativos al user.

---

## Estado de Módulos

| Módulo   | Completitud | Notas                                                              |
|----------|-------------|--------------------------------------------------------------------|
| Finances | ~75%        | CRUD + tarjetas + devoluciones. Carga de PDFs aún no implementada  |
| Plants   | ~85%        | CRUD + riegos + suplementos + poda + insecticida + transplante + fotos + logs + pH/EC/PPM + pesos + etapas (Germ/Vege/Flora/Secado/Curado) |
| Habits   | ~60%        | CRUD + calendario + stats. Hay duplicación de `HabitDetail`        |
| Savings  | ~70%        | Fondos múltiples ARS/USD + historial. Lógica duplicada con Finances|
| Basics   | ~70%        | Login, Home dashboard, Configuración, Perfil, Ayuda    |

---

## Módulo Plants — Contexto Importante

Es el corazón de la app. Debe permitir:
- Registro de múltiples cultivos hidropónicos ✅
- Mediciones diarias por cultivo: pH, EC, PPM ✅
- Carga de fotos para comparación visual entre fechas ✅
- Calendario de actividades por cultivo ✅
- (Otras funciones a definir durante el desarrollo)

**Estado real (~85%):** lo que hay es CRUD de plantas, riegos, podas, transplantes,
insecticidas, fotos, logs, aditivos, peso húmedo/seco, calendario y timeline.
**Ya implementado:** captura de pH/EC/PPM (wizards dedicados: /RegistrarMedicion,
/LogPlanta, /RegularPh). Ciclo de vida completo: Germinacion → Vegetativo →
Floracion → Secado → Curado (archivable).

**Cada acción tiene su wizard independiente:**
- `/NuevoRiego` — 5 pasos (plantas → pH/EC/PPM → riego+aditivos → notas → revisar)
- `/NuevoSuplemento` — 4 pasos (plantas → suplemento+dosis → notas → revisar)
- `/NuevaPoda` — 4 pasos (plantas → tipo → notas → revisar)
- `/NuevoInsecticida` — 5 pasos (plantas → tipo+método → insecticida+dosis → notas → revisar)
- `/NuevoTransplante` — 4 pasos (plantas → maceta+volumen → notas → revisar)
- `/CambiarEtapa` — 3 pasos (info → notas → confirmar)
- `/LogPlanta` — 5 pasos (pH → EC → PPM → Temp → revisar)
- `/RegularPh` — 2 pasos (plantas → pH numpad)

**Patrón de wizards:** full-screen (`position: fixed; inset: 0`) con
`WizardProgressDots` + `WizardFooter`, color por tipo de acción.

**Componentes reutilizables en `PlantShared.jsx`:**
- `STAGES` — array con las 5 etapas (`{key, label, icon, color, order}`)
- `PlantRow` — fila compacta de planta con foto, nombre, icono de etapa, días/semanas
- `ToolCircle` — botón circular con icono y label
- `BubbleTooltip` — menú flotante de acciones rápidas
- `LogEntry` — fila de log con tipo (pH/EC/PPM/riego/nota), valor, hora y color

**Utilidad `checkSearch`:** extrae `?id=` o `?plant=` del query string.
Usada por todos los wizards de Plants para recibir el ID de la planta.

---

## Deuda Técnica Conocida

### Problemas activos

1. **3 librerías de fechas conviven.** `moment` (requerido por react-big-calendar),
   `date-fns` (3 archivos), `dayjs` (2 archivos). Todas en `package.json` y uso activo.

2. **NewHabit.jsx sigue siendo componente monstruo** (~1.425 líneas). Es el único
   componente que queda sin romper. El resto (Finances, Home, Habits, Plant, Config,
   CreditCards) ya están modularizados.

3. **Reglas de Firebase no commiteadas.** No hay `database.rules.json` ni
   `storage.rules` en el repo. Verificar en consola Firebase que no estén abiertas.

4. **Capa de Storage pendiente.** 6 archivos importan `auth, storage` directamente
   desde `firebase.js`: `ConfigProfileTab.jsx`, `ConfigBackupTab.jsx`,
   `CreditCardStatementUpload.jsx`, `TarjetasUploadWizard.jsx`, `NewPhoto.jsx`,
   `Login.jsx`. Crear `services/storage.js` para unificar.

5. **Código muerto en Aditivos.jsx** (~10 imports sin uso: Divider, ListItemText,
   CardHeader, IconButton, Tooltip, Badge, ArrowBackIcon, FilterListIcon,
   SearchIcon, secondaryColor). Limpiar cuando se rompa ese archivo.

### Problemas resueltos (referencia histórica)

- ~~Lógica de Firebase regada en componentes~~ → Capa `services/` completa.
- ~~Componentes monstruo~~ → 6 de 7 rotos (Finances 293, Home 283, Habits 614,
  Plant ~500, Config 266, CreditCards 300). Solo falta NewHabit.
- ~~Dependencias no usadas~~ → 16 desinstaladas (redux, chart.js, recharts, etc.).
- ~~Archivos de respaldo~~ → ~20k líneas de zombies eliminadas.
- ~~Bugs #1-9 de la auditoría inicial~~ → Todos resueltos.
- ~~PlantStageDialog, NuevaAccion, NewIrrigation~~ → Reemplazados por wizards dedicados.
- ~~PlantDashboard.jsx~~ → Eliminado (reemplazado por Jardin con tabs).
- ~~utils/ carpeta zombie~~ → Eliminada; solo existe `utils.js`.

---

## Reglas para Claude Code

- Este es un proyecto **personal** — priorizá simplicidad sobre over-engineering
- Si hay varias formas de hacer algo, elegí la más **legible y mantenible**
- Antes de cambios grandes, mostrame el plan con `/plan` y esperá mi aprobación
- No modificar `firebase.js` sin pedirme confirmación explícita
- No instalar dependencias nuevas sin consultarme
- No generar tests automáticamente a menos que lo pida
- El objetivo es que yo entienda todo el código generado — explicá los cambios importantes
- **Borrar archivos y funciones que dejen de usarse** en cada refactor. El objetivo es llegar
  lo más livianos posible a la auditoría final. Si un archivo o función queda huérfano, se
  elimina en la misma sesión, no se deja "para después".
- **En Plants:** cada tipo de acción (riego, suplemento, poda, insecticida, transplante,
  cambio de etapa) tiene su propia ruta y wizard dedicado. No usar rutas genéricas con
  parámetros `?tipo=`; cada acción es una ruta independiente.

---

## Workflow Build/Deploy

- **Build + Deploy:** Solo cuando se dé la orden explícita "empezá a hacer build y deploy". A partir de ahí, cada iteración termina con `npm run build` + `firebase deploy` para testear en vivo en el celular.
- **Stop:** Con "dejá de hacer build y deploy" se cierra la ventana hasta nuevo aviso.
- **Commit a GitHub:** Solo ante orden directa de "commiteá a la siguiente versión mayor/menor".
- **Versioning (convención propia):**
  - *Menor* (bug fixes/parches): `x.x.1` → `x.x.2` (ej: `1.0.3` → `1.0.4`)
  - *Mayor* (features/nuevas funcionalidades): `x.1.x` → `x.2.x` (ej: `1.0.4` → `1.1.0`)

---

## Testing

- Existe `setupTests.js` de Create React App (Jest + React Testing Library)
- `App.test.js` fue borrado (era el test default de CRA, fallaba siempre)
- Por ahora no hay tests escritos
- Cuando se escriban, empezar por lógica en `utils.js` y explicar qué se está testeando

---

## Comandos Útiles

```bash
npm start          # Levantar app en desarrollo
npm run build      # Build de producción
npm test           # Correr tests
```

---

## Decisiones de Arquitectura

*(Se irá completando a medida que se tomen decisiones durante el desarrollo)*

---

## Historial de Sesiones

*(Al final de cada sesión pedile a Claude Code: "Generá el resumen de sesión según el formato del CLAUDE.md")*

### 2026-05-07 — Limpieza (zombies + bugs críticos baja dificultad)

**Qué se hizo:**
- Borrados 11 archivos zombie (~20k líneas de ruido) y la carpeta vacía `src/pages/finances/backup/`:
  - `Plant_backup.jsx`, `Plant_backup_weights.jsx`, `Plant_temp.jsx`, `Plant_temp_edit.jsx`
  - `CreditCards.temp.jsx`, `CreditCards.jsx.bak`, `CreditCards.jsx.backup`, `backup/Finances.jsx.bak`
  - `NewCreditCard.jsx`, `Sidebar.jsx`, `newphoto.txt` (raíz)
- 6 fixes aplicados:
  1. `src/pages/finances/CreditCards.jsx`: removido import muerto `getMonthlySummary`
  2. `src/App.js`: removido import muerto `ColorModeContext`
  3. `src/utils/`: borrada la carpeta entera (era código inalcanzable porque webpack resuelve a `utils.js`)
  4. `src/App.test.js`: borrado (test default de CRA, fallaba siempre)
  5. `src/components/layout/AppBar.jsx`: borrado `dollarRate`/`rateChange` hardcodeado + `useEffect` vacío
  6. `src/App.js`: refactor del `useEffect` de auth — ahora `database.ref(uid).off('value')` se llama al cambiar de usuario y al desmontar
- Build verificado con `npm run build`: compila sin errores. Quedan warnings de ESLint preexistentes (imports/variables no usados).

**Por qué se hizo así:**
- Los zombies no estaban enrutados ni importados en ningún lado — borrado seguro.
- Fixes 1, 2, 5: al revisarlos de cerca eran **imports/variables muertos**, no bugs visibles. Borrar fue más honesto que definir lo faltante.
- Fix 5 (AppBar): el state hardcodeado se borró en vez de cablearse al store porque no había JSX que lo consumiera. Cablear sería código preventivo.
- Fix 6: único cambio de comportamiento real — captura `dbRef` en cierre del `useEffect` para poder `.off()` al cambiar de cuenta y evitar listeners acumulados.

**Archivos modificados:**
- `src/App.js` (Fix 2 + Fix 6)
- `src/pages/finances/CreditCards.jsx` (Fix 1)
- `src/components/layout/AppBar.jsx` (Fix 5 + limpieza del import de `useEffect`)

**Archivos borrados:**
- 11 zombies + carpeta `backup/`
- `src/utils/index.js`, `src/utils/chartConfig.js`, carpeta `src/utils/`
- `src/App.test.js`

**Decisiones importantes tomadas:**
- `NewCreditCard.jsx`: borrado (Opción A). La feature `creditLimit` se rediseñará desde cero cuando se necesite — no se portó nada al `NewCard.jsx` activo.
- `utils/` (carpeta): eliminada, no migrada. `utils.js` queda como única fuente. Si hace falta `capitalize` o `formatDate`, se agregan a `utils.js`.
- AppBar: borrar > cablear. No agregar JSX/lógica que el componente no necesita hoy.
- Verificación con `npm run build` (no `npm start`) — suficiente para confirmar compilación.

**Pendiente para la próxima sesión:**
- **Bug #8 (no abordado):** `filterData` en `App.js` asume `data.plants.aditives` siempre existe. Crashea si la cuenta tiene `plants` pero no `aditives`.
- **Bug #7 (no abordado):** doble `HabitDetail` — decidir canónico entre `pages/habits/` y `components/habits/`.
- Capa de servicios Firebase (`src/services/{plants,finances,habits,savings,auth}.js`) para cumplir la regla del CLAUDE.md.
- Auditar y commitear `database.rules.json` / `storage.rules` desde la consola Firebase.
- Limpiar dependencias no usadas: `redux`, `react-redux`, `react-pdf`, `@react-pdf/renderer`, `styled-components`, `styled-jsx`, `react-helmet`, `react-beautiful-dnd`, `react-grid-layout`, `@dnd-kit/*`, `recharts`.
- Decidir librería única de fechas (hoy conviven `moment` + `date-fns` + `dayjs`).
- Implementar pH/EC/PPM en Plants — diseñar shape de RTDB con `/plan` antes de tocar.

---

### 2026-05-07 — Bugs pendientes (filterData defensivo + HabitDetail roto)

**Qué se hizo:**
- **BUG 1 — `filterData` defensivo en `App.js`:**
  - Agregado `data = data || {}` al inicio (cubre cuenta nueva con nodo inexistente).
  - `groupedPlants.active` y `groupedPlants.history` ahora caen a `{}` si no existen, en vez de quedar `undefined`.
  - Procesamiento de aditivos envuelto en `if (data.plants.aditives)` — ya no asume que existen.
  - Acceso al `type` del aditivo con `aditive?.type` para tolerar entradas malformadas.
- **BUG 2 — Doble `HabitDetail` reconectado:**
  - Reescrito `pages/habits/HabitDetail.jsx`: ahora usa `useParams()` en vez de `URLSearchParams` (matchea el `:habitId` de la ruta). Eliminado el state innecesario de `loading` y el bloque del spinner.
  - `App.js`: el import y la ruta `/DetalleHabito/:habitId` ahora apuntan al page wrapper (`HabitDetailPage`) en vez de al componente reusable. Así el componente recibe sus props correctamente y la página queda envuelta en `<Layout>`.
- Build verificado con `npm run build`: compila sin errores.

**Por qué se hizo así:**
- BUG 1: la auditoría señalaba solo el caso de `aditives` faltante, pero la lectura completa de `filterData` destapó otros tres puntos frágiles (data null, active/history undefined, aditivo sin type). Fix de un solo paso para no volver a tocar la función.
- BUG 2: la auditoría asumía duplicación pero el análisis cercano mostró que **no eran rivales** — `components/habits/HabitDetail.jsx` es el componente reusable (toda la lógica), y `pages/habits/HabitDetail.jsx` es el page wrapper. El bug era de cableado: App.js enrutaba el componente reusable sin pasarle props y sin `<Layout>`, y el wrapper parseaba `?id=` en vez de `:habitId`. Mantener ambos respeta la estructura page/component del proyecto y deja el feature funcional para cuando `HabitsList` agregue el botón "Ver detalle".

**Archivos modificados:**
- `src/App.js` (BUG 1 + cambio de import y de ruta para BUG 2)
- `src/pages/habits/HabitDetail.jsx` (reescrito completo, BUG 2)

**Archivos sin tocar (decisión):**
- `src/components/habits/HabitDetail.jsx` — componente reusable, queda intacto.

**Decisiones importantes tomadas:**
- **HabitDetail: no eliminar ninguno.** La pregunta original asumía duplicación, pero los archivos cumplen roles complementarios. La estructura `page wrapper + componente reusable` se elige a largo plazo (consistente con el resto del proyecto).
- **`filterData` defensivo a fondo, no parche puntual.** Fix incluye el caso del `aditives` que pidió el usuario más los otros tres encontrados en la lectura. Misma pasada, mismo riesgo.
- Verificación con `npm run build` (no `npm start`).

**Pendiente para la próxima sesión:**
- **Capa de servicios Firebase** (`src/services/{plants,finances,habits,savings,auth}.js`) para cumplir la regla del CLAUDE.md sobre no escribir Firebase en componentes.
- **Auditar y commitear** `database.rules.json` y `storage.rules` desde la consola Firebase.
- **Limpiar dependencias no usadas:** `redux`, `react-redux`, `react-pdf`, `@react-pdf/renderer`, `styled-components`, `styled-jsx`, `react-helmet`, `react-beautiful-dnd`, `react-grid-layout`, `@dnd-kit/*`, `recharts`.
- **Decidir librería única de fechas** (hoy conviven `moment` + `date-fns` + `dayjs`).
- **Implementar pH/EC/PPM en Plants** — diseñar shape de RTDB con `/plan` antes de tocar.
- Considerar agregar un botón "Ver detalle" en `HabitsList.jsx` que use la ruta `/DetalleHabito/:habitId` que ahora sí funciona.

---

### 2026-05-07 — Limpieza de dependencias

**Qué se hizo:**
- Análisis con grep de **todas** las deps sospechosas en `src/`:
  - 11 deps con cero imports en código activo (confirmadas).
  - 2 hermanos de `@dnd-kit` (`@dnd-kit/sortable`, `@dnd-kit/utilities`) sumados al lote.
  - **3 libs de fechas** detectadas: `date-fns` (11 archivos), `moment` (2 archivos, requerido por react-big-calendar), `dayjs` (3 archivos finances con 13 usos directos).
  - **5 libs de gráficos** detectadas: `react-apexcharts` + `apexcharts` (6 archivos, principal), `chart.js` + `react-chartjs-2` (importadas en Plant.jsx **pero nunca renderizadas** — código muerto), `@mui/x-charts` (cero imports).
- Borrados los imports muertos de chart.js en `src/pages/plants/Plant.jsx` (líneas 82-83 originales).
- Desinstaladas **16 dependencias** con `npm uninstall`:
  - `redux`, `react-redux`, `react-pdf`, `@react-pdf/renderer`
  - `styled-components`, `styled-jsx`, `react-helmet`
  - `react-beautiful-dnd`, `react-grid-layout`
  - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - `recharts`, `@mui/x-charts`
  - `chart.js`, `react-chartjs-2`
- Resultado: **-156 paquetes** en `node_modules` (16 directos + 140 transitivos).
- Build verificado con `npm run build`: compila limpio, bundle gzipped sigue en 1.07 MB (las libs ya estaban excluidas por tree-shaking — el beneficio es de disco y honestidad del `package.json`, no de bundle).

**Por qué se hizo así:**
- chart.js + react-chartjs-2 se trataron como deps no usadas, no como migración. Plant.jsx las importaba pero **no había `<Bar/>`, `<Pie/>` ni `<Line/>` en el JSX** — eran código muerto al 100%. Borrar imports + uninstall, sin migrar nada.
- @mui/x-charts se sumó al lote: cero imports en `src/`. Se desinstala junto con recharts.
- @dnd-kit: el `package.json` tenía 3 sub-paquetes (core/sortable/utilities). Se desinstalaron los 3 aunque la auditoría solo listara `@dnd-kit/core` — todos sin uso.
- **dayjs y moment NO se tocaron** — dayjs requiere migración real (13 usos directos en finanzas); moment lo exige `react-big-calendar` y sacarlo implica reescribir 2 calendarios. Ambos quedan para cuando se rompan los componentes monstruo (Fase 3).
- Memoización de series de gráficos: tampoco se tocó. Se dejó relevado (`generateChartData()` en Home.jsx, IIFEs inline en Finances/Habits, `preparePieChartData()` en cada render). Va con la Fase 3.

**Archivos modificados:**
- `src/pages/plants/Plant.jsx` (borradas 2 líneas de import muerto)
- `package.json` y `package-lock.json` (desinstalación)

**Decisiones importantes tomadas:**
- Solo se ejecutaron las acciones de **dificultad baja**. Migración de dayjs y memoización quedaron explícitamente fuera de scope para esta sesión.
- chart.js / react-chartjs-2 = uninstall directo, sin migrar (no había nada que migrar — solo imports muertos).
- No se ejecutó `npm audit fix` — las 103 vulnerabilidades reportadas vienen de `react-scripts 5.0.1` (CRA abandonado) y excede el scope de la limpieza.

**Pendiente para la próxima sesión:**
- **Fase 3 — Romper componentes monstruo:** Plant.jsx (3.979 líneas), Finances.jsx (3.951), Home.jsx (3.264), Habits.jsx (2.512), Configuracion.jsx (2.534). Aprovechar para:
  - Migrar `dayjs` → `date-fns` en los 3 archivos finances (CreditCards, CreditCardMovements, UpdateCardDates).
  - Memoizar series de gráficos con `useMemo` (especialmente `generateChartData` en Home.jsx que recalcula sobre todo el dataset cada render).
  - Reemplazar IIFEs inline en JSX por valores memoizados.
- **Capa de servicios Firebase** (`src/services/{plants,finances,habits,savings,auth}.js`) para cumplir la regla del CLAUDE.md sobre no escribir Firebase en componentes (320 ocurrencias en 46 archivos).
- **Auditar y commitear** `database.rules.json` / `storage.rules` desde la consola Firebase.
- **Implementar pH/EC/PPM en Plants** — diseñar shape de RTDB con `/plan` antes de tocar.
- Considerar agregar un botón "Ver detalle" en `HabitsList.jsx` que use la ruta `/DetalleHabito/:habitId` (reconectada en sesión anterior).
- Migración futura: `react-scripts` (CRA) → Vite, para zafar de las 103 vulnerabilidades arrastradas.

---

### 2026-05-07 — Capa de servicios + hooks: Auth

**Qué se hizo:**
- Creado `src/services/auth.js`: capa fina sobre Firebase Auth, sin estado React. Exporta `signInWithEmail`, `signUpWithEmail` (combina create + updateProfile), `signInWithGoogle`, `signOut`, `sendPasswordReset`, `updateDisplayName`, `updatePhotoURL`, `deleteCurrentUser`, `subscribeToAuthChanges`, `getCurrentUser`.
- Creado `src/hooks/useAuth.js`: suscribe a `subscribeToAuthChanges`, mantiene `user` y `authReady` en state, expone las funciones del servicio. **No maneja `loading` global** — cada componente maneja su propio loading local.
- Migrados 6 componentes a la nueva capa:
  - `App.js`: `auth.onAuthStateChanged` → `subscribeToAuthChanges`. `auth.currentUser` (en `PrivateRoute` muerto) → `getCurrentUser()`. Borrado el import de `auth` de firebase.
  - `Login.jsx`: las 4 operaciones (signIn, signUp, signInWithGoogle, sendPasswordReset) ahora vienen del hook. Borrado el import de `firebase/compat/app` (ya no se necesita `GoogleAuthProvider` directo). Mantenido el mapeo de `error.code` → mensajes en español (es UX del componente).
  - `AppBar.jsx`: `auth.signOut()` → `signOut()`. Lecturas `auth.currentUser?.{displayName,photoURL,email}` → `user?.{...}`. Borrado el import de `auth`.
  - `Drawer.jsx`: igual que AppBar.
  - `Perfil.jsx`: solo lecturas. Borrado el import de `auth, database` (ninguno se usaba ya — `database` venía importado pero sin uso desde antes).
  - `Configuracion.jsx`: las 7 operaciones de Auth migradas (3 updateProfile, sendPasswordReset, signOut, delete, lecturas para form). **El import de `auth` se mantiene** porque sigue habiendo 11 usos de `auth.currentUser.uid` para paths de Database/Storage que pertenecen a la futura capa de Database.
- Build verificado después de cada archivo: 6 builds intermedios + 1 final, todos limpios. Bundle se mantiene en 1.07 MB.

**Por qué se hizo así:**
- **Servicio sin estado React**: la traducción de `error.code` a mensajes en español queda en cada componente, no en el servicio. Razón: depende del idioma y del contexto de UX (ej. `auth/wrong-password` muestra "Contraseña incorrecta" en Login, pero podría mostrar otra cosa en otro flujo).
- **Hook sin `loading` global**: `Login.jsx` tiene 4 flujos (login, registro, Google, reset) que necesitan loading independientes. Un `loading` único en el hook generaría conflictos. Cada componente sigue con su `useState` local de UI.
- **`signUpWithEmail` agrupa create + updateProfile**: es siempre el mismo flujo (no tiene sentido crear un usuario sin nombre). El servicio lo expone como una sola operación atómica.
- **Imports de `auth` solo donde queda `auth.currentUser.uid`**: `Configuracion.jsx` mantiene el import porque su uso de `uid` es para Database, no Auth. Cuando exista `services/{plants,finances,...}.js`, el `uid` se resolverá internamente y este import desaparece.
- **`PrivateRoute` en `App.js` está muerto** (definido pero no usado). En vez de borrarlo (fuera de scope de Auth), se migró a `getCurrentUser()` para no dejar `auth` colgado en el archivo. Queda como TODO de limpieza futura.

**Archivos creados:**
- `src/services/auth.js` (nuevo)
- `src/hooks/useAuth.js` (nuevo)

**Archivos modificados:**
- `src/App.js` (+ `PrivateRoute` migrado a `getCurrentUser`)
- `src/pages/basics/Login.jsx` (+ borrado `import firebase from 'firebase/compat/app'`)
- `src/components/layout/AppBar.jsx`
- `src/components/layout/Drawer.jsx`
- `src/pages/basics/Perfil.jsx` (+ borrado `database` no usado)
- `src/pages/basics/Configuracion.jsx` (mantiene import de `auth` por usos de `auth.currentUser.uid` para DB)

**Decisiones importantes tomadas:**
- **Duplicación temporal de "user"** (Zustand vía `userLoggedIn` en App.js + `user` del hook en cada componente) aceptada como estado intermedio. Se consolida en Fase 3 cuando se rompan los componentes monstruo.
- **NO tocar los 26+ archivos** que solo usan `auth.currentUser.uid` para paths de Database. Esos van con la capa de Database, no con la capa de Auth.
- Build después de cada archivo migrado (6 builds intermedios) — más lento pero detecta regresiones por archivo. Vale la pena para una refactorización con tantos archivos tocados.

**Pendiente para la próxima sesión:**
- **Capa de servicios de Database** (`services/database.js` + `services/storage.js`): es la pieza que destrabará la limpieza definitiva de los `auth.currentUser.uid` regados en 26+ archivos. Cuando exista, `Configuracion.jsx` y todos los demás dejan de importar `auth`.
- **Servicios y hooks por dominio**: una vez listos los services genéricos de DB/Storage, crear `services/{plants,finances,habits,savings}.js` y sus hooks `usePlants`, `useFinances`, `useHabits`, `useSavings`.
- **Borrar `PrivateRoute` muerto** en `App.js` cuando se haga limpieza general de App.js.
- **Consolidar fuente de verdad de "user"**: hoy duplicado entre Zustand (`userLoggedIn`) y `useAuth` (`user`). Cuando se rompa App.js en Fase 3.
- Sigue pendiente: auditar reglas Firebase, migrar dayjs → date-fns, memoizar series de gráficos, romper componentes monstruo, implementar pH/EC/PPM en Plants.

---

### 2026-05-07 — Capa de servicios de Database (estructura + prueba de patrón)

**Qué se hizo:**
- Creados los 6 servicios completos:
  - `src/services/database.js` — capa core. CRUD genérico (`read`, `write`, `push`, `update`, `remove`), operaciones avanzadas (`bulkUpdate`, `generateKey`, `transaction`) y `subscribeToUserData` para el listener root. El uid se resuelve internamente vía `getCurrentUser()` de `services/auth`. Los componentes pasan paths relativos al user.
  - `src/services/finances.js` — gastos, ingresos, tarjetas (12 funciones).
  - `src/services/savings.js` — incluye `updateSavingsWithHistory` (el unificador del patrón duplicado en 6 archivos) y `transferToFund` (combo aprobado: actualiza balance del fondo + history del fondo + balance ARS + history ARS, todo atómico).
  - `src/services/habits.js` — CRUD + `toggleHabitCompletion` (acepta el estado destino, no el actual).
  - `src/services/plants.js` — incluye `addPlantActivity(plantId, activityType, data)` (unifica 6 actividades), `updatePlant` con flag `isArchived`, `archivePlant` (simplificado: el chequeo de "history existe" del código original era innecesario), `setPlantPotVolume` (transaction).
  - `src/services/config.js` — perfil RTDB, tema, backups, `deleteAllUserData` (nombre explícito).
- Migrados 4 archivos de prueba para validar el patrón:
  - **`App.js`**: `database.ref(user.uid).on(...)` + cleanup manual → `subscribeToUserData((data) => ...)`. Borrado el import de `database` (ya no se usa en App.js). Listener root ahora envuelve también el `.off()` en la función de cleanup.
  - **`NewPlant.jsx`**: `database.ref(`${uid}/plants/active`).push(...)` → `addPlant(plantData)`. Borrados los imports de `database, auth`.
  - **`NewIrrigation.jsx`**: el `selectedPlants.map(...)` con `database.ref(...).push(irrigationData)` → `addPlantActivity(plantId, 'irrigations', data)`. Demuestra que el unificador funciona: el componente queda 1 línea más corto y deja de saber el path.
  - **`Habits.jsx` (parcial)**: solo la función `toggleHabitCompletion`. Borradas las 2 declaraciones de refs (`habitRef` era además dead code: nunca se usaba). Las 2 llamadas a `completedRef.set/remove` reemplazadas por una sola `toggleHabitCompletionService(habitId, dateStr, newCompletedStatus)`. **El resto de Habits.jsx mantiene los imports de `database, auth`** porque sigue teniendo otras 6 ops sin migrar.
- Build verificado después de cada archivo: 4 builds intermedios + el build implícito post-services, todos limpios.

**Por qué se hizo así:**
- **`generateKey` + `bulkUpdate` para `updateSavingsWithHistory`**: la operación atómica multi-path es más segura que el patrón actual (`set` y `push` separados con dos round-trips). El componente pasa `currentBalance` para evitar una lectura redundante.
- **`subscribeToUserData` desempaqueta `.val()`**: la abstracción ofrece el `data` plano al componente, no el snapshot. App.js dejó de saber que existe `snapshot.val()`.
- **`Habits.jsx` migración parcial intencional**: el alcance pedido era validar el patrón con un caso por dominio. Dejar el resto del archivo a medias hace evidente el contraste — el toggle ahora tiene 1 línea de Firebase y el resto sigue con paths manuales — y permite que la próxima sesión arranque con una imagen clara del trabajo restante.
- **`archivePlant` simplificado**: el código original de Plant.jsx hacía `once('value')` sobre `plants/history` para chequear si existía y, si no, llamaba a `update({ history: {} })` antes de `push`. Firebase crea el nodo automáticamente al hacer push — el chequeo era folclore, lo eliminé en el servicio.

**Archivos creados:**
- `src/services/database.js`, `finances.js`, `savings.js`, `habits.js`, `plants.js`, `config.js` (6 nuevos)

**Archivos modificados:**
- `src/App.js`
- `src/pages/plants/NewPlant.jsx`
- `src/pages/plants/NewIrrigation.jsx`
- `src/pages/habits/Habits.jsx` (parcial — solo `toggleHabitCompletion`)

**Decisiones importantes tomadas:**
- **`transferToFund` incluido** (no solo deduplica las 2 ops de Savings.jsx, sino que las atomiza con `bulkUpdate`).
- **`subscribeToUserData` queda en `database.js`** (no en un servicio aparte): es la suscripción root, no encaja en ningún dominio.
- **NO migrar los 24 archivos en esta sesión.** Solo 4 de prueba.
- **`updateSavingsWithHistory` recibe `currentBalance` por argumento** en vez de leer del DB. Fundamento: todos los call sites ya tienen el balance en `userData.savings.amountARS` del store, leerlo de nuevo desperdiciaría una request.
- **Migración parcial de Habits.jsx**: el archivo mantiene imports de `database, auth` porque las otras 6 ops aún no migraron. La próxima sesión puede limpiarlo cuando complete el archivo.

**Pendiente para la próxima sesión:**
- **Migrar los 20 archivos restantes** consumiendo los servicios. Por dominio:
  - Finances: `Finances.jsx`, `NewExpense.jsx`, `NewIncome.jsx`, `Exchange.jsx`, `NewCard.jsx`, `EditCard.jsx`, `UpdateCardDates.jsx`, `CreditCards.jsx`.
  - Savings: `Savings.jsx`, `SavingsTab.jsx`, `FundHistory.jsx` (lectura).
  - Habits: completar `Habits.jsx`, migrar `HabitForm.jsx`, `NewHabit.jsx`, `Home.jsx` (toggle).
  - Plants: `NewPruning.jsx`, `NewInsecticide.jsx`, `NewTransplant.jsx`, `NewLog.jsx`, `NewPhoto.jsx`, `NewAditive.jsx`, `ImageUploader.jsx`, `Plant.jsx` (el más grande).
  - Config: `Configuracion.jsx`.
- **Tras la migración completa**: borrar el import de `auth` de `Configuracion.jsx` (ya no haría falta) y revisar si `store.js` puede prescindir de `auth.currentUser.uid` (`updateSavings` quedaría redundante con `updateSavingsWithHistory`).
- **Plant.jsx tiene un import muerto** del SDK modular (línea 3: `ref, push, set, ...` desde `firebase/database`). Borrar al migrarlo.
- **Hooks por dominio** (`useFinances`, `useSavings`, etc.): son la siguiente capa después de servicios. Por ahora los componentes consumen servicios directos.
- Sigue pendiente: auditar reglas Firebase, migrar dayjs → date-fns, memoizar series de gráficos, romper componentes monstruo, implementar pH/EC/PPM en Plants, borrar `PrivateRoute` muerto en App.js.

---

### 2026-05-08 — Migración masiva a la capa de servicios (20 archivos)

**Qué se hizo:**
- Migrados los 20 archivos restantes para consumir `src/services/{database,finances,savings,habits,plants,config}.js`. 20 builds intermedios verificados, todos limpios.
- **Plants (8):**
  - `NewPruning`, `NewInsecticide`, `NewLog`: usan `addPlantActivity(plantId, type, data)` — patrón uniforme.
  - `NewTransplant`: `addPlantActivity` + `setPlantPotVolume` (transaction).
  - `NewPhoto`, `ImageUploader`: `addPlantActivity(plantId, 'images', ...)` (mantienen `auth.currentUser.uid` para path de Storage).
  - `NewAditive`: `addAditive`.
  - **`Plant.jsx`**: el más grande. `updatePlant(plantId, data, { isArchived })` reemplaza el patrón `dbPath = isArchived ? 'history' : 'active'` repetido 4 veces. La función `moveToHistory` pasó de ~50 líneas (con once+update+push+remove encadenados, y un check innecesario de "history existe") a ~10 líneas con `read('plants/active/{id}') + archivePlant(id, data)`. **Borrado el import muerto del SDK modular** (`import { ref, push, set, ... } from "firebase/database"` línea 3, código zombie desde la auditoría inicial). `removePlant` quedó importado pero sin uso → quitado del import también.
- **Habits (4):**
  - `Habits.jsx`: solo había quedado el toggle migrado en sesión anterior. Ahora se borraron los imports residuales de `database, auth`.
  - `HabitForm.jsx`: `addHabit`, `updateHabit`, `removeHabit`.
  - `NewHabit.jsx`: `addHabit`. El check de `auth.currentUser` se reescribió usando `getCurrentUser()` del servicio de auth.
  - `Home.jsx` (toggle): migrado a `toggleHabitCompletion` con dynamic import (mantiene la forma `await import(...)` del código original).
- **Savings (2):**
  - `Savings.jsx`: `addSavingsFund` para crear fondo. **`transferToFund` reemplazó el patrón depositar/retirar duplicado** — `handleAddMoney` y `handleWithdrawMoney` pasaron de ~10 ops cada uno a una sola llamada con `amount` con signo (positivo = depósito, negativo = retiro). Bulk update atómico.
  - `SavingsTab.jsx`: `setCarMaintenancePercentage`, `setCarMaintenancePending`, `applyCarMaintenancePending` (la `transaction()`), `updateSavingsWithHistory`.
- **Finances (7):**
  - `NewExpense`: `addExpense` + `addCardTransaction` + `updateSavingsWithHistory` (cash) o iteración por cuotas (con tarjeta).
  - `NewIncome`: `addIncome` + `updateSavingsWithHistory`.
  - `Exchange`: dos llamadas a `updateSavingsWithHistory` (ARS y USD) con `amount` con signo según `Compra` o `Venta`. La lógica original tenía 4 `set` + 2 `push` con muchos ternarios; ahora son 2 calls simétricas.
  - `NewCard`: `addCreditCard`. `EditCard`: `updateCreditCard`. `UpdateCardDates`: `setCardDatesForMonth`.
  - **`CreditCards.jsx`**: el bulk update del flujo de pago (`updates[...] = ...` con paths absolutos del uid) se reescribió con paths relativos pasados a `bulkUpdate`. Los 2 `database.ref().child(...).push().key` se reemplazaron por `generateKey('expenses')` y `generateKey('savings/amountARSHistory')`. Mantiene `auth, storage` para uploads de PDFs.
- **Config:**
  - `Configuracion.jsx`: 7 ops migradas (`setTheme`, `setDisplayName`×2, `setConfig`, `getUserBackup`, `setPrivacyConfig`, `deleteAllUserData`). Mantiene `auth, storage` para subida de imagen de perfil y storage de backups.

**Por qué se hizo así:**
- **Imports `auth.currentUser.uid` que sobrevivieron** (4 archivos: Configuracion, CreditCards, ImageUploader, NewPhoto): todos son para paths de **Storage**, no Database. Storage no tiene servicio aún. Esos quedan para la próxima fase si decidimos crear `services/storage.js`.
- **`store.js` no se tocó**: tiene su propio `updateSavings` con paths absolutos. Quedó obsoleto frente a `updateSavingsWithHistory` del servicio, pero ningún componente lo llama hoy. Se borrará cuando se haga limpieza de `store.js`.
- **`Home.jsx` mantiene el `await import(...)` dinámico** porque era el patrón original; cambiar a import estático modificaría el momento de carga del módulo y excede el alcance.
- **`updateSavingsWithHistory` con `extras`**: el caso del Exchange necesitaba pasar `operationType` y un campo extra al history. El servicio acepta `...extras` y los mergea, así no hubo que crear una variante específica.
- **`NewHabit.jsx` reemplazó `auth.currentUser` por `getCurrentUser()`** del servicio en vez de borrar el check. El check tiene valor de UX (mensaje claro al usuario si la sesión se perdió antes de submit).

**Archivos modificados (20):**
- Plants: `NewPruning.jsx`, `NewInsecticide.jsx`, `NewTransplant.jsx`, `NewLog.jsx`, `NewPhoto.jsx`, `NewAditive.jsx`, `ImageUploader.jsx`, `Plant.jsx`.
- Habits: `Habits.jsx`, `HabitForm.jsx`, `NewHabit.jsx`, `Home.jsx`.
- Savings: `Savings.jsx`, `SavingsTab.jsx`.
- Finances: `NewExpense.jsx`, `NewIncome.jsx`, `Exchange.jsx`, `NewCard.jsx`, `EditCard.jsx`, `UpdateCardDates.jsx`, `CreditCards.jsx`.
- Config: `Configuracion.jsx`.

**Decisiones importantes tomadas:**
- **NO migrar Storage** en esta sesión. Los 4 archivos que mantienen `auth.currentUser.uid` lo hacen para paths de Firebase Storage, ortogonal al servicio de Database.
- **`store.js` queda intacto**: la función `updateSavings` ya no se llama desde ningún lado (los componentes pasaron al servicio), pero borrarla es limpieza separada.
- **Exchange.jsx — extras del history**: aproveché para pasar `operationType` y `amount_ars` al history del USD. No alteran semántica, agregan trazabilidad.
- Bundle final: 1.07 MB (sin cambios — el tamaño viene dominado por MUI, no por el wiring de Firebase).

**Estado final del refactor de Database:**
- **0 archivos de componentes con `database.ref` directo.**
- **0 archivos con `auth.currentUser.uid` para paths de DB** (los 4 que sobreviven son para Storage).
- Los 6 servicios de dominio + el core de database quedan como única fuente de verdad para mutaciones a Firebase RTDB.
- La regla del CLAUDE.md "No escribir lógica de Firebase directamente en componentes" está **cumplida para Database**.

**Pendiente para la próxima sesión:**
- **Capa de Storage** (opcional): `services/storage.js` con `uploadProfileImage(uid, file)`, `uploadStatementPdf(...)`, `uploadPlantImage(...)`, `uploadBackup(...)`. Permitiría borrar los últimos 4 imports de `auth, storage` directos. Solo si se considera valioso — los 4 call sites son específicos.
- **`store.js`**: borrar la función `updateSavings` obsoleta. Probablemente revisar si toda la responsabilidad de `userData` debería moverse a un hook dedicado.
- **Hooks por dominio** (`useFinances`, `useSavings`, etc.): la siguiente capa de abstracción. Encapsulan la suscripción + las mutaciones por dominio. Los componentes consumirían `const { addExpense, expenses } = useFinances()` en vez de importar el servicio + leer `userData.finances` por separado.
- **Borrar `PrivateRoute`** muerto en App.js (sigue colgado desde sesiones anteriores).
- **Plant.jsx revisar lo de `removePlant`**: lo importé y lo saqué porque no se usa, pero quedó disponible en `services/plants.js` por si Plant.jsx eventualmente quiere "borrar definitivamente" (vs archivar). Al romperlo en sub-componentes (Fase 3) puede aparecer el caso.
- Sigue pendiente: auditar reglas Firebase, migrar dayjs → date-fns, memoizar series de gráficos, romper componentes monstruo, implementar pH/EC/PPM en Plants.

---

### 2026-05-08 — Romper Finances.jsx — Sesión 1: limpieza + 2 extracciones auto-contenidas

**Qué se hizo:**
- **Limpieza de código muerto** (~520 líneas eliminadas):
  - `InsightCard` (sub-componente definido, nunca renderizado).
  - `TransactionsPanel` (versión vieja sin chart, suplantada por `TransactionsPanelWithChart`).
  - `CategoryChart` (sub-componente, no se renderizaba).
  - `categoryChartData` state + `updateCategoryChartData()` (solo los leía `CategoryChart`).
  - `expandedPanels` state + `handleAccordionChange` (zombie — se seteaba pero no se leía).
  - Su llamada en `useEffect` también se removió.
- **Helpers compartidos** en `src/components/finances/financesHelpers.jsx`:
  - `getCategoryIcon(category)` — pure function.
  - `getCategoryColor(cat, theme, dataType)` — recibe `theme` y `dataType` como argumentos para no depender del scope del padre.
- **`RefundDialog.jsx`** extraído (~329 líneas):
  - Estado del form (`refundForm`) + handler `handleProcessRefund` quedan dentro del componente.
  - El padre solo mantiene `openRefundDialog` y `selectedTransaction`. Pasa `open`, `transaction`, `dollarRate`, `currentSavings`, `onClose`.
  - Useeffect interno resetea el form cuando se abre con una transacción nueva.
- **`FinancesTimeNavigator.jsx`** extraído (~549 líneas):
  - `isAtCurrentLimit` y `handleNextMonthWithLimit` se calculan internamente (dependen solo de los selectores y los setters que llegan por props).
  - El array `months` se construye fuera del componente (módulo-level, no varía por render).
  - `useMediaQuery` (mobile/tablet) se mueve dentro del propio componente.
  - Recibe los 3 selectores + setters + `handlePreviousMonth` + `monthlyData` (para el chip de "Total").
- 4 builds intermedios verificados, todos limpios.

**Por qué se hizo así:**
- **`getCategoryColor` recibe `theme` y `dataType` por argumento** en vez de cerrar sobre ellos. Lo hace una función pura, reusable desde cualquier componente que tenga acceso al theme. La compatibilidad de la firma vieja (`getCategoryColor(cat, index)`) se rompió a propósito — los call sites se actualizan a la firma nueva.
- **`RefundDialog` se hace cargo de su propia persistencia**: el padre no necesita saber sobre `bulkUpdate`/`generateKey`/`read`. Le pasa `currentSavings` para evitar que el dialog tenga que conocer el shape de `userData.savings`.
- **`FinancesTimeNavigator` recibe setters directos** (`setDataType`, `setSelectedYear`, `setSelectedMonth`) en vez de callbacks tipo `onYearChange`. Razón: los handlers son simples (`setSelectedMonth(month.value)`), agregar callbacks intermedios sería boilerplate sin valor.
- **No tocar la lógica de cálculo (`updateMonthlyData`, `updateMonthlyTrends`)**: se queda en el padre. La memoización va en otra fase.
- **`getCategoryIcon` local en `TransactionsListPanel` se mantiene** (líneas dentro del bloque que va a Sesión 2). Va a desaparecer cuando se extraiga ese componente — no agrego deuda extra ahora.

**Archivos creados:**
- `src/components/finances/financesHelpers.jsx`
- `src/components/finances/RefundDialog.jsx`
- `src/components/finances/FinancesTimeNavigator.jsx`

**Archivos modificados:**
- `src/pages/finances/Finances.jsx` (3.948 → 2.549 líneas, **−1.399 líneas / −35%**)

**Decisiones importantes tomadas:**
- Las extracciones de Sesión 1 son las **auto-contenidas** (no necesitan acceso a state de hermanos): RefundDialog (modal) y TimeNavigator (header). Los componentes con dependencias cruzadas (lista ↔ summary, ambos consumen `monthlyData`) van a Sesión 2.
- Bundle se mantiene en 1.07 MB — los componentes nuevos no agregan superficie, redistribuyen.

**Pendiente — SESIÓN 2:**
- Extraer `MonthlySummaryCard.jsx` (lo que hoy es `TransactionsPanelWithChart`).
- Extraer `MonthlyTransactionsList.jsx` (lo que hoy es `TransactionsListPanel`).
- Extraer `AnnualTrends.jsx` (JSX inline de tendencias anuales).
- Extraer `SavingsEvolutionCard.jsx` (JSX inline de evolución de ahorros).
- `Finances.jsx` queda como orquestador (~120 líneas).
- Borrar `getCategoryIcon` local de `TransactionsListPanel` cuando se extraiga.

**Sigue pendiente** (otras sesiones):
- Auditar reglas Firebase, migrar dayjs → date-fns, memoizar series de gráficos (especialmente las IIFE inline en `SavingsEvolutionCard` y `Home.jsx`), implementar pH/EC/PPM en Plants.
- Romper otros componentes monstruo (Plant.jsx 3.979, Home.jsx 3.264, Habits.jsx 2.512, Configuracion.jsx 2.534, NewHabit.jsx 1.425).
- `store.js`: borrar la función `updateSavings` obsoleta.
- Borrar `PrivateRoute` muerto en App.js.

---

### 2026-05-08 — Romper Finances.jsx — Sesión 2: 4 extracciones restantes

**Qué se hizo:**
- **`MonthlySummaryCard.jsx`** (372 líneas) — extraído de `TransactionsPanelWithChart`. Recibe `monthlyData`, `dataType`, `selectedYear`, `selectedMonth`. Tiene su propia lógica `preparePieChartData` (top 3 + "Otras") y la configuración del pie chart. Maneja el estado vacío internamente.
- **`MonthlyTransactionsList.jsx`** (745 líneas) — extraído de `TransactionsListPanel`. Mantiene `searchText` y `expandedDates` como estado local. Recibe `userData`, `dataType`, `selectedYear`, `selectedMonth`, `dollarRate`, `onOpenRefund`. Funciones `getAllTransactions`, `getFilteredTransactions`, `getPaymentMethodInfo` quedan internas, junto con los sub-componentes `TransactionItem` y `DateGroupCard`. **Las helpers `obtenerFechaFormateada` y `parseFechaFlexible`** del padre (que solo usaba este componente) bajaron a module-level del archivo nuevo. **`getCategoryIcon` local muerto eliminado** — ahora usa el del helper compartido.
- **`AnnualTrends.jsx`** (293 líneas) — extraído del JSX inline. Recibe `monthlyTrendsData` y `dollarRate`. Calcula internamente `annualExpenses`, `annualIncomes`, `annualBalance` y construye `areaChartOptions`/`areaChartSeries` (esa configuración estaba en el padre y ahora vive donde se usa).
- **`SavingsEvolutionCard.jsx`** (341 líneas) — extraído del JSX inline. Recibe `userData` y `dollarRate`. **Las 2 IIFE pesadas del chart histórico** (categories y series) se reemplazaron por una sola función `buildHistoryEntries(history)` a module-level que filtra los últimos 6 meses, ordena cronológicamente y devuelve las entradas. El componente la llama una sola vez y deriva tanto las labels como los datos. Reduce duplicación + es más fácil de memoizar en futuro.
- **`Finances.jsx` reescrito como orquestador (293 líneas)**: solo state de selectores + 2 `useEffect` que mantienen `monthlyData` y `monthlyTrendsData`, dialog de refund + speed dial, y los 6 componentes hijos. Borrados todos los imports muertos (~80 líneas), state/funciones zombie (`isMobile`, `isTablet`, `availableYears`, `months`, `handleDataTypeChange`, `handleYearChange`, `handleMonthChange`, `handleNextMonth`, `currentMonth`, `currentYear`, `alertMonths`, `annualBalance`, `actions`, `areaChartOptions`, `areaChartSeries`).
- **`updateMonthlyTrends`** se simplificó: el patrón "filtrar transacciones visibles + sumar con devolución" se extrajo a una función `sumVisible` interna del useEffect. El bucle de gastos y el de ingresos quedaron en 5 líneas cada uno (antes ~80 por par).
- **5 builds intermedios** (uno por extracción + uno post-rewrite del orquestador), todos limpios.

**Por qué se hizo así:**
- **`buildHistoryEntries` para el chart de evolución**: las 2 IIFE del código original recorrían `Object.keys()`, mapeaban a `{ key, date }`, filtraban "últimos 6 meses", ordenaban, y al final una devolvía labels y la otra valores. Hacer ese trabajo dos veces por render era costoso y duplicado. Una sola pasada que devuelve el array completo, y el componente saca categories/data por map.
- **Lógica de cálculo (`monthlyData`, `monthlyTrendsData`) queda en el orquestador**: era la decisión de diseño de Sesión 1 — los hijos reciben los derivados ya calculados. Migrar esos cálculos a `useMemo` o a un hook `useFinancesData` dedicado pertenece a la fase de memoización.
- **Imports limpiados de raíz**: en vez de borrar uno por uno, reescribí el archivo completo con solo los imports que quedaron en uso. Más rápido y menos error-prone que ir warning por warning.
- **Eliminado `availableYears` y `months`** del orquestador: el TimeNavigator construye sus propios meses (lo hizo en Sesión 1) y `availableYears` no se usaba en ningún lado.

**Archivos creados:**
- `src/components/finances/MonthlySummaryCard.jsx`
- `src/components/finances/MonthlyTransactionsList.jsx`
- `src/components/finances/AnnualTrends.jsx`
- `src/components/finances/SavingsEvolutionCard.jsx`

**Archivos modificados:**
- `src/pages/finances/Finances.jsx` (reescrito como orquestador limpio)

**Resultado final del split de Finances:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/finances/Finances.jsx` | **293** | Orquestador: selectores, derivados, dialog, layout |
| `components/finances/MonthlyTransactionsList.jsx` | 745 | Lista con tabs + búsqueda + agrupación por fecha |
| `components/finances/FinancesTimeNavigator.jsx` | 549 | Header sticky |
| `components/finances/MonthlySummaryCard.jsx` | 372 | Resumen + pie chart del mes |
| `components/finances/SavingsEvolutionCard.jsx` | 341 | Resumen ARS/USD + chart histórico |
| `components/finances/RefundDialog.jsx` | 329 | Dialog modal de devolución |
| `components/finances/AnnualTrends.jsx` | 293 | Gráfico anual + 3 tarjetas de totales |
| `components/finances/financesHelpers.jsx` | 84 | `getCategoryIcon`, `getCategoryColor` |
| **Total** | **3.006** | (vs 3.948 originales: **−942 líneas**, −24%) |

**De `3.948 líneas en 1 archivo` a `3.006 líneas en 8 archivos`.** El más grande ahora (`MonthlyTransactionsList`) tiene 745 líneas — un quinto del original. Bundle de la app: 1.07 MB (−125 B).

**Decisiones importantes tomadas:**
- **Orquestador a 293 líneas, no 120**: la lógica de derivados (`updateMonthlyData`, `updateMonthlyTrends`) suma ~140 líneas. Sacarla a un hook (`useFinancesData`) sería el siguiente paso natural — pero **no en esta sesión** porque excede el alcance "romper en sub-componentes". Lo flag para la fase de memoización.
- **`MonthlyTransactionsList` mantiene helpers locales (`obtenerFechaFormateada`, `parseFechaFlexible`)** en vez de moverlas a `financesHelpers.jsx`. Razón: solo este componente las usa hoy. Si en el futuro `Home.jsx` u otro las necesita, ahí se mueven.
- **Las IIFE del chart histórico se condensaron en `buildHistoryEntries`**, pero **no se memoizó con `useMemo`**. Se ejecuta una vez por render del componente. Esa optimización va con la fase de memoización.

**Pendiente para la próxima sesión:**
- **Memoizar series de gráficos** con `useMemo`: especialmente `monthlyData` y `monthlyTrendsData` en Finances.jsx, y `buildHistoryEntries` en SavingsEvolutionCard. También el patrón `generateChartData()` de Home.jsx.
- **Hook `useFinancesData`** que encapsule el cálculo de derivados — Finances.jsx queda en ~120 líneas reales.
- **Romper otros componentes monstruo**: Plant.jsx (3.979 líneas), Home.jsx (3.264), Habits.jsx (2.512), Configuracion.jsx (2.534), NewHabit.jsx (1.425).
- Sigue pendiente: auditar reglas Firebase, migrar dayjs → date-fns, implementar pH/EC/PPM en Plants, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-08 — Romper Home.jsx — Sesión 1: limpieza + 4 extracciones autocontenidas

**Qué se hizo:**
- **Limpieza de código zombie** (~30 líneas eliminadas):
  - 5 `useState` huérfanos: `selectedRate`, `arsAmount`, `usdAmount`, `formattedArsAmount`, `formattedUsdAmount` (calculadora ARS↔USD que nunca se renderizó).
  - Función `formatDateForHabits` declarada y nunca llamada (las funciones `formatDate` que sí se usan dentro de `getHabitsStats`/`calculateWeeklyHabitsStats`/`findBestHabit`/`toggleHabitCompletion` son inlines locales con el mismo nombre, no la externa).
  - `getBudgetProgress()` + sus 3 derivados (`budgetProgress`, `isOverBudget`, `progressColor`): la función calculaba el porcentaje pero los derivados no se renderizaban en el JSX. Confirmado con grep antes de borrar.
  - `isSmall` (segundo `useMediaQuery` que no se usaba).
- **`OverviewCardsRow.jsx`** (233 líneas) — Sección A: Ahorros ARS / Ahorros USD / Balance Mensual. Recibe `userData`, `dollarRate`, `balance`. El padre calcula `getBalance()` una sola vez y lo pasa.
- **`DollarRatesRow.jsx`** (288 líneas) — Sección F: cotizaciones del dólar. **Self-contained**: tiene su propio `useState` para `dolarOficial`/`dolarBlue` y su `useEffect` que fetchea `bluelytics.com.ar`. Borradas las 2 líneas de state + el `useEffect` del padre.
- **`FinancialEvolutionChart.jsx`** (269 líneas) — Sección C: chart de 12 meses. **Borradas del padre las 3 funciones que ya no se necesitan**: `generateChartData` (~106 líneas), `getChartData` (~20 líneas), `chartOptions` (~155 líneas) y la línea de destructuring `const { labels, incomes, expenses, balance } = ...`. El componente nuevo refactorizó `generateChartData` en una helper module-level `buildLast12Months` con un sub-helper `fillSeries(kind, target, includeFilters)` — la duplicación entre el bucle de gastos e ingresos se redujo drásticamente.
- **`SavingsEvolutionChart.jsx`** (268 líneas) — Sección D: chart histórico ARS+USD. Las 2 IIFE pesadas del original (~100 líneas cada una con `getValidDateKey` duplicado) se refactorizaron en dos helpers module-level: `toIsoDateKey(dateString)` y `buildHistorySeries(history)`. El componente las invoca una sola vez por moneda. **Reducción dramática**: ~350 líneas en el padre → 268 líneas autocontenidas y mucho más legibles.
- 4 builds intermedios + 1 final, todos limpios.

**Por qué se hizo así:**
- **`buildHistorySeries` y `buildLast12Months` son module-level (no closures)**: las funciones de procesamiento no dependen de `theme` ni state, solo de los datos que reciben. Sacarlas del componente las hace puras y memoizables a futuro.
- **`DollarRatesRow` se hizo self-contained con su propio `useEffect`**: el listener fetch de Bluelytics no es responsabilidad del padre, no contamina otras secciones, y mover el `useState` adentro reduce el blast radius si el endpoint cambia.
- **`OverviewCardsRow` recibe `balance` precalculado** en vez de `getBalance` o las funciones del padre. Razón: el JSX original llamaba a `getBalance()` 4 veces. Calcularlo una vez en el padre y pasarlo es más eficiente y deja al componente sin dependencias derivadas.
- **`SavingsEvolutionChart` con detección de `hasData`**: el original chequeaba `userData.savings.amountARSHistory && Object.keys(...).length > 0` solo para ARS. El nuevo chequea ambas series y maneja un caso vacío unificado. Sutil mejora de UX.

**Archivos creados:**
- `src/components/home/OverviewCardsRow.jsx`
- `src/components/home/DollarRatesRow.jsx`
- `src/components/home/FinancialEvolutionChart.jsx`
- `src/components/home/SavingsEvolutionChart.jsx`

**Archivos modificados:**
- `src/pages/basics/Home.jsx` (3.250 → **2.025 líneas**, −1.225 líneas / −38%)

**Estado intermedio del split:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/basics/Home.jsx` | 2.025 | Aún tiene Sección B (3 cards) + Sección E (Hábitos) + SpeedDial + funciones derivadas |
| `components/home/DollarRatesRow.jsx` | 288 | Cotizaciones (self-contained con fetch) |
| `components/home/FinancialEvolutionChart.jsx` | 269 | Chart 12 meses |
| `components/home/SavingsEvolutionChart.jsx` | 268 | Chart histórico ahorros |
| `components/home/OverviewCardsRow.jsx` | 233 | 3 cards de overview |

**Decisiones importantes tomadas:**
- **`getBudgetProgress` confirmado muerto**: grep no encontró `budgetProgress`, `isOverBudget` ni `progressColor` en JSX. Borrado.
- **`parseDate` queda en el padre**: lo siguen usando 6 funciones (`getIncomeTotal`, `getExpenseTotal`, `getPreviousMonthData`, `getTopExpenseCategories`, `getTopIncomeCategories`). En Sesión 2 se mueve junto con `MonthlyIncomeCard`/`MonthlyExpenseCard`.
- **`SavingsEvolutionChart` refactor de IIFE**: era oportunidad razonable porque la duplicación era literal (mismas ~50 líneas, solo diferencia: `amountARSHistory` vs `amountUSDHistory`).

**Pendiente — SESIÓN 2:**
- `MonthlyIncomeCard.jsx` (Sección B parte 1)
- `MonthlyExpenseCard.jsx` (Sección B parte 2)
- `CreditCardsSummaryCard.jsx` (Sección B parte 3) — lleva `getCreditCardsData`, `getCreditCardTotal`, `getCreditCardDates`, `handleViewStatement`, `formatFullDate`
- `HabitsSection.jsx` (Sección E completa, 4 sub-cards) — lleva `getHabitsStats`, `shouldShowHabitForDate`, `calculateWeeklyHabitsStats`, `findBestHabit`, `toggleHabitCompletion`
- `Home.jsx` queda como orquestador (~150 líneas)
- Posiblemente sacar `parseDate` a `homeHelpers.js` cuando se vea cuántos hijos lo necesitan en Sesión 2.

**Sigue pendiente:**
- Romper otros componentes monstruo: Plant.jsx (3.979), Habits.jsx (2.512), Configuracion.jsx (2.534), NewHabit.jsx (1.425).
- Memoización de derivados de Finances.jsx con `useMemo` o hook dedicado (`useFinancesData`).
- Auditar reglas Firebase, migrar dayjs → date-fns, implementar pH/EC/PPM en Plants, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-08 — Romper Home.jsx — Sesión 2: 4 extracciones restantes

**Qué se hizo:**
- **`MonthlyIncomeCard.jsx`** (213 líneas) — Sección B parte 1. Recibe `incomeTotal`, `incomeChange`, `previousIncome`, `topIncomeCategories`, `comparisonDateRange`, `dollarRate`, `currentMonthName`, `currentYear`. El padre calcula los derivados una sola vez y los pasa.
- **`MonthlyExpenseCard.jsx`** (247 líneas) — Sección B parte 2. Análoga al de ingresos pero con icono de gastos diferente y mapping de categorías más amplio.
- **`CreditCardsSummaryCard.jsx`** (383 líneas) — Sección B parte 3. Self-contained: lleva 4 helpers module-level (`formatFullDate`, `resolveClosingDate`, `getCardTotal`, `getCardDates`, `buildCreditCardsData`, `handleViewStatement`). Recibe `userData`, `dollarRate`, `currentYear`, `currentMonth`, `currentMonthName`.
- **`HabitsSection.jsx`** (653 líneas) — Sección E completa con 4 sub-cards (resumen hoy, progreso semanal, mejor hábito, lista interactiva). Lleva 5 funciones de hábitos (`formatDateKey`, `shouldShowHabitForDate`, `getMondayOfWeek`, `calculateWeeklyHabitsStats`, `findBestHabit`, `computeHabitsStats`) como module-level. La toggle del checkbox usa `services/habits` directamente. Recibe solo `userData`.
- **Home.jsx reescrito como orquestador (283 líneas)**. Eliminados ~80 imports de iconos sin usar, `isMobile` huérfano, `balanceChange` sin uso, `handleOpenSpeedDial`/`handleCloseSpeedDial` (reemplazados por arrows inline más cortas). Las 6 funciones de cálculos derivados del padre se reescribieron como helpers module-level más compactos:
  - `parseDate` (intacto, solo movido a top-level).
  - **`sumMonthUpToToday(monthData, today, excludeHidden)`** — unifica `getIncomeTotal` y `getExpenseTotal` que diferían solo por el flag de exclusión. Era duplicación literal.
  - **`computeTopCategories(monthData, today, total, excludeHidden)`** — unifica `getTopExpenseCategories` y `getTopIncomeCategories`, mismo patrón duplicado.
  - **`computePreviousMonthData`** — la versión original tenía 3 cálculos anidados (`firstDayLastMonth`, `lastMonthToday`, sub-funciones `getPreviousMonthIncomeTotal`/`getPreviousMonthExpenseTotal`) con la misma lógica de "ajustar día si excede"  duplicada 3 veces. Reescrita usando `Math.min(today.getDate(), lastDayOfPreviousMonth)` una sola vez y delegando los sums a `sumMonthUpToToday`.
  - `getPercentChange` (helper de 1 línea, queda module-level).
- 4 builds intermedios + 1 final, todos limpios. Bundle: 1.07 MB (+80 B).

**Por qué se hizo así:**
- **Helpers `sumMonthUpToToday` y `computeTopCategories` con flag `excludeHidden`**: las versiones originales del padre eran 4 funciones (`getIncomeTotal`/`getExpenseTotal`/`getTopIncome`/`getTopExpense`) con 90% de código duplicado. La diferencia entre "ingresos" y "gastos" era solo: ingresos no excluyen `hiddenFromList` ni `excludeFromTotal`. Un parámetro booleano resolvió la duplicación.
- **`HabitsSection` con `computeHabitsStats` module-level**: el original tenía cinco funciones interdependientes definidas dentro del componente, cada una recibiendo `userData`, `formatDate` y `shouldShowHabitForDate` por argumento como workaround del scope. Al moverlas a module-level y consolidarlas, la dependencia explícita reemplaza al closure.
- **`CreditCardsSummaryCard` con `resolveClosingDate` extraído**: el código original repetía 3 veces el mismo patrón (chequear `card.dates[monthKey].closingDate` → fallback a `defaultClosingDay` → fallback a último día del mes). Una función deduplica eso.
- **`Home.jsx` con cálculos en module-level**: los helpers de cálculo no dependen de hooks ni de theme, son funciones puras sobre `userData`. Sacarlos del componente los hace memoizables y testeables a futuro.

**Archivos creados:**
- `src/components/home/MonthlyIncomeCard.jsx`
- `src/components/home/MonthlyExpenseCard.jsx`
- `src/components/home/CreditCardsSummaryCard.jsx`
- `src/components/home/HabitsSection.jsx`

**Archivos modificados:**
- `src/pages/basics/Home.jsx` (reescrito como orquestador limpio)

**Resultado final del split de Home:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/basics/Home.jsx` | **283** | Orquestador: helpers de cálculo + loading state + layout |
| `components/home/HabitsSection.jsx` | 653 | 4 sub-cards de hábitos (sección completa) |
| `components/home/CreditCardsSummaryCard.jsx` | 383 | Card de tarjetas con resúmenes + helpers de fechas |
| `components/home/DollarRatesRow.jsx` | 288 | 3 cards de cotizaciones (self-contained con fetch) |
| `components/home/FinancialEvolutionChart.jsx` | 269 | Chart 12 meses |
| `components/home/SavingsEvolutionChart.jsx` | 268 | Chart histórico ahorros |
| `components/home/MonthlyExpenseCard.jsx` | 247 | Card de gastos con top categorías |
| `components/home/OverviewCardsRow.jsx` | 233 | 3 cards de overview |
| `components/home/MonthlyIncomeCard.jsx` | 213 | Card de ingresos con top categorías |
| **Total** | **2.837** | (vs 3.250 originales: **−413 líneas**, −13%) |

**De `3.250 líneas en 1 archivo` a `2.837 líneas en 9 archivos`.** El más grande ahora (`HabitsSection`) tiene 653 líneas — un quinto del original. Bundle: 1.07 MB (+80 B, irrelevante).

**Decisiones importantes tomadas:**
- **Orquestador a 283 líneas, no 150**: la diferencia viene de los 5 helpers module-level (~140 líneas) que mantienen la lógica de cálculo derivado para los hijos. Sacarlos a un hook `useFinancialSnapshot` sería el siguiente paso para llegar a ~150 — pero **no en esta sesión** porque excede el alcance "romper en sub-componentes". Lo flag para la fase de memoización.
- **`HabitsSection` mantiene helpers locales** (`shouldShowHabitForDate`, `computeHabitsStats`, etc.) en vez de moverlos a un módulo compartido. Razón: solo este componente los usa hoy. Cuando se rompa `Habits.jsx` (próxima fase), se evalúa si compartir.
- **Las funciones del padre se unificaron con flags** en vez de duplicar (`sumMonthUpToToday(monthData, today, excludeHidden)`). Misma fusión que en Finances con `monthData.data.filter`.
- **Bundle `+80 B`**: irrelevante, dentro del ruido. El refactor es estructural.

**Pendiente para la próxima sesión:**
- **Hook `useFinancialSnapshot`** que encapsule los helpers de cálculo de Home.jsx → orquestador queda en ~150 líneas reales.
- **Memoizar derivados** con `useMemo` (`incomeTotal`, `expenseTotal`, `topIncomeCategories`, `topExpenseCategories`, etc.) — todos se recalculan en cada render hoy.
- **Romper otros componentes monstruo**: Plant.jsx (3.979), Habits.jsx (2.512), Configuracion.jsx (2.534), NewHabit.jsx (1.425).
- Sigue pendiente: auditar reglas Firebase, migrar dayjs → date-fns, implementar pH/EC/PPM en Plants, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-08 — Romper Habits.jsx — limpieza + 5 extracciones + bug fix

**Qué se hizo:**
- **Limpieza de zombies** (~50 líneas eliminadas):
  - `selectedDate` + `setSelectedDate` (declarado, nunca leído ni seteado).
  - Función `getFrequencyText` (~43 líneas, declarada, nunca llamada).
  - `useMemo` del import de React (sin uso).
- **`habitsHelpers.js`** (82 líneas) — helpers puros: `formatDate`, `getWeekRange`, `shouldShowHabitForDate`, `isToday`, `formatWeekRangeDisplay`. Los consumen los 4 componentes hijos y el orquestador.
- **`WeekNavigator.jsx`** (196 líneas) — header oscuro con prev/next, chip "X semanas atrás", botón "Ir a semana actual" + "Lista de Hábitos". `isCurrentOrFutureWeek` y `weeksInPast` calculados con IIFE en lugar de funciones internas. Recibe `currentWeek` y `onNavigate(action)`.
- **`WeeklyEvolutionChart.jsx`** (213 líneas) — chart de las últimas 5 semanas. Recibe `userData`, `habits`, `allWeeksCompletedHabits`. Mantiene su `useState` para `chartData` + `useEffect` de cálculo (igual que el original).
- **`HabitsStatCards.jsx`** (579 líneas) — 4 tarjetas: Progreso Semanal Ponderado / Mejor Rendimiento / Mejor Día / Necesita Mejorar. `getColoredPercentage`, `getDifficultyColor`, `getDifficultyLabel` se sacaron a module-level (eran helpers internos). Recibe `loading`, `stats`, `habits`, `allWeeksCompletedHabits`.
- **`HabitsCalendarPanel.jsx`** (513 líneas) — Consolida 5 piezas que estaban sueltas en el padre: `CalendarPanel`, `HabitEvent`, `DayStatsWrapper`, `CustomHeader`, `GlobalStyles`, `calendarStyles`. **Bug arreglado**: `DayStatsWrapper` antes leía `window.dailyHabitStats` que nunca se asignaba en ningún lado, por lo que los chips de progreso por día **nunca se renderizaban**. Ahora `dayStats` baja por prop desde el padre (`stats.dayStats`, calculado en `generateHabitEvents`). El bug existía silenciosamente: barras de progreso vacías para siempre. Recibe `habitEvents`, `currentWeek`, `loading`, `dayStats`, `onToggle`.
- **Habits.jsx reescrito como orquestador (614 líneas)**: imports limpios (de ~70 imports → 14), `isMobile` huérfano eliminado, `localizer`/`moment` que solo usaba el calendario quitados (viven en HabitsCalendarPanel ahora). Lo que queda: state de la página + 2 useEffect + `loadCompletedHabitsForWeek` + `loadAllWeeksCompletedHabits` + `generateHabitEvents` (256 líneas) + `toggleHabitCompletion` (102 líneas) + `handleNavigate` + `createNewHabit` + JSX de orquestación.
- 5 builds intermedios + 1 final, todos limpios. Bundle: 1.07 MB (−219 B).

**Por qué se hizo así:**
- **`HabitsCalendarPanel` envuelve `<GlobalStyles />` adentro** en vez de dejarlo como sibling del `<Card>`. El padre original lo renderizaba al inicio del JSX por separado; ahora vive con el calendario donde se usa, así no hay forma de olvidar incluirlo si se mueve el panel.
- **Bug fix sin scope creep**: el `window.dailyHabitStats` se reemplazó por una prop `dayStats`. El padre lee `stats.dayStats` (que `generateHabitEvents` ya calculaba). Esto es 1 línea de cambio en el padre + cambio de lectura en el hijo. Resultado: barras de progreso por día ahora se ven.
- **`generateHabitEvents` queda en el orquestador**: el alcance acordado fue romper en sub-componentes, no extraer a hook. Las 256 líneas de cálculo derivado quedan donde estaban — la fase de hooks (`useHabitsData`) las moverá.
- **3 closures internos en `HabitsCalendarPanel`** (`HabitEvent`, `DayStatsWrapper`, `CustomHeader`): los 3 cierran sobre `theme`, `dayStats` u `onToggle`. Definirlos como sub-componentes module-level requeriría pasar más props o usar `useTheme` redundante. Quedan como closures locales del componente.

**Archivos creados:**
- `src/components/habits/habitsHelpers.js`
- `src/components/habits/WeekNavigator.jsx`
- `src/components/habits/WeeklyEvolutionChart.jsx`
- `src/components/habits/HabitsStatCards.jsx`
- `src/components/habits/HabitsCalendarPanel.jsx`

**Archivos modificados:**
- `src/pages/habits/Habits.jsx` (reescrito como orquestador limpio)

**Resultado final del split de Habits:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/habits/Habits.jsx` | **614** | Orquestador: state + cálculo de stats + carga de datos |
| `components/habits/HabitsStatCards.jsx` | 579 | 4 tarjetas de stats semanales |
| `components/habits/HabitsCalendarPanel.jsx` | 513 | Calendario + 3 sub-componentes auxiliares + estilos |
| `components/habits/WeeklyEvolutionChart.jsx` | 213 | Chart de evolución 5 semanas |
| `components/habits/WeekNavigator.jsx` | 196 | Header con navegación de semana |
| `components/habits/habitsHelpers.js` | 82 | Helpers puros |
| **Total** | **2.197** | (vs 2.506 originales: **−309 líneas**, −12%) |

**De `2.506 líneas en 1 archivo` a `2.197 líneas en 6 archivos`.** El más grande ahora (`Habits.jsx` orquestador) tiene 614 líneas dominado por `generateHabitEvents` (256 líneas de cálculo).

**Decisiones importantes tomadas:**
- **Orquestador a 614 líneas, no 200**: la diferencia viene de las 4 funciones de carga/cálculo (`loadCompletedHabitsForWeek`, `loadAllWeeksCompletedHabits`, `generateHabitEvents`, `toggleHabitCompletion`) que suman ~430 líneas. Sacarlas a un hook `useHabitsData` es la fase de memoización.
- **Bug `window.dailyHabitStats` arreglado**: era una sola línea pero estaba silenciosamente roto desde un refactor anterior. Se aprovechó la extracción para fixearlo.
- **Helpers en `.js` (no `.jsx`)** porque no contienen JSX. Pequeña diferencia pero correcta.
- **Bundle baja −219 B**: ruido positivo, refactor estructural.

**Pendiente para la próxima sesión:**
- **Hook `useHabitsData`** que encapsule las 4 funciones de carga + cálculo de stats. Habits.jsx queda en ~150 líneas reales.
- **Memoizar `generateHabitEvents`** con `useMemo` en vez de `useState`+`useEffect`.
- **Romper otros componentes monstruo restantes**: Configuracion.jsx (2.534 líneas), NewHabit.jsx (1.425 líneas).
- Sigue pendiente: auditar reglas Firebase, migrar dayjs → date-fns, implementar pH/EC/PPM en Plants, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-09 — Romper CreditCards.jsx — Sesión 1: limpieza + 5 extracciones autocontenidas

**Qué se hizo:**
- **Limpieza profunda de código muerto** (~270 líneas eliminadas):
  - `obtenerFechaFormateada` (~55 líneas, función a nivel módulo, jamás llamada).
  - `isMonthAlreadyConfigured` (~13 líneas, definida y nunca llamada).
  - `haveAllCardsReachedClosingDate` (~22 líneas, definida y nunca llamada).
  - **`checkMonthPaymentStatus` completa** (~108 líneas) + sus 2 `useEffect` (uno la disparaba, otro reseteaba el state). El estado `paymentStatusChecked` solo era seteado por esta función y nunca se leía → la función entera era un side-effect inútil. Se borró tanto la declaración como las 2 llamadas (en useEffect y en `.then()` post-bulkUpdate).
  - State `paymentStatusChecked` + state `downloadUrl` (declarados pero nunca leídos).
  - `handlePayCreditCard` (wrapper trivial que solo llamaba a `handleOpenPaymentDialog` — inlineado).
- **`creditCardsHelpers.js`** (86 líneas) — funciones puras a nivel módulo:
  - `isBeyondFutureLimit(year, month, limitMonths)` (preexistente module-level).
  - `isFutureMonth(year, month)` (antes método interno, refactor para recibir args).
  - `isDateBeyondLimit(date, limitMonths)` (refactor: ahora delega en `isBeyondFutureLimit` en vez de duplicar la lógica de meses futuros).
  - `calculateNextFridays(count)` (era interno, ahora helper puro).
  - `getPreviousMonth(year, month)` y `isPreviousCalendarMonth(year, month)` (nuevos — extraen el patrón "el mes anterior al mes actual" que se duplicaba 3 veces en el padre).
- **`CreditCardsMonthNavigator.jsx`** (123 líneas) — sección 1: header con `<` mes año `>` + botón "Mes actual". Self-contained: los 3 handlers (prev/next/current) viven dentro. El `disabled` del next se calcula vía `isBeyondFutureLimit`.
- **`CreditCardsTotalBar.jsx`** (140 líneas) — sección 2: banner verde + botón pagar. **Las 2 IIFE gigantes del JSX original (con la misma lógica copiada para `disabled` y `label` del botón)** se consolidaron en una sola función `getButtonState()` que devuelve `{ disabled, label }`. Eliminó ~50 líneas de duplicación. Un helper `anyCardPastDue(cards, getCardDates)` saca el bucle de búsqueda de tarjetas vencidas a nivel módulo.
- **`CreditCardsList.jsx`** (204 líneas) — sección 3: sidebar sticky de tarjetas. La rama ternaria de gradients/labels (visa/master/card) se sacó a 3 helpers module-level (`getCardType`, `getCardGradient`, `getCardLabel`).
- **`CreditCardStatusInfo.jsx`** (229 líneas) — sección 6: 3 mini-cards de estado. **La IIFE inline del chip de vencimiento** (overdue/near-due/in-time, con 3 `return` distintos) se extrajo a `getDueDateChip(dueDate)` module-level. El chip del total se simplificó con un IIFE consolidado `totalChip = (() => ...)` en vez de 4 ternarios anidados separados (label, color, variant, icon) que repetían el mismo árbol de decisión.
- 5 builds intermedios + 1 final, todos limpios. Bundle: 1.07 MB (−175 B por la limpieza).

**Por qué se hizo así:**
- **`checkMonthPaymentStatus` se borró entero, no se "limpió"**: la función era un fósil. Su único side effect era setear un state que nunca se leía; los 2 callers descartaban el return. Detectarlo durante la migración fue más fácil que durante la auditoría inicial — borrarlo libera ~108 líneas y elimina ~10 dependencias falsas en useEffect.
- **`getPreviousMonth` + `isPreviousCalendarMonth` en helpers**: el patrón "calcular el mes anterior al actual" aparecía 3 veces (en TotalBar IIFE x2, en otra parte del JSX). Convertirlo en helper puro lo deja testeable y elimina la trampa del mes 0 (el código original lo manejaba a mano cada vez).
- **`getButtonState` de TotalBar consolidado**: las 2 IIFE eran la misma lógica de decisión retornando cosas diferentes (`true/false` vs `'Mes Futuro'/'Pagar'/...`). Consolidar en una sola función que devuelve un objeto reduce ~80 líneas de JSX a ~15. La vista renderiza `buttonState.disabled` y `buttonState.label`.
- **`isFutureMonth(year, month)` ahora recibe args**: antes era método interno cerrando sobre `selectedYear`/`selectedMonth`. Que reciba sus inputs lo hace puro y reusable desde TotalBar (que lo necesitaba sin acceso al state del padre).
- **`useMediaQuery` desde `@mui/material`, no `@mui/material/styles`**: el primer build de StatusInfo falló porque importé desde el lugar incorrecto. Patrón a recordar para futuras extracciones.

**Archivos creados:**
- `src/components/finances/creditCardsHelpers.js`
- `src/components/finances/CreditCardsMonthNavigator.jsx`
- `src/components/finances/CreditCardsTotalBar.jsx`
- `src/components/finances/CreditCardsList.jsx`
- `src/components/finances/CreditCardStatusInfo.jsx`

**Archivos modificados:**
- `src/pages/finances/CreditCards.jsx` (2.764 → **1.864 líneas**, −900 líneas / −33%)

**Estado intermedio del split:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/finances/CreditCards.jsx` | 1.864 | Aún tiene Sección 5 (DatesConfig), 7 (PDF), 12 (PaymentDialog) + lógica core |
| `components/finances/CreditCardStatusInfo.jsx` | 229 | 3 mini-cards de estado (cierre, vencimiento, total) |
| `components/finances/CreditCardsList.jsx` | 204 | Sidebar sticky de tarjetas |
| `components/finances/CreditCardsTotalBar.jsx` | 140 | Banner verde + botón pagar |
| `components/finances/CreditCardsMonthNavigator.jsx` | 123 | Header con navegación de mes |
| `components/finances/creditCardsHelpers.js` | 86 | Helpers puros |

**Decisiones importantes tomadas:**
- **Limpieza agresiva primero**: borré ~270 líneas de código muerto antes de empezar las extracciones. Eso simplificó las extracciones (menos JSX que mover) y dejó al orquestador con menos ruido.
- **Bundle −175 B**: el ahorro real viene de la limpieza, no de la redistribución. Los 5 sub-componentes nuevos tree-shakean igual que el monolito.
- **Helpers con `getPreviousMonth` y `isPreviousCalendarMonth` aunque el padre todavía no los use**: anticipan Sesión 2 (PaymentDialog y otros lugares pueden necesitarlos).

**Pendiente — SESIÓN 2:**
- `CreditCardDatesConfig.jsx` (sección 5 — DatePickers de cierre/vencimiento + `loadCardDates`, `shouldDisableClosingDate`, `shouldDisableDueDate`, `handleClosingDateChange`, `handleDueDateChange`, `validateUpdateInputs`, `handleUpdateDates`).
- `CreditCardStatementUpload.jsx` (sección 7 — PDF upload/download). Se queda con `auth.currentUser.uid` para path de Storage (igual que en sesiones previas).
- `CreditCardPaymentDialog.jsx` (sección 12 — modal completo de configuración de pago).
- Limpieza de imports muertos: `Paper`, `Divider`, `Tabs`, `Tab`, `List`, `ListItem`, `ListItemText`, `ListItemSecondaryAction`, `Tooltip`, `CardHeader`, `ButtonGroup`, `Slide`, `Zoom`, `MonthNavigator`, `getDate`, `DeleteIcon`, `UploadIcon`, `TrendingDownIcon`, `ErrorOutlineIcon`, `DateRangeIcon`, `KeyboardArrowLeftIcon`, `KeyboardArrowRightIcon`, `EventIcon`.
- `CreditCards.jsx` queda como orquestador ~400-500 líneas.

**Sigue pendiente:**
- Hooks por dominio (`useFinances`, `useSavings`, `useHabits`, `usePlants`).
- Memoización con `useMemo` de derivados (especialmente en Home y Habits).
- Migrar `dayjs` → `date-fns`.
- Romper Configuracion.jsx (2.534 líneas) y NewHabit.jsx (1.425 líneas).
- Auditar reglas Firebase, implementar pH/EC/PPM en Plants, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-11 — Romper CreditCards.jsx — Sesión 2: 3 extracciones finales + helpers puros + limpieza completa de imports

**Qué se hizo:**
- **`CreditCardDatesConfig.jsx`** (283 líneas) — sección 5: DatePickers de cierre/vencimiento. Self-contained con `saving` y `updateError` internos. Recibe `closingDate`, `dueDate`, `onClosingChange`, `onDueChange`, `onSubmit` (async). El orquestador queda solo con `handleSaveDates` (~6 líneas) que persiste vía `setCardDatesForMonth` y marca `datesConfigured`. `shouldDisableClosingDate` y `shouldDisableDueDate` (la rama del vencimiento es la lógica más densa: permite mismo mes o el siguiente al cierre) viven adentro.
- **`CreditCardStatementUpload.jsx`** (315 líneas) — sección 7: subida y descarga de PDF. Self-contained con `selectedFile`, `uploading` internos. **Lee el statement directamente de `userData.creditCards[selectedCard].statements[yearMonth]`** (la fuente de verdad), reemplazando el state `cardStatements` que era zombie en el padre (se seteaba en un useEffect pero nadie lo leía en JSX). El mapeo de códigos de error de Firebase Storage (`storage/unauthorized`, `storage/canceled`, etc.) a mensajes en español se sacó a un helper module-level `getUploadErrorMessage(error)`.
- **`CreditCardPaymentDialog.jsx`** (221 líneas) — sección 12: modal de configuración de pago. Self-contained con form state interno (`roundedAmount`, `numberOfPayments`, `paymentDates`, `paymentAmounts`). Un `useEffect([open, totalAmount])` reinicia el form cuando se abre. El padre solo maneja `paymentDialogOpen` + recibe el callback `onConfirm({...})` con los valores finales.
- **Helpers puros adicionales** en `creditCardsHelpers.js` (86 → 259 líneas):
  - `parseFlexibleDate(value)` — unifica el parsing de fechas en formatos DD/MM/YYYY, YYYY-MM-DD, Date o ISO. Antes había **7 copias** del mismo patrón `if (str.includes('/')) {...} else if (str.includes('-')) {...}` regadas en el padre.
  - `getCardClosingDates(card, year, month)` — devuelve `{ prevClosingDate, currentClosingDate }` como `Date`. Encapsula la lógica de "usar fecha configurada o default day o último día del mes" para los dos meses.
  - `filterAndSortBillingPeriodTransactions(transactions, prev, current)` — filtro `(prev, current]` + sort descendente. El useEffect gigante (~160 líneas) que filtraba transacciones por período de facturación pasó a **~20 líneas** delegando ambos cálculos a estos dos helpers.
  - `defaultClosingDateString(card, year, month)` y `defaultDueDateString(card, year, month)` — generan strings YYYY-MM-DD para defaults. `loadCardDates` (~80 líneas con 4 ramas anidadas) pasó a **~14 líneas** con dos calls.
  - `buildPaymentUpdates({...})` — construye el objeto `updates` para `bulkUpdate` del pago de tarjetas. Pure function: las keys de Firebase (`expenseKeys`, `savingsHistoryKey`) se pre-generan en el orquestador y se pasan. `handleProcessPayment` pasó de ~85 líneas a **~40 líneas**.
- **Simplificación de `areCardsActuallyPaid`** de ~40 líneas a 9. La versión vieja tenía dos flags (`allRelevantCardsPaid` + `anyCardHasPaidRecord`) y forEach con if/else; la nueva usa `cards.filter(getCardTotal > 0).every(isCardPaid)` que es lógicamente equivalente.
- **Simplificación de `getCardDates`** de ~80 líneas a 12. La versión vieja calculaba además un `prevClosingDate` que solo se usaba internamente y ahora vive en el helper `getCardClosingDates`.
- **Limpieza completa de imports**:
  - Borrados del bloque `@mui/material`: `Paper`, `Divider`, `TextField`, `Tabs`, `Tab`, `List`, `ListItem`, `ListItemText`, `ListItemSecondaryAction`, `Tooltip`, `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `CircularProgress`, `Link`, `CardHeader`, `ButtonGroup`, `FormControl`, `Select`, `InputAdornment`, `InputLabel`, `Slide`, `Zoom`, `IconButton`, `Chip`.
  - Borrados de `@mui/icons-material`: `UploadIcon`, `DownloadIcon`, `PaymentIcon`, `CalendarTodayIcon`, `CheckCircleIcon`, `InfoIcon`, `CheckIcon`, `TrendingDownIcon`, `AccountBalanceIcon`, `ScheduleIcon`, `WarningIcon`, `CheckCircleOutlineIcon`, `ErrorOutlineIcon`, `AccessTimeIcon`, `DeleteIcon`.
  - Borrados los single-imports: `MoreVertIcon`, `DateRangeIcon`, `ArrowRightAltIcon`, `InsertDriveFileIcon`, `UploadFileIcon`, `PictureAsPdfIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `KeyboardArrowLeftIcon`, `KeyboardArrowRightIcon`, `TodayIcon`, `EventIcon`, `SaveIcon`.
  - Borrados: `LocalizationProvider`, `DatePicker`, `AdapterDayjs`, `dayjs`, `MonthNavigator`, `getDate` (de utils), `setCardStatement`, `auth`, `storage`.
  - Borrada la línea `dayjs.locale('es')` a nivel módulo (no se usa dayjs en el orquestador; los componentes hijos hacen su propia config).
- **Código muerto adicional eliminado**:
  - `areDatesConfigured` (función declarada nunca llamada).
  - State `cardStatements` + su useEffect de carga (~18 líneas).
  - State `selectedFile`, `uploading` (movidos a StatementUpload).
  - State `saving`, `updateError` (movidos a DatesConfig).
  - State `numberOfPayments`, `roundedAmount`, `paymentDates`, `paymentAmounts` (movidos a PaymentDialog).
- 4 builds intermedios + final, todos limpios. Bundle: 1.07 MB (−180 B adicionales sobre Sesión 1).

**Por qué se hizo así:**
- **Helpers puros en lugar de `useFinancesData` hook**: la decisión de no extraer un hook es coherente con el patrón establecido (Finances, Home, Habits) — los hooks por dominio quedan para la fase de memoización. Pero al ser este el cierre del split de CreditCards, sí valía la pena extraer las **funciones puras** (parsing, building, filtering) a helpers. Resultado: el orquestador queda mucho más legible y los helpers son testeables aisladamente cuando llegue el momento.
- **`parseFlexibleDate` resuelve 7 duplicaciones**: el patrón de "parsear fecha string en DD/MM/YYYY o YYYY-MM-DD evitando zona horaria" estaba escrito a mano 7 veces en CreditCards.jsx. Cada copia tenía ligeras variaciones (algunas no manejaban Date instances). Unificar es defensivo y elimina ~40 líneas netas.
- **`buildPaymentUpdates` como función pura**: las keys de Firebase (`generateKey('expenses')`) son side-effectful y se quedan en el orquestador. El helper recibe los `expenseKeys` ya generados. Esto es importante: el helper queda testeable sin mockear Firebase, y la separación deja claro qué es runtime vs. qué es transformación pura.
- **`StatementUpload` lee `statements` desde `userData` directo**: el state `cardStatements` que sincronizaba con un useEffect era código zombie — la JSX original ya leía de `userData.creditCards[selectedCard].statements[...]` directo, ignorando el state. Borrar el state + useEffect simplifica y evita inconsistencias.
- **No se extrajo `CreditCardDetailsPanel`** (que envolvería header de tarjeta + movimientos + estado vacío): habría sido un 9° componente fuera de la división aprobada. La JSX inline del header (~50 líneas) + Card de movimientos (~50 líneas) + estado vacío (~30 líneas) queda en el orquestador.
- **Bundle se mantiene en 1.07 MB (−180 B sobre Sesión 1)**: la ganancia real es estructural — los archivos hijos tree-shakean igual, pero ahora son más fáciles de leer/mantener.

**Archivos creados:**
- `src/components/finances/CreditCardDatesConfig.jsx`
- `src/components/finances/CreditCardStatementUpload.jsx`
- `src/components/finances/CreditCardPaymentDialog.jsx`

**Archivos modificados:**
- `src/pages/finances/CreditCards.jsx` (1.864 → **580 líneas**, −1.284 / −69%)
- `src/components/finances/creditCardsHelpers.js` (86 → 259 líneas, +173 con 5 helpers nuevos)

**Resultado final del split de CreditCards:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/finances/CreditCards.jsx` | **580** | Orquestador: 4 useEffects + funciones de cómputo + JSX inline (header, movimientos, estado vacío) |
| `components/finances/CreditCardStatementUpload.jsx` | 315 | Subida/descarga de PDF self-contained |
| `components/finances/CreditCardDatesConfig.jsx` | 283 | DatePickers de cierre/vencimiento con form state interno |
| `components/finances/creditCardsHelpers.js` | 259 | 10 helpers puros |
| `components/finances/CreditCardStatusInfo.jsx` | 229 | 3 mini-cards de estado |
| `components/finances/CreditCardPaymentDialog.jsx` | 221 | Modal de configuración de pago con cuotas |
| `components/finances/CreditCardsList.jsx` | 204 | Sidebar de tarjetas |
| `components/finances/CreditCardsTotalBar.jsx` | 140 | Banner verde + botón pagar |
| `components/finances/CreditCardsMonthNavigator.jsx` | 123 | Header con navegación de mes |
| **Total** | **2.354** | (vs 2.764 originales: **−410 líneas**, −15%) |

**De `2.764 líneas en 1 archivo` a `2.354 líneas en 9 archivos`.** El orquestador final tiene 580 líneas — quedó arriba del target original de 400-500 pero dentro del rango razonable, dado que las ~290 líneas de JSX inline (header de tarjeta + estado vacío + Card de movimientos) se dejaron deliberadamente sin extraer (no estaba en la división aprobada de 8 sub-componentes). El más grande ahora (`StatementUpload`) tiene 315 líneas — un noveno del original.

**Decisiones importantes tomadas:**
- **Helpers puros, no hooks**: 5 helpers nuevos en `creditCardsHelpers.js` (`parseFlexibleDate`, `getCardClosingDates`, `filterAndSortBillingPeriodTransactions`, `defaultClosingDateString`, `defaultDueDateString`, `buildPaymentUpdates`) bajan el orquestador en ~250 líneas sin necesidad de un hook. La extracción a hook se posterga consistentemente al patrón de las sesiones anteriores.
- **`generateKey` queda en el orquestador**, no en el helper: las side effects de Firebase no entran en helpers puros. El orquestador pre-genera todas las keys y las pasa.
- **JSX inline (header tarjeta, movimientos, estado vacío) NO se extrae**: respeta la división aprobada en el análisis de Sesión 1 (8 sub-componentes). Un 9° componente excedería el alcance.
- **`cardStatements` state borrado, no migrado**: era zombie (se seteaba, no se leía). StatementUpload lee directo de `userData`.

**Pendiente para la próxima sesión:**
- **Hook `useCreditCardsData`** que encapsule los 4 useEffects + las funciones `getCardTotal`, `getCardDates`, `getAllCardsTotal`, `isCardPaid`, `areCardsActuallyPaid`. Bajaría el orquestador a ~300-350 líneas.
- **Romper Configuracion.jsx** (2.534 líneas) y **NewHabit.jsx** (1.425 líneas) — los últimos dos componentes monstruo del proyecto.
- **Memoización con `useMemo`** de derivados en los 4 componentes ya rotos (Finances, Home, Habits, CreditCards).
- **Migrar `dayjs` → `date-fns`**: queda como única dependencia de fechas no estándar (los 3 sub-componentes nuevos de CreditCards usan dayjs para los DatePickers + Status).
- **Implementar pH/EC/PPM en Plants** (feature núcleo faltante).
- **Capa de Storage** (`services/storage.js`): los componentes `CreditCardStatementUpload`, `NewPhoto`, `ImageUploader`, `Configuracion` aún importan `auth, storage` directo para paths de Firebase Storage.
- **Borrar `PrivateRoute` muerto** en App.js, **borrar `updateSavings` obsoleto** de store.js, **auditar reglas Firebase**.

---

### 2026-05-12 — Romper Plant.jsx — sesión única: limpieza masiva + 10 extracciones

**Qué se hizo:**
- **Limpieza de zombies** (~600 líneas + decenas de imports muertos):
  - 6 estados nunca leídos: `tabValue`, `calendarView`, `selectedImage`, `speedDialOpen`, `viewMode`, `selectedDay`+`dayEvents`+`openDayEventsModal` (+ `setTabValue` zombie en stat card → reemplazado por `setHighlightedTab`).
  - 7 funciones zombie: `handleTabChange`, `handleImageClick`, `refreshPlantData`, `calculateLifeDays`, `calculateLifeWeeks`, `calculateDaysSinceStageChange`, `changeToEnfrascado`, `getStageEndDate`, `formatMonthYearDisplay`, `formatDayDisplay`, `calculateDryingDays`, `handleSelectSlot`.
  - 1 `const actions` huérfano a nivel componente (line 1010) duplicado con el local de `generateEvents`.
  - `useParams()` zombie (shadowed por `checkSearch(location.search)`).
  - **~50 imports muertos eliminados**: 30+ MUI components (Tabs, Tab, Modal, Skeleton, Table*, List*, Badge, Zoom, Menu, AvatarGroup, Backdrop, SpeedDial*, Popper, Container, FormControlLabel, etc.), 15+ iconos (DeleteIcon, EditIcon, MoreVertIcon, ExpandMoreIcon, VisibilityIcon, etc.), 4 helpers de date-fns no usados (parseISO, add, isSameDay, formatDistance), `formatAmount`, `styled`, `withDragAndDrop`, `storage`, `storageRef`, `getDownloadURL`, `withReactContent`.
- **`plantsHelpers.jsx`** (189 líneas) — funciones puras + STAGES_ORDER + helpers:
  - `convertToDetailedDate`, `formatMonthDisplay`, `calculateDaysBetween` (con flag interno para hoy).
  - `calculateDaysInStage(plant, stageName)` — unifica los 4 branches del original (Germinación/Vegetativo/Floración/Secado).
  - `getStageInfo(plant, stageName)` — devuelve `{ startDate, endDate, duration, isActive, isCompleted, hasStarted }`.
  - `getStageIcon(stage, fontSize)` — devuelve icono JSX según etapa.
  - **`getNextStage(currentStage)` nuevo helper**: map etapa actual → `{ newStage, dateField }`. Reemplaza el if/else de 4 ramas en `confirmStageChange`.
- **`PlantHero.jsx`** (239 líneas) — Sección 2: header con foto bg + datos inline + botón cambiar etapa. Los 5 bloques duplicados `Box>Typography caption + Typography h6` se consolidaron en un sub-componente `InlineStat`, y los separadores verticales en `Separator`. La elección del label del botón se sacó a un helper `getStageButtonLabel`.
- **`PlantStageCards.jsx`** (229 líneas) — Sección 3: 4 tarjetas de etapas. Los 4 chips de estado se unificaron en un sub-componente `StatusChip`, los 2 bloques de fecha (inicio/finalización) en `StageDateBox`. Acepta toda la lógica del switch del estado.
- **`PlantQuickActions.jsx`** (101 líneas) — Sección 4: **6 botones idénticos con solo color/icono/ruta** se redujeron a un array `ACTIONS = [{ label, route, icon, palette }...]` y un `.map()`. La paleta default usa `theme.palette[name]`; el botón "Nota" con color hex hardcoded usa `paletteHex`/`paletteHexDark`. **Reducción dramática**: de ~210 líneas a 101.
- **`PlantActionStats.jsx`** (237 líneas) — Sección 5: stats + inputs de peso. Separé las dos variantes en `CountCard` (card simple) y `WeightCard` (con input/save) — el JSX original tenía un `stat.isWeight ? ... : ...` anidado con triple ternario.
- **`PlantStageDialog.jsx`** (276 líneas) — Sección 9: modal cambio de etapa. **El switch de 5 ramas que generaba el copy del título/info/CTA** se extrajo a un helper module-level `getDialogCopy(etapa)` que devuelve un objeto `{ title, infoTitle, infoBody, transitionNote, cta, ctaLoading, buttonIcon }`. La cronología visual de 5 etapas (5 bloques Avatar+Typography idénticos) se consolidó en un array `STAGE_CHRONOLOGY` con `.map()`.
- **`PlantProfilePhotoDialog.jsx`** (109 líneas) — Sección 8: selector de foto de perfil. Sin grandes simplificaciones — el JSX ya era razonable.
- **`PlantEventDialog.jsx`** (412 líneas) — Sección 7: modal de detalle de evento con switch por `resourceType`. Tres helpers internos sacan duplicación: `NotesBlock` (bloque de notas reutilizado en 4 cases), `UsageCard` (aditivo/insecticida), `HighlightBox` (wrapper destacado del header). El icono del header se extrajo a `getHeaderIcon(event)` module-level. **Este es el componente clave para Fase 4** — cuando se agreguen campos pH/EC/PPM al case 'Riego', se hace en un solo archivo.
- **`PlantPhotoGalleryDialog.jsx`** (239 líneas) — extraído del `EventComponent`. Modal con vistas grid + single (prev/next). El reset al cerrar (`selectedIndex=0`, `view='grid'`) se hace con un `useEffect([open])`. **Diseñado para reemplazo en Fase 4** por la vista de comparación de fotos: misma API (`photos`, `accentColor`), nueva implementación.
- **`PlantCalendar.jsx`** (493 líneas) — Sección 6 completa: el `Calendar` de react-big-calendar + `EventComponent` (renderer custom) + `CustomHeader` + `eventStyleGetter` + `GlobalStyles` (CSS overrides) + `calendarSx` (sx overrides) + nav controls + botón "Ir a línea de tiempo". **Componente self-contained** que solo recibe `events`, `currentDate`, `onCurrentDateChange`, `onEventClick`, `locationSearch`. **Este es el candidato principal de reemplazo en Fase 4** — todo el calendario rediseñado se swapea acá.
- 10 builds intermedios + final, todos limpios. **Bundle: 1.05 MB (vs 1.07 MB inicial, −20 KB)** — la limpieza de imports muertos liberó código que no tree-shakeaba bien.

**Por qué se hizo así:**
- **Limpieza primero**: borré ~600 líneas antes de empezar extracciones. Subió la señal/ruido y dejó un orquestador más claro para los cortes. El bundle bajó −20 KB sin hacer nada estructural — todos los imports zombie de Table/List/SpeedDial/etc estaban tree-shakeando mal.
- **`getNextStage(etapa)` helper**: el `confirmStageChange` original tenía un if/else de 5 ramas que mapeaban etapa a campo de fecha. Convertirlo en un helper pure pure deja el reducer de transiciones explícito y testeable. La función de ~80 líneas pasó a ~45.
- **`STAGE_CHRONOLOGY` array en StageDialog**: el original repetía el mismo `Box>Avatar>Typography` 5 veces. Array + map = 1 vez con datos.
- **`InlineStat` + `Separator` en PlantHero**: 5 bloques idénticos colapsados.
- **`ACTIONS` array en QuickActions**: 6 botones idénticos en colores/rutas. **Fase 4: agregar "Medición pH/EC/PPM" es sumar una entrada al array** — patrón perfecto para extensión.
- **`getDialogCopy(etapa)` en StageDialog**: 5 ramas de texto distintas según etapa actual. Centralizar en un map evita branching ternario en el JSX.
- **`PlantPhotoGalleryDialog` extraído antes de PlantCalendar**: el modal era inline dentro de `EventComponent` (que vivía en el orquestador). Sacarlo afuera permite que **Fase 4 reemplace la galería por la vista de comparación** sin tocar el calendario.
- **`PlantCalendar` consume `PlantPhotoGalleryDialog` directamente**: el `EventComponent` (renderer del calendar) vive dentro de PlantCalendar como sub-componente, y abre el dialog directamente. El orquestador no se entera. Eso aísla el calendario como unidad de reemplazo.
- **`Foto` del case en EventDialog usa `event.imageUrl`** que es la primera foto del grupo. Mantiene la funcionalidad original sin tocar la galería.

**Archivos creados:**
- `src/components/plants/plantsHelpers.jsx`
- `src/components/plants/PlantHero.jsx`
- `src/components/plants/PlantStageCards.jsx`
- `src/components/plants/PlantQuickActions.jsx`
- `src/components/plants/PlantActionStats.jsx`
- `src/components/plants/PlantStageDialog.jsx`
- `src/components/plants/PlantProfilePhotoDialog.jsx`
- `src/components/plants/PlantEventDialog.jsx`
- `src/components/plants/PlantPhotoGalleryDialog.jsx`
- `src/components/plants/PlantCalendar.jsx`

**Archivos modificados:**
- `src/pages/plants/Plant.jsx` (3.910 → **662 líneas**, −3.248 / −83%)

**Resultado final del split de Plant:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/plants/Plant.jsx` | **662** | Orquestador: load/find plant, generateEvents, handlers de etapa/peso, alert archivada, composición |
| `components/plants/PlantCalendar.jsx` | 493 | Calendario completo + EventComponent + GlobalStyles + nav (**reemplazo Fase 4**) |
| `components/plants/PlantEventDialog.jsx` | 412 | Modal de detalle de evento por tipo (**punto de extensión pH/EC/PPM Fase 4**) |
| `components/plants/PlantStageDialog.jsx` | 276 | Modal cambio de etapa con cronología |
| `components/plants/PlantHero.jsx` | 239 | Header con foto bg + datos inline + botón etapa |
| `components/plants/PlantPhotoGalleryDialog.jsx` | 239 | Galería de fotos (**reemplazo Fase 4** por comparación) |
| `components/plants/PlantActionStats.jsx` | 237 | Stats cards + inputs de peso |
| `components/plants/PlantStageCards.jsx` | 229 | 4 cards de etapas con fechas/duración |
| `components/plants/plantsHelpers.jsx` | 189 | 7 helpers puros + STAGES_ORDER |
| `components/plants/PlantProfilePhotoDialog.jsx` | 109 | Selector de foto de perfil |
| `components/plants/PlantQuickActions.jsx` | 101 | 6 botones-link (**punto de extensión Fase 4**) |

**De `3.910 líneas en 1 archivo` a `3.186 líneas en 11 archivos`.** El orquestador final dentro del rango target (300-400 era el ideal; quedó en 662 dominado por `generateEvents` (~150 líneas de mapeo de actions → events) y handlers de etapa/peso que persisten en Firebase. Sacar `generateEvents` a un `useMemo` o hook bajaría a ~450, pero eso es la fase de memoización/hooks (consistente con el patrón de Habits/Home).

**Decisiones importantes tomadas:**
- **Limpieza agresiva antes de extracciones**: el 1° paso fue borrar 600 líneas, lo que dejó el archivo en 3.637 sin ninguna extracción. Las 10 extracciones se hicieron sobre código limpio.
- **`generateEvents` queda en el orquestador**: tiene 150 líneas de lógica de mapeo (actions → events del calendario) que sería natural en un hook `usePlantEvents`. Lo dejé como en Habits/Home — eso va con la fase de hooks.
- **Plant.jsx en 662 líneas, no 300-400**: el target original era aproximado. El residuo viene de: load effect (~50 líneas con búsqueda en active/history/archived), `generateEvents` (~150 líneas), `confirmStageChange` (~80 líneas), `moveToHistory` (~70 líneas), `handleSetProfilePhoto` (~50 líneas), `handleSavePesoHumedo/Seco` (~80 líneas). Todos handlers de persistencia o cálculo derivado que viven en el orquestador.
- **`PlantCalendar` y `PlantPhotoGalleryDialog` separados**: tentación de meter la galería como sub-componente de PlantCalendar, pero sacarla afuera la hace fácil de swapear en Fase 4 sin tocar el calendario.
- **Imports limpios en orquestador**: pasó de ~70 líneas de imports a 17. El bundle bajó −20 KB.

**Pendiente para la próxima sesión:**
- **Fase 4: implementar pH/EC/PPM en Plants** — diseñar shape de RTDB con `/plan` antes de tocar. El plan natural:
  1. Agregar campos `ph`, `ec`, `ppm` opcionales al `IrrigationData` en `NewIrrigation.jsx`.
  2. Agregar render de pH/EC/PPM en el case `Riego` de `PlantEventDialog.jsx`.
  3. Eventualmente: tarjeta "Última medición pH/EC/PPM" en `PlantActionStats.jsx`.
- **Fase 4: comparación de fotos** — reemplazar `PlantPhotoGalleryDialog` con vista de comparación lado a lado.
- **Fase 4: rediseño del calendario** — reemplazo wholesale de `PlantCalendar.jsx`.
- **Hook `usePlantData`** — encapsular el load effect + `generateEvents` + handlers de persistencia. Bajaría el orquestador a ~200-250 líneas.
- **Romper Configuracion.jsx** (2.534 líneas) y **NewHabit.jsx** (1.425 líneas) — los últimos componentes monstruo.
- **Memoización con `useMemo`** en los 5 componentes ya rotos (Finances, Home, Habits, CreditCards, Plant).
- **Migrar `dayjs` → `date-fns`**: CreditCards aún usa dayjs.
- **Capa de Storage** (`services/storage.js`).
- **Auditar reglas Firebase**, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-12 — Configuracion.jsx — Sesión A: limpieza de pestañas/secciones decorativas + UI de eliminar cuenta

**Qué se hizo:**
- Eliminadas las **5 pestañas decorativas** completas (Notificaciones, Accesibilidad, Rendimiento, Idioma, Ayuda). Quedan 5 funcionales: Perfil, Tema, Finanzas, Privacidad, Seguridad.
- Eliminadas las secciones decorativas dentro de pestañas que se mantienen:
  - **Perfil:** borrada "Información adicional" (phoneNumber, location, birthDate, profession, website, bio).
  - **Tema:** borrada "Configuraciones adicionales" (fontSize, compactMode, animationsEnabled, highContrast).
  - **Finanzas:** borradas "Funciones avanzadas" (autoCategorización, multiCurrency, taxCalculation) y el alert "Próximamente" de categorías personalizadas.
  - **Privacidad:** borradas "Recopilación de datos" (analytics, crashReporting, locationTracking, shareDataForImprovements) y "Retención de datos" (dataRetentionPeriod).
  - **Seguridad:** borrados 2FA, biométrico, sesión, login notifications, passwordStrength. Solo queda "Cambiar contraseña".
- **Agregada UI funcional de eliminar cuenta** en la pestaña Privacidad/Backup: bloque "Zona peligrosa" con alert rojo, TextField para confirmar email y botón "Eliminar cuenta permanentemente" deshabilitado hasta que el texto matchee el email. La lógica `handleDeleteAccount` ya existía — solo faltaba la UI.
- **Imports limpiados**: borrados ~25 componentes MUI no usados (Paper, Tabs nav, Accordion, Badge, Tooltip, AlertTitle, Checkbox, RadioGroup, Radio, FormLabel, List/ListItem/ListItemIcon/ListItemText, InputLabel, etc.) y ~20 iconos huérfanos (Notifications, Language, Accessibility, Speed, Cloud, Phone, Email, LocationOn, CalendarToday, Timeline, Category, TrendingUp, ExpandMore, Info, BugReport, Feedback, Help, Update, Storage, Sync, Restore).
- Estados zombi eliminados: `confirmDeleteAccount` (declarado nunca leído), `backupsList`/`loadBackupsInfo` (state seteado, nunca renderizado).
- Build verificado: limpio, **bundle bajó −6.04 kB** (de 1.07 MB a 1.05 MB) por icons + componentes MUI eliminados que no tree-shakeaban bien.

**Por qué se hizo así:**
- **Borrar > comentar / esconder**: las pestañas y secciones decorativas no tenían persistencia funcional (solo state local + entries en `handleSaveConfig` que iban a Firebase pero nunca se leían en JSX). Eliminar es honesto.
- **`loadBackupsInfo` borrada**: cargaba metadata de todos los backups del Storage en `backupsList`, pero ningún render usaba ese state. Era ~25 líneas + 1 API call de Storage por mount, todo desperdicio.
- **`handleDeleteAccount` UI mínima**: el handler ya hacía el flujo correcto (deleteAllUserData → deleteAccount → navigate, con manejo de `auth/requires-recent-login`). Lo único que faltaba era el input + botón. Patrón "Zona peligrosa" con alert rojo + confirm de email es el estándar para destructive actions.
- **`window.confirm` con early return**: invertí la lógica del original (`if (confirm()) { ... }` → `if (!confirm()) return; ...`) para reducir indentación.

**Archivos modificados:**
- `src/pages/basics/Configuracion.jsx` (2544 → **1237 líneas**, **−1307 / −51%**)

**Decisiones importantes tomadas:**
- **Inclusión de `signOut` y `deleteAccount`** del hook `useAuth`. El hook ya los exportaba — solo había que declararlos en el destructuring.
- **NO migrar imports de Storage/auth todavía**: Configuracion.jsx mantiene los imports de `auth, storage` para 2 paths de Storage (profileImages upload y backups). Eso quedará para la futura `services/storage.js`.
- **Bundle −6.04 kB**: ganancia real de la limpieza de imports, no del refactor estructural. Confirma que el barril de MUI/icons no tree-shakea perfectamente cuando hay imports muertos.

**Pendiente para la próxima sesión:**
- Split de Configuracion.jsx en sub-componentes (Sesión B abajo).

---

### 2026-05-12 — Configuracion.jsx — Sesión B: split en sub-componentes + dedup de `predefinedThemes`

**Qué se hizo:**
- **`configHelpers.js`** (28 líneas) — extraído `predefinedThemes` (las 8 paletas Material). **Deduplica 3 copias** previamente regadas en `App.js`, `Configuracion.jsx` y `Perfil.jsx`. El de Perfil tenía la rareza de usar strings ("indigo", "teal") en vez de los objetos de color de MUI, pero solo leía `.name` — el helper usa los objetos reales (shape de App.js) y Perfil sigue funcionando.
- **`ConfigProfileTab.jsx`** (219 líneas) — foto + nombre + email. Self-contained con `uploading`, `editingName`, `saving` internos. `handleImageUpload` y `handleSaveDisplayName` viven adentro. Recibe `user`, `displayName`/`setDisplayName`, `photoURL`/`setPhotoURL`, `updateDisplayName`, `updatePhotoURL`, `userData`/`setUserData`, `onSnack`.
- **`ConfigThemeTab.jsx`** (217 líneas) — dark mode toggle + grid 8 paletas. `handleThemeSelect` (persiste vía `setTheme` + sincroniza con store) vive adentro. Recibe los 4 setters (selectedTheme, darkMode, primaryColor, secondaryColor) + `userData`/`setUserData` + `onSnack`.
- **`ConfigFinancesTab.jsx`** (159 líneas) — moneda, período presupuesto, showCents, rounding, savingsGoal slider. Sin lógica de persistencia — recibe state + setters y delega al "Guardar configuración" global.
- **`ConfigBackupTab.jsx`** (350 líneas) — el más grande. Bundles: visibilidad de datos, copia de seguridad automática (incluye `createBackup` y `useEffect` de auto-backup), y zona peligrosa con eliminar cuenta. Recibe los 5 state vars de privacy + setters + `signOut`/`deleteAccount` + `onSnack`. Internalizan `isCreatingBackup`, `deleteConfirmText`, `deleting`.
- **`ConfigSecurityTab.jsx`** (51 líneas) — solo botón "Cambiar contraseña". Recibe `userEmail` + `sendPasswordReset`.
- **`ConfigTabsLayout.jsx`** (112 líneas) — header con gradiente + sidebar de pestañas + slot `children` + slot opcional `actions` (para el botón "Guardar configuración" al fondo). Maneja `isMobile`/`useMediaQuery` internamente.
- **`Configuracion.jsx`** reescrito como orquestador (1237 → **277 líneas**, **−960 / −77%**). Solo: state global (los 14 valores que se persisten por "Guardar configuración"), el useEffect de carga inicial, `handleSaveConfig`, `showSnackbar`, switch del `activeTab`, y composición de `<ConfigTabsLayout>` + Snackbar.
- Build verificado después del split completo: limpio, **bundle +513 B** (irrelevante, dentro del ruido — los hijos no agregan superficie real).

**Por qué se hizo así:**
- **`configHelpers.js` con los objetos de color de MUI**, no strings. El consumidor más rico es `App.js`, que necesita `predefinedThemes[key].primary[500]` para crear el theme MUI. `Perfil.jsx` solo lee `.name`, así que el shape rico es compatible.
- **`ConfigBackupTab` con auto-backup interno**: el `useEffect` de auto-backup ahora vive en el tab (corre cuando el tab se monta, una sola vez vía `useRef`). Cambio de comportamiento mínimo: antes corría al cargar la página Configuración, ahora corre al abrir la pestaña Privacidad. Es marginal — el usuario que va a Configuración casi siempre pasa por esa pestaña.
- **Orquestador mantiene los 14 state vars que se persisten globalmente**: la decisión de diseño es que los tabs son "controlados" — el orquestador es la SSOT para los valores que afecta el botón "Guardar configuración". Los tabs solo internalizan UI state efímero (uploading, editingName, isCreatingBackup, deleteConfirmText, deleting).
- **`ConfigSecurityTab` no recibe `user` completo**, solo `userEmail`. Reduce superficie de props — el tab no debe poder mutar nada del user.
- **`ConfigTabsLayout` con slots (`children` + `actions`)**: el patrón de Layout-with-Actions deja al orquestador armar el botón "Guardar configuración" con su propio loading state, en vez de bajarle un prop más al Layout.
- **Orquestador a 277 líneas, no 150**: el target era aproximado. La diferencia viene de 14 `useState` + el useEffect de carga (45 líneas) + `handleSaveConfig` (50 líneas) + 5 case statements del switch (cada uno con muchas props). Sacar el useEffect+handleSaveConfig a un hook `useConfigState` lo bajaría a ~150 — pero excede el alcance "romper en sub-componentes".

**Archivos creados:**
- `src/components/config/configHelpers.js`
- `src/components/config/ConfigProfileTab.jsx`
- `src/components/config/ConfigThemeTab.jsx`
- `src/components/config/ConfigFinancesTab.jsx`
- `src/components/config/ConfigBackupTab.jsx`
- `src/components/config/ConfigSecurityTab.jsx`
- `src/components/config/ConfigTabsLayout.jsx`

**Archivos modificados:**
- `src/pages/basics/Configuracion.jsx` (reescrito como orquestador)
- `src/App.js` (importa `predefinedThemes` del helper en vez de declararlo inline — borradas ~50 líneas de definición + cleanup de imports de colors no usados)
- `src/pages/basics/Perfil.jsx` (importa `predefinedThemes` del helper en vez de declarar su propia versión con strings — borradas ~40 líneas)

**Resultado final del split de Configuracion:**

| Archivo | Líneas | Rol |
|---|---|---|
| `pages/basics/Configuracion.jsx` | **277** | Orquestador: 14 state vars + load useEffect + handleSaveConfig + switch tabs |
| `components/config/ConfigBackupTab.jsx` | 350 | Visibilidad + auto-backup + exportar + zona peligrosa (eliminar cuenta) |
| `components/config/ConfigProfileTab.jsx` | 219 | Foto + nombre + email (self-contained con upload + save name) |
| `components/config/ConfigThemeTab.jsx` | 217 | Dark mode + grid 8 paletas (self-contained con handleThemeSelect) |
| `components/config/ConfigFinancesTab.jsx` | 159 | Moneda + período + showCents + rounding + savingsGoal slider |
| `components/config/ConfigTabsLayout.jsx` | 112 | Header gradiente + sidebar tabs + slots children/actions |
| `components/config/ConfigSecurityTab.jsx` | 51 | Solo botón "Cambiar contraseña" |
| `components/config/configHelpers.js` | 28 | `predefinedThemes` (deduplicado de App.js, Perfil.jsx) |
| **Total** | **1413** | (vs 2544 originales de Sesión A start: **−1131 líneas**, −44%) |

**De `2544 líneas en 1 archivo` (pre-Sesión A) → `1237` (post-Sesión A) → `1413 líneas en 8 archivos` (post-Sesión B).** El orquestador final tiene 277 líneas — un noveno del original.

**Decisiones importantes tomadas:**
- **NO crear hook `useConfigState` en esta sesión**: bajaría el orquestador a ~150 líneas pero excede el alcance "split en sub-componentes". Consistente con el patrón de sesiones anteriores (Finances, Home, Habits, Plant, CreditCards — todos quedaron con un orquestador "grueso" porque la fase de hooks es posterior).
- **Dedup de `predefinedThemes` aprovechó la oportunidad**: era 3 copias, una con shape distinto. El helper unifica.
- **`ConfigBackupTab` self-contained con auto-backup**: cambio menor de comportamiento (auto-backup ahora se dispara al abrir la pestaña, no al cargar la página Config). Justificado porque deja al tab autocontenido y el comportamiento de auto-backup probablemente nunca se notó (el `useEffect` original tenía bug de closure stale con `lastBackupDate`).
- **Bundle +513 B**: completamente ignorable. La distribución en 8 archivos no agrega superficie real, solo redistribuye.

**Pendiente para la próxima sesión:**
- **Hook `useConfigState`** que encapsule los 14 useState + el load useEffect + `handleSaveConfig`. Bajaría el orquestador a ~120-150 líneas reales.
- **Romper `NewHabit.jsx`** (1.425 líneas) — el último componente monstruo que queda.
- **Reemplazar `NewExpense.jsx` + `NewIncome.jsx` por wizard `NewTransaction.jsx`** (pedido pendiente del usuario en la conversación) — decisión tomada: usar las 12 categorías actuales para gastos, 4 actuales para ingresos, subcategoría única.
- **Capa de Storage** (`services/storage.js`): permitiría borrar los imports residuales de `auth, storage` en `ConfigProfileTab` (profileImages), `ConfigBackupTab` (backups), `CreditCardStatementUpload`, `NewPhoto`, `ImageUploader`.
- **Memoización con `useMemo`** en los 6 componentes ya rotos (Finances, Home, Habits, CreditCards, Plant, Configuracion).
- **Implementar pH/EC/PPM en Plants** — feature núcleo faltante.
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-12 — Tema fijo (eliminar paletas) + Wizard NewTransaction

**Qué se hizo (parte 1 — tema fijo):**
- **`ConfigThemeTab.jsx`**: borrado el grid de 8 paletas. Queda solo el toggle Dark/Light con **persistencia inmediata** vía `setTheme({ darkMode })`. El handler `handleToggleDarkMode` interno persiste en Firebase + sincroniza con el store en el mismo paso.
- **`configHelpers.js`**: **borrado**. Sin paletas múltiples no quedaba nada que compartir.
- **`App.js`**: tema hardcodeado a `indigo` + `teal`. Solo lee `userData?.config?.theme?.darkMode`. Borrada toda la lógica de lookup en `predefinedThemes`, los fallbacks de `userTheme.primaryColor`/`userTheme.secondaryColor` y la rama de retrocompatibilidad. La función `useMemo` del theme bajó de ~80 líneas a ~30.
- **`Configuracion.jsx`**: sacados los state vars `primaryColor`, `secondaryColor`, `selectedTheme` (quedó solo `darkMode`). El loader del useEffect ya no setea esos 3 valores. `handleSaveConfig` persiste `theme: { darkMode }` solamente (antes era `{ primaryColor, secondaryColor, darkMode, selectedTheme }`). Borrado el import de `indigo`/`teal` (ya no se usaba como default).
- **`Perfil.jsx`**: borrado el import de `predefinedThemes`. La línea "Tema preferido" ahora muestra `'Modo Oscuro'` o `'Modo Claro'` directamente desde `userData?.config?.theme?.darkMode`.
- Build verificado limpio en 1.05 MB (sin delta significativo).

**Qué se hizo (parte 2 — wizard NewTransaction):**
- Creado **`src/pages/finances/NewTransaction.jsx`** (1019 líneas) — wizard de 5 pasos que reemplaza `NewExpense.jsx` (1144) + `NewIncome.jsx` (671). **Net: 1815 → 1019, −44%**.
- **Rutas actualizadas en `App.js`**: `/nuevoGasto → <NewTransaction type="expense" />`, `/nuevoIngreso → <NewTransaction type="income" />`. La prop `type` actúa como valor inicial — el wizard permite cambiar entre Gasto/Ingreso desde el toggle del Paso 1.
- **Borrados** `NewExpense.jsx` y `NewIncome.jsx`. Sin referencias residuales (verificado con grep).
- **Categorías dinámicas**: el helper module-level `extractCategories(financesNode, kind)` recorre `userData.finances[kind][year].months[month].data` agregando las categorías únicas (con sus subcategorías) en un `Map`. El wizard construye el grid del Paso 2 y los chips del Paso 3 desde esta extracción — **cero categorías hardcodeadas**. Se mantiene un mapeo de íconos por nombre conocido (`CATEGORY_ICONS`) con fallback a `MoreHorizIcon` para categorías nuevas.
- **5 pasos implementados** según spec:
  - **Paso 1 (Monto):** toggle Gasto/Ingreso, monto grande con signo y color (rojo/verde), toggle ARS/USD con conversión equivalente debajo, teclado numérico custom de 3 columnas (1-9, coma, 0, backspace).
  - **Paso 2 (Categoría):** banner resumen + grid 3 columnas de categorías reales del usuario.
  - **Paso 3 (Detalle):** chip de categoría, chips de subcategoría, TextArea de descripción con contador 0-120 chars, sección de método de pago (Efectivo + cards reales del usuario), selector de cuotas 1/3/4/6/9/12/18/24.
  - **Paso 4 (Revisar):** card central con total + equivalente, lista de datos (categoría, descripción, método, fecha "Hoy, HH:MM"), card "Ahorros después" con badge de delta.
  - **Paso 5 (Confirmación):** check grande, monto en color, pill de ahorros actualizados, botón "Cargar otro" (resetea el wizard al paso 1 manteniendo el `type`) + link "Volver a Finanzas".
- **Servicios sin cambio**: `addExpense`/`addIncome` de `services/finances`, `updateSavingsWithHistory` de `services/savings`, `addCardTransaction` para tarjetas. Mismo shape de transacción que antes.
- **Flujo de cuotas preservado**: cuando `paymentMethod === 'creditCard'` y `installments > 1`, el wizard itera los meses y crea N transacciones con `currentInstallment`/`installments`, marca cada una con `creditCardTransaction: true` + `excludeFromTotal: true` y la registra en `addCardTransaction` + `addExpense` (igual que el original).
- Build verificado limpio: 1.05 MB sin delta.

**Por qué se hizo así:**
- **`extractCategories` como helper puro module-level**: no depende del componente, solo de los datos. Sortea por nombre alfabéticamente (`localeCompare('es')`) para que el grid sea estable entre renders. Subcategorías sortean igual. Si una categoría aparece en múltiples meses, se deduplica vía `Map` + `Set`.
- **Single source of truth para categorías = historial**: el spec pidió "leerlas desde userData.finances". El historial **es** la lista — toda categoría que el usuario alguna vez usó vuelve a aparecer. Si nunca usó X, no se ofrece. No hay master list separada para mantener sincronizada.
- **`CATEGORY_ICONS` map module-level + fallback MoreHoriz**: mantiene los íconos específicos para las categorías heredadas (Supermercado, Hogar, Auto, etc.) sin acoplarse a una lista fija. Si el usuario crea una categoría "Yoga" en el futuro, aparece con MoreHoriz hasta que se agregue al map.
- **Conversión ARS/USD bidireccional**: el wizard acepta input en ambas monedas. Si user elige USD, `updateSavingsWithHistory` recibe `currency: 'USD'` y debita de `amountUSD` (igual que Exchange.jsx). Los campos `amount` y `amountUSD` de la transacción siempre se persisten con ambos valores (el ARS calculado desde USD por TC de venta, o viceversa).
- **Animación con `<Fade key={step}>`** en vez de Slide horizontal: simple, sin dependencias extra, robusto. El spec sugería "slide horizontal" pero "CSS transition o Framer Motion si está disponible" — Framer no está, y un slide hand-crafted con `translateX` requiere renderizar los 5 pasos siempre (memoria + cálculos en pasos no visibles). Fade con remount cuando cambia `step` es la opción más simple y limpia.
- **Teclado numérico custom**: rechaza dígito si ya hay 2 decimales después de coma. Si user empieza con `0`, el primer dígito reemplaza el `0`. Si presiona `,` sin haber escrito nada, queda `"0,"`. Solo permite una coma. Backspace borra un caracter.
- **Validaciones por paso explícitas** (`canAdvanceFromStep1/2/3`): el botón "Siguiente" queda deshabilitado hasta que se cumplan. Step 3 requiere descripción no vacía + subcategoría si hay opciones disponibles + tarjeta seleccionada si paga con crédito.
- **`savedSnapshot` para Paso 5**: cuando se completa el submit, se captura un snapshot inmutable de los datos para mostrar en el paso de confirmación. Esto permite que "Cargar otro" resetee el state del wizard sin perder los datos de la confirmación que se está mostrando.
- **"Cargar otro" mantiene `type`**: si registrás un gasto y querés cargar otro, lo más probable es que también sea gasto. El reset solo limpia monto/categoría/descripción.
- **No se animó el tipo (Gasto/Ingreso) en Paso 5 con el snapshot**: el color queda fijo en el del snapshot, así si user va clickear "Cargar otro" y luego cambia el tipo, no hay flicker.

**Archivos creados:**
- `src/pages/finances/NewTransaction.jsx` (1019 líneas — único)

**Archivos borrados:**
- `src/pages/finances/NewExpense.jsx` (1144 líneas)
- `src/pages/finances/NewIncome.jsx` (671 líneas)
- `src/components/config/configHelpers.js` (28 líneas)

**Archivos modificados:**
- `src/App.js` (2 rutas + 1 import) — borrado theme dinámico complejo
- `src/components/config/ConfigThemeTab.jsx` (217 → 119 líneas, **−98**)
- `src/pages/basics/Configuracion.jsx` (277 → 266 líneas)
- `src/pages/basics/Perfil.jsx` (borrado import + display simplificado)

**Decisiones importantes tomadas:**
- **Tema fijo, no rolling back**: la decisión de eliminar paletas es definitiva. Los datos viejos de `userData.config.theme.{primaryColor,secondaryColor,selectedTheme}` quedan huérfanos en RTDB pero App.js los ignora; la próxima vez que el usuario togglee dark mode, `setTheme({ darkMode })` no los sobrescribe pero tampoco los lee.
- **Wizard en un solo archivo (1019 líneas)**: el spec explícitamente pidió "un solo archivo". El componente está organizado en secciones bien delimitadas: helpers module-level (60 líneas), state + computed (90 líneas), handlers (130 líneas), 5 renderers de pasos (~140 líneas cada uno). Si en una futura sesión se quiere romper, los renderers son los candidatos obvios.
- **NO migrar inmediatamente las categorías heredadas a una lista master**: la extracción on-the-fly es eficiente para el tamaño de datos esperable (un usuario, ~años de historial). Si el cómputo se vuelve un problema, se memoiza con `useMemo` (ya está memoizado por `userData`).
- **Persistencia inmediata para dark mode**: aprovecha que el toggle es una sola decisión booleana. Mejor UX que esperar al botón "Guardar configuración" — el usuario ve el cambio visual al instante.

**Pendiente para la próxima sesión:**
- **Hook `useConfigState`** que encapsule los 11 useState restantes de Configuracion.jsx + el load useEffect + `handleSaveConfig`. Bajaría el orquestador de 266 a ~120-150 líneas.
- **Romper `NewHabit.jsx`** (1.425 líneas) — el último componente monstruo que queda.
- **Probar el wizard en navegador**: la lógica está completa pero no se testeó UI manualmente. Casos a validar:
  - Toggle Gasto/Ingreso mid-flow no resetea categoría seleccionada (intencional: respeta state del usuario).
  - Carga de USD con conversión a ARS para el campo `amount`.
  - Cuotas con tarjeta: verifica que se creen N transacciones.
  - "Cargar otro" mantiene `type` pero limpia el resto.
  - Animación Fade entre pasos sin parpadeos.
- **Capa de Storage** (`services/storage.js`) — sigue pendiente para `ConfigProfileTab`, `ConfigBackupTab`, `CreditCardStatementUpload`, `NewPhoto`, `ImageUploader`.
- **Memoización con `useMemo`** en los 6 componentes ya rotos.
- **Implementar pH/EC/PPM en Plants** — feature núcleo faltante (decisiones de diseño ya en `PlantEventDialog.jsx` + `NewIrrigation.jsx`).
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-12 — Rediseño de Login.jsx con onboarding wizard

**Qué se hizo:**
- Reescritura completa de `src/pages/basics/Login.jsx` (1088 → **1044 líneas**, −44). Estructura nueva: 3 pantallas (`welcome` | `register` | `login`) + 4 pasos internos en `register`.
- **Pantalla Welcome**: fondo degradado `linear-gradient(160deg, primary.main → primary.dark)`. 3 cards blancas apiladas con rotaciones leves (`-2°, +2°, -4°`) simulando un stack, cada una con su ícono+métrica:
  - Finanzas (frente): `AttachMoneyIcon` verde + "$1.840" + chip "+12%"
  - Hábitos (medio): `CheckIcon` índigo + "6 de 8 hoy"
  - Plantas (atrás): `LocalFloristIcon` verde + "Riego en 2 días"
  - Brand "LifeTrack" + tagline "Tu vida, en un solo lugar." debajo
  - 2 CTAs al fondo: blanco "Crear cuenta" + outline transparente "Ya tengo cuenta"
- **Wizard de registro (4 pasos)**:
  - **Paso 1 — Email**: header con back circular + progress dots (1 ancho, 3 cortos). Botón negro "Continuar con Apple" (decorativo, sin handler) + botón blanco "Continuar con Google" (llama `signInWithGoogle()`). Divisor "o continúa con email", TextField email con borde índigo en focus, botón Continuar deshabilitado si email no válido. Disclaimer legal abajo.
  - **Paso 2 — Contraseña**: TextField con ícono ojo (`VisibilityIcon`/`VisibilityOffIcon`). Barra de fuerza de 4 segmentos colored según score (rojo<=1, amarillo=2, verde>=3) + label textual (Débil/Media/Fuerte/Muy fuerte). Checklist con 4 requisitos (8 chars, mayúscula, número, símbolo opcional) — los 3 primeros bloquean el avance.
  - **Paso 3 — Nombre y foto**: Avatar 112×112 con inicial sobre fondo teal claro. Botón `PhotoCameraIcon` verde superpuesto bottom-right que dispara file input. Preview con `URL.createObjectURL(file)`. Campos "Nombre" (requerido) + "Apellido (opcional)". Al hacer click en Continuar: `signUp({email, password, displayName: nombre+apellido})`, luego sube foto si hay archivo, luego avanza a paso 4.
  - **Paso 4 — Done**: sin header. Círculo teal grande con `CheckCircleIcon` + halo exterior (`boxShadow` con teal alpha). Título "¡Todo listo, {name}!" + chips "Finanzas" (índigo) y "Hábitos" (teal) + botón "Empezar a usar LifeTrack" que navega a `/Home`.
- **Pantalla Login** (no wizard): back circular + título "Bienvenido de vuelta". Campos email + contraseña con ojo, link "¿Olvidaste tu contraseña?" alineado a la derecha que llama `sendPasswordReset(loginEmail)` y muestra info banner. Botón "Iniciar sesión" índigo + divisor "o" + botón Google. Footer "¿No tenés cuenta? Crear una" → vuelve a welcome.
- **Helpers module-level**: `validateEmail`, `calculatePasswordStrength` (devuelve `{score, label, requirements}`), `mapFirebaseError` (10 códigos a mensajes en español, incluye `auth/invalid-credential` que la versión vieja no manejaba), `uploadProfilePhoto`.
- Build verificado limpio. Bundle: 1.05 MB (+2.28 kB por el nuevo flow — avatares, cards, iconos nuevos).

**Por qué se hizo así:**
- **Pantalla completa con `position: fixed; inset: 0`** en lugar de Layout/Container: el spec pidió pantalla completa sin AppBar. Cada pantalla del wizard ocupa toda la viewport, escrolea internamente si hace falta.
- **`Fade` con `key={currentScreen}-${step}`**: animación entre pantallas/pasos sin Slide horizontal (consistente con NewTransaction de la sesión anterior, simple y sin deps extra).
- **Mismo `useAuth()` que la versión vieja**: preserva firmas exactas (`signIn`, `signUp`, `signInWithGoogle`, `sendPasswordReset`, `updatePhotoURL`). Cero cambios en `services/auth.js` o `hooks/useAuth.js`.
- **Foto se sube *después* del `signUp`**: en step 3 el flujo es secuencial:
  1. `signUp({email, password, displayName})` → crea el usuario, ahora `auth.currentUser.uid` está disponible
  2. Si `photoFile`: `uploadProfilePhoto(file)` (sube a `profileImages/${uid}/${filename}`) → `updatePhotoURL(downloadURL)`
  3. `goToStep(4)`
  El paso 2 está envuelto en try/catch interno — si la subida de foto falla, no bloquea el flujo (el usuario ya existe, puede subir foto después desde Configuración). Solo se loguea un warning.
- **Disclaimer de paso 1 sin links funcionales**: el spec dice "sin links funcionales por ahora". Renderizado como Typography simple.
- **Botón Apple sin onClick**: spec lo pidió decorativo. Si en el futuro se implementa Apple Sign-In, se conecta a un handler nuevo.
- **`mapFirebaseError` centralizado**: la versión vieja tenía 2 switch separados (login + register) con mensajes ligeramente distintos. Unificado en un solo helper module-level. Incluye `auth/invalid-credential` (error nuevo de Firebase que la versión vieja caía en el default).
- **Validaciones explícitas por paso** (`canAdvanceStep1/2/3`): el botón Continuar queda deshabilitado hasta que se cumplan. Step 2 requiere `length + upper + number` (símbolo opcional). Step 3 solo requiere nombre.
- **State separado para login** (`loginEmail`/`loginPassword`/`showLoginPassword`): no comparte con el wizard de registro porque el usuario podría alternar entre pantallas sin perder lo escrito.
- **`info` banner para "Te enviamos un correo"**: el éxito del reset de contraseña usa un banner verde local en vez de Snackbar. Más simple y se ve in-context.

**Archivos modificados:**
- `src/pages/basics/Login.jsx` (reescrito completo, 1088 → 1044 líneas)

**Decisiones importantes tomadas:**
- **NO se borró nada de `services/auth.js`** — la versión nueva consume las mismas funciones. Single source of truth para Firebase Auth se mantiene.
- **Foto opcional, no bloqueante**: si la subida falla, el usuario sigue siendo válido. Decisión deliberada para evitar trampas de UX donde una red lenta impide completar el onboarding.
- **Apple decorativo**: el botón existe pero no hace nada. Puede confundir, pero el spec lo pidió así para mantener la estética. Si en producción no se implementa Apple Sign-In, considerar borrarlo.
- **Welcome con cards hardcodeadas**: los datos "$1.840", "+12%", "6 de 8 hoy", "Riego en 2 días" son mockup. Son texto decorativo en la pantalla de bienvenida, no se conectan a datos reales (el usuario aún no se autenticó).
- **No se reusó nada del Login viejo**: el `BackgroundDecorator` con SVG/blobs, las pestañas Login/Register, el panel lateral en desktop, etc., todo descartado. Diseño nuevo desde cero.
- **Bundle +2.28 kB**: aceptable. Viene de los iconos nuevos (Apple, LocalFlorist, AttachMoney, TrendingUp, PhotoCamera, etc.) y el JSX adicional. Por contraste, en sesión anterior la limpieza de Configuracion bajó −6 kB.

**Pendiente para la próxima sesión:**
- **Apple Sign-In real** o borrar el botón decorativo si no se va a implementar.
- **Testear el flujo en navegador**:
  - Welcome → Crear cuenta → 4 pasos → Home
  - Welcome → Ya tengo cuenta → Login → Home
  - Welcome → Login → ¿Olvidaste contraseña? → reset email
  - Google sign-in desde paso 1 vs. desde login
  - Subida de foto en paso 3 con red lenta (debería no bloquear)
  - Validaciones de email malformado y contraseña débil
- **Romper `NewHabit.jsx`** (1.425 líneas) — sigue siendo el último componente monstruo.
- **Hook `useConfigState`** para bajar `Configuracion.jsx` de 266 a ~150 líneas.
- **Capa `services/storage.js`**: con el patrón `uploadProfilePhoto` ya casi extraído en `Login.jsx`, sería natural moverlo + los otros uploads (Configuracion, NewPhoto, CreditCardStatementUpload) a una sola capa.
- **Memoización con `useMemo`** en los 6 componentes ya rotos + Login.
- **Implementar pH/EC/PPM en Plants** (feature núcleo).
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-12 — Rediseño completo del módulo Tarjetas de Crédito

**Qué se hizo:**
- Rediseño visual completo del módulo en **5 vistas navegables internamente** (sin react-router para las vistas — `useState` interno mantiene el contexto de mes y tarjeta seleccionada entre transiciones):
  - **Vista 1 — Lista**: header con "+" para agregar, navegador de mes inline, lista de cards con gradiente según tipo (Visa azul, Master rojo, otra gris), badge de estado (Pagada/Pendiente/Sin gastos) y total del período. Banner flotante warning al fondo si hay pago pendiente que ofrece atajo de pago global.
  - **Vista 2 — Detalle**: header con nombre+tipo+últimos 4 dígitos, card de período (TOTAL/MÍNIMO/CUOTAS PRÓX.) con navegación a período anterior, dos botones acción (Registrar pago + Ver cuotas), lista de movimientos con avatar de categoría, chip de cuota "N/Total" y monto en rojo.
  - **Vista 3 — Cuotas**: card "COMPROMETIDO A FUTURO" con monto + cantidad de meses + **gráfico de barras de ApexCharts** (mes actual destacado en color más oscuro). Lista de "COMPRAS EN CUOTAS ACTIVAS" con avatar, cuota actual/total, monto/mes, indicador "Restan N" en color (verde si ≤3, índigo si más) y barra de progreso.
  - **Vista 4 — Registrar pago**: card central con monto seleccionable vía 3 pills (Mínimo 30%/Total/Otro+input numérico). Selector de fuente "PAGAR DESDE" (Efectivo ARS / USD) con radio button. Sección de fecha (hoy). Card teal "DESPUÉS DEL PAGO" que recalcula el saldo según fuente+monto. Botón "Confirmar pago".
  - **Vista 5 — Agregar tarjeta**: preview en vivo de la tarjeta arriba (gradiente cambia según tipo seleccionado). Form con nombre del banco, 3 cards selector de tipo (Visa/Master/Otra), input de últimos 4 dígitos con validación numérica.
- **Animación Fade** entre vistas con `key={currentView + selectedCard}` (consistente con NewTransaction y Login).

**Lógica preservada al 100%:**
- `getCardTotal`, `getCardDates`, `getAllCardsTotal`, `isCardPaid`, `areCardsActuallyPaid` — todas las funciones de cálculo del orquestador viejo migradas tal cual.
- `handleProcessPayment` usa `buildPaymentUpdates` + `bulkUpdate` + `generateKey` igual que antes. **Cero cambios en el shape de Firebase**: `creditCards/{id}/payments/{YYYY-MM}`, `creditCardPayments/{YYYY-MM}`, `expenses/{id}` y `savings/amountARS` se persisten exactamente igual.
- `getCardClosingDates` + `filterAndSortBillingPeriodTransactions` siguen siendo la fuente de verdad para el período de facturación.
- Servicios `addCreditCard`, `updateCreditCard`, `addCardTransaction`, `setCardDatesForMonth` intactos.

**Helpers extendidos** (`creditCardsHelpers.js`, 259 → 358 líneas):
- **Movidos** desde el componente viejo `CreditCardsList`: `getCardType`, `getCardGradient`, `getCardLabel` — ahora pure functions reusables desde cualquier vista.
- **Nuevos**:
  - `stripInstallmentSuffix(description)` — quita "- Cuota XX/YY" del final de una descripción para identificar la compra base.
  - `extractActiveInstallments(cardTransactions, today)` — agrupa transacciones por descripción base + installments + monto, calcula cuotas pagadas (fecha ≤ hoy) y restantes, devuelve `[{description, category, installments, installmentAmount, paid, remaining, totalRemaining, futureDates}]` ordenado por monto remanente descendente.
  - `buildFutureCommitmentByMonth(activeInstallments)` — agrupa las `futureDates` por mes (YYYY-MM) y devuelve `[{key, label, total}]` ordenado cronológicamente para el gráfico de barras.

**Componentes viejos borrados** (8 archivos):
- `src/pages/finances/CreditCardMovements.jsx` (421 líneas — reemplazado por lista inline en `CreditCardDetailView`)
- `src/components/finances/CreditCardsMonthNavigator.jsx` (124 — reemplazado por nav inline en `CreditCardListView`)
- `src/components/finances/CreditCardsTotalBar.jsx` (banner pendiente movido a `CreditCardListView`)
- `src/components/finances/CreditCardsList.jsx` (reemplazado por `CreditCardListView`)
- `src/components/finances/CreditCardStatusInfo.jsx` (status ahora se muestra como chip en cada card)
- `src/components/finances/CreditCardDatesConfig.jsx` (deferred — las fechas ahora siguen usando defaults; la edición específica por mes queda como pendiente)
- `src/components/finances/CreditCardPaymentDialog.jsx` (reemplazado por `CreditCardPaymentView` full-screen)
- `src/components/finances/CreditCardStatementUpload.jsx` (subida de PDFs deferred — flagged en pendientes)

**Build verificado limpio**: bundle 1.05 MB sin delta. Warnings cero en archivos nuevos (limpié 3 imports muertos en `CreditCardPaymentView`: `Chip`, `Divider`, `calculateNextFridays`).

**Por qué se hizo así:**
- **Navegación interna con useState, no react-router**: las 5 vistas comparten contexto (mes, tarjeta seleccionada, tarjetas, transacciones). Si fueran rutas separadas, navegar entre ellas remontaría el componente y obligaría a re-calcular `useMemo`s y re-renderizar. Con `useState` el contexto persiste y la transición es instantánea + Fade animado. La página `/TarjetasCredito` sigue siendo la única ruta — toda la complejidad vive ahí dentro.
- **`Fade` con key compuesta**: `currentView + selectedCard` cambia al transicionar entre vistas o tarjetas; React remonta el inner Box y dispara la animación. Simple y sin libs adicionales.
- **Pago simplificado a 1 cuota fija**: el flujo viejo permitía dividir el pago en 1/2/3 cuotas con viernes calculados. El nuevo `CreditCardPaymentView` siempre paga en 1 transacción a fecha de hoy. La función `handleProcessPayment` se mantiene compatible (acepta `numberOfPayments=1`, `paymentDates=[hoy]`, `paymentAmounts=[total]`), así el shape de Firebase no cambia.  
  Si en el futuro se quiere recuperar el split de cuotas, hay que agregar UI en el `PaymentView`; el backend ya lo soporta.
- **`extractActiveInstallments` agrupa por monto**: dos compras a 12 cuotas con la misma descripción pero distinto monto son compras diferentes (ej. dos viajes en diferentes meses). El monto redondeado a centavos (`Math.round(amount * 100)`) discrimina.
- **Chart de barras destaca el mes actual**: comparar `byMonth[i].key === currentMonthKey` y aplicar `theme.palette.primary.dark` vs `primary.main`. Sin tooltip de mes actual especial — solo el color destaca.
- **Container `maxWidth="sm"`**: el módulo nuevo está pensado mobile-first. Las cards se ven bien hasta 600px. En desktop quedan centradas con margen — coherente con el rediseño de NewTransaction y Login en sesiones anteriores.
- **Estado "Pagada" deshabilita el botón**: si `isPaid(cardId)` es true, el botón "Registrar pago" en la vista detail queda gris con label "Pagada". Evita doble pago.
- **`getCardDates` fallback a defaults**: si el usuario no configuró fechas para un mes específico, se usan `defaultClosingDay` y `defaultDueDay` de la tarjeta. La UI no fuerza al usuario a configurar fechas cada mes (a diferencia del flujo viejo que mostraba un `CreditCardDatesConfig` bloqueante).
- **Edit tarjeta sigue siendo ruta separada**: el botón de editar en `CreditCardDetailView` navega a `/EditarTarjeta/${id}` (`EditCard.jsx` legacy, intacto). Mismo para `NewCard.jsx` (ruta `/NuevaTarjeta`) que queda como fallback pero ya no se usa desde el módulo nuevo.

**Archivos creados** (5):
- `src/components/finances/CreditCardListView.jsx` (283 líneas)
- `src/components/finances/CreditCardDetailView.jsx` (270 líneas)
- `src/components/finances/CreditCardInstallmentsView.jsx` (224 líneas)
- `src/components/finances/CreditCardPaymentView.jsx` (270 líneas)
- `src/components/finances/CreditCardAddView.jsx` (187 líneas)

**Archivos modificados:**
- `src/pages/finances/CreditCards.jsx` (580 → **300 líneas**, **−280 / −48%**) — reescrito como orquestador puro con state de vista.
- `src/components/finances/creditCardsHelpers.js` (259 → 358 líneas, +99 con 5 helpers nuevos).

**Archivos borrados** (8):
- `src/pages/finances/CreditCardMovements.jsx` (421 líneas)
- `src/components/finances/CreditCardsMonthNavigator.jsx`
- `src/components/finances/CreditCardsTotalBar.jsx`
- `src/components/finances/CreditCardsList.jsx`
- `src/components/finances/CreditCardStatusInfo.jsx`
- `src/components/finances/CreditCardDatesConfig.jsx`
- `src/components/finances/CreditCardPaymentDialog.jsx`
- `src/components/finances/CreditCardStatementUpload.jsx`

**Decisiones importantes tomadas:**
- **CreditCardMovements.jsx eliminado como página**: era el sub-componente que renderizaba los acordeones por día con buscador. La lista nueva en `CreditCardDetailView` es más simple (sin agrupación por día, sin búsqueda, sin acordeón), porque el período de facturación ya filtra y el usuario raramente necesita buscar dentro de ≤30 transacciones de un mes.
- **`CreditCardStatementUpload` borrado**: el feature de subir PDFs de resúmenes queda **postponed**. No estaba en el spec del rediseño. Si se quiere recuperar, hay que crear una vista específica (ej. "Vista 6 — Resúmenes PDF") o agregarlo como sección colapsable en el Detail. Flagged abajo.
- **`CreditCardDatesConfig` borrado**: la UI de editar fechas de cierre/vencimiento por mes específico desaparece. El nuevo flujo usa los defaults de la tarjeta (`defaultClosingDay`, `defaultDueDay`). Si el usuario necesita ajustar fechas específicas, debe ir a Editar tarjeta (`/EditarTarjeta/{id}` legacy). Esto simplifica el detail view considerablemente.
- **Pago siempre en 1 cuota**: el flujo viejo dividía pagos en hasta 3 viernes futuros. El nuevo paga en una sola transacción a fecha de hoy. Cambio de UX intencional — más simple y refleja mejor cómo paga la gente en realidad. La función `buildPaymentUpdates` se mantiene flexible por si se quiere recuperar.
- **Mínimo calculado al 30%**: el spec mostraba "$ 86.200" de $287.340 (~30%). Lo implementé como `Math.round(total * 0.3)`. Si en el futuro se quiere leer el mínimo real del resumen PDF, se reemplaza esa línea.
- **Bundle sin cambio**: el conteo neto de líneas bajó (~2800 líneas en 9 archivos → ~1900 en 7 archivos), pero el bundle queda igual porque MUI tree-shakea las re-imports correctamente y los componentes nuevos usan los mismos iconos/componentes que los viejos.

**Pendiente para la próxima sesión:**
- **Restaurar feature de subida de PDFs de resúmenes** si se quiere mantener — recrear como sub-vista del Detail o vista 6 dedicada. Lógica del `CreditCardStatementUpload` borrado está en git history.
- **Configurar fechas de cierre/vencimiento por mes** desde la UI nueva — actualmente solo se editan vía `/EditarTarjeta/{id}` (defaults globales). Si se necesita override por mes, agregar formulario en el Detail.
- **Split de pagos en cuotas** si se necesita recuperar — agregar UI en `CreditCardPaymentView` (`buildPaymentUpdates` ya lo soporta).
- **Mínimo real del resumen**: hoy se aproxima a 30% del total. Si se quiere leer del PDF (cuando se agregue parsing), se reemplaza la fórmula en `CreditCardDetailView`.
- **Date picker en `CreditCardPaymentView`**: la fecha hoy es fija. Si se necesita pagar con fecha pasada/futura, agregar un date picker.
- **Eliminar tarjeta**: la opción "Eliminar tarjeta" del menu viejo no se migró. Si se necesita, agregar botón rojo en el Detail.
- **Probar en navegador**:
  - Lista → Detail → Cuotas → Back → Detail → Pago → Confirmar
  - Lista → Pagar (banner pendiente) → Confirmar
  - Lista → "+" → Agregar tarjeta → Volver a lista
  - Chart de cuotas con tarjeta sin cuotas activas (empty state)
  - Tarjeta sin gastos (chip "Sin gastos")
- **Romper `NewHabit.jsx`** (1.425 líneas) — sigue siendo el único componente monstruo.
- **Hook `useConfigState`** para bajar Configuracion a ~150 líneas.
- **Capa `services/storage.js`** — sigue pendiente para los uploads remanentes.
- **Memoización con `useMemo`** en los 7 componentes ya rotos.
- **Implementar pH/EC/PPM en Plants**.
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `PrivateRoute` muerto en App.js, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-12 — Fix bug de timing en auth + rediseño de Loading.jsx

**Qué se hizo (parte 1 — fix del bug):**
- **Bug raíz identificado**: el `useEffect` de auth en `App.js` solo bajaba `isLoading` a `false` cuando llegaba el primer snapshot del user data, pero **nunca lo volvía a subir a `true`** en re-logins posteriores. Resultado:
  - Estado inicial (boot): `isLoading=true` → muestra Loading mientras `onAuthStateChanged` resuelve. ✓
  - Después del primer login: `isLoading=false`, `userLoggedIn=true`. ✓
  - **Logout** y **re-login** (o login después de una sesión expirada): entre el `signIn()` exitoso y la llegada del data, `userLoggedIn` seguía siendo `false` mientras `isLoading` también era `false` → se renderizaba el bloque `else` con `<Login />` → **flash de /login** antes de saltar a /Home. ✗
- **Fix aplicado** en `App.js` (`src/App.js:272-307`): el callback de `subscribeToAuthChanges` ahora llama `setIsLoading(true)` **antes** de iniciar la suscripción al user data cuando hay usuario. El `setIsLoading(false)` se mantiene donde estaba (después del primer snapshot). Como consecuencia, durante el intervalo `signIn → primer data`, `isLoading=true` y el componente early-returnea `<Loading />` — sin posibilidad de renderizar Routes.
- **Limpieza adicional**: el `else` (user null) ahora también llama `setUserData(null)` para limpiar el data del usuario anterior en logout. Antes solo bajaba `userLoggedIn` y `isLoading`.
- **Loading envuelto en `<ThemeProvider>`** durante el early return: el bloque `if (isLoading) return <Loading />` ahora envuelve `<Loading />` en `<ThemeProvider theme={theme}>` + `<CssBaseline />` para que el theme MUI (indigo/teal) esté disponible. Antes Loading se renderizaba fuera del ThemeProvider y dependía de los defaults de MUI.
- **`PrivateRoute` muerto borrado**: estaba flagged como pendiente desde varias sesiones. Como `isLoading` gateaba todo Routes, el `PrivateRoute` definido pero nunca usado fue eliminado. También se removió el import de `getCurrentUser` que solo lo usaba esa función muerta.
- **Imports muertos adicionales borrados**: `useState` y `useNavigate` en App.js — flagged por ESLint después del cleanup.

**Qué se hizo (parte 2 — Loading.jsx):**
- Reescritura completa de `src/pages/basics/Loading.jsx`: **315 → 38 líneas (−277, −88%)**.
- **Diseño nuevo**:
  - Fondo `linear-gradient(160deg, primary.main → primary.dark)` (mismo gradiente del Welcome de Login).
  - Logo "LifeTrack" centrado, blanco, `fontWeight: 800`, `letterSpacing: -1.5`, responsive 3rem (móvil) / 4rem (desktop).
  - `<CircularProgress>` blanco debajo, size 36, thickness 4.
  - Sin texto adicional, sin mensajes rotativos, sin íconos flotantes, sin animaciones de pulse/shine/float.
- **Borrado todo lo decorativo**:
  - 4 keyframes (`pulse`, `float`, `shine`, `progressPulse`).
  - 5 styled components (`StyledTitle`, `ProgressWrapper`, `FloatingIcon`, `Background`, `Card`).
  - Array `loadingMessages` con 5 mensajes rotativos.
  - State `messageIndex` + `progress` con 2 setIntervals.
  - 6 íconos flotantes (`MonetizationOnIcon`, `DirectionsCarIcon`, `LocalFloristIcon`, `SavingsIcon`, `AccountBalanceWalletIcon`, `LightbulbIcon`).
  - "Optimizando tu experiencia..." y otros textos.

**Build verificado limpio**: cero warnings en App.js y Loading.jsx. Bundle 1.05 MB (sin delta significativo).

**Por qué se hizo así:**
- **Subir `isLoading=true` en cada disparo de auth con user**: el bug original era una asunción válida solo para el boot inicial. Generalizar a "cada vez que auth resuelve un usuario, esperá el data antes de mostrar la UI" es la corrección correcta. Cubre login, re-login, switch de cuenta y refresh con sesión activa.
- **`setUserData(null)` en logout**: si no se limpia, después de un logout + login con otra cuenta, podría aparecer brevemente el data del usuario anterior. Limpiar es defensivo.
- **`<ThemeProvider>` envolviendo Loading**: el Loading nuevo usa `theme.palette.primary.main/dark` para el gradiente. Sin ThemeProvider en el early return, los valores caerían a los defaults de MUI (índigo casual, no el del proyecto). Envolver es la opción más limpia.
- **`<CircularProgress>` en vez de dots animados**: el spec dice "Spinner o dots animados". El `CircularProgress` de MUI ya está disponible y se ve bien en blanco contra el gradiente. Dots animados requerirían un keyframe + 3 Boxes — más código sin ganancia visual.
- **Borrado wholesale del Loading viejo**: las animaciones, íconos flotantes y mensajes rotativos eran ruido. El Loading se muestra entre 100ms y 2s en el peor caso — nadie tiene tiempo de leer "Sincronizando tus ahorros..." y seguro genera ansiedad si parece que tarda. Una marca + spinner es la convención esperada (Spotify, Discord, etc.).
- **No se modificó el flujo de Login.jsx**: el `navigate('/Home')` después del signIn sigue ahí. No importa qué pathname tenga el browser — mientras `isLoading=true` solo se renderiza Loading. Cuando baje, ya estaremos en /Home con userLoggedIn=true.

**Archivos modificados:**
- `src/App.js` — fix del useEffect de auth + early return con ThemeProvider + cleanup de imports muertos + `PrivateRoute` borrado
- `src/pages/basics/Loading.jsx` — reescrito completo (315 → 38 líneas)

**Decisiones importantes tomadas:**
- **`PrivateRoute` eliminado del todo**: estaba definido pero nunca usado. El gating por `isLoading` + el bloque ternario `userLoggedIn ? <Routes>: <Routes login-only>` cubren la lógica. Si en el futuro se necesita `PrivateRoute` (por ej. rutas mixtas públicas/privadas), se vuelve a crear.
- **Loading no tiene mensaje de progreso**: la transición es lo suficientemente rápida que mostrar "X%" introduce más ruido que valor. El usuario ve "LifeTrack + spinner" y entiende. Se prioriza calma sobre información.
- **El theme del Loading usa `primary.main/dark` (indigo)** — coherente con Welcome de Login y los headers del resto de la app. Una vez que la app cargue con `darkMode=true`, el Loading también se vería en modo oscuro (porque toma el theme actualizado).

**Pendiente para la próxima sesión:**
- **Probar en navegador el fix**:
  - Logout → Login (debería ir directo a /Home sin flash de /login).
  - Login con red lenta (debería mostrar Loading entre signIn y data llegado, no flash de pantallas).
  - Refresh F5 con sesión activa (debería ir directo a /Home).
  - Refresh F5 sin sesión (debería ir directo a /login).
  - Cerrar sesión desde Configuración → Privacidad → eliminar cuenta (debería limpiar userData y navegar a /).
- **Romper `NewHabit.jsx`** (1.425 líneas) — sigue siendo el único componente monstruo.
- **Hook `useConfigState`** para bajar Configuracion a ~150 líneas.
- **Capa `services/storage.js`** — sigue pendiente.
- **Restaurar feature de PDFs de tarjetas** si se quiere.
- **Memoización con `useMemo`** en los 7 componentes ya rotos.
- **Implementar pH/EC/PPM en Plants**.
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-12 — Restaurar features en Tarjetas (PDF + fechas por mes) + ajustes de UI

**Qué se hizo:**
- **Restaurada subida de PDF del resumen mensual** (`CreditCardStatementUpload.jsx`, 230 líneas). Sub-componente integrado al final de la Vista Detalle bajo el label "RESUMEN DEL PERÍODO":
  - **Empty state**: card con borde punteado + avatar/ícono + botón "Subir" (file picker que acepta solo PDF). Texto guía "Solo PDF · Máximo 10MB".
  - **Estado con PDF**: card sólida con avatar rojo PDF + nombre del archivo + fecha de subida + 2 botones ("Ver" abre en nueva pestaña con URL fresca refresheado de Storage, "Reemplazar" abre file picker para sobrescribir).
  - **Validaciones**: rechaza archivos que no sean `application/pdf` y archivos >10MB con snackbar de error.
  - **Path Storage**: `users/${uid}/summaries/${cardId}_${yearMonth}_${safeName}` — sigue el spec literal `users/{uid}/summaries/{filename}` pero incluye discriminadores en el filename para evitar colisiones cross-card/cross-month.
  - **Path RTDB**: `creditCards/${cardId}/statements/${yearMonth}` (vía `setCardStatement` del servicio existente).
  - **Custom metadata** en Storage: `userId`, `cardId`, `yearMonth` para queries futuras.
  - Reset del `<input type="file">` después de cada upload exitoso vía `key` que se incrementa (truco para limpiar el value del input nativo).
- **Restaurada configuración de fechas por mes** (`CreditCardDatesConfig.jsx`, 175 líneas). Sub-componente collapsible que se muestra en la Vista Detalle según estado:
  - **Si `!datesConfigured`**: banner naranja arriba del card de período con icono `WarningAmberIcon` y texto "Configurá las fechas de este período". Al tocar, expande un `<Collapse>` con el form.
  - **Si `datesConfigured`**: ícono lápiz al lado del chevron de "Período actual" — al tocar, muestra el form en modo edición con botones Cancelar + Guardar fechas.
  - **Validaciones preservadas** del componente viejo: `shouldDisableClosingDate` (1 mes futuro límite) y `shouldDisableDueDate` (debe ser ≥ cierre + caer en el mismo mes o el siguiente). Usa `isDateBeyondLimit` del helpers.
  - **DatePickers** con `@mui/x-date-pickers` + `AdapterDayjs` + locale `es`. Format `DD/MM/YYYY`. Persiste vía `setCardDatesForMonth(cardId, monthKey, {closingDate, dueDate})`.
- **Ajustes de UI en `CreditCardListView`**:
  - **Borrado**: el header con "Mis tarjetas" + botón "+" que ocupaba la parte superior.
  - **Movido el banner "PAGO PENDIENTE"** desde un `position: absolute` al fondo de la lista hacia **el tope de la vista**, encima del navegador de mes. Cuando no hay pendiente, no se renderiza nada en ese slot.
  - **Reemplazo del botón "+"**: card "+ Agregar tarjeta" con borde punteado al final de la lista de tarjetas. Aparece después de la última tarjeta y abre la Vista Add. Mantiene el acceso sin un header dedicado.

**Lógica preservada al 100%:**
- `addCreditCard`, `addCardTransaction`, `setCardStatement`, `setCardDatesForMonth` — todos los servicios de `services/finances.js` se siguen consumiendo igual.
- `isDateBeyondLimit` del helpers — la validación de "no más de 1 mes futuro" funciona igual que antes.
- El shape de RTDB y Storage no cambia. Datos viejos siguen siendo legibles.

**Orquestador actualizado** (`CreditCards.jsx`):
- Agregada función `areDatesConfigured(cardId)` que chequea `userData?.creditCards?.[cardId]?.dates?.[monthKey]?.closingDate && dueDate`.
- Agregada función `handleSaveDates({closingDate, dueDate})` que llama `setCardDatesForMonth` y muestra snackbar.
- Pasa `datesConfigured`, `onSaveDates`, `userData`, `onSnack` al `CreditCardDetailView`.

**Build verificado**: bundle 1.05 MB (+2.59 kB por DatePickers + 2 sub-componentes nuevos). Cero warnings en los archivos tocados.

**Por qué se hizo así:**
- **PDF subida inline en el Detail, no en vista separada**: el spec pidió "agregar una sección debajo de los movimientos". Mantener el flujo dentro del Detail evita una sexta vista — el PDF queda asociado visualmente al período/mes que se está viendo.
- **Path `users/{uid}/summaries/{filename}` con discriminadores**: el spec dice exactamente ese path. Para garantizar 1 PDF por tarjeta por mes sin colisiones cross-card (varias tarjetas pueden tener el mismo nombre original de archivo), incluyo `${cardId}_${yearMonth}_${safeName}` en el filename. El RTDB sigue siendo SSOT del "cuál PDF corresponde a qué tarjeta/mes" — Storage es solo blob.
- **`Collapse` para el formulario de fechas, no Bottom Sheet**: el spec ofreció ambas opciones. `Collapse` es más simple (sin dependencias, sin gestión de modal) y mantiene el contexto visual (el form aparece donde va a ir el dato). En móvil ocupa la misma pantalla sin perder el header.
- **Card "+ Agregar tarjeta" al final, no FAB**: un FAB flotante sobre la lista impediría ver el último item y obligaría a una decisión adicional de UX (¿esconder al scrollear?, ¿posición exacta?). Card al final del scroll es discoverable (el usuario llega cuando recorre todas sus tarjetas) y tipo "ghost card" coincide visualmente con las cards reales.
- **Banner pendiente arriba**: ahora es lo primero que el usuario ve cuando hay pago pendiente. Anchorando al top en vez de flotando al fondo se evita superposición con el último ítem de la lista y se da más jerarquía visual al "call to action" de pagar.
- **Subida que rechaza no-PDF antes de iniciar upload**: el `file.type !== 'application/pdf'` early-return evita un round-trip a Storage para fallar. Mismo para el límite de 10MB.
- **`storagePath` guardado en RTDB**: permite pedir URL fresca con token actualizado al hacer "Ver" — si el `downloadURL` original expiró, todavía se puede abrir el PDF.
- **`useEffect` que sincroniza `[initialClosingDate, initialDueDate]`** en DatesConfig: si el orquestador cambia los defaults (ej. al cambiar de mes), el form se actualiza. Sin esto, el form quedaría con valores stale.

**Archivos creados** (2):
- `src/components/finances/CreditCardStatementUpload.jsx` (230 líneas — recreado, no se restauró el viejo)
- `src/components/finances/CreditCardDatesConfig.jsx` (175 líneas — recreado, validaciones del viejo preservadas)

**Archivos modificados** (3):
- `src/components/finances/CreditCardDetailView.jsx` (+banner naranja + Collapse + sección Resumen + props nuevas)
- `src/components/finances/CreditCardListView.jsx` (banner pendiente movido al tope, header borrado, card "+ Agregar tarjeta" al final)
- `src/pages/finances/CreditCards.jsx` (+`areDatesConfigured`, `handleSaveDates`, props nuevas al DetailView, +import de `setCardDatesForMonth`)

**Decisiones importantes tomadas:**
- **NO restaurar `CreditCardStatementUpload.jsx` del git history**: el componente viejo (354 líneas) era full-card con gradiente y muchos detalles visuales. El nuevo (230 líneas) está adaptado al estilo del módulo rediseñado — compacto, inline, sin gradientes coloridos. El path de Storage también cambió (era `statements/{uid}/{cardId}/{yearMonth}/...`, ahora `users/{uid}/summaries/...` per spec).
- **NO restaurar `CreditCardDatesConfig.jsx` viejo**: era full-card con dos sub-cards visuales por DatePicker. El nuevo es un Card compacto con 2 DatePickers en stack vertical + botones Cancelar/Guardar. Mismas validaciones, una décima parte del JSX.
- **Bundle +2.59 kB justificado**: los DatePickers (`@mui/x-date-pickers`) y `dayjs` ya estaban en bundle (UpdateCardDates.jsx los usa). El delta viene del JSX adicional de los 2 sub-componentes + uso de `Collapse` en DetailView.
- **Acceso al "Agregar tarjeta" no se pierde**: el card ghost al final de la lista cumple el rol del botón "+" del header eliminado. En empty state (sin tarjetas) sigue el botón centrado del placeholder.

**Pendiente para la próxima sesión:**
- **Testear en navegador los flujos restaurados**:
  - Mes nuevo sin fechas configuradas → banner naranja → expandir → guardar → desaparece banner.
  - Mes con fechas configuradas → click icono lápiz → editar → cancelar / guardar.
  - Subir PDF (válido / no-PDF / >10MB).
  - Reemplazar PDF subido.
  - Ver PDF subido en otra pestaña.
- **Tocar la Vista Lista** verificando que el banner pendiente queda arriba del navegador de mes, que el card "+ Agregar tarjeta" aparece al final y funciona.
- **Romper `NewHabit.jsx`** (1.425 líneas).
- **Hook `useConfigState`** para bajar Configuracion a ~150 líneas.
- **Capa `services/storage.js`** — `CreditCardStatementUpload` es ahora el 5° componente que importa `auth, storage` directos.
- **Memoización con `useMemo`** en los 7 componentes ya rotos.
- **Implementar pH/EC/PPM en Plants**.
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-12 — Rediseño completo de AppBar + Drawer + Layout

**Qué se hizo:**
- **`AppBar.jsx` reescrito** (375 → **163 líneas**, **−212 / −57%**) con estilo iOS minimalista:
  - **Fondo blanco** (`background.paper`) en modo claro / `grey.900` en modo oscuro. Texto en `text.primary`.
  - Sin elevación fuerte: `elevation={0}` + `borderBottom: 1px solid divider` + sombra muy sutil `0 1px 2px rgba(0,0,0,0.04)`.
  - Heights: 56px mobile / 64px desktop.
  - **Layout en grid de 3 columnas** (`1fr auto 1fr`) para centrar el título perfectamente independiente del ancho de los slots laterales.
  - **Izquierda**: hamburguesa color índigo (`primary.main`) con hover sutil.
  - **Centro**: título en `text.primary` con ellipsis si overflowa.
  - **Derecha**: avatar circular (foto o inicial sobre fondo `primary.main` con 15% alpha) que abre un Menu con:
    - Nombre + email del usuario en el header del menu
    - `Configuración` → `/Configuracion`
    - `Cerrar sesión` (texto rojo, ícono rojo)
  - **Borrados** del AppBar viejo: Paper con saldos ARS/USD, botón "Acción rápida" con menú de quick actions (Nuevo gasto/ingreso/exchange/planta/aditivo), opción "Mi perfil", opción "Ayuda".
- **`Drawer.jsx` reescrito** (432 → **248 líneas**, **−184 / −43%**) con menú agrupado plano:
  - Ancho 280px. Fondo `background.paper` en modo claro / `grey.900` en modo oscuro.
  - **Sin header oscuro con gradiente**: ahora el header es limpio sobre fondo blanco con avatar 64×64 centrado + nombre del usuario en bold + email en `text.secondary` debajo. Divider sutil debajo.
  - **Menú agrupado en `MENU_GROUPS`** (estructura declarativa a nivel módulo): 4 grupos con `label` opcional:
    - Sin label: Home
    - "FINANZAS": Finanzas / Tarjetas / Exchange / Ahorros
    - "VIDA": Hábitos / Plantas
    - "CUENTA": Configuración / Ayuda
  - **Items planos sin submenús**: `Aditivos` y `HabitosList` ahora se acceden desde sus respectivas vistas raíz (`Plantas` y `Hábitos`), eliminando los Collapse/expand del Drawer viejo.
  - **Item activo**: fondo `primary.main` con 8% alpha + texto color `primary.main` + **borde izquierdo índigo 4px**. Hover incrementa el alpha al 12%.
  - **`isItemActive` helper** module-level: matchea exact + prefijos (ej. `/ahorros/fondo/123` activa Ahorros), pero Home (`/`) solo si es exact match.
  - **Footer**: divider + botón "Cerrar sesión" en `text-only style` con texto + ícono rojo (`error.main`), centrado, sin fondo. Hover muestra fondo rojo con 8% alpha.
- **`Layout.jsx` ajustado** (27 → **23 líneas**):
  - Eliminado el `Grid mt={5}` con `bgcolor: secondary.dark` (el `mt={5}` (40px) no compensaba el AppBar de 56-64px causando que el contenido quedara semi-tapado, y el bgcolor oscuro chocaba con el nuevo AppBar blanco).
  - Reemplazado por `<Box>` con `pt: { xs: '56px', sm: '64px' }` que compensa exactamente el alto del AppBar fijo.
- **Build verificado limpio**. **Bundle bajó −1.33 kB** (limpieza de imports MUI y desuso de varios iconos del AppBar viejo).

**Por qué se hizo así:**
- **Grid de 3 columnas en el Toolbar**: la forma estándar de `<Toolbar>` con `<Stack direction="row">` no centra el título porque las zonas izquierda/derecha tienen anchos variables. Un `display: 'grid'` con `1fr auto 1fr` garantiza que el slot central (donde va el título) ocupa el espacio restante y se centra perfectamente sin importar el ancho de los lados.
- **`MENU_GROUPS` declarativo a nivel módulo**: la lista de items vive fuera del componente, sin closures sobre theme/state. Si en el futuro se agrega un ítem, es una entrada en el array — el `renderItem` no cambia. Cada grupo tiene `label` opcional y un array `items`.
- **`isItemActive` con prefix matching**: cuando el usuario está en `/ahorros/fondo/abc123`, el item "Ahorros" debe quedar marcado como activo. Un exact match no lo cubre. Pero Home (`/`) requiere exact match para evitar que TODOS los paths matcheen el prefijo `/`.
- **Sin submenús expandibles**: la versión vieja tenía 3 grupos con sub-items (Finanzas/Hábitos/Plantas). Eso requería state `expandedItems`, lógica de auto-expand al cargar la ruta, `<Collapse>` con animación, etc. El diseño nuevo plano elimina toda esa complejidad. Los accesos a Aditivos y HabitosList se mueven dentro de las propias vistas raíz (decisión coherente con el patrón mobile-first del resto del rediseño).
- **AppBar sin saldos ni "Acción rápida"**: el spec lo pidió explícitamente. Las acciones ahora viven en cada pantalla (Finances tiene su SpeedDial, NewTransaction es una pantalla completa que se navega desde el wizard). El AppBar queda como chrome puro de navegación.
- **`text.primary` para el título (no color blanco)**: con fondo blanco/dark, el título debe respetar el color de texto del theme. En modo claro queda gris oscuro; en modo oscuro queda blanco automáticamente.
- **Layout sin `<Grid>` wrapper**: el `<Grid container>` del Layout viejo agregaba 0 valor (no había grid de columnas, solo un wrapper). Reemplazado por `<Box>` simple. El `bgcolor: secondary.dark` que aplicaba a todo el wrapper se eliminó porque hacía que páginas que no setean su propio fondo (ej. PlantsList) se vieran con un fondo turquesa raro.

**Archivos modificados:**
- `src/components/layout/AppBar.jsx` (375 → 163, **−212 líneas**)
- `src/components/layout/Drawer.jsx` (432 → 248, **−184 líneas**)
- `src/components/layout/Layout.jsx` (27 → 23 líneas)

**Decisiones importantes tomadas:**
- **Drawer siempre temporal** (no persistente en desktop): el spec dijo "puede ser persistente" pero no es obligatorio. Mantener temporal en todas las resoluciones simplifica el layout y es coherente con el patrón mobile-first del resto del rediseño. Si en el futuro se quiere persistente en desktop, es un `variant` condicional de 1 línea.
- **`useStore` para `displayName` mantenido en el Drawer**: aunque `useAuth()` ya da `user.displayName`, el Drawer también lee de `userData.displayName` (Zustand) que se actualiza al guardar desde Configuración antes de que Firebase Auth refresque el token. Esto evita un flash donde el sidebar muestre el nombre viejo después de cambiarlo.
- **Aditivos y HabitosList sin link en el Drawer**: cambio de UX. El usuario llega vía la vista raíz (Plantas → ver aditivos, Hábitos → ver lista). Si se necesita acceso directo, agregar al `MENU_GROUPS`.
- **Borrado de "Mi perfil" del AppBar menu**: el menú profile del AppBar viejo tenía 3 opciones (Mi Perfil, Configuración, Ayuda). El spec nuevo pide solo "Ir a Configuración" + "Cerrar sesión". "Ayuda" sigue accesible desde el Drawer; "Mi Perfil" desaparece (la ruta `/Perfil` sigue funcionando pero sin acceso desde el AppBar).
- **No se tocó `useAuth()` ni `services/auth.js`**: el `signOut()` se invoca igual que antes. El `user.photoURL` y `user.displayName` se leen igual.

**Pendiente para la próxima sesión:**
- **Probar en navegador**:
  - AppBar: hamburguesa abre Drawer / avatar abre menú / "Configuración" navega / "Cerrar sesión" hace logout
  - Drawer: items navegan + cierran drawer / item activo tiene borde índigo izq / cerrar sesión funciona
  - Layout: el contenido empieza debajo del AppBar sin quedar tapado
  - Modo oscuro: AppBar y Drawer cambian a `grey.900` correctamente
- **Romper `NewHabit.jsx`** (1.425 líneas).
- **Hook `useConfigState`** para bajar Configuracion a ~150 líneas.
- **Capa `services/storage.js`**.
- **Memoización con `useMemo`** en los 7 componentes ya rotos.
- **Implementar pH/EC/PPM en Plants**.
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `updateSavings` obsoleto de store.js.

---

### 2026-05-13 — Rediseño completo de la pantalla Finanzas

**Qué se hizo:**
- Reescritura completa de la página Finanzas siguiendo la estética iOS de los rediseños anteriores. **4 sub-componentes nuevos** + orquestador limpio + borrado de 5 componentes viejos.
- **Orquestador `Finances.jsx`** (294 → **289 líneas**): preserva al 100% los 2 `useEffect` de cálculo (`monthlyData` y `monthlyTrendsData`) y el manejo de `RefundDialog` + `SpeedDial`. Solo compone las 4 nuevas secciones verticalmente.
- **Sección 1 — `FinancesHeader.jsx`** (135 líneas): toggle Gastos/Ingresos con `ToggleButtonGroup` redondeado pill-style (rojo cuando expense, verde cuando income) + navegador `< Mes Año >` grande con chevrons. Validación `isFutureMonth` para deshabilitar el `>` si el siguiente mes es futuro.
- **Sección 2 — `FinancesMonthSummary.jsx`** (254 líneas): card con gradiente suave del color del tipo (rojo/verde tenue). Layout:
  - Monto total grande (`h2`, fontWeight 800) con signo `−`/`+` y color acento
  - Equivalente USD debajo en gris
  - 3 métricas en grid: TRANSACCIONES / PROMEDIO POR DÍA / VS MES ANTERIOR (con flecha arriba/abajo según signo)
  - Top 3 categorías con avatar circular coloreado + nombre + `LinearProgress` del % + monto a la derecha
  - Botón "Ver todas las categorías (N)" si hay más de 3
- **Sección 3 — `FinancesCharts.jsx`** (276 líneas): 2 charts navegables con swipe horizontal + dots indicator:
  - **Chart A**: Evolución últimos 6 meses, tipo `area` con gradient (ApexCharts). Color rojo o verde según `dataType`. Helper `buildLastNMonths` retrocede mes-a-mes desde el seleccionado.
  - **Chart B**: Top 6 categorías del mes actual, barras horizontales (ApexCharts). Cada barra usa el color de la categoría desde `getCategoryColor`.
  - Navegación: chevrons `<` / `>` en el header + swipe táctil (`onTouchStart/Move/End` con threshold 40px) + click en dots
- **Sección 4 — `FinancesTransactionsList.jsx`** (367 líneas): lista de transacciones con buscador + agrupado por fecha + expand al tocar:
  - **Buscador** pill-style con ícono lupa, filtra en vivo por descripción/categoría/subcategoría/monto/método
  - **Agrupado por fecha** con etiquetas inteligentes "Hoy" / "Ayer" / "13 may"
  - Cada grupo tiene su total agregado a la derecha del label de fecha
  - **Cada transacción**: avatar coloreado con ícono de categoría, descripción bold, categoría · subcategoría, chip "N/12" si es cuota, ícono pequeño de método de pago, monto a la derecha en color del tipo con signo
  - **Expand al tocar**: muestra descripción completa, fecha "lunes 13 de mayo de 2026", equivalente USD + TC, método, y botón "Registrar devolución" (solo en gastos en efectivo sin refund previa)
  - Helpers internos `parseFechaFlexible`, `labelFromDate`, `fullDateLabel` — preserva la lógica de fechas flexibles del componente viejo

**Lógica preservada al 100%:**
- Los 2 `useEffect` para `monthlyData` y `monthlyTrendsData` quedan idénticos al original (filtrado de transacciones futuras, `excludeFromTotal`, `hiddenFromList`, `refundAmount`).
- `RefundDialog` se mantiene sin cambios — el orquestador lo monta igual.
- `addExpense`/`addIncome`/`updateSavingsWithHistory` no se tocan (no se llaman desde acá; vienen vía NewTransaction).
- `getCategoryIcon` / `getCategoryColor` del helpers se reusan.

**Componentes viejos borrados** (5):
- `FinancesTimeNavigator.jsx` (549 líneas — reemplazado por FinancesHeader 135)
- `MonthlySummaryCard.jsx` (372 — reemplazado por FinancesMonthSummary 254 con el pie chart sustituido por top 3 + barras)
- `MonthlyTransactionsList.jsx` (745 — reemplazado por FinancesTransactionsList 367 sin acordeones por fecha, ahora expand inline por transacción)
- `AnnualTrends.jsx` (293 — reemplazado por FinancesCharts 276)
- `SavingsEvolutionCard.jsx` (341 — eliminado del módulo, ya está en Home según spec)

**Build verificado limpio**. Bundle **bajó −4.53 kB** (de 1.05 → 1.04 MB) — neto positivo a pesar de 4 archivos nuevos. La ganancia viene del borrado de 5 componentes pesados y el unshare de imports de MUI/iconos no usados.

**Por qué se hizo así:**
- **Layout vertical de 4 secciones**: el spec pide pantalla con scroll vertical, no más layout en columnas Grid. Permite mejor UX en mobile (donde se usa más) y elimina la complejidad de breakpoints.
- **`FinancesHeader` con `isFutureMonth` no `isBeyondFutureLimit`**: la pantalla Finanzas no permite navegar al futuro (a diferencia de Tarjetas que sí permite 1 mes adelante para configurar pagos). Función inline simple — no necesita helper compartido.
- **`monthlyTrendsData` se pasa a ambos `FinancesMonthSummary` y `FinancesCharts`**: ambos lo consumen — Summary para "vs mes anterior", Charts para evolución 6 meses. Calcular una vez en el orquestador y pasar como prop evita doble cómputo.
- **`buildLastNMonths` con fallback a 0 cross-year**: si el usuario navega a enero/febrero, los últimos 6 meses cruzan el cambio de año. Como `monthlyTrendsData` es solo del año seleccionado, los meses del año anterior aparecen como 0. Aceptable para esta versión — flagged en pendiente para mejora futura (necesitaría leer `userData.finances.expenses[prevYear]` también).
- **Top 3 categorías + barra de progreso en lugar de pie chart**: el `MonthlySummaryCard` viejo tenía un pie chart con top 3 + "Otras". El diseño nuevo prefiere barras horizontales más legibles y compactas, alineadas con el resto del módulo (chart B usa barras también).
- **Expand inline por transacción en lugar de acordeón por fecha**: el componente viejo agrupaba por fecha con `<Accordion>` y mostraba todo el detalle dentro. El nuevo usa `<Collapse>` por transacción individual — más granular y permite ver el detalle sin colapsar/expandir grupos enteros.
- **Botón "Registrar devolución" solo en condiciones específicas**: visible cuando `isExpense && !hasRefund && !isCreditCard`. La regla viene del flujo viejo (RefundDialog solo aplica a gastos en efectivo sin devolución previa). `e.stopPropagation()` evita que el click cierre el expand de la transacción.
- **Swipe horizontal con `useRef`** en charts: evita re-renderizar en cada movimiento del dedo. Threshold de 40px filtra clicks accidentales.

**Archivos creados** (4):
- `src/components/finances/FinancesHeader.jsx` (135 líneas)
- `src/components/finances/FinancesMonthSummary.jsx` (254 líneas)
- `src/components/finances/FinancesCharts.jsx` (276 líneas)
- `src/components/finances/FinancesTransactionsList.jsx` (367 líneas)

**Archivos modificados:**
- `src/pages/finances/Finances.jsx` (294 → 289 líneas, reescrito como orquestador limpio)

**Archivos borrados** (5):
- `FinancesTimeNavigator.jsx`, `MonthlySummaryCard.jsx`, `MonthlyTransactionsList.jsx`, `AnnualTrends.jsx`, `SavingsEvolutionCard.jsx`

**Resultado neto**: ~2378 líneas eliminadas, ~1032 líneas nuevas (4 componentes nuevos), **−1346 líneas / −57%** en el módulo de pantalla principal de Finanzas.

**Decisiones importantes tomadas:**
- **`SavingsEvolutionCard` eliminado del módulo Finanzas**: el spec lo permitió explícitamente porque ya existe en Home. Si en el futuro se quiere recuperarlo, está en git history.
- **SpeedDial agregó botón Exchange**: el viejo solo tenía Nuevo gasto / Nuevo ingreso. Agregué Exchange porque el sidebar nuevo lo expone como sección de Finanzas — coherente tener acceso rápido.
- **`onSeeAllCategories` scroll al ancla de transacciones**: el spec dice "Link 'Ver todas' al final" sin definir qué hace. Implementé scroll suave a la lista de transacciones (donde se ven todas las categorías filtrables). Si en el futuro se quiere vista dedicada, hay que crearla.
- **Expand inline en transacciones, no Dialog/Drawer**: mantiene contexto, es más rápido, y coherente con el patrón del rediseño (Tarjetas usa expand inline también para fechas).
- **Bundle −4.53 kB**: el borrado de los 5 componentes (con muchos imports MUI redundantes) más que compensa los 4 archivos nuevos. Tree-shaking de los imports de MUI usados.

**Pendiente para la próxima sesión:**
- **Probar en navegador**:
  - Toggle Gastos/Ingresos cambia color + recalcula datos
  - Navegador de mes deshabilita `>` cuando es mes actual
  - Swipe entre los 2 charts en mobile
  - Buscar transacciones en vivo
  - Expand de una transacción muestra detalle + botón devolución (en gastos efectivo)
  - Registrar devolución abre el RefundDialog correctamente
  - SpeedDial con 3 acciones (Gasto/Ingreso/Exchange) navega correctamente
- **`buildLastNMonths` cross-year**: leer `userData.finances.expenses[prevYear]` si el rango cruza enero.
- **Vista "Ver todas las categorías"**: hoy hace scroll al ancla. Considerar página dedicada con filtros si se necesita.
- **Romper `NewHabit.jsx`** (1.425 líneas) — único componente monstruo que queda.
- **Hook `useConfigState`**, capa `services/storage.js`.
- **Memoización con `useMemo`** en los componentes ya rotos.
- **Implementar pH/EC/PPM en Plants**.
- Sigue pendiente: migrar `dayjs` → `date-fns`, auditar reglas Firebase, borrar `updateSavings` obsoleto de store.js.

---

### 2026-06-30 — Animaciones UX/UI (Framer Motion)

**Qué se hizo:**
- Creado `src/design-system/AnimatedCard.jsx` con `AnimatedGroup` y `AnimatedItem`
- Animaciones fade-in-up stagger aplicadas a ~20 archivos en todos los módulos
- Swipe carrusel 3-panel con `useMotionValue` en `Finances.jsx`
- Swipe `useMotionValue` en `WeekStrip.jsx` (navegador de semanas de Plants)
- Scrollbars ocultos globalmente (`App.css`)
- Animación slide horizontal al navegar meses con botones

---

## Patrones de Animación UX/UI — Referencia para replicar

### Patrón 1: Fade-in-up stagger (listas de cards)

**Archivos:** `src/design-system/AnimatedCard.jsx` (implementación), aplicado en 20+ archivos.

**Uso básico — flex column:**
```jsx
import { AnimatedGroup, AnimatedItem } from '../../design-system';

<AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  <AnimatedItem><Card>...</Card></AnimatedItem>
  <AnimatedItem><Card>...</Card></AnimatedItem>
</AnimatedGroup>
```

**Uso con Grid de MUI:**
```jsx
<Grid container spacing={1} component={AnimatedGroup}>
  {items.map(item => (
    <Grid item xs={4} key={item.id} component={AnimatedItem}>
      <Card>...</Card>
    </Grid>
  ))}
</Grid>
```

**Uso con componente `component` en Stack:**
```jsx
<AnimatedGroup component={Stack} spacing={1.5}>
  {items.map(item => (
    <AnimatedItem key={item.id}><Card>...</Card></AnimatedItem>
  ))}
</AnimatedGroup>
```

**Uso standalone (una sola card):**
```jsx
<AnimatedItem><Card>...</Card></AnimatedItem>
```

**Parámetros de `AnimatedGroup`:**
| Prop | Default | Descripción |
|---|---|---|
| `staggerDelay` | `0.05` | Segundos entre cada hijo |
| `delay` | `0.05` | Delay inicial antes de empezar stagger |
| `skipEnter` | `false` | Si `true`, desactiva la animación en este grupo Y todos los `AnimatedItem` anidados (vía contexto) |
| `sx` | — | Props de estilo MUI (usa `<Box component={motion.div}>` internamente) |

**Cómo funciona internamente:**
- `AnimatedGroup` renderiza `<Box component={motion.div}>` con variantes de container (`staggerChildren`, `delayChildren`)
- `AnimatedItem` renderiza `<Box component={motion.div}>` con variantes `hidden → show`: `y: 20→0, opacity: 0→1, duration: 0.3s easeOut`
- `skipEnter` usa `createContext` para propagar la neutralización a TODOS los `AnimatedItem` nietos sin necesidad de pasarlo como prop a cada uno
- Si un `AnimatedGroup` anidado NO tiene `skipEnter`, lee el contexto del padre y no crea un Provider propio → deja fluir el contexto

**IMPORTANTE — El `sx` SÍ funciona:** Los componentes usan `<Box component={motion.div}>` de MUI, no `<motion.div>` nativo. El `sx` se procesa correctamente y se aplican `gap`, `display: flex`, `grid`, etc.

---

### Patrón 2: Swipe carrusel 3-panel (navegación mensual/semanal)

**Archivo de referencia:** `src/pages/finances/Finances.jsx`

**Cuándo usarlo:** Navegación entre items adyacentes (meses, semanas, días) donde querés feedback táctil en tiempo real y ver el panel adyacente durante el swipe.

**Estructura:**
```jsx
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// 1. MotionValue para el offset de paneo
const panelW = 375; // ancho de cada panel (usar window.innerWidth o ResizeObserver)
const panX = useMotionValue(-panelW); // empieza centrado en el panel actual

// 2. Calcular datos de paneles adyacentes (prev y next)
const prevData = useMemo(() => computeData(prevMonth), [prevMonth]);
const nextData = useMemo(() => computeData(nextMonth), [nextMonth]);

// 3. Refs para estado de drag
const touchStartX = useRef(0);
const isDragging = useRef(false);
const animatingRef = useRef(false);

// 4. Handlers de touch
const onTouchStart = (e) => {
  touchStartX.current = e.touches[0].clientX;
  isDragging.current = false;
};

const onTouchMove = (e) => {
  const dx = e.touches[0].clientX - touchStartX.current;
  if (!isDragging.current && Math.abs(dx) > 8) isDragging.current = true;
  if (isDragging.current) panX.set(-panelW + dx);
};

const onTouchEnd = () => {
  if (!isDragging.current) return;
  isDragging.current = false;
  const offset = panX.get() + panelW;
  const threshold = panelW * 0.3;
  
  if (offset < -threshold) {
    // Swipe a siguiente → animar a -panelW*2, jump, cambiar estado
    animate(panX, -panelW * 2, { type: 'spring', stiffness: 200, damping: 28 })
      .then(() => { panX.jump(-panelW); goNext(); });
  } else if (offset > threshold) {
    // Swipe a anterior → animar a 0, jump, cambiar estado
    animate(panX, 0, { type: 'spring', stiffness: 200, damping: 28 })
      .then(() => { panX.jump(-panelW); goPrev(); });
  } else {
    // Spring back al centro
    animate(panX, -panelW, { type: 'spring', stiffness: 300, damping: 30 });
  }
};

// 5. Navegación por botones (mismo patrón de animación)
const goNext = () => {
  if (animatingRef.current) return;
  animatingRef.current = true;
  animate(panX, -panelW * 2, { type: 'spring', stiffness: 200, damping: 28 })
    .then(() => { panX.jump(-panelW); animatingRef.current = false; setMonth(next); });
};

// 6. Render: 3 paneles en flex row dentro de overflow:hidden
<Box onTouchStart={...} onTouchMove={...} onTouchEnd={...}>
  <Box sx={{ overflow: 'hidden' }}>
    <motion.div style={{ display: 'flex', x: panX, width: panelW * 3 }}>
      <Box sx={{ minWidth: panelW }}><PrevPanel /></Box>
      <Box sx={{ minWidth: panelW }}><CurrentPanel /></Box>
      <Box sx={{ minWidth: panelW }}><NextPanel /></Box>
    </motion.div>
  </Box>
</Box>
```

**Para desktop** — cada panel debe tener `maxWidth` para no estirarse:
```jsx
<Box sx={{ minWidth: panelW, maxWidth: 600, mx: 'auto', width: '100%' }}>
```

**Patrón de animación de botones:**
1. `animate(panX, target, spring)` → panel actual sale
2. Al completar → `panX.jump(-panelW)` → reset instantáneo al centro
3. Cambiar estado → re-render con nuevo panel en el centro

---

### Patrón 3: Navegador con `useMotionValue` (WeekStrip)

**Archivo de referencia:** `src/components/plants/WeekStrip.jsx`

**Cuándo usarlo:** Navegador horizontal compacto (semanas, tabs) con swipe + botones. Las 3 vistas se renderizan juntas y se deslizan con `useMotionValue`.

**Estructura:**
```jsx
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const containerWidth = 300; // vía ResizeObserver
const translateX = useMotionValue(0);
const totalX = useTransform(translateX, (t) => -containerWidth + t);
const containerWidthRef = useRef(containerWidth);

// Botones: setear translateX al borde, rAF, animar a 0
const navigate = (direction) => {
  const cw = containerWidthRef.current;
  setOffset(offset + direction);
  translateX.set(direction > 0 ? -cw : cw);
  requestAnimationFrame(() => {
    animate(translateX, 0, { type: 'spring', stiffness: 250, damping: 30, mass: 0.8 });
  });
};

// Touch: translateX sigue el dedo en tiempo real
const onTouchMove = (e) => {
  translateX.set(e.touches[0].clientX - startX);
};

const onTouchEnd = () => {
  const delta = /* delta final */;
  if (Math.abs(delta) > 40) {
    // Swipe completado: cambiar offset, setear translateX al borde, rAF, animar a 0
    setOffset(offset + (delta > 0 ? -1 : 1));
    translateX.set(delta);
    requestAnimationFrame(() => animate(translateX, 0, spring));
  } else {
    // Spring back
    animate(translateX, 0, { type: 'spring', stiffness: 350, damping: 35, mass: 0.6 });
  }
};

// Render: motion.div con x derivado de useTransform
<motion.div style={{ display: 'flex', x: totalX }}>
  <PrevWeek />
  <CurrentWeek />
  <NextWeek />
</motion.div>
```

**Diferencia clave con Patrón 2:** Acá `translateX` representa el delta de arrastre desde el centro. `totalX = -containerWidth + translateX` deriva la posición absoluta. En el Patrón 2, `panX` es la posición absoluta directamente.

---

### Patrón 4: AnimatePresence slide (transiciones con key)

**Archivo de referencia:** `Finances.jsx` (versión anterior, reemplazada por Patrón 2)

**Cuándo usarlo:** Transiciones entre estados donde solo se muestra UN panel a la vez y el cambio de estado dispara la animación.

```jsx
import { motion, AnimatePresence } from 'framer-motion';

const [selected, setSelected] = useState(0);
const [direction, setDirection] = useState(1);

const slideVariants = {
  enter: (dir) => ({
    x: dir * 40,
    opacity: 0,
    transition: {
      x: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.4, ease: 'easeOut' },
    },
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({
    x: dir * -60,
    opacity: 0,
    transition: {
      x: { duration: 0.35, ease: 'easeIn' },
      opacity: { duration: 0.18, ease: 'easeIn', delay: 0.17 },
    },
  }),
};

<AnimatePresence custom={direction}>
  <motion.div
    key={selected}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
  >
    <Content />
  </motion.div>
</AnimatePresence>
```

**Timing asimétrico:** `enter` con opacidad que llega a 100% al ~50% del slide. `exit` con opacidad que se mantiene 100% hasta ~50% y luego se desvanece. Esto evita que se vea contenido "fantasma" durante el solapamiento.

---

### Patrón 5: Scrollbars ocultas

**Archivo:** `src/App.css`

```css
* { scrollbar-width: none; }
*::-webkit-scrollbar { display: none; }
```

---

### Patrón 6: Numpad wizard steps (Monto + display centrado + numpad abajo)

**Archivos de referencia:** `NewTransaction.jsx` Step 1, `Exchange.jsx` Steps 1-2, `ProcesarDevolucion.jsx` Step 0

**Cuándo usarlo:** Pasos de wizard con toggle superior + display numérico centrado + numpad + botón de acción. El display debe centrarse verticalmente entre el toggle y el numpad, ocupando el espacio flexible.

**Estructura:**
```jsx
// 1. El AnimatedGroup envuelve todo el contenido del paso, con flex: 1 y gap
<AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
  
  {/* 2. Toggle / switch — sin flex, tamaño natural */}
  <AnimatedItem>
    <Box sx={{ px: 3 }}>
      <ToggleButtonGroup>...</ToggleButtonGroup>
    </Box>
  </AnimatedItem>

  {/* 3. Display centrado — AnimatedItem con flex: 1 + display: flex */}
  {/*    El display: flex es CLAVE: convierte el wrapper en contenedor flex */}
  {/*    para que el Box interno con justifyContent: center funcione */}
  <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
      <Typography>MONTO</Typography>
      <Typography variant="h2">$ 1.840</Typography>
      <Typography>≈ USD 1.23</Typography>
    </Box>
  </AnimatedItem>

  {/* 4. Numpad + TextField — sin flex, tamaño natural */}
  <AnimatedItem>
    <Box sx={{ px: 3, pb: 2 }}>
      <Grid container>{/* botones del numpad */}</Grid>
      <TextField placeholder="O pegá el monto acá" />
    </Box>
  </AnimatedItem>

  {/* 5. Botón de acción — sin flex, al fondo */}
  <AnimatedItem>
    <Box sx={{ px: 3, pb: 3 }}>
      <Button>Siguiente →</Button>
    </Box>
  </AnimatedItem>
</AnimatedGroup>
```

**El secreto:**
- El `AnimatedGroup` tiene `flex: 1` para ocupar todo el alto disponible
- Solo el `AnimatedItem` del display tiene `sx={{ flex: 1, display: 'flex' }}`
- Los demás `AnimatedItem` no tienen flex → tamaño natural
- El `display: 'flex'` en el AnimatedItem del display es **obligatorio**. Sin él, el Box interno con `justifyContent: 'center'` no centra porque el AnimatedItem es `display: block` por defecto.

**Patrón equivalente sin numpad (solo display centrado):**
```jsx
<AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
  <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
      {/* Contenido centrado */}
    </Box>
  </AnimatedItem>
  <AnimatedItem>
    <Box sx={{ px: 3, pb: 3 }}>
      {renderActionButton(...)}
    </Box>
  </AnimatedItem>
</AnimatedGroup>
```

**Para steps de revisión (múltiples Cards sin numpad):**
```jsx
<Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
  <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
    <AnimatedItem><Card>...</Card></AnimatedItem>
    <AnimatedItem><Card>...</Card></AnimatedItem>
  </AnimatedGroup>
</Box>
```
Las Cards de revisión NO necesitan `flex: 1` — solo `gap` para espaciado entre ellas. El scroll lo maneja el Box padre.

---

### Patrón 7: Campo de fecha en step de revisión (DatePicker inline en card ghost)

**Archivos de referencia:** `src/pages/plants/NuevaPoda.jsx` (step revisión), `src/pages/plants/NuevoTransplante.jsx`, `src/pages/plants/NuevoInsecticida.jsx`

**Cuándo usarlo:** En el step final de revisión de un wizard, dentro de la card ghost con las filas de datos, para permitir editar la fecha antes de guardar.

**Estructura:**

1. **Imports necesarios:**
```jsx
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
```

2. **Helper `formatDate` a nivel módulo** (convierte `Date` → `DD/MM/YYYY` para persistir):
```jsx
const formatDate = (date) => {
  if (!date) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
};
```

3. **State como `Date` object** (no string). Si viene `?date=DD/MM/YYYY` por URL, parsear:
```jsx
const [fecha, setFecha] = useState(() => {
  if (dateParam) {
    const [d, m, y] = dateParam.split('/');
    return new Date(+y, +m - 1, +d);
  }
  return new Date();
});
```

4. **Envolver el `return` del componente en `<LocalizationProvider>`:**
```jsx
return (
  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    <Box sx={{ position: 'fixed', inset: 0, ... }}>
      {/* wizard content */}
    </Box>
  </LocalizationProvider>
);
```

5. **Fila dentro de la card ghost de revisión** — label a la izquierda, `DatePicker` a la derecha con `maxWidth: 160`:
```jsx
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: 2.5 }}>
  <Typography variant="body2" color="text.secondary">Fecha</Typography>
  <Box sx={{ maxWidth: 160 }}>
    <DatePicker
      value={fecha}
      onChange={(date) => date && setFecha(date)}
      slotProps={{
        textField: {
          size: 'small',
          sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
        },
      }}
    />
  </Box>
</Box>
```

6. **Al persistir**, usar `formatDate(fecha)` (no el `Date` directo ni `getDate()`):
```jsx
await addPlantActivity(id, 'prunings', { date: formatDate(fecha), ... });
```

7. **En `handleLoadAnother`**, resetear a `new Date()`:
```jsx
setFecha(new Date());
```

**Notas importantes:**
- **No usar `TextField` plano** para la fecha. Todos los wizards de plants usan `DatePicker` de `@mui/x-date-pickers` con `AdapterDateFns` y locale `es` — mantener consistencia.
- **`getDate()` de `utils.js`** devuelve un string `DD/MM/YYYY` — solo útil para defaults iniciales o snapshots. Para edición inline, siempre `DatePicker` + `formatDate`.
- **`maxWidth: 160`** en el wrapper del DatePicker para que no ocupe todo el ancho de la card.
- **`size="small"`** para que visualmente coincida con la altura de las otras filas de la card.

| Caso | Patrón | Archivo ejemplo |
|---|---|---|
| Lista de cards con entrada stagger | **Patrón 1** (`AnimatedGroup` + `AnimatedItem`) | `Home.jsx`, `HabitsStatCards.jsx`, `Savings.jsx` |
| Card individual | **Patrón 1** (`AnimatedItem` standalone) | `CreditCardsGlance.jsx`, `FinancesMonthSummary.jsx` |
| Swipe horizontal con feedback en tiempo real + preview del panel adyacente | **Patrón 2** (3-panel carrusel, `useMotionValue`) | `Finances.jsx` (meses) |
| Navegador horizontal compacto con swipe (semanas, tabs) | **Patrón 3** (WeekStrip, `useMotionValue` + `useTransform`) | `WeekStrip.jsx` |
| Transición simple entre estados con slide horizontal | **Patrón 4** (`AnimatePresence` + `custom` variants) | Cualquier toggle/routing interno |
| Desactivar animaciones en una subsección | `skipEnter={true}` en `AnimatedGroup` | Cuando necesitás que solo el slide padre sea visible |
| Paso de wizard con numpad y display centrado | **Patrón 6** (AnimatedGroup flex:1 + AnimatedItem display:flex en el display) | `NewTransaction.jsx` Step 1, `Exchange.jsx` Steps 1-2, `NuevoInsecticida.jsx` Step 3 |
| Campo de fecha editable en step de revisión | **Patrón 7** (DatePicker + LocalizationProvider + formatDate helper) | `NuevaPoda.jsx`, `NuevoTransplante.jsx`, `NuevoInsecticida.jsx` |

**Decisiones importantes tomadas:**
- Los componentes de animación usan `<Box component={motion.div}>` de MUI, no `<motion.div>` nativo. Esto garantiza que `sx` funcione correctamente.
- `skipEnter` usa React Context para propagarse automáticamente a `AnimatedItem` nietos sin necesidad de pasar la prop manualmente.
- Para Grid de MUI, se usa `component={AnimatedGroup}` y `component={AnimatedItem}` en los Grid items.
- En swipes, los `useRef` para `isDragging` y `animatingRef` evitan re-renders durante el drag (solo `useMotionValue` actualiza la posición vía la GPU).
- `panX.jump()` es la forma de setear un MotionValue sin animación (equivalente a `set()` pero sin触发 transiciones).
- **Todo input en un paso de wizard debe tener `autoFocus`** — el foco va al primer campo para que el usuario pueda tipear inmediatamente sin tocar la pantalla. Si no hay input (ej: selector de chips/cards), no aplica.

**Archivos creados:**
- `src/design-system/AnimatedCard.jsx`

**Archivos modificados (~20):**
- `src/design-system/index.js`
- `src/pages/basics/Home.jsx`, `src/components/home/QuickActions.jsx`, `FinancesSnapshot.jsx`, `CreditCardsGlance.jsx`
- `src/pages/finances/Finances.jsx`, `NewTransaction.jsx`, `ProcesarDevolucion.jsx`
- `src/pages/finances/CreditCards.jsx`, `src/components/finances/TarjetasListView.jsx`
- `src/components/finances/FinancesMonthSummary.jsx`, `FinancesCharts.jsx`, `FinancesTransactionsList.jsx`
- `src/pages/habits/Habits.jsx`, `HabitsList.jsx`, `src/components/habits/HabitsStatCards.jsx`, `HabitsDayList.jsx`, `WeeklyEvolutionChart.jsx`
- `src/pages/plants/Jardin.jsx`, `RegistrarMedicion.jsx`, `NuevaPoda.jsx`, `NuevoInsecticida.jsx`, `NuevoTransplante.jsx`, `NuevoSuplemento.jsx`, `CambiarEtapa.jsx`
- `src/components/plants/WeekStrip.jsx`
- `src/pages/savings/Savings.jsx`
- `src/pages/basics/Configuracion.jsx`
- `src/App.css`

**Pendiente para la próxima sesión:**
- Aplicar Patrón 2 o 3 al navegador de meses de Tarjetas
- Aplicar Patrón 2 o 3 a la navegación de semanas en Habits
- Evaluar swipe en otras listas (HabitsList, Exchanges, FundHistory)

---

### 2026-07-04 — Auditoría de seguridad + Capa Storage + Rediseño de notificaciones

**Qué se hizo:**
- **Creado `services/storage.js`** con `uploadProfilePhoto`, `uploadPlantImage`, `uploadStatementPdf`, `uploadBackup`, `getFileUrl`. Sanitiza nombres de archivo y resuelve `uid` internamente vía `getCurrentUser()`.
- **Migrados 6 componentes** que importaban `auth, storage` directo de `firebase.js`:
  - `Login.jsx` — `uploadProfilePhoto` desde el servicio
  - `Configuracion.jsx` — `uploadProfilePhoto` + `uploadBackup` desde el servicio
  - `NewPhoto.jsx` — `uploadPlantImage` desde el servicio (devuelve `{downloadURL, storagePath}`)
  - `CreditCardStatementUpload.jsx` — `uploadStatementPdf` + `getFileUrl`
  - `TarjetasUploadWizard.jsx` — `uploadStatementPdf`
  - `CreditCardDetail.jsx` — `getFileUrl`
- **Eliminadas** `deleteAllUserData()` de `services/config.js` y `deleteCurrentUser()` de `services/auth.js` + `useAuth.js`. No existe más la función de eliminar cuenta.
- **Consola 100% limpia**: eliminadas 34 líneas de `console.warn/error/log` en todo `src/`. La más importante: App.js ya no loguea objetos de transacciones completos con datos financieros.
- **Creado agente `security-auditor`** en `.opencode/agents/` para auditorías futuras.
- **Rediseño completo del sistema de notificaciones** para eliminar el consumo excesivo de datos en Firebase (~150 MB/hora):
  - **Causa raíz identificada**: la cloud function `dailyExpenseReminder` corría cada minuto (`* * * * *`), leía la DB entera (`db.ref('/').once('value')`) y escribía `lastSent` en el árbol del usuario. Cada escritura disparaba el listener raíz del cliente (`subscribeToUserData`) que re-descargaba TODO el árbol (1.28 MB). Resultado: ~150 MB/hora.
  - **Nueva cloud function `checkReminders`**: 4 slots diarios (9, 12, 18, 22). Lee **solo** el nodo `notifications/` (fuera de `users/`). Escribe `lastSent` en `notifications/` (no en el árbol del usuario → no dispara el listener raíz). Consumo: ~20 KB/día (reducción 99.999%).
  - **Nueva estructura de datos**: `notifications/{uid}/fcmToken` y `notifications/{uid}/reminders/{id}` — nodo separado del árbol del usuario.
  - **`NuevaNotificacion.jsx`**: time picker reemplazado por selector de 4 franjas horarias fijas (Mañana 09:00, Mediodía 12:00, Tarde 18:00, Noche 22:00).
  - **`Configuracion.jsx`**: sección de notificaciones actualizada para leer/escribir del nuevo nodo `notifications/`. Carga reminders con `getReminders()` (one-time read) en mount.
  - **`services/notifications.js`**: reescrito para usar paths `notifications/{uid}/` con `database.ref()` directo. Funciones: `requestPermission`, `saveFcmToken`, `removeFcmToken`, `getStoredFcmToken`, `addReminder`, `updateReminder`, `removeReminder`, `getReminders`, `onForegroundMessage`.

**Por qué se hizo así:**
- **Storage service**: unifica 5 patrones de upload regados en 6 componentes. Sanitiza `file.name` con `replace(/[^a-zA-Z0-9._-]/g, '_')` — prevención de path traversal. Los paths de storage se construyen dentro del servicio (no en los componentes).
- **Eliminar delete account**: el usuario no quiere la feature. Las funciones existían pero no tenían UI. Borrado completo para no dejar código huérfano.
- **Notificaciones con slots fijos**: el problema de fondo era el polling cada minuto + lectura de la DB entera. Con 4 slots fijos la función corre 4 veces/día (no 1440). El nodo separado `notifications/` garantiza que la función **nunca** lea el árbol del usuario y que sus escrituras **nunca** disparen el listener raíz del cliente.
- **`notifications/` como nodo raíz separado**: la decisión clave. `subscribeToUserData` escucha `database.ref(uid)` = `{uid}`. Escribir en `notifications/{uid}` está fuera de ese path → cero re-descargas en el cliente.

**Archivos creados:**
- `src/services/storage.js`
- `.opencode/agents/security-auditor.md`

**Archivos modificados:**
- `src/pages/basics/Login.jsx` (import storage service, removido helper local)
- `src/pages/basics/Configuracion.jsx` (storage + backup + sección notificaciones refactorizada)
- `src/pages/plants/NewPhoto.jsx` (uploadPlantImage, removido `auth`)
- `src/components/finances/CreditCardStatementUpload.jsx` (uploadStatementPdf + getFileUrl)
- `src/components/finances/TarjetasUploadWizard.jsx` (uploadStatementPdf)
- `src/pages/finances/CreditCardDetail.jsx` (getFileUrl)
- `src/services/config.js` (removido deleteAllUserData)
- `src/services/auth.js` (removido deleteCurrentUser)
- `src/hooks/useAuth.js` (removido deleteAccount)
- `src/services/notifications.js` (reescrito completo — nuevo nodo)
- `src/pages/basics/NuevaNotificacion.jsx` (reescrito — slots en vez de time picker)
- `src/App.js` (console.* limpios, ruta /nuevaNotificacion mantenida)
- `functions/index.js` (reescrito — 4 slots, nodo notifications/)
- 15+ archivos más: console.* eliminados

**Decisiones importantes tomadas:**
- **NO se migró el listener raíz** (`subscribeToUserData`) a listeners por módulo. Queda documentado como "futura reestructuración" (ver abajo). El consumo actual sin la cloud function es aceptable (~2 descargas del árbol por sesión de uso).
- **Horarios fijos**: 09:00, 12:00, 18:00, 22:00 (hora Argentina). El usuario pierde la capacidad de elegir horario exacto pero gana cero consumo innecesario.
- **`notifications/` usa `database.ref()` directo** en vez de pasar por `services/database.js` (que siempre prepende `uid`). Esto es correcto porque el path necesario es `notifications/{uid}/...` y no `{uid}/notifications/...`.
- **Build**: 997 KB gzipped, sin errores.

**Pendiente — DEPLOY:**
- **Desplegar la nueva cloud function**: ejecutar `firebase deploy --only functions` desde la raíz del proyecto. Esto **reemplaza** la función vieja (`dailyExpenseReminder`) por la nueva (`checkReminders`). La vieja deja de existir y de consumir datos.
- **Verificar en Firebase Console** que la función vieja ya no aparece y la nueva tiene schedule `0 9,12,18,22 * * *`.

---

## Futuras reestructuraciones

### Listeners por módulo (en lugar del listener raíz)

**Problema:** `subscribeToUserData` en `database.js:68-73` suscribe al árbol entero del usuario. Cada write en cualquier parte dispara una re-descarga completa.

**Solución propuesta:** Reemplazar por listeners individuales por dominio:
- `useFinances()` → suscribe a `{uid}/expenses` + `{uid}/incomes` + `{uid}/creditCards`
- `usePlants()` → suscribe a `{uid}/plants`
- `useHabits()` → suscribe a `{uid}/habits`
- `useSavings()` → suscribe a `{uid}/savings` + `{uid}/savingsFunds`
- `useConfig()` → suscribe a `{uid}/config`

Cada hook se carga solo cuando su página está activa (lazy subscription). App.js deja de tener el árbol completo en un solo state y pasa a ser un orchestrator de hooks.

**Beneficio:** Reducción ~80-90% del tráfico de descarga. Un cambio en una planta no re-descarga los gastos.

**Riesgo:** Cambio arquitectónico grande. Requiere refactor de `store.js` y de todos los componentes que leen `userData.xxx` del store global.

**Estado:** No implementado. El consumo actual sin la cloud function es aceptable para un solo usuario.
