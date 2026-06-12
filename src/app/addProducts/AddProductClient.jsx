"use client";

import { useState, useEffect } from "react";
import ProductForm from "../components/productForm";

export default function AddProductClient({ id }) {
  const [image, setImage] = useState(null);
  const [Form, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    costPrice: "",
    category: "",
    sku: "",
    description: "",
  });

  // handleChange function to update form state on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handles the form submit event and collects values from the inputs
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Build a plain object so it can be sent as JSON to the API
    const data = {
      name: formData.get("name"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      costPrice: formData.get("costPrice"),
      category: formData.get("category"),
      sku: formData.get("sku"),
      description: formData.get("description"),
    };
    //  formData.append("image", image);
    console.log(data);
    // Send the product data to the backend API

    setFormData({
      name: "",
      price: "",
      stock: "",
      costPrice: "",
      category: "",
      sku: "",
      description: "",
    });
    await createProducts(data);
  };

  // Calls the API route that stores a new product in MongoDB
  async function createProducts(data) {
    try {
      if (id) {
        await fetch(`/api/product/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  // edit
  useEffect(() => {
    async function loadProduct() {
      if (!id) return;

      const res = await fetch(`/api/product/${id}`);
      const data = await res.json();
      console.log("Fetched product data:", data);
      console.log("Setting form data with:", data.product);
      setFormData(data.product);
    }

    loadProduct();
  }, [id]);

  return (
    <div className="container">
      <ProductForm
        formData={Form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        change={id ? "Edit Product" : "Add Product"}
      />
    </div>
  );
}
