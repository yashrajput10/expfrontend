import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    itemName: "",
    price: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const res = await axios.get("http://localhost:5000/invoices");
    setInvoices(res.data);
  };

  const deleteInvoice = async (id) => {
    await axios.delete(`http://localhost:5000/invoices/${id}`);
    fetchInvoices();
  };

  const addInvoice = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/invoices", invoiceData);
    setInvoiceData({
      invoiceNumber: "",
      invoiceDate: "",
      itemName: "",
      price: "",
      expiryDate: "",
    });
    fetchInvoices();
  };

  const toggleDoneStatus = async (id) => {
    await axios.put(`http://localhost:5000/invoices/${id}/done`);
    fetchInvoices();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date"; // Return empty if invalid date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-pink-100">
      <h1 className="text-4xl font-bold text-center text-pink-800 border p-2">
        EXP STOCK MANAGE
      </h1>
      <div className="flex gap-6">
        {/* Left side: Invoice Data (Table) */}
        <div className="w-2/3 bg-pink-200 shadow-md rounded-lg overflow-x-auto p-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search invoices..."
              className="border p-2 w-96 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border p-2 rounded-full "
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
          </div>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-pink-500 text-white border-b text-center">
                  <th className="p-4 font-semibold text-white">Invoice No</th>
                  <th className="p-4 font-semibold text-white">Date</th>
                  <th className="p-4 font-semibold text-white">Item Name</th>
                  <th className="p-4 font-semibold text-white">Price</th>
                  <th className="p-4 font-semibold text-white">Expiry Date</th>
                  <th className="p-4 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices
                  .filter(
                    (invoice) =>
                      invoice.itemName.toLowerCase().includes(search.toLowerCase()) ||
                      invoice.invoiceDate.includes(search) // Include date search
                  )
                  .map((invoice) => (
                    <tr
                      key={invoice._id}
                      className={`border-t hover:bg-pink-300 transition-colors duration-200 ${
                        new Date(invoice.expiryDate) - new Date() <= 24 * 60 * 60 * 1000 ? "bg-pink-500 text-white" : ""
                      }`}
                    >
                      <td className="p-4">{invoice.invoiceNumber}</td>
                      <td className="p-4">{formatDate(invoice.invoiceDate)}</td>
                      <td className="p-4">{invoice.itemName}</td>
                      <td className="p-4">₹{invoice.price}</td>
                      <td className="p-4">{formatDate(invoice.expiryDate)}</td>
                      <td className="p-4 flex space-x-2">
                        <button
                          onClick={() => toggleDoneStatus(invoice._id)}
                          className={`p-2 rounded-lg text-white transition-colors duration-200 ${
                            invoice.done
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
                        >
                          {invoice.done ? "Done" : "Pending"}
                        </button>
                        <button
                          className="bg-black text-white p-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this invoice?"
                              )
                            ) {
                              deleteInvoice(invoice._id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Invoice Form */}
        <div className="w-1/3 bg-pink-50 shadow-md rounded p-4 space-y-4">
          <form onSubmit={addInvoice} className="grid grid-cols-1 gap-4">
            <label className="text-xl text-pink-700">
              Invoice No
              <input
                type="text"
                placeholder="Invoice Number"
                className="border p-2 w-full"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceNumber: e.target.value,
                  })
                }
                required
              />
            </label>
            <label className="text-xl text-pink-700">
              Invoice Date
              <input
                type="date"
                className="border p-2 w-full"
                value={invoiceData.invoiceDate}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })
                }
                required
              />
            </label>
            <label className="text-xl text-pink-700">
              Item Name
              <input
                type="text"
                placeholder="Item Name"
                className="border p-2 w-full"
                value={invoiceData.itemName}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, itemName: e.target.value })
                }
                required
              />
            </label>
            <label className="text-xl text-pink-700">
              Price
              <input
                type="number"
                placeholder="Price"
                className="border p-2 w-full"
                value={invoiceData.price}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, price: e.target.value })
                }
                required
              />
            </label>
            <label className="text-xl text-pink-700">
              Expiry Date
              <input
                type="date"
                className="border p-2 w-full"
                value={invoiceData.expiryDate}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, expiryDate: e.target.value })
                }
                required
              />
            </label>
            <button
              type="submit"
              className="col-span-full bg-pink-500 hover:bg-pink-600 text-white p-2 rounded"
            >
              Add Invoice
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
