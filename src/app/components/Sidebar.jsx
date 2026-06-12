"use client";
import Link from "next/link";
import {
  MdDashboard,
  MdInventory,
  MdCategory,
  MdShoppingCart,
  MdGroups,
  MdBarChart,
  MdSettings,
  MdAccountCircle,
  MdClose,
MdAddBox,
} from "react-icons/md";
import { usePathname } from "next/navigation";



export default function Sidebar({open,handleClick,className}) {

    // const [open, setOpen] = useState(true);
  const menuItems = [
    { name: "Dashboard", icon: <MdDashboard />, href: "/" },
    {name:"Add Product", icon: <MdAddBox />, href: "/addProducts"},
    { name: "Products", icon: <MdInventory />, href: "/products" },
    { name: "Categories", icon: <MdCategory />, href: "/categories" },
    { name: "Orders", icon: <MdShoppingCart />, href: "/orders" },
    { name: "Suppliers", icon: <MdGroups />, href: "/suppliers" },
    { name: "Reports", icon: <MdBarChart />, href: "/reports" },
    { name: "Settings", icon: <MdSettings />, href: "/settings" },
  ];

  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  console.log("pathname:", pathname);
  return (
    <>
    {/* left container */}
    <div className={` min-h-[100vh] overflow-y-auto bg-gradient-to-b from-[#081028] to-[#0b1739] text-white flex flex-col ${open ? "w-64":"w-0 overflow-hidden"} transition-all duration-300 ${className}`}>

      {/* Logo */}
      <div className="pl-5 py-5 border-b border-white/10 flex justify-between items-center">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <MdInventory className="text-blue-400 text-2xl" />
          Inventory SaaS
        </h1>
         {/* Close button for mobile view */}
        <MdClose className="text-3xl cursor-pointer mx-2.5" onClick={handleClick} />
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 py-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200
  ${
    isActive(item.href)
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-white/10 hover:text-white"
  }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
          <MdAccountCircle className="text-4xl text-gray-300" />

          <div>
            <p className="text-sm font-semibold">Aman Verma</p>
            <p className="text-xs text-gray-400">
              admin@inventory.com
            </p>
          </div>
        </div>
      </div>
    </div>
{/* right container */}

    </>
  );
}