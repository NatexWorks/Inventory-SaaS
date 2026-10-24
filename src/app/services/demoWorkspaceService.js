// Idempotently populate only the explicitly configured demo workspace.
// Existing products, categories, orders, and workspace settings are never overwritten.
import dbConnect from "../lib/db";
import Category from "../models/categorySchema";
import Product from "../models/productSchema";
import Order from "../models/orderSchema";

const categoryFixtures = [
  { name: "Electronics", slug: "electronics", description: "Computers, peripherals, and electronic devices" },
  { name: "Office Supplies", slug: "office-supplies", description: "Paper, writing materials, and desk essentials" },
  { name: "Accessories", slug: "accessories", description: "Cables, adapters, and workstation accessories" },
  { name: "Packaging & Shipping", slug: "packaging-shipping", description: "Packing materials and shipping labels" },
  { name: "Grocery", slug: "grocery", description: "Packaged food, beverages, and pantry essentials" },
  { name: "Clothing", slug: "clothing", description: "Everyday apparel and clothing essentials" },
  { name: "Home & Kitchen", slug: "home-kitchen", description: "Kitchenware and useful household products" },
  { name: "Personal Care", slug: "personal-care", description: "Daily hygiene and personal care products" },
  { name: "Sports & Fitness", slug: "sports-fitness", description: "Fitness accessories and sports equipment" },
  { name: "Cleaning Supplies", slug: "cleaning-supplies", description: "Cleaning products and janitorial essentials" },
];

