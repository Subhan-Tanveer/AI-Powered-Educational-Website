import React from 'react';
import { 
  MessageCircle, 
  Brain, 
  FileText, 
  Mic, 
  Target, 
  GraduationCap, 
  Image, 
  FileSearch, 
  Code, 
  BarChart3
} from 'lucide-react';

export const aiTools = [
  {
    id: 'chatbot',
    title: 'AI Chatbot Assistant',
    description: 'Get instant help with your studies through our intelligent virtual assistant.',
    icon: MessageCircle,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'quiz',
    title: 'AI Quiz Generator',
    description: 'Create personalized quizzes from any text or topic instantly.',
    icon: Brain,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'homework',
    title: 'Homework Helper',
    description: 'Get step-by-step solutions and explanations for your assignments.',
    icon: FileText,
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'voice',
    title: 'Voice-to-Text & Text-to-Voice',
    description: 'Convert speech to text and text to speech for better accessibility.',
    icon: Mic,
    color: 'from-red-400 to-red-600'
  },
  {
    id: 'learning',
    title: 'Personalized Learning Path',
    description: 'Get customized learning recommendations based on your progress.',
    icon: Target,
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 'grading',
    title: 'Essay Grading Assistant',
    description: 'Receive detailed feedback and scores on your written assignments.',
    icon: GraduationCap,
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'handwriting',
    title: 'Handwriting Recognition',
    description: 'Convert handwritten notes to digital text using image upload.',
    icon: Image,
    color: 'from-pink-400 to-pink-600'
  },
  {
    id: 'summarizer',
    title: 'Content Summarizer',
    description: 'Get concise summaries of articles, notes, and study materials.',
    icon: FileSearch,
    color: 'from-teal-400 to-teal-600'
  },
  {
    id: 'code',
    title: 'Code Explainer AI',
    description: 'Understand programming concepts with detailed code explanations.',
    icon: Code,
    color: 'from-cyan-400 to-cyan-600'
  },
  {
    id: 'dashboard',
    title: 'Performance Dashboard',
    description: 'Track your learning progress with detailed analytics and insights.',
    icon: BarChart3,
    color: 'from-yellow-400 to-yellow-600'
  }
];

export const courses = [
  {
    title: 'Mathematics Fundamentals',
    description: 'Master essential math concepts from basic arithmetic to advanced calculus.',
    duration: '12 weeks',
    level: 'Beginner to Advanced',
    students: 2847
  },
  {
    title: 'Science & Physics',
    description: 'Explore the wonders of physics and natural sciences with interactive experiments.',
    duration: '10 weeks',
    level: 'Intermediate',
    students: 1923
  },
  {
    title: 'Programming & Computer Science',
    description: 'Learn coding fundamentals and computer science principles.',
    duration: '16 weeks',
    level: 'Beginner',
    students: 3456
  },
  {
    title: 'Language Arts & Literature',
    description: 'Improve your writing, reading comprehension, and literary analysis skills.',
    duration: '8 weeks',
    level: 'All Levels',
    students: 1654
  }
];