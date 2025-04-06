"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const languages = [
  {
    name: "Python",
    icon: "🐍",
    description: "A versatile and beginner-friendly programming language",
  },
  {
    name: "C++",
    icon: "⚡",
    description: "A powerful language for system programming and game development",
  },
  {
    name: "C",
    icon: "🔧",
    description: "The foundation of modern programming languages",
  },
];

export default function LanguagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Choose a Programming Language
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {languages.map((language) => (
          <button
            key={language.name}
            onClick={() => router.push(`/assessment?language=${language.name.toLowerCase()}`)}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-500"
          >
            <div className="text-4xl mb-4">{language.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {language.name}
            </h2>
            <p className="text-gray-600">{language.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
} 