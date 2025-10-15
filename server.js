require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONT_ORIGIN || "http://localhost:4200" }));

// Conexión a Mongo
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

mongoose
  .connect(mongoUri, { dbName })
  .then(() => {
    console.log("✅ Conectado a MongoDB");
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MongoDB:", err);
  });

// Modelo de products
const ProductSchema = new mongoose.Schema({
  name: { type: String },
  category: { type: String },
  stock: { type: Number },
});
const Product = mongoose.model("Product", ProductSchema, collectionName);

// Endpoint para recuperar todos los productos
app.get("/api/products", async (req, res) => {
  try {
    // Obtener todos los productos
    let products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Endpoint para añadir un nuevo producto
app.post("/api/product", async (req, res) => {
  try {
    let { name, category, stock } = req.body;
    if (stock !== undefined) stock = Number(stock);

    // Nuevo producto
    let product = await Product.create({ name, category, stock });
    res.status(201).json({ message: "Producto guardado correctamente", product });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Endpoint para editar un producto
app.put("/api/product/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let { name, category, stock } = req.body;
    if (stock !== undefined) stock = Number(stock);

    // Actualizar producto
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { name, category, stock } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.status(200).json({ message: "Producto actualizado correctamente", product });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Endpoint para eliminar un producto
app.delete("/api/product/:id", async (req, res) => {
  try {
    let { id } = req.params;

    // Eliminar producto
    let product = await Product.findByIdAndDelete(id);
    
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.status(200).json({ message: "Producto eliminado correctamente", product });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Arrancamos el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
