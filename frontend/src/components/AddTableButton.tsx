"use client";
import { Plus } from "lucide-react";

interface AddTableButtonProps {
  onAddTable: () => void;
}

const AddTableButton = ({ onAddTable }: AddTableButtonProps) => {
  return (
    <button
      onClick={onAddTable}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Plus className="h-4 w-4 mr-1" />
      Add New Table
    </button>
  );
};

export default AddTableButton;
