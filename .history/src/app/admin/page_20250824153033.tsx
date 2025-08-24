"use client";
import { Suggestion } from "@prisma/client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState("suggestions");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!adminLoggedIn) {
      router.push("/admin/login");
      return;
    }

    fetchSuggestions();
  }, [router]);

  async function fetchSuggestions() {
    try {
      const res = await fetch("/api/admin/suggestions");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminEmail");
    router.push("/admin/login");
  }

  const tabs = [
    { id: "suggestions", label: "Suggestions & Bugs", icon: "💬" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">PDFly Admin</h1>
                <p className="text-sm text-gray-600">Management Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin/change-password")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "suggestions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Suggestions & Bug Reports
              </h2>
              <div className="text-sm text-gray-600">
                Total: {suggestions.length} submissions
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No submissions yet
                    </h3>
                    <p className="text-gray-600">
                      Suggestions and bug reports will appear here.
                    </p>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-medium text-sm">
                              {suggestion.name
                                ? suggestion.name.charAt(0).toUpperCase()
                                : "A"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {suggestion.name || "Anonymous"}
                            </h3>
                            {suggestion.email && (
                              <a
                                href={`mailto:${suggestion.email}`}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                {suggestion.email}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {new Date(suggestion.createdAt).toLocaleDateString()}
                          </span>
                          <select
                            value={suggestion.status}
                            onChange={async (e) => {
                              const status = e.target.value;
                              await fetch('/api/admin/suggestions/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: suggestion.id, status }),
                              });
                              fetchSuggestions();
                            }}
                            className="mt-1 px-2 py-1 rounded border border-gray-300 text-xs text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="read">Read</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {suggestion.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Account Settings
                  </h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => router.push("/admin/change-password")}
                      className="flex items-center space-x-3 w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">🔑</span>
                      <div>
                        <div className="font-medium text-gray-800">
                          Change Password
                        </div>
                        <div className="text-sm text-gray-600">
                          Update your admin password
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    System Info
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-800">Admin Email:</span>
                        <span className="ml-2 font-bold text-gray-900">
                          {sessionStorage.getItem("adminEmail")}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-800">
                          Total Suggestions:
                        </span>
                        <span className="ml-2 font-bold text-gray-900">
                          {suggestions.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
