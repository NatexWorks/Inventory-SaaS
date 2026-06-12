"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "../components/productFetch";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      const products = await fetchProducts();

      const grouped = products.reduce((acc, product) => {
        const key = product.category || "Uncategorized";

        if (!acc[key]) {
          acc[key] = {
            name: key,
            description: product.description || "-",
            products: [],
          };
        }

        acc[key].products.push(product);
        return acc;
      }, {});

      setCategories(Object.values(grouped));
    }

    loadCategories();
  }, []);

  return (
    <main className="p-6">
      <h1>Categories</h1>

      <table className="w-1/2 border">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Description</th>
            <th>Products</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((item) => (
            <tr className="border mx-auto" key={item.name}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.products.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}