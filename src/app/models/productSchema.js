import mongoose from "mongoose";

const { Schema } = mongoose;

// Defines the shape of a product document in MongoDB
const inventorySchema = new Schema({
  name: String,
  price: Number,
  costPrice: Number,
  sku: String,
  stock: Number,
  category: String,
  description: String,
}, {
  timestamps: true
});
// Model name: Product
// Collection name: product

const Product = mongoose.models.Product || mongoose.model("Product", inventorySchema, "product");
export default Product;
