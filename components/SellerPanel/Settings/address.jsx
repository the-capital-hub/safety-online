"use client";
import React, { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

const Addresses = () => {
  const [addresses, setAddresses] = useState([
    {
      type: "Home Address",
      details: `Nitin Kumar
1006, Rohini Sector-16
New Delhi, Delhi 110083
India`,
    },
    {
      type: "Office Address",
      details: `Nitin Kumar
Office Address
Delhi, Delhi 110083
India`,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tag: "",
    building: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    companyEmail: "",
    phone: "",
    companyLogo: "",
    gstin: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newAddress = {
      type: formData.tag,
      details: `${formData.building}
${formData.street}
${formData.city}, ${formData.state} ${formData.pincode}
${formData.country}

Company Email: ${formData.companyEmail}
Phone: ${formData.phone}
Company Logo: ${formData.companyLogo}
GSTIN: ${formData.gstin}`,
    };
    setAddresses([...addresses, newAddress]);
    setFormData({
      tag: "",
      building: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      companyEmail: "",
      phone: "",
      companyLogo: "",
      gstin: "",
    });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Addresses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your shipping and billing addresses
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-gray-800"
            >
              <Plus size={16} /> Add Address
            </button>
          )}
        </div>

        {/* Form */}
        {showForm ? (
          <form onSubmit={handleSave} className="space-y-4 mt-6">
            {[
              { label: "Tag Name", name: "tag" },
              { label: "Building", name: "building" },
              { label: "Street", name: "street" },
              { label: "City", name: "city" },
              { label: "State", name: "state" },
              { label: "Pincode", name: "pincode" },
              { label: "Country", name: "country" },
              { label: "Company Email", name: "companyEmail" },
              { label: "Phone", name: "phone" },
              { label: "Company Logo (URL)", name: "companyLogo" },
              { label: "GSTIN Number", name: "gstin" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.label}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            ))}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800 transition"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Address Cards */}
            <div className="space-y-4 mt-6">
              {addresses.map((addr, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">
                      {addr.type}
                    </h3>
                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mt-1">
                      {addr.details}
                    </pre>
                  </div>

                  <div className="flex gap-3">
                    <button className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                      <Pencil size={18} />
                    </button>
                    <button className="text-gray-600 dark:text-gray-300 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button className="px-6 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800 transition">
                Save Addresses
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Addresses;
