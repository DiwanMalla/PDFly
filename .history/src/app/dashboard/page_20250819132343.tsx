"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tools = [
    {
      name: "Merge PDF",
      description: "Combine multiple PDF files into one",
      icon: "📄",
      href: "/tools/merge",
      color: "bg-blue-500",
    },
    {
      name: "Split PDF",
      description: "Split a PDF into multiple files",
      icon: "✂️",
      href: "/tools/split",
      color: "bg-green-500",
    },
    {
      name: "Compress PDF",
      description: "Reduce PDF file size",
      icon: "🗜️",
      href: "/tools/compress",
      color: "bg-purple-500",
    },
    {
      name: "Convert PDF",
      description: "Convert PDF to other formats",
      icon: "🔄",
      href: "/tools/convert",
      color: "bg-orange-500",
    },
    {
      name: "Edit PDF",
      description: "Edit text and images in PDF",
      icon: "✏️",
      href: "/tools/edit",
      color: "bg-red-500",
    },
    {
      name: "OCR PDF",
      description: "Extract text from scanned PDFs",
      icon: "🔍",
      href: "/tools/ocr",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">PDFly</h1>
            </div>
            <div className="flex items-center space-x-4">
                <Image
                  className="h-8 w-8 rounded-full"
                  src={session.user?.image || "/default-avatar.png"}
                  alt={session.user?.name || "User"}
                  width={32}
                  height={32}
                  priority
                />
                />
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to PDFly, {session.user?.name}!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Choose a tool to start processing your PDFs
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="px-4 py-6 sm:px-0">
          <h3 className="text-lg font-medium text-gray-900 mb-6">PDF Tools</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link key={tool.name} href={tool.href} className="block group">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 ${tool.color} rounded-md p-3`}
                      >
                        <span className="text-2xl">{tool.icon}</span>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                          {tool.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="px-4 py-6 sm:px-0">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Recent Documents
          </h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
              <p>No documents yet. Start by uploading a PDF!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
