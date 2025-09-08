"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    tagName: "",
    building: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    companyEmail: "",
    phone: "",
    companyLogo: "",
    gstinNumber: "",
  });

  // Fetch company details
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/seller/company/getCompany", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch company");
        const data = await res.json();
        setAddresses(data.company.companyAddress || []);
        setFormData({
          ...formData,
          companyEmail: data.company.companyEmail || "",
          phone: data.company.phone || "",
          companyLogo: data.company.companyLogo || "",
          gstinNumber: data.company.gstinNumber || "",
        });
      } catch (err) {
        console.error("Error fetching company:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
   
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save / Update
  const handleSave = async (e) => {
    e.preventDefault();

    let newAddresses;
    if (editIndex !== null) {
      // update existing
      newAddresses = addresses.map((addr, idx) =>
        idx === editIndex ? { ...formData } : addr
      );
    } else {
      // add new
      newAddresses = [...addresses, { ...formData }];
    }

    try {
      const res = await fetch("/api/seller/company/updateCompany", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companyAddress: newAddresses,
          companyEmail: formData.companyEmail,
          phone: formData.phone,
          companyLogo: formData.companyLogo,
          gstinNumber: formData.gstinNumber,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setAddresses(data.company.companyAddress || []);
      setFormData({
        tagName: "",
        building: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        companyEmail: data.company.companyEmail || "",
        phone: data.company.phone || "",
        companyLogo: data.company.companyLogo || "",
        gstinNumber: data.company.gstinNumber || "",
      });
      setEditIndex(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const handleEdit = (index) => {
    setFormData({ ...addresses[index], ...formData }); // keep company fields
    setEditIndex(index);
    setShowForm(true);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Company Addresses
          </h2>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditIndex(null);
              }}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-gray-800"
            >
              <Plus size={16} /> Add Address
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSave} className="space-y-4 mt-6">
            {[
              { label: "Tag Name", name: "tagName" },
              { label: "Building", name: "building" },
              { label: "Street", name: "street" },
              { label: "City", name: "city" },
              { label: "State", name: "state" },
              { label: "Pincode", name: "pincode" },
              { label: "Country", name: "country" },
              { label: "Company Email", name: "companyEmail" },
              { label: "Phone", name: "phone" },
              { label: "Company Logo (URL)", name: "companyLogo" },
              { label: "GSTIN Number", name: "gstinNumber" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.label}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            ))}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditIndex(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800 transition"
              >
                {editIndex !== null ? "Update" : "Save"}
              </button>
            </div>
          </form>
        )}

        {/* Address List */}
        {!showForm && (
          <div className="space-y-4 mt-6">
            {addresses.map((addr, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-start"
              >
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">
                    {addr.tagName}
                  </h3>
                  <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mt-1">
                    {addr.building}, {addr.street}
                    {"\n"}
                    {addr.city}, {addr.state} {addr.pincode}
                    {"\n"}
                    {addr.country}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    <Pencil size={18} />
                  </button>
                  <button className="text-gray-600 dark:text-gray-300 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
