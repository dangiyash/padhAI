import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");

  if (!language) {
    return NextResponse.json(
      { error: "Language parameter is required" },
      { status: 400 }
    );
  }

  // Get custom language data if it exists
  let customLanguage;
  try {
    if (typeof localStorage !== 'undefined') {
      const customData = localStorage.getItem("customLanguage");
      if (customData) {
        customLanguage = JSON.parse(customData);
      }
    }
  } catch (error) {
    console.error("Error reading custom language:", error);
  }

  // If this is a custom language and we have data for it
  if (customLanguage && language.toLowerCase() === customLanguage.name.toLowerCase()) {
    const concepts = customLanguage.concepts;
    
    // Generate questions based on the custom concepts
    const questions = concepts.map((concept: string, index: number) => ({
      id: `custom-${index + 1}`,
      question: `How familiar are you with ${concept}?`,
      options: [
        "No knowledge",
        "Basic understanding",
        "Intermediate knowledge",
        "Advanced understanding",
        "Expert level"
      ],
      concept: concept,
      difficulty: "custom"
    }));

    return NextResponse.json({ questions });
  }

  // Default questions for built-in languages
  

  const languageQuestions = questions[language.toLowerCase() as keyof typeof questions];

  if (!languageQuestions) {
    return NextResponse.json(
      { error: "Invalid language specified" },
      { status: 400 }
    );
  }

  return NextResponse.json({ questions: languageQuestions });
} 
