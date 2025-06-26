import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AIEssayGrader = ({ showComingSoonToast }) => {
  const [essayInput, setEssayInput] = useState('');
  const [gradingResult, setGradingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradingStartTime, setGradingStartTime] = useState(null); // New state to track grading start time

  // Function to save essay results to localStorage
  const saveEssayResult = (score, durationMinutes) => {
    try {
      const existingResults = JSON.parse(localStorage.getItem('essays_results') || '[]');
      const newResult = {
        score: score,
        duration: durationMinutes, // Duration in minutes
        timestamp: new Date().toISOString(),
      };
      existingResults.push(newResult);
      localStorage.setItem('essays_results', JSON.stringify(existingResults));
      console.log("Essay result saved:", newResult);
    } catch (e) {
      console.error("Failed to save essay result to localStorage:", e);
    }
  };

  const handleGradeEssay = async () => {
    if (essayInput.trim() === '') {
      setError("Please paste your essay or paragraph to get a grade.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGradingResult(null);
    setGradingStartTime(Date.now()); // Record start time when grading begins

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // *** MODIFIED PROMPT FOR MORE ROBUST JSON OUTPUT ***
    const prompt = `Your task is to act as an AI Essay Grader.
    You will receive an essay or paragraph.
    You MUST analyze it and provide a grade out of 100 for:
    - Overall Score
    - Clarity
    - Structure
    - Grammar

    Additionally, you MUST provide specific feedback categorized into three arrays:
    - "good_points": Strengths of the essay.
    - "suggestions": Areas for minor improvement or minor issues.
    - "blunders": Significant errors or major weaknesses.

    Your entire response MUST be a single, valid JSON object, and nothing else. Do not include any conversational text, introductory phrases, or explanations outside the JSON. Ensure all scores are integers (0-100). If a feedback category has no points, provide an empty array.

    Here is the EXACT JSON structure you MUST adhere to:
    {
      "overall_score": <integer>,
      "scores": {
        "clarity": <integer>,
        "structure": <integer>,
        "grammar": <integer>
      },
      "feedback": {
        "good_points": [
          "<string>",
          "<string>"
        ],
        "suggestions": [
          "<string>",
          "<string>"
        ],
        "blunders": [
          "<string>",
          "<string>"
        ]
      }
    }

    Essay/Paragraph to grade:
    "${essayInput}"`;

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
        
        // Trim whitespace from response
        rawResponse = rawResponse.trim();

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
        if (parsedResult && typeof parsedResult.overall_score === 'number' &&
            parsedResult.scores && typeof parsedResult.scores.clarity === 'number' &&
            typeof parsedResult.scores.structure === 'number' && typeof parsedResult.scores.grammar === 'number' &&
            parsedResult.feedback && Array.isArray(parsedResult.feedback.good_points) &&
            Array.isArray(parsedResult.feedback.suggestions) && Array.isArray(parsedResult.feedback.blunders)) {
          setGradingResult(parsedResult);

          // Calculate time spent and save results
          if (gradingStartTime) {
            const endTime = Date.now();
            const durationMillis = endTime - gradingStartTime;
            const durationMinutes = Math.round(durationMillis / (1000 * 60)); // Convert ms to minutes
            saveEssayResult(parsedResult.overall_score, durationMinutes);
          }
        } else {
          setError("AI returned an invalid data structure or missing required fields. Raw response in console.");
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
        <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-1">
          Paste your essay here:
        </label>
        <Textarea
          id="essay"
          placeholder="Start writing or paste your essay..."
          rows={8}
          value={essayInput}
          onChange={(e) => setEssayInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <Button
        onClick={handleGradeEssay}
        className="w-full yellow-gradient text-white"
        disabled={isLoading || essayInput.trim() === ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Grading...
          </>
        ) : (
          <>
            <GraduationCap className="mr-2 h-4 w-4" /> Grade My Essay
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {gradingResult && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center">
              <GraduationCap className="mr-2 text-blue-500" /> AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">Overall Score</p>
              <p className="text-5xl font-bold gradient-text">{gradingResult.overall_score}/100</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p>Clarity</p>
                <Progress value={gradingResult.scores.clarity} className="w-2/3" />
              </div>
              <div className="flex justify-between items-center">
                <p>Structure</p>
                <Progress value={gradingResult.scores.structure} className="w-2/3" />
              </div>
              <div className="flex justify-between items-center">
                <p>Grammar</p>
                <Progress value={gradingResult.scores.grammar} className="w-2/3" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              {/* Good Points */}
              {gradingResult.feedback.good_points.length > 0 && (
                <p className="font-semibold text-green-700">What went well:</p>
              )}
              {gradingResult.feedback.good_points.map((point, index) => (
                <div key={`good-${index}`} className="flex items-start space-x-2 text-green-600">
                  <Check className="w-4 h-4 mt-1 flex-shrink-0" />
                  <p>{point}</p>
                </div>
              ))}
              {/* Suggestions/Normal Mistakes */}
              {gradingResult.feedback.suggestions.length > 0 && (
                <p className="font-semibold text-yellow-700 mt-4">Areas for improvement:</p>
              )}
              {gradingResult.feedback.suggestions.map((suggestion, index) => (
                <div key={`suggestion-${index}`} className="flex items-start space-x-2 text-yellow-600">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <p>{suggestion}</p>
                </div>
              ))}
              {/* Blunders */}
              {gradingResult.feedback.blunders.length > 0 && (
                <p className="font-semibold text-red-700 mt-4">Major issues:</p>
              )}
              {gradingResult.feedback.blunders.map((blunder, index) => (
                <div key={`blunder-${index}`} className="flex items-start space-x-2 text-red-600">
                  <X className="w-4 h-4 mt-1 flex-shrink-0" />
                  <p>{blunder}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIEssayGrader;