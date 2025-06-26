import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

const AIQuizGenerator = ({ showComingSoonToast }) => {
  // State for user inputs
  const [topicInput, setTopicInput] = useState('');
  const [numQuestions, setNumQuestions] = useState('5'); // Default to 5 questions
  const [difficulty, setDifficulty] = useState('Medium'); // Default to Medium difficulty

  // State for generated quiz and user answers
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // Stores { questionId: selectedOptionIndex }
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null); // New state to track quiz start time

  // Function to save quiz results to localStorage
  const saveQuizResult = (finalScore, totalQuestions, topic, durationMinutes) => {
    try {
      const existingResults = JSON.parse(localStorage.getItem('quizzes_results') || '[]');
      const newResult = {
        score: Math.round((finalScore / totalQuestions) * 100), // Convert to percentage out of 100
        subject: topic, // Use the topic as the subject
        duration: durationMinutes, // Duration in minutes
        timestamp: new Date().toISOString(),
      };
      existingResults.push(newResult);
      localStorage.setItem('quizzes_results', JSON.stringify(existingResults));
      console.log("Quiz result saved:", newResult);
    } catch (e) {
      console.error("Failed to save quiz result to localStorage:", e);
    }
  };

  const handleGenerateQuiz = async () => {
    if (topicInput.trim() === '') {
      setError("Please enter a topic or paste a paragraph to generate a quiz.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuizQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setQuizStartTime(Date.now()); // Record start time when quiz generation begins

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`; // Using gemini-1.0-pro for robust text generation for quizzes

    const prompt = `Generate a multiple-choice quiz based on the following text/topic: "${topicInput}".
Difficulty: ${difficulty}.
Number of questions: ${numQuestions}.

Provide the output in a strict JSON format, ensuring that the "correct_answer_index" refers to the 0-based index of the correct option in the "options" array. Each question must have exactly 4 options.

Example JSON structure:
{
  "quiz": [
    {
      "question": "What is the capital of France?",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correct_answer_index": 2
    },
    {
      "question": "Which planet is known as the Red Planet?",
      "options": ["Earth", "Mars", "Jupiter", "Venus"],
      "correct_answer_index": 1
    }
  ]
}

Ensure the generated JSON is valid and adheres to the structure above.`;

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
        const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
        let quizData;
        if (jsonMatch && jsonMatch[1]) {
            quizData = JSON.parse(jsonMatch[1]);
        } else {
            try {
                quizData = JSON.parse(rawResponse);
            } catch (jsonParseError) {
                setError("Failed to parse AI response as JSON. The format might be incorrect. Please try again or simplify your request.");
                console.error("JSON parsing error:", jsonParseError, "Raw AI response:", rawResponse);
                setIsLoading(false);
                return;
            }
        }

        if (quizData && Array.isArray(quizData.quiz)) {
          const questionsWithIds = quizData.quiz.map((q, index) => ({
            ...q,
            id: `q${index}`,
          }));
          setQuizQuestions(questionsWithIds);
        } else {
          setError("Failed to parse quiz data from AI response. The AI might not have returned valid JSON. Please try again or refine your input.");
          console.error("AI response did not contain a valid quiz array:", quizData);
        }
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

  const handleAnswerChange = (questionId, selectedOptionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(selectedOptionIndex, 10),
    }));
  };

  const handleCheckAnswers = () => {
    let correctCount = 0;
    quizQuestions.forEach(question => {
      if (userAnswers.hasOwnProperty(question.id)) {
        if (userAnswers[question.id] === question.correct_answer_index) {
          correctCount++;
        }
      }
    });
    setScore(correctCount);
    setShowResults(true);

    // Calculate time spent and save results
    if (quizStartTime) {
      const endTime = Date.now();
      const durationMillis = endTime - quizStartTime;
      const durationMinutes = Math.round(durationMillis / (1000 * 60)); // Convert ms to minutes
      saveQuizResult(correctCount, quizQuestions.length, topicInput, durationMinutes);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:max-w-[800px] max-h-[70vh] overflow-y-auto p-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
          Enter a topic or paste a paragraph:
        </label>
        <Textarea
          id="topic"
          placeholder="e.g., 'The process of photosynthesis' or paste text here..."
          rows={5}
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Using native HTML <select> for Number of Questions */}
      <div>
        <Label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 mb-1">
          Number of Questions:
        </Label>
        <select
          id="num-questions"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
      </div>

      {/* Using native HTML <select> for Difficulty */}
      <div>
        <Label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
          Difficulty:
        </Label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <Button
        onClick={handleGenerateQuiz}
        className="w-full yellow-gradient text-white"
        disabled={isLoading || topicInput.trim() === ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" /> Generate Quiz
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Dynamically Generated Quiz Section */}
      {quizQuestions.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Generated Quiz</CardTitle>
          </CardHeader>
          {/* This CardContent has the scrolling for the quiz questions only */}
          <CardContent className="space-y-6 max-h-[50vh] overflow-y-auto p-4">
            {quizQuestions.map((q, qIndex) => (
              <div key={q.id}>
                <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                <div className="mt-2 space-y-2">
                  {q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center space-x-2 p-2 rounded-md transition-colors cursor-pointer
                        ${showResults
                          ? (optIndex === q.correct_answer_index
                            ? 'bg-green-100 border border-green-300'
                            : (userAnswers[q.id] === optIndex
                               ? 'bg-red-100 border border-red-300'
                               : 'bg-gray-50 hover:bg-gray-100'))
                          : 'bg-gray-50 hover:bg-gray-100'
                        }
                        ${!showResults && userAnswers[q.id] === optIndex ? 'bg-blue-100' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        id={`${q.id}-${optIndex}`}
                        name={`question-${q.id}`}
                        value={optIndex.toString()}
                        checked={userAnswers[q.id]?.toString() === optIndex.toString()}
                        onChange={() => handleAnswerChange(q.id, optIndex)}
                        disabled={isLoading || showResults}
                        className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`${q.id}-${optIndex}`} className="flex-1 cursor-pointer">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {!showResults && (
              <div className="p-4 border-t"> {/* Corrected: Removed mb-200, adjusted margin to just p-4 */}
                <Button
                  onClick={handleCheckAnswers}
                  className="w-full yellow-gradient text-white"
                  disabled={Object.keys(userAnswers).length !== quizQuestions.length || quizQuestions.length === 0}
                >
                  Check Answers
                </Button>
              </div>
            )}
            {showResults && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
                <p className="text-lg font-semibold">
                  You scored {score} out of {quizQuestions.length} correct!
                </p>
                <Button
                  onClick={() => {
                    setQuizQuestions([]);
                    setTopicInput('');
                    setNumQuestions('5');
                    setDifficulty('Medium');
                    setUserAnswers({});
                    setShowResults(false);
                    setScore(0);
                    setError(null);
                    setQuizStartTime(null); // Reset start time
                  }}
                  className="mt-2 text-blue-600 hover:underline" // Corrected: Removed mb-40, let parent control spacing, if needed add pb-40 to the parent div containing the Card
                  variant="link"
                >
                  Generate New Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIQuizGenerator;