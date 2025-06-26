import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Lightbulb, Loader2 } from 'lucide-react'; // Added Loader2
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // For code highlighting
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // A dark theme for the code

const CodeExplainer = ({ showComingSoonToast }) => {
  // State for user code input
  const [codeInput, setCodeInput] = useState('');
  // State for AI explanation result (array of strings)
  const [explanationResult, setExplanationResult] = useState(null); // Will store the array of bullet points
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExplainCode = async () => {
    if (codeInput.trim() === '') {
      setError("Please paste some code to explain.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanationResult(null); // Clear previous results

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`; // Using gemini-1.0-pro

    const prompt = `Your task is to explain the provided code snippet in clear, concise bullet points.
    For each line of code or logical block, provide a separate explanation bullet point.
    Your entire response MUST be a single, valid JSON object, and nothing else.
    The JSON object MUST contain a single key "explanation_points" which is an array of strings.
    Each string in the array should represent one explanation bullet point, prefixed with a blue diamond emoji (🔹).

    Example JSON structure:
    {
      "explanation_points": [
        "🔹 This line declares a variable.",
        "🔹 This block performs a calculation.",
        "🔹 This function returns a value."
      ]
    }

    Here is the code snippet to explain:
    \`\`\`
    ${codeInput}
    \`\`\``;

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
        if (parsedResult && Array.isArray(parsedResult.explanation_points) && parsedResult.explanation_points.every(item => typeof item === 'string')) {
          setExplanationResult(parsedResult.explanation_points); // Set only the array of points
        } else {
          setError("AI returned an invalid data structure for the explanation. Raw response in console.");
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

  // Function to guess the language for syntax highlighting (basic heuristic)
  const guessLanguage = (code) => {
    if (code.includes('function') || code.includes('console.log') || code.includes('const') || code.includes('let') || code.includes('var')) return 'javascript';
    if (code.includes('#include') || code.includes('main()') || code.includes('printf')) return 'c';
    if (code.includes('public static void main') || code.includes('System.out.println')) return 'java';
    if (code.includes('def ') || code.includes('print(') || code.includes('import ')) return 'python';
    if (code.includes('<?php')) return 'php';
    if (code.includes('<html')) return 'html';
    if (code.includes('body {')) return 'css';
    return 'plaintext'; // Default to plaintext if no specific language is detected
  };

  return (
    <div className="space-y-4 p-4 sm:max-w-[800px] max-h-[70vh] overflow-y-auto p-6">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          Paste your code snippet here:
        </label>
        <Textarea
          id="code"
          placeholder="function helloWorld() { console.log('Hello, World!'); }"
          rows={8}
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono" // Added font-mono
        />
      </div>
      <Button
        onClick={handleExplainCode}
        className="w-full yellow-gradient text-white"
        disabled={isLoading || codeInput.trim() === ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Explaining...
          </>
        ) : (
          <>
            <Lightbulb className="mr-2 h-4 w-4" /> Explain Code
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Display AI Explanation */}
      {explanationResult && (
        <Card className="mt-4 bg-gray-900 text-white"> {/* Changed background to dark for code explanation */}
          <CardHeader>
            <CardTitle className="text-lg flex items-center font-bold text-white">
              <Code className="mr-2 text-purple-400" /> AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display the original code with syntax highlighting */}
            <div className="rounded-lg overflow-hidden border border-gray-700">
              <SyntaxHighlighter
                language={guessLanguage(codeInput)}
                style={atomDark}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  padding: '1rem',
                  backgroundColor: '#2d2d2d', // Match Card bg if needed, or keep theme default
                  fontSize: '0.875rem', // text-sm
                }}
                lineProps={{
                  style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' }
                }}
              >
                {codeInput.trim()}
              </SyntaxHighlighter>
            </div>

            {/* Display the explanation points */}
            <ul className="space-y-2 text-gray-200">
              {explanationResult.map((point, index) => (
                <li key={index} className="flex items-start">
                  {/* Using a span for the diamond to ensure correct spacing with text */}
                  <span className="mr-2 flex-shrink-0" style={{ color: '#60a5fa' }}>🔹</span> {/* Blue diamond emoji */}
                  <p className="flex-grow">{point.startsWith('🔹') ? point.substring(1).trim() : point}</p> {/* Remove leading diamond if AI adds it */}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeExplainer;