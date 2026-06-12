// Edit product
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Product from "@/app/models/productSchema";

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = await params;

  const product = await Product.findById(id);

  return NextResponse.json({
    product,
  });
}

export async function PUT(request, { params }) {
  await dbConnect();

  const { id } = await params;
  const data = await request.json();

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
  });

  return NextResponse.json({
    message: "Product updated successfully",
    product,
  });
}

export async function DELETE(request, { params }) {
  await dbConnect();

  const { id } = await params;

  const product = await Product.findByIdAndDelete(id);
  return NextResponse.json({
    message: "Product deleted successfully",
    product,
  });
} 

