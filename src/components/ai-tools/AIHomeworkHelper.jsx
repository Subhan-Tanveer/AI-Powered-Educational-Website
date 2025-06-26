import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm';       // Import remark-gfm for GitHub Flavored Markdown (optional, but good for robust parsing)


const AIHomeworkHelper = ({ showComingSoonToast }) => {
  const [questionInput, setQuestionInput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetExplanation = async () => {
    if (questionInput.trim() === '') {
      setError("Please enter a question, topic, or paragraph to get an explanation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation('');

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const prompt = `Please explain the following concept, question, or paragraph in a clear, comprehensive, and understandable way, suitable for a student. Provide a detailed explanation, avoiding quiz questions or multiple-choice options.
    
    If the explanation naturally divides into multiple points or paragraphs, please separate them clearly. Use bolding for key terms or section headlines within the explanation where appropriate.

    Input: "${questionInput}"`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const rawResponse = data.candidates[0].content.parts[0].text;
        setExplanation(rawResponse);
      } else if (data.error) {
        setError(`AI Error: ${data.error.message}. Please check your API key and try again.`);
        console.error("AI API Error:", data.error);
      } else {
        setError("Received an unexpected response from the AI. Please try again.");
        console.error("Unexpected AI response structure:", data);
      }
    } catch (err) {
      setError("Failed to connect to AI service. Please check your network or API key.");
      console.error("Network or parsing error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:max-w-[800px] max-h-[70vh] overflow-y-auto p-6">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Enter your homework question, topic, or paragraph:
        </label>
        <Textarea
          id="question"
          placeholder="e.g., 'Explain Newton's First Law of Motion.' or 'What is photosynthesis?' or paste a paragraph here..."
          rows={6}
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <Button
        onClick={handleGetExplanation}
        className="w-full yellow-gradient text-white"
        disabled={isLoading || questionInput.trim() === ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Explanation...
          </>
        ) : (
          <>
            <Lightbulb className="mr-2 h-4 w-4" /> Get Help
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Display AI Explanation */}
      {explanation && (
        <Card className="mt-4 bg-gray-50">
          <CardHeader>
            {/* Made the CardTitle text explicitly bold and adjusted spacing */}
            <CardTitle className="text-lg font-bold flex items-center pb-2 border-b border-gray-200 mb-2">
              <Lightbulb className="mr-2 text-yellow-500" /> AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-100"> {/* Increased space-y for better paragraph separation */}
            {/* Use ReactMarkdown to render the explanation, assuming AI might return Markdown */}
            <div className="prose max-w-none text-gray-700"> {/* 'prose' class from @tailwindcss/typography */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIHomeworkHelper;