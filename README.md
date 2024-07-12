# Proyecto Integrador: CRUD con Node.js y MongoDB Julio 2024

## Descripción del Proyecto

En este proyecto, desarrollarás una aplicación basada en Node.js y MongoDB que permita realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en una base de datos. La base de datos MongoDB deberá estar generada en el clúster de mongodb.com y tu aplicación Node.js se conectará a ella.

Podrás usar alguno de los datasets JSON proporcionados, o crear uno propio que contenga entre 20 y 30 productos, distribuidos en varias categorías. [Use el Supermercado.json]

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

- Node.js y npm (Node Package Manager)
- MongoDB instalado y en ejecución en tu máquina local o una URI de MongoDB en la nube

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/SoyHumint/Trabajo-Integrador-Backend.git
   cd nombre_del_directorio
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configuración de la base de datos:**

   - Crea una base de datos en MongoDB.
   - Configura la URI de MongoDB en el archivo `database.js`.
   - En este caso usare el json de supermercado.json.

## Ejecución

Para ejecutar la aplicación localmente, utiliza el siguiente comando:

```bash
npm start
```

Esto iniciará el servidor Express en el puerto especificado (por defecto, el puerto 3000).

## Endpoints

### GET /api/products

Devuelve todos los productos.

### GET /api/products/:id

Devuelve un producto por su ID.


```json
{
  "codigo": 1,
  "nombre": "Producto Ejemplo",
  "precio": 99.99,
  "categorias": ["Categoria1", "Categoria2"]
}
```

### PUT /api/products/:id

Actualiza un producto existente.

### PATCH /api/products/:id/precio

Actualiza el precio de un producto.

```json
{
  "precio": 109.99
}
```

### DELETE /api/products/:id

Elimina un producto por su ID.

### GET /api/products/search?nombre={nombre}

Filtra productos por nombre, utiliza params.

## Autor
   - Kevin Rodriguez. (https://github.com/SoyHumint)
## Profesores
   - [FabioDrizZt](https://github.com/FabioDrizZt)
   - [JuanNebbia](https://github.com/JuanNebbia)
   - [NKrein](https://github.com/NKrein)
   - [mathiasbarbosa](https://github.com/mathiasbarbosa)

## Conclusión

Este proyecto te permitirá aplicar tus conocimientos en desarrollo backend con Node.js y MongoDB, implementando un CRUD completo con control de errores y buenas prácticas. ¡Buena suerte y adelante con el desarrollo!

---

Recuerda mantener tu código limpio, documentado y seguir las buenas prácticas de desarrollo. ¡Nos vemos en clase para revisar tu progreso el 11 de julio de 2024!