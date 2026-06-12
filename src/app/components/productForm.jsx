// components/productForm.jsx
"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
export default function ProductForm({ formData, handleChange, handleSubmit,change }) {
  const [image, setImage] = useState(null);

  const categories = [
    // {
    //   name: "Select Category",
    //   description: "Please select a category for the product."
    // },
    {
      name: "Electronics",
      description: "Devices, gadgets, accessories, and electronic equipment."
    },
  {
    name: "Fashion",
    description: "Clothing, footwear, accessories, and fashion products."
  },
  {
    name: "Home & Kitchen",
    description: "Kitchen appliances, cookware, and home essentials."
  },
  {
    name: "Beauty & Personal Care",
    description: "Skincare, cosmetics, grooming, and personal care products."
  },
  {
    name: "Sports & Fitness",
    description: "Sports equipment, fitness gear, and workout accessories."
  },
  {
    name: "Toys & Games",
    description: "Toys, puzzles, board games, and entertainment products."
  },
  {
    name: "Automotive",
    description: "Vehicle accessories, tools, and automotive products."
  },
  {
    name: "Books",
    description: "Educational, fiction, non-fiction, and reference books."
  },
  {
    name: "Health & Household",
    description: "Healthcare, wellness, and household utility products."
  },
  {
    name: "Grocery & Gourmet Food",
    description: "Food items, beverages, and gourmet grocery products."
  },
  {
    name: "Office & Stationery",
    description: "Office supplies, stationery, and productivity tools."
  },
  {
    name: "Furniture",
    description: "Home and office furniture for comfort and organization."
  },
  {
    name: "Jewelry & Watches",
    description: "Jewelry, watches, and fashion accessories."
  },
  {
    name: "Garden & Outdoor",
    description: "Gardening tools, outdoor equipment, and plants."
  },
  {
    name: "Pets & Veterinary Care",
    description: "Pet food, accessories, and veterinary care products."
  }
];
  return (
  <>
    
    <div className="container">
      <h1 className="text-3xl font-bold underline bg-amber-200 border-r-2n border-fuchsia-200 flex justify-start items-center mt-3 mb-4">{change}</h1>
      {/* form border and container */}
      <div className="form-container border-2 mx-auto border-black  h-auto w-auto md:w-1/2 p-4">
        <div className="font-bold text-[20px] mx-auto mt-2 mb-3">product Information</div>
        <form className="flex flex-col gap-2 items-center flex-wrap" action="" method="post" onSubmit={handleSubmit}>
          {/* Basic form for collecting product details */}
          <div className="flex flex-row flex-wrap gap-4 mx-4 justify-between mb-3.5">
            {/* product name */}
            <div>
              <label className="block " htmlFor="name">Product Name <span className="text-red-600 text-2xl">*</span></label>
              <input className="product-description w-3xs border-2 border-black  " onChange={handleChange} type="text" value={formData.name} name="name" id="name" placeholder="Product Name" required />

            </div>
          {/* <label>Category</label> */}
          <div>
            <label className="block " htmlFor="category">Category <span className="text-red-600 text-2xl">*</span></label>
          <select className="product-description w-3xs" id="category" onChange={handleChange} value={formData.category}  name="category" placeholder="Category" required>
           { categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))
}
          </select>
          </div>
          {/* product price */}
          <div>
            <label className="block " htmlFor="price">Product Price <span className="text-red-600 text-2xl">*</span></label>
            <input className="product-description w-3xs border-2 border-black " onChange={handleChange} type="number" value={formData.price} name="price" placeholder="Product Price" required />
          </div>
          {/* cost price */}
          <div>
            <label className="block " htmlFor="cost-price">Cost Price</label>
          <input className="product-description w-3xs border-2 border-black " onChange={handleChange} type="number" value={formData.costPrice} name="costPrice" id="costPrice" placeholder="Cost Price(Optional)" />
          </div>
          {/* product stock */}
          <div>
            <label className="block " htmlFor="stock">Product Stock <span className="text-red-600 text-2xl">*</span></label>
          <input className="product-description w-3xs border-2 border-black " onChange={handleChange} type="number" value={formData.stock} name="stock" id="stock" placeholder="Product Stock" required />
          </div>
          {/* product SKU */}
          <div>
            <label className="block " htmlFor="sku">SKU </label>
          <input className="product-description w-3xs border-2 border-black " onChange={handleChange} type="text" value={formData.sku} name="sku" id="sku" placeholder="SKU(Optional)" />
          </div>
          {/* product description */}
          <div className="w-full">
            <label className="block " htmlFor="description">Product Description</label>
          <textarea className="product-description w-full border-2 border-black " onChange={handleChange} value={formData.description} name="description" placeholder="Enter Product Description" id="description"></textarea>
          </div>
         </div>
{/* 
         adding product images 
          line break
         <div className="border-t-2 border-gray-400 h-0.5 w-full mb-3"></div>
         adding product images
          <div className="flex flex-row flex-wrap gap-4 mx-4 justify-between mb-3.5">
            <div>
              <label className="block " htmlFor="image">Product Image</label>
              <input value={formData.image} onChange={(e) => setImage(e.target.files[0])} className="product-description w-3xs border-2 border-black h-[10vh] " type="file" name="image" id="image" placeholder="Click to upload image or drag and drop PNG,JPG" />
            </div>
             showing uploaded image
              <div className="w-full md:w-1/2 h-20 bg-gray-100 border-2 rounded-2xl border-gray-400 flex items-center justify-center">
                <span className="text-gray-400 text-center">Image Preview</span>
              </div> 
              */}
              {/* button for submititing the form */}
          {/* </div> */}
              <button type="submit" className="product-description w-[10vw] border-2 border-blue-500 bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-2xl ml-auto">
                {change}
              </button>
          </form>
      </div>
    </div>
    </>
  );
}
