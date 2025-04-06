"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface LearningPathItem {
  title: string;
  description: string;
}

interface AssessmentResult {
  skillGap: {
    title: string;
    detail: string;
  };
  learningPath: LearningPathItem[];
}

export default function LearningPathPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const language = searchParams.get("language") || "python";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const storedResult = localStorage.getItem("assessmentResult");
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch (error) {
        setError("Failed to load assessment results");
      }
    } else {
      setError("No assessment results found. Please complete an assessment first.");
    }
    setLoading(false);
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => router.push(`/assessment?language=${language}`)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Take Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your {language.charAt(0).toUpperCase() + language.slice(1)} Learning Path
        </h1>
        <p className="text-gray-600">
          Based on your assessment results, here's your personalized learning journey
        </p>
      </div>

      {result && (
        <div className="space-y-8">
          {/* Skill Gap Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Gap Analysis</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{result.skillGap.title}</h3>
                <p className="mt-2 text-gray-600">{result.skillGap.detail}</p>
              </div>
            </div>
          </div>

          {/* Learning Path Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Path to Expertise</h2>
            <div className="space-y-6">
              {result.learningPath.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push(`/assessment?language=${language}`)}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Retake Assessment
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 