import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import AIChatbot from './AIChatbot';
import AIQuizGenerator from './AIQuizGenerator';
import AIHomeworkHelper from './AIHomeworkHelper';
import VoiceTextTool from './VoiceTextTool';
// import PersonalizedLearningPath from './PersonalizedLearningPath';
import AIEssayGrader from './AIEssayGrader';
import HandwritingRecognition from './HandwritingRecognition';
import ContentSummarizer from './ContentSummarizer';
import CodeExplainer from './CodeExplainer';
// import StudentProgressDashboard from './StudentProgressDashboard';

const toolComponents = {
  chatbot: AIChatbot,
  quiz: AIQuizGenerator,
  homework: AIHomeworkHelper,
  voice: VoiceTextTool,
  // learning: PersonalizedLearningPath,
  grading: AIEssayGrader,
  handwriting: HandwritingRecognition,
  summarizer: ContentSummarizer,
  code: CodeExplainer,
  // dashboard: StudentProgressDashboard,
};

const AIToolDialog = ({ tool, onOpenChange, showComingSoonToast }) => {
  if (!tool) return null;

  const ToolComponent = toolComponents[tool.id];

  return (
    <Dialog open={!!tool} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className={`w-8 h-8 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mr-3`}>
              <tool.icon className="w-5 h-5 text-white" />
            </div>
            {tool.title}
          </DialogTitle>
          <DialogDescription>
            {tool.description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {ToolComponent ? <ToolComponent showComingSoonToast={showComingSoonToast} /> : <p>Coming Soon!</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIToolDialog;