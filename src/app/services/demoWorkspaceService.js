// Idempotently populate only the explicitly configured demo workspace.
// Existing products, categories, orders, and workspace settings are never overwritten.
import dbConnect from "../lib/db";
import Category from "../models/categorySchema";
import Product from "../models/productSchema";
import Order from "../models/orderSchema";

const categoryFixtures = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Computers, peripherals, and electronic devices",
  },
  {
    name: "Office Supplies",
    slug: "office-supplies",
    description: "Paper, writing materials, and desk essentials",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Cables, adapters, and workstation accessories",
  },
  {
    name: "Packaging & Shipping",
    slug: "packaging-shipping",
    description: "Packing materials and shipping labels",
  },
];

const productFixtures = [
  { sku: "DEMO-MOUSE-001", name: "Wireless Mouse", category: "electronics", price: 799, costPrice: 450, stock: 18, description: "Ergonomic wireless mouse with adjustable DPI" },
  { sku: "DEMO-USBHUB-001", name: "USB-C Hub", category: "electronics", price: 1499, costPrice: 880, stock: 8, description: "Multiport USB-C hub for laptops" },
  { sku: "DEMO-KEYBOARD-001", name: "Mechanical Keyboard", category: "electronics", price: 2799, costPrice: 1900, stock: 6, description: "Compact mechanical keyboard" },
  { sku: "DEMO-MONITOR-001", name: "24-inch Monitor", category: "electronics", price: 8999, costPrice: 7200, stock: 4, description: "Full HD office monitor" },
  { sku: "DEMO-SCANNER-001", name: "Barcode Scanner", category: "electronics", price: 4999, costPrice: 3600, stock: 3, description: "Handheld barcode scanner" },
  { sku: "DEMO-WEBCAM-001", name: "HD Webcam", category: "electronics", price: 2499, costPrice: 1800, stock: 11, description: "1080p webcam for meetings" },
  { sku: "DEMO-PAPER-001", name: "A4 Copy Paper", category: "office-supplies", price: 299, costPrice: 220, stock: 32, description: "500-sheet A4 copy paper ream" },
  { sku: "DEMO-NOTEBOOK-001", name: "Ruled Notebook", category: "office-supplies", price: 49, costPrice: 20, stock: 54, description: "A5 ruled notebook" },
  { sku: "DEMO-PENS-001", name: "Ballpoint Pens (Pack of 10)", category: "office-supplies", price: 99, costPrice: 45, stock: 26, description: "Blue ink ballpoint pens, pack of ten" },
  { sku: "DEMO-STAPLER-001", name: "Heavy-duty Stapler", category: "office-supplies", price: 349, costPrice: 210, stock: 14, description: "Desktop stapler for daily office use" },
  { sku: "DEMO-HDMI-001", name: "HDMI Cable (2m)", category: "accessories", price: 249, costPrice: 110, stock: 22, description: "Two-metre HDMI cable" },
  { sku: "DEMO-STAND-001", name: "Adjustable Laptop Stand", category: "accessories", price: 899, costPrice: 520, stock: 9, description: "Adjustable aluminium laptop stand" },
  { sku: "DEMO-HEADSET-001", name: "USB Headset", category: "accessories", price: 1499, costPrice: 900, stock: 13, description: "Wired USB headset with microphone" },
  { sku: "DEMO-ADAPTER-001", name: "Universal Power Adapter", category: "accessories", price: 299, costPrice: 120, stock: 17, description: "Universal power adapter" },
  { sku: "DEMO-TAPE-001", name: "Packing Tape Roll", category: "packaging-shipping", price: 89, costPrice: 30, stock: 28, description: "Clear packing tape roll" },
  { sku: "DEMO-LABEL-001", name: "Shipping Label Roll", category: "packaging-shipping", price: 199, costPrice: 75, stock: 9, description: "Thermal shipping label roll" },
  { sku: "DEMO-BUBBLE-001", name: "Bubble Wrap Roll", category: "packaging-shipping", price: 159, costPrice: 70, stock: 12, description: "Protective bubble wrap roll" },
];

