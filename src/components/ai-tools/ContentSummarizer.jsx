import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, List, Loader2 } from 'lucide-react'; // Added Loader2 for loading state

const ContentSummarizer = ({ showComingSoonToast }) => {
  // State for user input content
  const [contentInput, setContentInput] = useState('');
  // State for AI summary result (array of strings)
  const [summaryResult, setSummaryResult] = useState(null); // Will store the array of bullet points
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSummarizeContent = async () => {
    if (contentInput.trim() === '') {
      setError("Please paste some content to summarize.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummaryResult(null); // Clear previous results

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`; // Using gemini-1.0-pro for text tasks

    const prompt = `Your task is to summarize the following article/notes into a concise list of key bullet points.
    Your entire response MUST be a single, valid JSON object, and nothing else.
    The JSON object MUST contain a single key "summary_points" which is an array of strings.
    Each string in the array should be a concise summary point.

    Example JSON structure:
    {
      "summary_points": [
        "First key point of the summary.",
        "Second key point, very concise.",
        "Third key insight or conclusion."
      ]
    }

    Here is the content to summarize:
    "${contentInput}"`;

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
        let rawResponse = data.candidates[0].content.parts[0].text;
        rawResponse = rawResponse.trim(); // Trim whitespace

        let parsedResult;
        // Attempt to parse JSON. Model sometimes wraps JSON in markdown code block.
        const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            parsedResult = JSON.parse(jsonMatch[1]);
        } else {
            // Fallback for cases where AI might return JSON directly without a markdown block.
            try {
                parsedResult = JSON.parse(rawResponse);
            } catch (jsonParseError) {
                setError("Failed to parse AI response as JSON. The format might be incorrect. Raw response in console.");
                console.error("JSON parsing error:", jsonParseError, "Raw AI response:", rawResponse);
                setIsLoading(false);
                return;
            }
        }

        // Validate the parsed structure
        if (parsedResult && Array.isArray(parsedResult.summary_points) && parsedResult.summary_points.every(item => typeof item === 'string')) {
          setSummaryResult(parsedResult.summary_points); // Set only the array of points
        } else {
          setError("AI returned an invalid data structure for the summary. Raw response in console.");
          console.error("AI response did not contain expected structure:", parsedResult, "Raw AI response:", rawResponse);
        }

      } else if (data.error) {
        setError(`AI Error: ${data.error.message}. Please check your API key and try again.`);
        console.error("AI API Error:", data.error);
      } else {
        setError("Received an unexpected response from the AI. Raw response in console.");
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
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Paste your article or notes here:
        </label>
        <Textarea
          id="content"
          placeholder="Paste a long paragraph or article..."
          rows={8}
          value={contentInput}
          onChange={(e) => setContentInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <Button
        onClick={handleSummarizeContent}
        className="w-full yellow-gradient text-white"
        disabled={isLoading || contentInput.trim() === ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...
          </>
        ) : (
          <>
            <FileSearch className="mr-2 h-4 w-4" /> Summarize Content
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Display AI Summary when summaryResult is available */}
      {summaryResult && (
        <Card className="mt-4 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center font-bold">
              <List className="mr-2 text-blue-500" /> AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {summaryResult.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentSummarizer;