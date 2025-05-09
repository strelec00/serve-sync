import TableCard from "./TableCard";

interface Table {
  id: number;
  name: string;
}

interface TableListProps {
  tables: Table[];
}

const TableList = ({ tables }: TableListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tables.map((table) => (
        <TableCard key={table.id} table={table} />
      ))}
    </div>
  );
};

export default TableList;