const orderFixtures = [
  { orderNumber: "DEMO-ORD-1001", status: "COMPLETED", customerName: "Aarav Retail", daysAgo: 26, items: [{ sku: "DEMO-MOUSE-001", quantity: 2 }, { sku: "DEMO-USBHUB-001", quantity: 1 }] },
  { orderNumber: "DEMO-ORD-1002", status: "COMPLETED", customerName: "Mira Office Supplies", daysAgo: 17, items: [{ sku: "DEMO-PAPER-001", quantity: 3 }, { sku: "DEMO-PENS-001", quantity: 2 }, { sku: "DEMO-TAPE-001", quantity: 2 }] },
  { orderNumber: "DEMO-ORD-1003", status: "PENDING_APPROVAL", customerName: "Northstar Retail", daysAgo: 2, items: [{ sku: "DEMO-SCANNER-001", quantity: 1 }, { sku: "DEMO-LABEL-001", quantity: 2 }] },
  { orderNumber: "DEMO-ORD-1004", status: "PENDING_APPROVAL", customerName: "Bright Desk Co.", daysAgo: 1, items: [{ sku: "DEMO-KEYBOARD-001", quantity: 1 }, { sku: "DEMO-STAND-001", quantity: 1 }] },
  { orderNumber: "DEMO-ORD-1005", status: "DRAFT", customerName: "Rohan Enterprises", daysAgo: 0, items: [{ sku: "DEMO-WEBCAM-001", quantity: 1 }, { sku: "DEMO-NOTEBOOK-001", quantity: 5 }] },
  { orderNumber: "DEMO-ORD-1006", status: "CANCELLED", customerName: "Greenfield Stores", daysAgo: 12, items: [{ sku: "DEMO-MONITOR-001", quantity: 1 }] },
  { orderNumber: "DEMO-ORD-1007", status: "COMPLETED", customerName: "Urban Cart", daysAgo: 4, items: [{ sku: "DEMO-HEADSET-001", quantity: 2 }, { sku: "DEMO-HDMI-001", quantity: 1 }] },
  { orderNumber: "DEMO-ORD-1008", status: "DRAFT", customerName: "Walk-in Customer", daysAgo: 0, items: [{ sku: "DEMO-STAPLER-001", quantity: 1 }, { sku: "DEMO-BUBBLE-001", quantity: 2 }] },
];

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function daysAgoDate(daysAgo) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

export async function seedDemoWorkspace(userId) {
  await dbConnect();

  const categoriesBySlug = new Map();
  for (const fixture of categoryFixtures) {
    const category = await Category.findOneAndUpdate(
      { userId, slug: fixture.slug },
      {
        $setOnInsert: {
          userId,
          name: fixture.name,
          slug: fixture.slug,
          description: fixture.description,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    categoriesBySlug.set(fixture.slug, category);
  }

  await Product.bulkWrite(
    productFixtures.map((fixture) => {
      const category = categoriesBySlug.get(fixture.category);
      return {
        updateOne: {
          filter: { userId, sku: fixture.sku },
          update: {
            $setOnInsert: {
              userId,
              categoryId: category?._id || null,
              category: category?.name || fixture.category,
              name: fixture.name,
              price: fixture.price,
              costPrice: fixture.costPrice,
              stock: fixture.stock,
              sku: fixture.sku,
              description: fixture.description,
              barcodes: [],
              isActive: true,
            },
          },
          upsert: true,
        },
      };
    }),
    { ordered: true }
  );

  const products = await Product.find({
    userId,
    sku: { $in: productFixtures.map((product) => product.sku) },
  }).lean();
  const productsBySku = new Map(products.map((product) => [product.sku, product]));

  const orderOperations = orderFixtures.map((fixture) => {
    const createdAt = daysAgoDate(fixture.daysAgo);
    const items = fixture.items.map(({ sku, quantity }) => {
      const product = productsBySku.get(sku);
      if (!product) {
        throw new Error(`Demo seed product not found: ${sku}`);
      }

      const price = Number(product.price || 0);
      return {
        productId: product._id,
        barcodeId: null,
        barcode: "",
        name: product.name,
        quantity,
        price,
        lineTotal: roundMoney(price * quantity),
      };
    });

    const subtotal = roundMoney(items.reduce((total, item) => total + item.lineTotal, 0));
    const taxAmount = roundMoney(subtotal * 0.12);
    const order = {
      userId,
      orderNumber: fixture.orderNumber,
      customerName: fixture.customerName,
      customerPhone: "",
      status: fixture.status,
      items,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount: roundMoney(subtotal + taxAmount),
      isReturn: false,
      notes: "Sample data for the Inventory SaaS demo",
      createdAt,
      updatedAt: createdAt,
    };

    if (fixture.status === "COMPLETED") {
      order.approvedBy = userId;
      order.approvedAt = createdAt;
    }
    if (fixture.status === "CANCELLED") {
      order.cancelledBy = userId;
      order.cancelledAt = createdAt;
    }

    return {
      updateOne: {
        filter: { userId, orderNumber: fixture.orderNumber },
        update: { $setOnInsert: order },
        upsert: true,
      },
    };
  });

  await Order.bulkWrite(orderOperations, { ordered: true });

  return {
    categories: categoryFixtures.length,
    products: productFixtures.length,
    orders: orderFixtures.length,
  };
}
