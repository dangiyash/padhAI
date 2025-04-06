import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;

interface Answer {
  questionId: number;
  question: string;
  answer: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  concept: string;
}

interface LearningPathItem {
  title: string;
  description: string;
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

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid answers array" },
        { status: 400 }
      );
    }

    const prompt = `As an expert ${language} programming instructor, analyze these answers and identify:
    1. The main skill gap in the student's understanding
    2. Specific topics they need to learn to improve

    Focus on concrete programming topics and concepts rather than general learning steps.
    For each topic, explain why it's important and how it relates to their current knowledge level.

    Write the response in this exact format:

    Gap Title: [Main area needing improvement]
    Gap Detail: [Detailed explanation of the gap]

    Topics to Master:
    1. Title: [First topic to learn]
       Description: [Why this topic is important and how it relates to their current knowledge]
    2. Title: [Second topic to learn]
       Description: [Why this topic is important and how it relates to their current knowledge]
    3. Title: [Third topic to learn]
       Description: [Why this topic is important and how it relates to their current knowledge]
    4. Title: [Fourth topic to learn]
       Description: [Why this topic is important and how it relates to their current knowledge]
    5. Title: [Fifth topic to learn]
       Description: [Why this topic is important and how it relates to their current knowledge]

    Answers to evaluate:
    ${JSON.stringify(answers, null, 2)}`;

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
    console.log("Generated Analysis:", outputText);

    if (!outputText) {
      throw new Error("No analysis generated from the API response");
    }

    // Parse the response into structured format
    const lines = outputText.split('\n');
    const result = {
      skillGap: {
        title: lines.find((line: string) => line.startsWith('Gap Title:'))?.replace('Gap Title:', '').trim() || '',
        detail: lines.find((line: string) => line.startsWith('Gap Detail:'))?.replace('Gap Detail:', '').trim() || ''
      },
      learningPath: lines
        .filter((line: string) => line.match(/^\d+\. Title:/))
        .map((line: string): LearningPathItem => {
          const title = line.replace(/^\d+\. Title:/, '').trim();
          const descriptionLine = lines[lines.indexOf(line) + 1];
          const description = descriptionLine?.replace('Description:', '').trim() || '';
          return { title, description };
        })
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating analysis:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate skill gap analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 