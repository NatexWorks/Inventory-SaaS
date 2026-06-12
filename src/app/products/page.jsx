"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "../components/productFetch";
import { EditButton, DeleteButton } from "../components/button";
import { useRouter } from "next/navigation";
export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
   // edit and delete buttons
const handleDelete = async (delId) => {
    try {
      const response = await fetch(`/api/product/${delId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the deleted product from the state
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== delId)
        );
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

useEffect(() => {
  async function loadProducts() {
    const data = await fetchProducts();
    setProducts(data);
  }

  loadProducts();
}, []);
 

  return (
    <div className="p-4">
      <h1>Products</h1>

      <table className="w-1/2 border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Cost Price</th>
            <th>Category</th>
            <th>SKU</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.stock}</td>
              <td>₹{p.costPrice}</td>
              <td>{p.category}</td>
              <td>{p.sku}</td>
              <td className="flex gap-2 mt-2" >
                <EditButton  productId={p._id} onclick={() => router.push(`/addProducts?id=${p._id}`)} />
                <DeleteButton onclick={() => handleDelete(p._id)} productId={p._id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
