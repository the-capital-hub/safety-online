"use client";
import React, { useState } from "react";

const ShopForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [gstinNumber, setGstinNumber] = useState("");
  const [addresses, setAddresses] = useState([
    { tag: "", building: "", street: "", city: "", state: "", pincode: "", country: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddressChange = (index, field, value) => {
    const updated = [...addresses];
    updated[index][field] = value;
    setAddresses(updated);
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      { tag: "", building: "", street: "", city: "", state: "", pincode: "", country: "" },
    ]);
  };

  const removeAddress = (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/seller/company/createCompany", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // send cookie
        body: JSON.stringify({
          companyName,
          companyEmail,
          phone,
          companyLogo,
          gstinNumber,
          companyAddress: addresses,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessage(" Company created successfully!");
    } catch (err) {
      setMessage( err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-8 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* GSTIN Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              GSTIN Number
            </label>
            <input
              type="text"
              placeholder="GSTIN Number"
              value={gstinNumber}
              onChange={(e) => setGstinNumber(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company Logo (URL)
            </label>
            <input
              type="text"
              placeholder="https://example.com/logo.png"
              value={companyLogo}
              onChange={(e) => setCompanyLogo(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Addresses */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
              Addresses
            </h3>
            {addresses.map((addr, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="Tag (Home/Office)"
                  value={addr.tag}
                  onChange={(e) =>
                    handleAddressChange(index, "tag", e.target.value)
                  }
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                />
                <input
                  type="text"
                  placeholder="Building"
                  value={addr.building}
                  onChange={(e) =>
                    handleAddressChange(index, "building", e.target.value)
                  }
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                />
                <input
                  type="text"
                  placeholder="Street"
                  value={addr.street}
                  onChange={(e) =>
                    handleAddressChange(index, "street", e.target.value)
                  }
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addr.city}
                  onChange={(e) =>
                    handleAddressChange(index, "city", e.target.value)
                  }
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addr.state}
                  onChange={(e) =>
                    handleAddressChange(index, "state", e.target.value)
                  }
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={addr.pincode}
                  onChange={(e) =>
                    handleAddressChange(index, "pincode", e.target.value)
                  }
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={addr.country}
                  onChange={(e) =>
                    handleAddressChange(index, "country", e.target.value)
                  }
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                />

                {addresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAddress(index)}
                    className="text-red-500 text-sm mt-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addAddress}
              className="mt-2 text-sm text-blue-600"
            >
              + Add Another Address
            </button>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Company"}
            </button>
          </div>

          {message && (
            <p className="mt-3 text-sm text-center">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ShopForm;
