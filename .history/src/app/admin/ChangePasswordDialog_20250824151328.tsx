"use client";
import React, { useState } from "react";

export default function ChangePasswordDialog({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, confirmPassword }),
    });
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to change password");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 relative">
        <h2 className="text-xl font-bold mb-2 text-orange-700">Set New Password</h2>
        <p className="text-sm text-gray-600 mb-4">Please set a new password for your admin account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            placeholder="New Password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Confirm Password"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
