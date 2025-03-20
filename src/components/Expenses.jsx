import { Pencil, Trash, FileText, Search, Filter, UploadCloud } from "lucide-react";
import { useState } from "react";

export default function ExpensesTable() {
    // State for search
    const [search, setSearch] = useState("");

    // Sample data
    const [expenses, setExpenses] = useState([
        {
            id: 1,
            date: "2024-02-15",
            vendor: "Starbucks",
            category: "Food & Dining",
            description: "Team Coffee Meeting",
            amount: "$42.50",
            payment: "Credit Card",
        },
        {
            id: 2,
            date: "2024-02-14",
            vendor: "Office Depot",
            category: "Office Supplies",
            description: "Printer Paper & Supplies",
            amount: "$156.75",
            payment: "Company Card",
        },
    ]);

    // Search filter function
    const filteredExpenses = expenses.filter(expense =>
        expense.vendor.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="p-6 bg-gray-100">
                <div className="p-6 rounded-lg bg-white">
                    <div className="border-dashed border-2 border-gray-300 rounded-lg p-8 flex flex-col items-center bg-white">
                        <UploadCloud size={40} className="text-gray-400" />
                        <h3 className="font-medium text-gray-700 mt-2">Upload receipts</h3>
                        <p className="text-gray-500 text-sm">Drag and drop files or click to browse</p>
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium flex items-center">
                            <UploadCloud size={16} className="mr-2" />
                            Select Files
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-100">
                {/* Search and Filter Bar */}
                <div className="bg-white p-4 rounded-t-lg flex justify-between items-center shadow">
                    {/* Search Input */}
                    <div className="flex items-center border rounded px-3 py-2 bg-white w-1/3">
                        <Search size={18} className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search receipts..."
                            className="outline-none bg-white w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter & Actions */}
                    <div className="flex space-x-2">
                        <Button className="bg-white border text-gray-700 flex items-center">
                            <input type="date" name="filterDate" className="bg-transparent border-none" />
                        </Button>
                        <Button className="bg-white border text-gray-700 flex items-center">
                            <Filter size={16} className="mr-2" />
                            All Categories
                        </Button>
                        <Button className="bg-white border text-gray-700 flex items-center">
                            <FileText size={16} className="mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="pt-6 bg-white rounded-b-lg shadow-md p-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left text-gray-600 border-b">
                                <th className="py-3 px-3">
                                    <input type="checkbox" />
                                </th>
                                <th className="py-3 px-3">Date</th>
                                <th className="py-3 px-3">Vendor</th>
                                <th className="py-3 px-3">Category</th>
                                <th className="py-3 px-3">Description</th>
                                <th className="py-3 px-3">Amount</th>
                                <th className="py-3 px-3">Payment</th>
                                <th className="py-3 px-3">Receipt</th>
                                <th className="py-3 px-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense) => (
                                <TableRow key={expense.id} {...expense} />
                            ))}
                        </tbody>
                    </table>
                    <div className="text-gray-500 text-sm p-3">Showing {filteredExpenses.length} of {expenses.length} results</div>
                </div>

                {/* Pagination */}
                <div className="flex justify-end mt-4 space-x-2">
                    <Button className="bg-gray-200">{`<`}</Button>
                    <Button className="bg-blue-600 text-white">1</Button>
                    <Button className="bg-gray-200 text-gray-700">2</Button>
                    <Button className="bg-gray-200 text-gray-700">3</Button>
                    <Button className="bg-gray-200">{`>`}</Button>
                </div>
            </div>
        </>
    );
}

// Table Row Component
function TableRow({ date, vendor, category, description, amount, payment }) {
    return (
        <tr className="border-b text-gray-700">
            <td className="py-3 px-3">
                <input type="checkbox" />
            </td>
            <td className="py-3 px-3">{date}</td>
            <td className="py-3 px-3 font-semibold">{vendor}</td>
            <td className="py-3 px-3">{category}</td>
            <td className="py-3 px-3">{description}</td>
            <td className="py-3 px-3 font-semibold">{amount}</td>
            <td className="py-3 px-3">{payment}</td>
            <td className="py-3 px-3 text-center">
                📄
            </td>
            <td className="py-3 px-3 flex space-x-2">
                <Pencil size={18} className="text-gray-500 cursor-pointer" />
                <Trash size={18} className="text-gray-500 cursor-pointer" />
            </td>
        </tr>
    );
}

// Reusable Button Component
function Button({ children, onClick, className }) {
    return (
        <button className={`px-4 py-2 rounded ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}