// Keep the original fixtures for the sample orders, then add a broad 250-item catalogue.
const coreProductFixtures = [
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
const extraProductNames = {
  "electronics": [
    "Bluetooth Speaker",
    "Wireless Earbuds",
    "Power Bank 10000mAh",
    "USB Flash Drive 64GB",
    "External SSD 1TB",
    "Wi-Fi Router",
    "Webcam 4K",
    "Gaming Mouse",
    "Wireless Keyboard",
    "Laptop Charger 65W",
    "Laptop Cooling Pad",
    "Smart Plug",
    "Smart LED Bulb",
    "MicroSD Card 128GB",
    "Ethernet Switch 8-Port",
    "Portable Projector",
    "Laser Printer",
    "Ink Cartridge Black",
    "Surge Protector",
    "UPS 600VA",
    "Drawing Tablet",
    "Conference Speakerphone",
    "HDMI Splitter",
    "USB-C Docking Station",
    "Mini PC"
  ],
  "office-supplies": [
    "Sticky Notes Pack",
    "Permanent Marker Set",
    "Whiteboard Marker Set",
    "A4 File Folder",
    "Lever Arch File",
    "Document Wallet",
    "Paper Clips Box",
    "Binder Clips Set",
    "Correction Tape",
    "Desk Organizer",
    "Whiteboard 60x90cm",
    "Whiteboard Eraser",
    "Calculator Basic",
    "Scientific Calculator",
    "Envelope Pack",
    "Index Cards Pack",
    "Pencil Pack",
    "Eraser Pack",
    "Pencil Sharpener",
    "Ruler 30cm",
    "Geometry Box",
    "Glue Stick",
    "Scissors 8-inch",
    "Hole Punch",
    "Receipt Book"
  ],
  "accessories": [
    "USB-C Cable 1m",
    "USB-C Cable 2m",
    "Lightning Cable 1m",
    "Micro USB Cable",
    "DisplayPort Cable",
    "VGA Cable",
    "Bluetooth Adapter",
    "USB Wi-Fi Adapter",
    "Mouse Pad",
    "Wrist Rest",
    "Laptop Sleeve 14-inch",
    "Laptop Sleeve 15-inch",
    "Phone Stand",
    "Tablet Stand",
    "Cable Organizer Clips",
    "Cable Ties Pack",
    "Webcam Privacy Cover",
    "Screen Cleaning Kit",
    "Headphone Stand",
    "USB Numeric Keypad",
    "Card Reader",
    "Wireless Presenter",
    "Portable SSD Case",
    "Travel Adapter",
    "Laptop Privacy Filter"
  ],
  "packaging-shipping": [
    "Corrugated Box Small",
    "Corrugated Box Medium",
    "Corrugated Box Large",
    "Mailer Bag Small",
    "Mailer Bag Large",
    "Kraft Paper Roll",
    "Stretch Film Roll",
    "Packing Peanuts Bag",
    "Foam Sheet Pack",
    "Fragile Stickers Roll",
    "Shipping Pouch Pack",
    "Zip Lock Bags Pack",
    "Carton Sealing Tape",
    "Paper Tape Roll",
    "Padded Envelope Pack",
    "Cardboard Divider Set",
    "Pallet Wrap",
    "Strapping Roll",
    "Strapping Buckle Pack",
    "Thermal Label 4x6",
    "Packing List Envelope",
    "Void Fill Paper",
    "Corner Protector Set",
    "Reusable Shipping Crate",
    "Tamper Evident Bag"
  ],
  "grocery": [
    "Basmati Rice 1kg",
    "Wheat Flour 5kg",
    "Sugar 1kg",
    "Toor Dal 1kg",
    "Moong Dal 1kg",
    "Chana Dal 1kg",
    "Cooking Oil 1L",
    "Salt 1kg",
    "Tea Bags 100-count",
    "Ground Coffee 200g",
    "Green Tea 25-count",
    "Oats 1kg",
    "Corn Flakes 500g",
    "Pasta 500g",
    "Instant Noodles Pack",
    "Tomato Ketchup 500g",
    "Peanut Butter 340g",
    "Honey 250g",
    "Biscuits Family Pack",
    "Dark Chocolate 100g",
    "Mineral Water 1L",
    "Fruit Juice 1L",
    "Canned Sweet Corn",
    "Mixed Spices Pack",
    "Coconut Milk 400ml"
  ],
  "clothing": [
    "Cotton T-Shirt Small",
    "Cotton T-Shirt Medium",
    "Cotton T-Shirt Large",
    "Polo Shirt Medium",
    "Formal Shirt Medium",
    "Formal Shirt Large",
    "Denim Jeans 30",
    "Denim Jeans 32",
    "Chinos 32",
    "Track Pants Medium",
    "Hoodie Medium",
    "Hoodie Large",
    "Cotton Socks Pack",
    "Ankle Socks Pack",
    "Baseball Cap",
    "Wool Beanie",
    "Canvas Belt",
    "Leather Belt",
    "Sports Shorts Medium",
    "Leggings Medium",
    "Kurta Medium",
    "Scarf Cotton",
    "Raincoat Large",
    "Apron Cotton",
    "Cotton Handkerchief Pack"
  ],
  "home-kitchen": [
    "Stainless Steel Water Bottle",
    "Ceramic Coffee Mug",
    "Dinner Plate Set",
    "Glass Tumbler Set",
    "Cutlery Set 24-piece",
    "Non-stick Frying Pan",
    "Saucepan 2L",
    "Pressure Cooker 3L",
    "Chopping Board",
    "Chef Knife 8-inch",
    "Vegetable Peeler",
    "Measuring Cup Set",
    "Food Storage Container Set",
    "Lunch Box",
    "Insulated Flask",
    "Dish Rack",
    "Kitchen Tongs",
    "Silicone Spatula",
    "Mixing Bowl Set",
    "Colander Steel",
    "Tea Strainer",
    "Manual Can Opener",
    "Kitchen Scale",
    "Cotton Bath Towel",
    "Microfiber Doormat"
  ],
  "personal-care": [
    "Hand Wash 250ml",
    "Body Wash 500ml",
    "Shampoo 400ml",
    "Conditioner 400ml",
    "Toothpaste 150g",
    "Toothbrush Pack of 3",
    "Dental Floss",
    "Mouthwash 500ml",
    "Face Wash 100ml",
    "Moisturizer 200ml",
    "Sunscreen SPF 50",
    "Lip Balm",
    "Hand Sanitizer 500ml",
    "Deodorant Spray",
    "Hair Oil 200ml",
    "Comb Set",
    "Bath Sponge",
    "Cotton Swabs Pack",
    "Cotton Pads Pack",
    "Disposable Razor Pack",
    "Shaving Cream",
    "Nail Clipper",
    "Face Tissue Box",
    "Wet Wipes Pack",
    "Travel Toiletry Kit"
  ],
  "sports-fitness": [
    "Yoga Mat 6mm",
    "Resistance Bands Set",
    "Dumbbell 2kg Pair",
    "Skipping Rope",
    "Foam Roller",
    "Gym Gloves Medium",
    "Sports Water Bottle",
    "Fitness Jump Box",
    "Exercise Ball 65cm",
    "Wrist Wraps Pair",
    "Knee Support Medium",
    "Ankle Weights 1kg Pair",
    "Tennis Balls Pack",
    "Badminton Shuttlecock Pack",
    "Badminton Racket",
    "Football Size 5",
    "Basketball Size 7",
    "Cricket Tennis Ball Pack",
    "Cricket Bat",
    "Swimming Goggles",
    "Cycling Helmet Medium",
    "Reflective Running Vest",
    "Pedometer",
    "Hand Grip Strengthener",
    "Massage Ball"
  ],
  "cleaning-supplies": [
    "Floor Cleaner 1L",
    "Glass Cleaner 500ml",
    "Disinfectant Liquid 1L",
    "Dishwashing Liquid 500ml",
    "Laundry Detergent 2kg",
    "Fabric Softener 1L",
    "Toilet Cleaner 500ml",
    "Bleach 1L",
    "Microfiber Cloth Pack",
    "Scrub Sponge Pack",
    "Broom Soft",
    "Floor Mop",
    "Mop Refill",
    "Dustpan Set",
    "Rubber Gloves Medium",
    "Garbage Bags Small",
    "Garbage Bags Large",
    "Paper Towel Roll",
    "Toilet Paper Pack",
    "Air Freshener Spray",
    "Cleaning Brush Set",
    "Spray Bottle 500ml",
    "Bucket 15L",
    "Squeegee 12-inch",
    "Hand Duster"
  ]
};
const categoryBasePrices = {
  electronics: 450, "office-supplies": 35, accessories: 120, "packaging-shipping": 55,
  grocery: 45, clothing: 299, "home-kitchen": 99, "personal-care": 65,
  "sports-fitness": 149, "cleaning-supplies": 45,
};
const generatedProductFixtures = Object.entries(extraProductNames).flatMap(([category, names]) =>
  names.map((name, index) => {
    const base = categoryBasePrices[category] || 100;
    const price = Math.round(base * (1 + ((index * 17) % 140) / 100));
    const stockPattern = [0, 2, 4, 7, 12, 18, 24, 31, 46, 58];
    const stock = stockPattern[(index * 7 + category.length) % stockPattern.length];
    const skuPart = category.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    const sku = `DEMO-${skuPart}-${String(index + 1).padStart(3, "0")}`;
    return {
      sku,
      name,
      category,
      price,
      costPrice: Math.max(1, Math.round(price * 0.68)),
      stock,
      description: `${name} — sample inventory item for the ${category.replace(/-/g, " ")} category`,
    };
  })
);
const productFixtures = [...coreProductFixtures, ...generatedProductFixtures];

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
