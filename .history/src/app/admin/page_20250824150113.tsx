import { Suggestion } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import React from "react";

async function getSuggestions(): Promise<Suggestion[]> {
  return await prisma.suggestion.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function AdminPage() {
  const suggestions = await getSuggestions();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-orange-700">
        Suggestions & Bug Reports
      </h1>
      <div className="space-y-6">
        {suggestions.length === 0 ? (
          <p className="text-gray-500">No suggestions or bug reports yet.</p>
        ) : (
          suggestions.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-orange-700">
                  {s.name || "Anonymous"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-1">{s.message}</div>
              {s.email && (
                <a
                  href={`mailto:${s.email}`}
                  className="text-xs text-blue-600 underline"
                >
                  {s.email}
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
