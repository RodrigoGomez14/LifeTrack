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
    finances/       # Componentes del módulo finanzas
    habits/         # Componentes del módulo hábitos
    icons/          # Iconos reutilizables
    layout/         # Componentes de estructura (navbar, sidebar, etc.)
    plants/         # Componentes del módulo plantas
  pages/
    basics/         # Página de datos básicos / perfil
    finances/       # Página de finanzas
    habits/         # Página de hábitos
    plants/         # Página de plantas
    savings/        # Página de ahorros
  utils/            # Carpeta — actualmente CÓDIGO MUERTO (ver nota abajo)
  App.js            # Componente raíz y rutas
  App.css           # Boilerplate CRA sin uso real (pendiente de limpiar)
  firebase.js       # Configuración de Firebase — NO TOCAR sin consultar
  store.js          # Estado global con Zustand
  utils.js          # Utilidades globales — éste es el que se usa
```

> **Nota sobre `utils`:** existen `src/utils.js` (archivo) y `src/utils/` (carpeta).
> Webpack resuelve `from '../../utils'` al **archivo** `utils.js`, así que la carpeta
> `utils/` queda inalcanzable y es código muerto. Además, `utils/index.js` re-exporta
> nombres que no están importados → si alguna vez se llega a resolver el directorio,
> revienta. **Mientras no se decida unificar, agregar utilidades nuevas a `utils.js`.**

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

## Estado de Módulos

| Módulo   | Completitud | Notas                                                              |
|----------|-------------|--------------------------------------------------------------------|
| Finances | ~75%        | CRUD + tarjetas + devoluciones. Carga de PDFs aún no implementada  |
| Plants   | ~50%        | Más avanzado de lo que decía. Faltan pH/EC/PPM (feature núcleo)    |
| Habits   | ~60%        | CRUD + calendario + stats. Hay duplicación de `HabitDetail`        |
| Savings  | ~70%        | Fondos múltiples ARS/USD + historial. Lógica duplicada con Finances|
| Basics   | ~70%        | Login, Home dashboard, Configuración (8 paletas), Perfil, Ayuda    |

---

## Módulo Plants — Contexto Importante

Es el corazón de la app. Debe permitir:
- Registro de múltiples cultivos hidropónicos ✅
- Mediciones diarias por cultivo: pH, EC, PPM ❌ **NO IMPLEMENTADO** — feature núcleo faltante
- Carga de fotos para comparación visual entre fechas ✅
- Calendario de actividades por cultivo ✅
- (Otras funciones a definir durante el desarrollo)

**Estado real (~50%):** lo que hay es CRUD de plantas, riegos, podas, transplantes,
insecticidas, fotos, logs, aditivos, peso húmedo/seco, calendario y timeline.
**Lo que falta y bloquea el módulo:** captura de pH/EC/PPM. `NewIrrigation.jsx` solo
guarda `quantity`, `aditives`, `notes`, `date` — no hay campos para las mediciones.

Antes de implementar pH/EC/PPM, diseñar la estructura del nodo en Firebase
con `/plan` y esperar aprobación. Esto define el resto de la feature.

---

## Deuda Técnica Conocida

Bugs y problemas detectados en la auditoría del 2026-05-07. Si tocás un archivo
afectado, considerá arreglar el bug en la misma pasada. No hace falta resolverlos
todos a la vez, pero **no introducir código nuevo encima de estos bugs sin avisar**.

1. **`getMonthlySummary` no existe.** Importado en `src/pages/finances/CreditCards.jsx:47`,
   pero nunca exportado desde `utils.js`. Crashea cuando se invoca.

2. **`ColorModeContext` no existe.** Importado en `src/App.js:36` desde `'./utils'`,
   pero no está exportado. No rompe solo porque no se usa más adelante.

3. **`src/utils/index.js` re-exporta sin importar.** Líneas `export { checkSearch, formatAmount, ... }`
   sin los `import` correspondientes. El directorio `utils/` está fuera del path de
   resolución (gana `utils.js`), así que es código muerto. Eliminar o unificar.

4. **`src/App.test.js` busca "learn react"** que no existe en la app → `npm test` falla.
   Reescribir o borrar.

5. **`src/components/layout/Sidebar.jsx` está incompleto.** Tiene un literal
   `{/* ... existing code ... */}` en producción y usa `window.location` en vez de
   `useLocation()`. No parece estar enrutado en `App.js` — candidato a borrar.

6. **`src/components/layout/AppBar.jsx` muestra USD hardcodeado** (`{ buy: 1250, sell: 1300 }`)
   con un `useEffect` vacío y comentario "// En un caso real…". Debe leer `dollarRate`
   del store, que ya se trae de `dolarapi.com` desde `App.js`.

7. **Doble `HabitDetail`.** Existe en `src/pages/habits/HabitDetail.jsx` y
   `src/components/habits/HabitDetail.jsx`. La ruta `/DetalleHabito/:habitId`
   apunta al de `components/`, que recibe props en vez de leer `useParams` →
   posible bug de prop drilling. Decidir cuál es el canónico.

8. **`filterData` en `src/App.js` asume estructura completa.** Si `data.plants`
   existe pero `data.plants.aditives` no, hace `Object.keys(undefined)` y crashea
   (líneas ~199–207). Falta defensa contra estructuras parciales.

9. **`auth.onAuthStateChanged` no limpia el listener de RTDB.** En `App.js`,
   `database.ref(user.uid).on('value', …)` nunca llama a `.off()`. Si el usuario
   cambia de cuenta o reinicia auth, los listeners se acumulan → memoria + datos
   pisándose. El `unsubscribe` actual solo desuscribe el authStateChanged.

### Otros problemas no-bug pero de fondo

- **Lógica de Firebase regada en componentes** (320 ocurrencias en 46 archivos).
  Viola la regla "No escribir lógica de Firebase directamente en componentes".
  Pendiente: capa `src/services/{plants,finances,habits,savings,auth}.js`.
- **Componentes monstruo:** `Plant.jsx` 3.979 líneas, `Finances.jsx` 3.951,
  `Home.jsx` 3.264, `Habits.jsx` 2.512, `Configuracion.jsx` 2.534, `NewHabit.jsx` 1.425.
- **3 librerías de fechas conviven:** `moment` + `date-fns` + `dayjs`.
- **Dependencias instaladas y nunca usadas:** `redux`, `react-redux`, `styled-components`,
  `styled-jsx`, `react-pdf`, `@react-pdf/renderer`, `react-helmet`, `react-beautiful-dnd`,
  `react-grid-layout`, `@dnd-kit/*`, `recharts`.
- **Archivos de respaldo en árbol vivo:** `Plant_backup.jsx`, `Plant_backup_weights.jsx`,
  `Plant_temp.jsx`, `Plant_temp_edit.jsx`, `CreditCards.temp.jsx`, `CreditCards.jsx.bak`,
  `CreditCards.jsx.backup`, `backup/Finances.jsx.bak`, `NewCreditCard.jsx`, `newphoto.txt`
  (UTF-16 en raíz). ~20.000 líneas de ruido.
- **`NewPhoto.jsx` con variables globales mutables** (`IS_UPLOADING`, `UPLOAD_PROGRESS`)
  y montaje manual de Dialog vía `document.createElement` — anti-React.
- **Reglas de Firebase no commiteadas.** No hay `database.rules.json` ni `storage.rules`
  en el repo. Confirmar en consola que no estén abiertas.

---

## Reglas para Claude Code

- Este es un proyecto **personal** — priorizá simplicidad sobre over-engineering
- Si hay varias formas de hacer algo, elegí la más **legible y mantenible**
- Antes de cambios grandes, mostrame el plan con `/plan` y esperá mi aprobación
- No modificar `firebase.js` sin pedirme confirmación explícita
- No instalar dependencias nuevas sin consultarme
- No generar tests automáticamente a menos que lo pida
- El objetivo es que yo entienda todo el código generado — explicá los cambios importantes

---

## Testing

- Existe `App.test.js` y `setupTests.js` de Create React App (Jest + React Testing Library)
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

### [Fecha] — [Módulo trabajado]
**Qué se hizo:**
-

**Por qué se hizo así:**
-

**Archivos modificados:**
-

**Decisiones importantes tomadas:**
-

**Pendiente para la próxima sesión:**
-
