import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;

interface Question {
  id: number;
  question: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  concept: string;
}

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  try {
    const { language, answers } = await req.json();
    
    if (!language) {
      return NextResponse.json(
        { error: "Missing required field: language" },
        { status: 400 }
      );
    }

    // Make answers optional
    const prompt = answers && Array.isArray(answers) && answers.length > 0
      ? `Generate 5 ${language} programming questions based on these previous answers: ${JSON.stringify(answers)}. Each question should:
        1. Be clear and concise
        2. Test a specific programming concept
        3. Be suitable for a programming assessment
        4. Not include any answers or explanations
        5. Build upon the concepts shown in the previous answers`
      : `Generate 5 ${language} programming questions. Each question should:
        1. Be clear and concise
        2. Test a specific programming concept
        3. Be suitable for a programming assessment
        4. Not include any answers or explanations
        5. Cover fundamental programming concepts
        
        Format each question as a numbered list (1., 2., etc.)`;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API Response:", data);

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Generated Text:", outputText);

    if (!outputText) {
      throw new Error("No questions generated from the API response");
    }

    // Extract questions and format them
    const questions: Question[] = outputText
      .split("\n")
      .map((q: string) => q.trim())
      .filter((q: string) => q.match(/^(\d+\..*)|(^Question \d+:.*)/))
      .map((q: string, index: number) => ({
        id: index + 1,
        question: q.replace(/^(\d+\.\s*)|(^Question \d+:\s*)/, ""),
        difficulty: index < 2 ? "beginner" : index < 4 ? "intermediate" : "advanced",
        concept: "General Programming"
      }));

    if (questions.length === 0) {
      throw new Error("No valid questions found in the response");
    }

    console.log("Formatted Questions:", questions);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate questions",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 