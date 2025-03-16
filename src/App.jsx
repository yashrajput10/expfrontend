import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Calendar styles
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const localizer = momentLocalizer(moment);

const App = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState(""); // Already defined
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    itemName: "",
    price: "",
    expiryDate: "",
  });
  const [activeSection, setActiveSection] = useState("table");

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
    toast.success("Invoice deleted successfully!"); // Success Toast
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
    toast.success("Invoice added successfully!"); // Success Toast
  };

  const toggleDoneStatus = async (id) => {
    await axios.put(`http://localhost:5000/invoices/${id}/done`);
    fetchInvoices();
    toast.info("Invoice status updated!"); // Info Toast
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isExpiredOrAboutToExpire = (expiryDate) => {
    const currentTime = new Date();
    const expiryTime = new Date(expiryDate);
    return (
      expiryTime <= currentTime ||
      (expiryTime - currentTime <= 24 * 60 * 60 * 1000 &&
        expiryTime > currentTime)
    );
  };

  const expiredInvoices = invoices.filter(
    (invoice) => new Date(invoice.expiryDate) < new Date()
  );

  const chartData = {
    labels: invoices.map((invoice) => formatDate(invoice.invoiceDate)),
    datasets: [
      {
        label: "Done Invoices (₹)",
        data: invoices
          .filter((invoice) => invoice.done)
          .map((invoice) => invoice.price),
        backgroundColor: "rgba(24, 246, 4, 0.5)",
        borderColor: "rgb(8, 250, 77)",
        borderWidth: 1,
      },
      {
        label: "Pending Invoices (₹)",
        data: invoices
          .filter((invoice) => !invoice.done)
          .map((invoice) => invoice.price),
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        borderColor: "rgb(114, 0, 0)",
        borderWidth: 1,
      },
    ],
  };

  const chartDataExpired = {
    labels: expiredInvoices.map((invoice) => formatDate(invoice.expiryDate)),
    datasets: [
      {
        label: "Expired Invoices (₹)",
        data: expiredInvoices.map((invoice) => invoice.price),
        backgroundColor: "rgba(255,20,147,0.5)",
        borderColor: "rgba(255,20,147,1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-wrap justify-between p-5 bg-white gap-6 max-w-7xl mx-auto">
      <div className="bg-pink-400 text-white p-4 w-64  shadow-lg transition-all flex-shrink-0">
        <h2 className="text-xl font-semibold text-center mb-4 tracking-wider">
          EXP Stock
        </h2>
        <button
          onClick={() => setActiveSection("table")}
          className={`p-3 mb-4 w-full bg-pink-200 text-black rounded-l cursor-pointer border-none transition-all duration-300 ease-in-out hover:bg-pink-700 hover:text-white ${
            activeSection === "table" ? "bg-pink-800 text-white" : ""
          }`}
        >
          Invoice Data
        </button>
        <button
          onClick={() => setActiveSection("chart")}
          className={`p-3 mb-4 w-full bg-pink-200 text-black  rounded-l cursor-pointer border-none transition-all duration-300 ease-in-out hover:bg-pink-700 hover:text-white ${
            activeSection === "chart" ? "bg-pink-800 text-white" : ""
          }`}
        >
          Invoice Price Trends
        </button>
        <button
          onClick={() => setActiveSection("expired")}
          className={`p-3 mb-4 w-full bg-pink-200 text-black rounded-l cursor-pointer border-none transition-all duration-300 ease-in-out hover:bg-pink-700 hover:text-white ${
            activeSection === "expired" ? "bg-pink-800 text-white" : ""
          }`}
        >
          Expired Invoice Chart
        </button>
        <button
          onClick={() => setActiveSection("form")}
          className={`p-3 mb-4 w-full bg-pink-200 text-black rounded-l cursor-pointer border-none transition-all duration-300 ease-in-out hover:bg-pink-700 hover:text-white ${
            activeSection === "form" ? "bg-pink-800 text-white" : ""
          }`}
        >
          Add Invoice
        </button>
      </div>

      <div className="flex-grow p-6 max-w-4xl box-border animation-fadeIn  bg-pink-400">
        <h1 className="text-2xl font-extrabold text-white mb-6 text-center">
          EXP STOCK MANAGEMENT
        </h1>

        {/* Add Search Bar Here */}
        {activeSection === "table" && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 items-end hover:w-52 p-2 bg-white border rounded-xl border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
        )}

        {activeSection === "table" && (
          <div className="bg-white shadow-lg p-2  max-h-136 overflow-y-auto border border-gray-100">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                <th className="py-4 px-6 bg-pink-500 text-white font-bold uppercase border-b-2">
                    Item Name
                  </th>
                  <th className="py-4 px-6 bg-pink-500 text-white font-bold uppercase border-b-2">
                    Invoice No
                  </th>
                  <th className="py-4 px-6 bg-pink-500 text-white font-bold uppercase border-b-2">
                    Date
                  </th>
                  
                  <th className="py-4 px-6 bg-pink-500 text-white font-bold uppercase border-b-2">
                    Price
                  </th>
                  <th className="py-4 px-6 bg-pink-500 text-white font-bold uppercase border-b-2">
                    Expiry Date
                  </th>
                  <th className="py-4 px-6 bg-pink-500 text-white font-bold uppercase border-b-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices
                  .filter(
                    (invoice) =>
                      invoice.itemName
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      invoice.invoiceDate.includes(search)
                  )
                  .map((invoice) => (
                    <tr
                      key={invoice._id}
                      className={`${
                        isExpiredOrAboutToExpire(invoice.expiryDate)
                          ? "bg-red-600 text-white border-2"
                          : "hover:bg-pink-200"
                      } transition-all duration-300`}
                    >
                      <td className="py-2 px-2 text-center ">
                        {invoice.itemName}
                      </td>
                      <td className="py-2 px-2 text-center ">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-2 px-2 text-center ">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      
                      <td className="py-2 px-2 text-center ">
                        ₹{invoice.price}
                      </td>
                      <td className="py-2 px-2 text-center ">
                        {formatDate(invoice.expiryDate)}
                      </td>
                      <td className="py-2 px-2 text-center flex space-x-2">
                        <button
                          onClick={() => toggleDoneStatus(invoice._id)}
                          className={`px-4 py-2 text-white font-semibold rounded-md ${
                            invoice.done
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-[#a8a29e] hover:bg-red-700"
                          }`}
                        >
                          {invoice.done ? "Done" : "Pending"}
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this invoice?"
                              )
                            ) {
                              deleteInvoice(invoice._id);
                            }
                          }}
                          className="px-4 py-2 text-white font-semibold rounded-md bg-black hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === "chart" && (
          <div className="bg-white shadow-lg mb-12 p-6">
            <h2 className="text-2xl font-bold text-pink-700 mb-4">
              Invoice Price Trends
            </h2>
            <Bar data={chartData} />
          </div>
        )}

        {activeSection === "expired" && (
          <div className="bg-white mb-14 shadow-lg p-6">
            <h2 className="text-l font-bold text-white mb-4">
              Expired Invoice Price Trends
            </h2>
            <Bar data={chartDataExpired} />
          </div>
        )}

        {activeSection === "form" && (
          <div className="bg-white shadow-lg p-6 max-w-l mx-auto">
            <form onSubmit={addInvoice}>
              <h2 className="text-2xl font-bold text-pink-700">
                Add Invoice
              </h2>
              <div className="mb-2">
                <label className="block text-pink-700 mb-2">Invoice No</label>
                <input
                  type="text"
                  placeholder="Invoice Number"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      invoiceNumber: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="mb-2">
                <label className="block text-pink-700 mb-2">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      invoiceDate: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="mb-2">
                <label className="block text-pink-700 mb-2">Item Name</label>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={invoiceData.itemName}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, itemName: e.target.value })
                  }
                  required
                  className="w-full p-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="mb-2">
                <label className="block text-pink-700 mb-2">Price</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={invoiceData.price}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, price: e.target.value })
                  }
                  required
                  className="w-full p-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-pink-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={invoiceData.expiryDate}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      expiryDate: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 focus:outline-none transition-all duration-300"
              >
                Add Invoice
              </button>
            </form>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
