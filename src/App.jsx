import { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2"; // Import Bar chart
import { Chart as ChartJS } from "chart.js/auto"; // Import Chart.js
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Calendar styles

const localizer = momentLocalizer(moment); // Localizer for calendar

const App = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    itemName: "",
    price: "",
    expiryDate: "",
  });
  const [activeSection, setActiveSection] = useState("table"); // State to track which section is active

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
    if (isNaN(date)) return "Invalid Date";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Check if the invoice has expired or is about to expire (within 24 hours)
  const isExpiredOrAboutToExpire = (expiryDate) => {
    const currentTime = new Date();
    const expiryTime = new Date(expiryDate);
    return expiryTime <= currentTime || (expiryTime - currentTime <= 24 * 60 * 60 * 1000 && expiryTime > currentTime);
  };

  // Filter expired invoices
  const expiredInvoices = invoices.filter((invoice) => new Date(invoice.expiryDate) < new Date());

  // Prepare chart data for all invoices (Invoice Price Trends)
  const chartData = {
    labels: invoices.map((invoice) => formatDate(invoice.invoiceDate)),
    datasets: [
      {
        label: "Done Invoices (₹)",
        data: invoices.filter((invoice) => invoice.done).map((invoice) => invoice.price),
        backgroundColor: "rgba(24, 246, 4, 0.5)", // Bar color for done invoices (light pink)
        borderColor: "rgb(8, 250, 77)", // Border color for done invoices (light pink)
        borderWidth: 1,
      },
      {
        label: "Pending Invoices (₹)",
        data: invoices.filter((invoice) => !invoice.done).map((invoice) => invoice.price),
        backgroundColor: "rgba(255, 0, 0, 0.5)", // Bar color for pending invoices (dark pink)
        borderColor: "rgb(114, 0, 0)", // Border color for pending invoices (dark pink)
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for expired invoices (Expired Invoice Price Trends)
  const chartDataExpired = {
    labels: expiredInvoices.map((invoice) => formatDate(invoice.expiryDate)), // Use expiryDate for x-axis
    datasets: [
      {
        label: "Expired Invoices (₹)",
        data: expiredInvoices.map((invoice) => invoice.price),
        backgroundColor: "rgba(255,20,147,0.5)", // Bar color for expired invoices (dark pink)
        borderColor: "rgba(255,20,147,1)", // Border color for expired invoices (dark pink)
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-pink-200 flex"> {/* Light pink background */}
      {/* Sidebar */}
      <div className="w-1/4 bg-pink-400 text-white p-4 flex flex-col"> {/* Dark pink sidebar */}
        <h2 className="text-3xl font-bold mb-6">EXP Stock</h2>
        <button
          onClick={() => setActiveSection("table")}
          className={`p-2 mb-4 rounded-md ${activeSection === "table" ? "bg-pink-800" : "bg-pink-500 hover:bg-pink-600"}`}
        >
          Invoice Data
        </button>
        <button
          onClick={() => setActiveSection("chart")}
          className={`p-2 mb-4 rounded-md ${activeSection === "chart" ? "bg-pink-800" : "bg-pink-500 hover:bg-pink-600"}`}
        >
          Invoice Price Trends
        </button>
        <button
          onClick={() => setActiveSection("expired")}
          className={`p-2 mb-4 rounded-md ${activeSection === "expired" ? "bg-pink-800" : "bg-pink-500 hover:bg-pink-600"}`}
        >
          Expired Invoice Chart
        </button>
        <button
          onClick={() => setActiveSection("form")}
          className={`p-2 rounded-md ${activeSection === "form" ? "bg-pink-800" : "bg-pink-500 hover:bg-pink-600"}`}
        >
          Add Invoice
        </button>
      </div>

      {/* Main content area */}
      <div className="w-3/4 p-6 space-y-6">
        <h1 className="text-4xl font-bold text-center text-pink-700 mb-6">
          EXP STOCK MANAGEMENT
        </h1>

        {/* Conditional rendering based on activeSection */}
        {activeSection === "table" && (
          <div className="bg-white shadow-lg rounded-lg p-16">
            <div className="overflow-y-auto max-h-96"> {/* This will allow scrolling when rows exceed 6 */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-pink-500 text-white border-b text-center">
                    <th className="p-4 font-semibold">Invoice No</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Item Name</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Expiry Date</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .filter(
                      (invoice) =>
                        invoice.itemName.toLowerCase().includes(search.toLowerCase()) ||
                        invoice.invoiceDate.includes(search)
                    )
                    .map((invoice) => (
                      <tr
                        key={invoice._id}
                        className={`border-t hover:bg-pink-100 ${
                          isExpiredOrAboutToExpire(invoice.expiryDate) ? "bg-red-500 text-white" : ""
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
                              invoice.done ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                            }`}
                          >
                            {invoice.done ? "Done" : "Pending"}
                          </button>
                          <button
                            className="bg-black text-white p-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this invoice?")) {
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
        )}

        {activeSection === "chart" && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-pink-700 mb-4">Invoice Price Trends</h2>
            <Bar data={chartData} />
          </div>
        )}

        {activeSection === "expired" && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-pink-700 mb-4">Expired Invoice Price Trends</h2>
            <Bar data={chartDataExpired} />
          </div>
        )}

        {activeSection === "form" && (
          <div className="bg-white shadow-lg rounded-lg p-4">
            <form onSubmit={addInvoice} className="space-y-4">
              <h2 className="text-2xl font-semibold text-pink-700 mb-4">Add Invoice</h2>
              <div>
                <label className="block text-xl text-pink-700">Invoice No</label>
                <input
                  type="text"
                  placeholder="Invoice Number"
                  className="border p-2 w-full rounded-md focus:ring-2 focus:ring-pink-500"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      invoiceNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xl text-pink-700">Invoice Date</label>
                <input
                  type="date"
                  className="border p-2 w-full rounded-md focus:ring-2 focus:ring-pink-500"
                  value={invoiceData.invoiceDate}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xl text-pink-700">Item Name</label>
                <input
                  type="text"
                  placeholder="Item Name"
                  className="border p-2 w-full rounded-md focus:ring-2 focus:ring-pink-500"
                  value={invoiceData.itemName}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, itemName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xl text-pink-700">Price</label>
                <input
                  type="number"
                  placeholder="Price"
                  className="border p-2 w-full rounded-md focus:ring-2 focus:ring-pink-500"
                  value={invoiceData.price}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xl text-pink-700">Expiry Date</label>
                <input
                  type="date"
                  className="border p-2 w-full rounded-md focus:ring-2 focus:ring-pink-500"
                  value={invoiceData.expiryDate}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, expiryDate: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600"
              >
                Add Invoice
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
