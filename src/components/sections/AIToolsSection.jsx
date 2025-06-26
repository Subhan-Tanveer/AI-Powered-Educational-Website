import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { aiTools } from '@/data/content';
import AIToolDialog from '@/components/ai-tools/AIToolDialog';

const AIToolsSection = ({ showComingSoonToast }) => {
  const [selectedTool, setSelectedTool] = useState(null);

  return (
    <>
      <section id="ai-tools" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              AI-Powered <span className="gradient-text">Learning Tools</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of education with our comprehensive suite of AI tools designed to enhance your learning journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover-lift cursor-pointer flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedTool(tool)}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{tool.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{tool.description}</p>
                <div className="flex items-center text-yellow-600 font-medium mt-auto">
                  Try Now
                  <ChevronRight className="ml-1 w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <AIToolDialog 
        tool={selectedTool} 
        onOpenChange={() => setSelectedTool(null)}
        showComingSoonToast={showComingSoonToast}
      />
    </>
  );
};

export default AIToolsSection;