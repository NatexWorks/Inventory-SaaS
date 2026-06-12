"use client";
export function EditButton({onclick}) {
  return (
    <button className="bg-blue-500 text-white w-16 flex items-center justify-center h-8 rounded hover:bg-blue-600"  onClick={onclick}>
      Edit
    </button>
  );
}

export function DeleteButton({onclick}) {
  return (
    <button className="bg-red-500 text-white w-16 flex items-center justify-center h-8 rounded hover:bg-red-600" onClick={onclick}>
      Delete
    </button>
  );
}