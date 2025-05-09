"use client";

import { useState } from "react";
import Header from "./components/Header";
import TableList from "./components/TableList";
import AddTableButton from "./components/AddTableButton";

// Sample table data
const initialTables = [];

const Dashboard = () => {
  const [tables, setTables] = useState(initialTables);

  const handleAddTable = () => {
    const newTable = {
      id: tables.length + 1,
      name: `Table ${tables.length + 1}`,
    };
    setTables([...tables, newTable]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Tables</h2>
            <AddTableButton onAddTable={handleAddTable} />
          </div>
          <TableList tables={tables} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
