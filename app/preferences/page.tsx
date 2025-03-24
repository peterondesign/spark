"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon } from "../components/icons";
import Header from "../components/Header";

type Question = {
  id: string;
  text: string;
  type: "text" | "select" | "multiselect" | "range";
  options?: string[];
  min?: number;
  max?: number;
};

export default function Preferences() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);

  // List of questions for the questionnaire
  const questions: Question[] = [
    {
      id: "location",
      text: "Where do you live? (City and Country)",
      type: "text",
    },
    {
      id: "relationship_status",
      text: "What's your relationship status?",
      type: "select",
      options: [
        "Single and dating",
        "In a new relationship",
        "Long-term relationship",
        "Married",
        "It's complicated",
      ],
    },
    {
      id: "budget",
      text: "What's your typical budget for a date?",
      type: "select",
      options: [
        "Budget-friendly (under $20)",
        "Moderate ($20-$50)",
        "Special occasion ($50-$100)",
        "Luxurious ($100+)",
      ],
    },
    {
      id: "interests",
      text: "What activities do you enjoy together? (Select all that apply)",
      type: "multiselect",
      options: [
        "Outdoor adventures",
        "Food & Dining",
        "Arts & Culture",
        "Sports & Fitness",
        "Movies & Entertainment",
        "Learning & Workshops",
        "Relaxation & Wellness",
        "Travel & Getaways",
      ],
    },
    {
      id: "new_experiences",
      text: "What is something new you're open to trying?",
      type: "text",
    },
    {
      id: "favorite_date",
      text: "Describe your ideal or favorite date experience so far:",
      type: "text",
    },
    {
      id: "adventure_comfort",
      text: "How adventurous are you with new date experiences?",
      type: "range",
      min: 1,
      max: 5,
    },
    {
      id: "planning_preference",
      text: "Do you prefer spontaneous or planned date activities?",
      type: "select",
      options: [
        "Very spontaneous",
        "Somewhat spontaneous",
        "Balance of both",
        "Somewhat planned",
        "Meticulously planned",
      ],
    },
    {
      id: "special_considerations",
      text: "Any special considerations we should know about? (e.g., accessibility needs, dietary restrictions)",
      type: "text",
    },
    {
      id: "goals",
      text: "What are you hoping to get from your dating experiences?",
      type: "select",
      options: [
        "Fun and entertainment",
        "Deeper connection",
        "New experiences",
        "Romance and intimacy",
        "Quality time together",
        "All of the above",
      ],
    },
  ];

  // Load answers from localStorage on component mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem("datePreferences");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    // Check if all questions are answered
    const savedComplete = localStorage.getItem("preferencesComplete");
    if (savedComplete === "true") {
      setIsComplete(true);
    }
  }, []);

  // Handle answer updates
  const handleAnswerChange = (questionId: string, value: any) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);
    localStorage.setItem("datePreferences", JSON.stringify(updatedAnswers));
  };

  // Handle checkbox selection for multiselect
  const handleCheckboxChange = (questionId: string, option: string) => {
    const currentSelections = answers[questionId] || [];
    let updatedSelections;

    if (currentSelections.includes(option)) {
      updatedSelections = currentSelections.filter((item: string) => item !== option);
    } else {
      updatedSelections = [...currentSelections, option];
    }

    handleAnswerChange(questionId, updatedSelections);
  };

  // Handle next button click
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the questionnaire
      setIsComplete(true);
      localStorage.setItem("preferencesComplete", "true");
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Clear all saved preferences
  const clearPreferences = () => {
    localStorage.removeItem("datePreferences");
    localStorage.removeItem("preferencesComplete");
    setAnswers({});
    setIsComplete(false);
    setCurrentStep(0);
  };

  // Render input based on question type
  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
          />
        );

      case "select":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`${question.id}_${option}`}
                  name={question.id}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-gray-300"
                  checked={answers[question.id] === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                />
                <label htmlFor={`${question.id}_${option}`} className="ml-2 text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${question.id}_${option}`}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-gray-300 rounded"
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={() => handleCheckboxChange(question.id, option)}
                />
                <label htmlFor={`${question.id}_${option}`} className="ml-2 text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case "range":
        return (
          <div className="w-full">
            <input
              type="range"
              min={question.min || 1}
              max={question.max || 5}
              value={answers[question.id] || (question.min || 1)}
              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Less adventurous</span>
              <span>Very adventurous</span>
            </div>
            <div className="text-center font-medium mt-2">
              {answers[question.id] || (question.min || 1)}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render the completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation - Made Sticky */}
        <Header />

        <div className="max-w-3xl mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Preferences Saved!</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Thanks for sharing your preferences. We'll use this information to personalize your date recommendations.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Preferences Summary</h2>

            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <p className="text-sm font-medium text-gray-500">{question.text}</p>
                  <p className="text-gray-800 mt-1">
                    {question.type === "multiselect"
                      ? (answers[question.id] || []).join(", ") || "Not specified"
                      : answers[question.id] || "Not specified"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={clearPreferences}
              className="px-6 py-3 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Reset Preferences
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render the questionnaire
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Made Sticky */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <HeartIcon className="h-8 w-8 text-rose-500" />
            <span className="ml-2 text-xl font-bold text-gray-800">Spark</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Personalize Your Date Recommendations</h1>
          <p className="text-gray-600">
            Answer a few questions to help us tailor date ideas specifically for you.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Question {currentStep + 1} of {questions.length}
        </p>

        {/* Current Question */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {questions[currentStep].text}
          </h2>

          {renderQuestionInput(questions[currentStep])}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${currentStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
          >
            Previous
          </button>

          <div className="flex gap-4">
            <button
              onClick={clearPreferences}
              className="px-6 py-3 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
            >
              {currentStep < questions.length - 1 ? "Next" : "Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
