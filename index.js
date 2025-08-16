// Cargar variables de entorno
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

// Importar configuración de base de datos
const db = require('./config/database');

// Configurar middleware para servir archivos estáticos
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Rutas para las páginas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'main.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'dashboard.html'));
});

app.get('/sell', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'sell.html'));
});

app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'client.html'));
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'product.html'));
});

//Rutas API
const clientsRouter = require('./routes/clients');
app.use('/api/clients', clientsRouter);
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);
const sellsRouter = require('./routes/sells');
app.use('/api/sells', sellsRouter);
const sellItemsRouter = require('./routes/sellItems');
app.use('/api/sellItems', sellItemsRouter); 

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});