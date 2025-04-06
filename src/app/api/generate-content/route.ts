import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  try {
    const { title, language } = await req.json();
    if (!title || !language) {
      return NextResponse.json(
        { error: "Missing required fields: title and language" },
        { status: 400 }
      );
    }

    const prompt = `Generate detailed learning content about ${title} in ${language}. 
    Include examples, explanations, and best practices. 
    Format the content in markdown.
    
    The content should be comprehensive and include:
    1. Introduction to the concept
    2. Detailed explanation with examples
    3. Best practices and common pitfalls
    4. Practical applications
    5. Code examples where applicable`;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content generated");
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 