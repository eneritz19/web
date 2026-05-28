# EcoMove Simple V2

Versión simplificada del prototipo EcoMove.

La versión original estaba montada con React/Vite y muchas dependencias UI. Esta versión está pensada para que sea más fácil de entender, modificar y conectar con Matomo.

## Estructura

```text
src/main/java/com/ecomove/
├── EcoMoveApplication.java
├── controller/
│   ├── EcoMoveController.java
│   └── WebController.java
├── model/
│   ├── UserProfile.java
│   ├── Trip.java
│   ├── Reward.java
│   ├── Rider.java
│   ├── TransportLine.java
│   └── ...
└── service/
    └── EcoMoveService.java

src/main/resources/static/
├── index.html
├── css/styles.css
└── js/app.js
```

## Cómo ejecutarlo

Desde la carpeta del proyecto:

```powershell
mvn spring-boot:run
```

Luego abre:

```text
http://localhost:8080
```

También puedes abrirlo desde IntelliJ o VS Code ejecutando la clase:

```text
src/main/java/com/ecomove/EcoMoveApplication.java
```

## Pantallas incluidas

- Bienvenida
- Login
- Registro
- Hasiera / Dashboard
- Bidaia trakeatua
- Karpoola
- Garraioa
- Sariak
- Estatistikak
- Profila
- Enpresa panel

## Endpoints principales

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/profile
GET  /api/dashboard
GET  /api/trips
GET  /api/riders
GET  /api/transport-lines
GET  /api/rewards
GET  /api/rewards?category=Janaria
GET  /api/route/recommended
POST /api/tracking/start?mode=Autobusa
POST /api/tracking/stop
GET  /api/corporate
```

## Matomo

El punto para añadir Matomo está en:

```text
src/main/resources/static/index.html
```

Busca el bloque comentado `MATOMO` y sustituye:

```javascript
var u = "MATOMO_URL";
_paq.push(['setSiteId', 'SITE_ID']);
```

por tus datos reales de Matomo.

Además, en `app.js` ya hay funciones para registrar eventos:

```javascript
matomoPage('Nombre de página');
matomoEvent('Categoría', 'acción', 'nombre');
```

Ejemplos incluidos:

- Login
- Registro
- Inicio/fin de viaje
- Filtro de recompensas
- Exportar estadísticas
- Clicks en karpoola

## Nota

Los datos están simulados dentro de `EcoMoveService.java`. Más adelante puedes sustituirlos por una base de datos, por ejemplo con JPA/Hibernate y un repositorio.
