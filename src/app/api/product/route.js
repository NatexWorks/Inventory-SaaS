import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Product from "@/app/models/productSchema"; // IMPORTANT

// POST /api/product
// Creates a new product record in MongoDB using the request body
export async function POST(request) {
  await dbConnect();

  // Parse the JSON payload sent from the client form
  const data = await request.json();

  // Save the product document into the collection

  try{
  const product = await Product.create(data);
  
  return NextResponse.json({
    message: "Product added successfully",
    product,
  });

  } catch(error){
    return NextResponse.json(
      {error :error.message},
      {status:400}
    );
  }

}

// GET /api/product
// Returns all saved products from the database
export async function GET() {
  try {
    await dbConnect();

    // Fetch every product document in the collection
    const products = await Product.find(); // FIXED

    return NextResponse.json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching products", error: error.message },
      { status: 500 }
    );
  }
}

