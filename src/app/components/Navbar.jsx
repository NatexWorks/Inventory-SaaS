"use client";
import {
  MdMenu,
  MdNotifications,
  MdMessage,
  MdAccountCircle
} from "react-icons/md";

export default function Navbar({ handleClick ,className}) {
  return (
    <>
      <nav className={`bg-zinc-100 flex justify-between items-center p-4 px-10 w-full border-b border-gray-200 ${className}`}>
        {/* Logo and welcome message */}
        <div>
            <span className="flex items-center gap-4">
        <MdMenu size={38} onClick={handleClick} className="text-3xl cursor-pointer mx-2.5" />

        <div className=" font-bold">welcome Back user!</div></span>
        <p className="text-sm text-gray-400">Hey what&apos;s happening with your store today</p>
        </div>
         {/* input search bar */}
         {/* right contaainer contains search and right side icons */}
         <div className="rightcontainer flex gap-4 justify-between">
         <div className="flex gap-4 items-center hover:bg-gray-200 transition-colors duration-300 rounded-lg px-2 py-1">
         <input type="text" placeholder="Search..." className="px-4 py-2 rounded-lg text-gray-700 bg-white placeholder:text-sm border-2 border-gray-200 placeholder:text-gray-400    " />
         </div>
          {/* Logout button */}
            <div className="flex bg-zinc-100 border-2 border-gray-300 p-2 rounded-lg items-center">
              <MdNotifications size={25} className="text-3xl cursor-pointer mx-2.5" />
              <MdMessage size={25} className="text-3xl cursor-pointer mx-2.5" />
              <MdAccountCircle size={25} className="text-3xl cursor-pointer mx-2.5" />
            </div>
            </div>
           
      </nav>
      {/* <h1 className="text-2xl font-bold">Navbar</h1> */}
    
    </>
  );
}

