'use client';

import { useState } from 'react';

export default function Assessment() {
  const [answers, setAnswers] = useState({});

  const questions = [
    { id: 1, text: 'What is your learning goal?' },
    { id: 2, text: 'How much time can you dedicate?' },
  ];

  const handleSubmit = () => {
    // Process assessment and redirect to pathway
    console.log(answers);
  };

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id} className="mb-4">
          <p>{q.text}</p>
          <input
            type="text"
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}
      <button onClick={handleSubmit} className="bg-green-500 text-white p-2 rounded">
        Submit
      </button>
    </div>
  );
}