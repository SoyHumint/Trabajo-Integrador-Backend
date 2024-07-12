require("dotenv").config();
const express = require("express");
const { connectToMongoDB, disconnectFromMongoDB } = require("./src/database.js");
const session = require("express-session");
const methodOverride = require("method-override"); // Permite PUT, PATCH y DELETE
const morgan = require("morgan");
const bodyParser = require("body-parser");
// const products = require("./json/supermercado.json"); // Importar JSON, use este json en mongoDB.

const app = express();
const port = process.env.PORT;

// Midleware
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.json()); // Para manejar cuerpos de solicitudes JSON
app.use(express.urlencoded({ extended: true })); // Para manejar cuerpos de solicitudes URL-encoded

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60000,
      httpOnly: true,
    },
  })
);


// Simulamos nuestra BD en memoria
const users = [];

// Función para proteger rutas
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.render("login");
  }
  next();
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  // Guardarlo en la BD
  users.push({ username, password });
  res.render("login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Buscamos si se encuentra en la Base de Datos
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (user) {
    req.session.user = user;
    const client = await connectToMongoDB();
    if (!client) {
      return res.status(500).send("Error al conectar con MongoDB");
    }
    try {
      const db = client.db('Ecomerce');
      const productos = await db.collection('productos').find().toArray();
      res.render("products", { products: productos });
    }
    catch (error) {
      res.status(500).send("Error al obtener la coleccion del MongoDB. (productos)");
    }

  } else {
    res.render("login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Usuario deslogueado");
});

app.get("/products", isAuthenticated, async (req, res) => {
  // Traemos los productos de la BD
  // res.render("products", { products });
  const client = await connectToMongoDB();
  if (!client) {
    return res.status(500).send("Error al conectar con MongoDB");
  }
  try {
    const db = client.db('Ecomerce');
    const productos = await db.collection('productos').find().toArray();
    res.render("products", { products: productos });
  }
  catch (error) {
    res.status(500).send("Error al obtener la coleccion del MongoDB (productos)");
  }
  finally {

    await disconnectFromMongoDB(client);
  }
});

app.get("/products/:id", isAuthenticated, async (req, res) => {
  // const product = products.find((product) => product.id == req.params.id);
  // res.render("product", { product });

  const client = await connectToMongoDB();
  if (!client) {
    return res.status(500).send("Error al conectar con MongoDB");
  }
  try {
    //viene como string y hacemos un parseInt para que se convierta en un entero o por defecto ponemos 1.
    const productId = parseInt(req.params.id) || 1;
    const db = client.db('Ecomerce');
    const producto = await db.collection('productos').findOne({ id: productId });
    if (producto) res.render("product", { product: producto });
    else res.status(404).send(`No se encontro el producto ${productId}`);
  }
  catch (error) {
    res.status(500).send("Error al obtener el producto de la coleccion (productos)");
  }
  finally {
    disconnectFromMongoDB(client);
  }

});

// app.get("/products/add", isAuthenticated, (req, res) => {
//   return res.render("addProduct");
// });

app.get("/products/add", isAuthenticated, async (req, res) => {
  const client = await connectToMongoDB();
  if (!client) {
    return res.status(500).send("Error al conectar con MongoDB");
  }
  try {
    res.render("addProduct");
  } catch (error) {
    res.status(500).send("Error al cargar (addProduct)");
  } finally {
    disconnectFromMongoDB(client);
  }
});

// app.get("/products/edit/:id", isAuthenticated, (req, res) => {
//   const product = products.find((p) => p.id == req.params.id);
//   res.render("editProduct", { product });
// });

app.get("/products/edit/:id", isAuthenticated, async (req, res) => {
  const client = await connectToMongoDB();
  if (!client) {
    return res.status(500).send("Error al conectar con MongoDB");
  }
  try {
    // Convierte el id de la ruta a un entero
    const productId = parseInt(req.params.id);
    const db = client.db('Ecomerce');
    const product = await db.collection('productos').findOne({ id: productId });

    if (product) {
      res.render("editProduct", { product: product });
    } else {
      res.status(404).send(`No se encontró el producto con id: ${productId}`);
    }
  } catch (error) {
    res.status(500).send("Error al obtener el producto de la colección (productos)");
  } finally {
    disconnectFromMongoDB(client);
  }
});

// app.post("/products/", isAuthenticated, (req, res) => {
//   const { codigo, nombre, precio, categoria } = req.body;
//   products.push({
//     id: products.length + 1,
//     codigo,
//     nombre,
//     precio,
//     categoria,
//   });
//   res.render("products", { products });
// });

app.post("/products/add", isAuthenticated, async (req, res) => {
  const { codigo, nombre, precio, categoria } = req.body;

  const client = await connectToMongoDB();
  if (!client) {
    return res.status(500).send("Error al conectar con MongoDB");
  }
  try {
    const db = client.db('Ecomerce');
    const newProduct = {
      id: products.length + 10,
      codigo,
      nombre,
      precio,
      categoria,
    };
    await db.collection('productos').insertOne(newProduct);
    res.redirect("/products");
  } catch (error) {
    res.status(500).send("Error al agregar el nuevo producto dentro de la colección (productos)");
  } finally {
    disconnectFromMongoDB(client);
  }
});

// app.patch("/products/:id", isAuthenticated, (req, res) => {
//   const { id, codigo, nombre, precio, categoria } = req.body;
//   const productIndex = products.findIndex((p) => p.id == req.params.id);
//   products[productIndex] = {
//     id: req.params.id,
//     codigo,
//     nombre,
//     precio,
//     categoria,
//   };
//   res.render("products", { products });
// });

app.patch("/products/:id", isAuthenticated, async (req, res) => {
  const productId = parseInt(req.params.id);
  const { codigo, nombre, precio, categoria } = req.body;

  const client = await connectToMongoDB();
  if (!client) {
    return res.status(500).send("Error al conectar con MongoDB");
  }
  try {
    const db = client.db('Ecomerce');
    const result = await db.collection('productos').updateOne(
      { id: productId },
      {
        $set: {
          codigo,
          nombre,
          precio,
          categoria,
        },
      }
    );

    if (result.matchedCount === 1) {
      const products = await db.collection('productos').find().toArray(); // Obtener la lista actualizada de productos
      res.render("products", { products });
    } else {
      res.status(404).send(`No se encontro el producto con id: ${productId}`);
    }
  } catch (error) {
    res.status(500).send("Error al actualizar el producto en la colección (productos)");
  } finally {
    disconnectFromMongoDB(client);
  }
});

// app.delete("/products/:id", isAuthenticated, (req, res) => {
//   const productIndex = products.findIndex((p) => p.id == req.params.id);
//   products.splice(productIndex, 1);
//   res.render("products", { products });
// });

app.delete("/products/:id", isAuthenticated, async (req, res) => {
  const productId = parseInt(req.params.id);

  const client = await connectToMongoDB();
  if (!client) {
    return res.status(500).send("Error al conectar con MongoDB");
  }

  try {
    const db = client.db('Ecomerce');
    const result = await db.collection('productos').deleteOne({ id: productId });

    if (result.deletedCount === 1) {
      const products = await db.collection('productos').find().toArray(); // actualizamos la lista de productos
      res.render("products", { products });
    } else {
      res.status(404).send(`No se encontró el producto con id ${productId}`);
    }
  } catch (error) {
    res.status(500).send("Error al eliminar el producto de la colección (productos)");
  } finally {
    disconnectFromMongoDB(client);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});