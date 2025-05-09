import { Database, MoreHorizontal, Table, Utensils } from "lucide-react";

interface Table {
  id: number;
  name: string;
}

interface TableCardProps {
  table: Table;
}

const TableCard = ({ table }: TableCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center">
              <Utensils className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {table.name}
              </h3>
            </div>
          </div>
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500"></span>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
