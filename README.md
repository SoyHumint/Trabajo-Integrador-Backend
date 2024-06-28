# express-session

`express-session` es un middleware de gestión de sesiones para aplicaciones Express. Permite crear y gestionar sesiones de usuario de manera fácil y segura.

## Instalación

Para instalar `express-session`, usa npm o yarn:

```bash
npm install express-session
```

## Uso Básico

Para usar `express-session` en una aplicación Express, debes configurarlo como middleware:

```javascript
const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
  secret: 'your-secret-key',  // Clave secreta para firmar la cookie de la sesión
  resave: false,  // No guarda la sesión si no ha sido modificada
  saveUninitialized: false,  // No guarda una sesión nueva no inicializada
  cookie: { secure: false }  // La cookie solo se envía a través de HTTPS si está en true
}));

app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send(`Has visitado esta página ${req.session.views} veces`);
  } else {
    req.session.views = 1;
    res.send('Bienvenido por primera vez a esta página!');
  }
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
```

## Configuración de Opciones

### secret
`secret` es una cadena que se usa para firmar la cookie de la sesión. Es obligatorio.

### resave
`resave` es una opción que indica si la sesión debe guardarse de nuevo en el store, incluso si no ha sido modificada. 
- `false` (recomendado): La sesión no se guarda si no ha sido modificada.
- `true`: La sesión se guarda en cada solicitud.

### saveUninitialized
`saveUninitialized` es una opción que indica si una sesión nueva no inicializada debe ser guardada en el store.
- `false` (recomendado): No guarda una sesión que no ha sido inicializada.
- `true`: Guarda la sesión aunque no haya sido inicializada.

### cookie
`cookie` es una opción que permite configurar las propiedades de la cookie de la sesión. 

#### Opciones de cookie
- `secure`: Indica si la cookie solo debe ser enviada a través de HTTPS. `false` por defecto.
- `maxAge`: Establece el tiempo de vida de la cookie en milisegundos.
- `httpOnly`: Indica si la cookie solo es accesible a través del protocolo HTTP(S), no disponible a través de JavaScript. `true` por defecto.

Ejemplo de configuración de cookie:

```javascript
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 60000,  // La cookie expira en 1 minuto
    httpOnly: true
  }
}));
```

## Almacenes de Sesión (Session Stores)

Por defecto, `express-session` usa el almacén en memoria (`MemoryStore`), que no es adecuado para producción debido a su falta de escalabilidad y persistencia.

Para producción, se recomienda usar un almacén de sesión persistente como Redis, MongoDB, MySQL, etc.

Ejemplo con connect-redis:

```bash
npm install connect-redis redis
```

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const client = redis.createClient();

app.use(session({
  store: new RedisStore({ client: client }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
```

## Métodos de Sesión

### req.session
El objeto `req.session` contiene los datos de la sesión. Puedes leer y escribir en este objeto.

```javascript
app.get('/set', (req, res) => {
  req.session.username = 'JohnDoe';
  res.send('Nombre de usuario guardado en la sesión');
});

app.get('/get', (req, res) => {
  if (req.session.username) {
    res.send(`Nombre de usuario: ${req.session.username}`);
  } else {
    res.send('No hay nombre de usuario en la sesión');
  }
});
```

### req.session.destroy(callback)
El método `req.session.destroy()` destruye la sesión y elimina la cookie.

```javascript
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error al cerrar la sesión');
    }
    res.send('Sesión cerrada exitosamente');
  });
});
```

### req.session.regenerate(callback)
El método `req.session.regenerate()` crea una nueva sesión, preservando los datos de la anterior si es necesario.

```javascript
app.get('/regenerate', (req, res) => {
  req.session.regenerate(err => {
    if (err) {
      return res.status(500).send('Error al regenerar la sesión');
    }
    res.send('Sesión regenerada exitosamente');
  });
});
```

## Seguridad

### Claves Secretas
Usa una clave secreta fuerte y cámbiala periódicamente para mejorar la seguridad.

### secure Cookies
Configura `secure: true` para enviar cookies solo a través de HTTPS en producción.

### httpOnly Cookies
Mantén `httpOnly: true` para prevenir ataques XSS.

### maxAge
Establece un `maxAge` apropiado para limitar la duración de las sesiones.

### Almacenes de Sesión
Usa almacenes de sesión confiables y seguros en producción.

## Ejemplo Completo

```javascript
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const client = redis.createClient();

const app = express();

app.use(session({
  store: new RedisStore({ client: client }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60000,
    httpOnly: true
  }
}));

app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send(`Has visitado esta página ${req.session.views} veces`);
  } else {
    req.session.views = 1;
    res.send('Bienvenido por primera vez a esta página!');
  }
});

app.get('/set', (req, res) => {
  req.session.username = 'JohnDoe';
  res.send('Nombre de usuario guardado en la sesión');
});

app.get('/get', (req, res) => {
  if (req.session.username) {
    res.send(`Nombre de usuario: ${req.session.username}`);
  } else {
    res.send('No hay nombre de usuario en la sesión');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error al cerrar la sesión');
    }
    res.send('Sesión cerrada exitosamente');
  });
});

app.get('/regenerate', (req, res) => {
  req.session.regenerate(err => {
    if (err) {
      return res.status(500).send('Error al regenerar la sesión');
    }
    res.send('Sesión regenerada exitosamente');
  });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
```

## Recursos Adicionales

- [Documentación oficial de express-session](https://www.npmjs.com/package/express-session)
- [Guía de seguridad de OWASP para sesiones](https://owasp.org/www-project-secure-headers/)


# method-override

`method-override` es un middleware para Express que permite usar otros métodos HTTP en lugares donde el cliente no los soporta. Esto es particularmente útil para soportar métodos PUT y DELETE en formularios HTML, ya que estos solo permiten GET y POST.

## Instalación

Para instalar `method-override`, usando npm 

```bash
npm install method-override
```
## Uso Básico

Para usar `method-override` en una aplicación Express, debes configurarlo como middleware:

```javascript
const express = require('express');
const methodOverride = require('method-override');

const app = express();

// Override con query parameter
app.use(methodOverride('_method'));

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
```

### Query Parameter Override

Para usar un parámetro de consulta para indicar el método HTTP:

```javascript
app.use(methodOverride('_method'));
```

Luego, puedes enviar solicitudes con el parámetro `_method` en la URL:

```http
POST /resource?_method=DELETE HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

data=example
```

## Ejemplo Completo

Aquí hay un ejemplo completo de una aplicación Express que utiliza `method-override` para soportar métodos PUT y DELETE en formularios HTML:

```javascript
const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const app = express();

// Configurar body-parser para manejar formularios
app.use(bodyParser.urlencoded({ extended: true }));

// Override con query parameter
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send(`
    <form action="/resource?_method=PUT" method="POST">
      <button type="submit">Enviar PUT</button>
    </form>
    <form action="/resource?_method=DELETE" method="POST">
      <button type="submit">Enviar DELETE</button>
    </form>
  `);
});

app.put('/resource', (req, res) => {
  res.send('Se recibió una solicitud PUT');
});

app.delete('/resource', (req, res) => {
  res.send('Se recibió una solicitud DELETE');
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
```

## Recursos Adicionales

- [Documentación oficial de method-override](https://www.npmjs.com/package/method-override)
