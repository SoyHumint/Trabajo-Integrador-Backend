const express = require('express')
const session = require('express-session')
const methodOverride = require('method-override') // Permite PUT, PATCH y DELETE
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

// Midleware
app.set('view engine', 'ejs')
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60000, // expira en 1min
      httpOnly: true,
    },
  })
)

// Simulamos nuestra BD en memoria
const users = []
const products = [
  {
    id: 12,
    name: 'articulo 1',
    price: 111,
    description: 'Un lindo articulo',
    stock: 1,
  },
  {
    id: 11,
    name: 'articulo 2',
    price: 222,
    description: 'Un lindo articulo',
    stock: 2,
  },
]

//Funcion para proteger rutas
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('login')
  }
  next()
}

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', (req, res) => {
  const { username, password } = req.body
  // Guardarlo en la BD
  users.push({ username, password })
  res.render('login')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  // Buscamos si se encuentra en la BD
  const user = users.find(
    (user) => user.username === username && user.password === password
  )
  if (user) {
    req.session.user = user
    res.render('products', { products })
  } else {
    res.render('login')
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.send('Usuario deslogueado')
})

app.get('/products', isAuthenticated, (req, res) => {
  // traemos los productos de la BD
  res.render('products', { products })
})

app.get('/products/add', isAuthenticated, (req, res) => {
  return res.render('addProduct')
})

app.get('/products/:id', isAuthenticated, (req, res) => {
  // buscamos en la BD el producto
  const product = products.find((product) => product.id == req.params.id)
  res.render('product', { product })
})

app.get('/products/edit/:id', isAuthenticated, (req, res) => {
  const product = products.find((p) => p.id == req.params.id)
  res.render('editProduct', { product })
})

app.post('/products/', isAuthenticated, (req, res) => {
  console.log('asd')
  const { name, price, description, stock } = req.body
  products.push({ id: products.length + 1, name, price, description, stock })
  res.render('products', { products })
})

app.patch('/products/:id', isAuthenticated, (req, res) => {
  const { name, price, description, stock } = req.body
  const productIndex = products.findIndex((p) => p.id == req.params.id)
  products[productIndex] = {
    id: req.params.id,
    name,
    price,
    description,
    stock,
  }
  res.render('products', { products })
})

app.delete('/products/:id', isAuthenticated, (req, res) => {
  const productIndex = products.findIndex((p) => p.id == req.params.id)
  products.splice(productIndex, 1)
  res.render('products', { products })
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})
