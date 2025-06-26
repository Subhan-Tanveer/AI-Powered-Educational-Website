import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = ({ showComingSoonToast }) => {
  return (
    <section id="home" className="pt-16 min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Learn Smarter with{' '}
              <span className="gradient-text">AI Power</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transform your educational journey with our cutting-edge AI tools, personalized learning paths, and interactive courses designed for students of all ages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="yellow-gradient text-white hover:opacity-90 pulse-yellow"
                onClick={showComingSoonToast}
              >
                Start Learning Today
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={showComingSoonToast}
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="floating-animation">
              <img 
                alt="Students learning with AI technology"
                className="w-full h-auto rounded-2xl shadow-2xl" src="https://images.unsplash.com/photo-1603201667141-5a2d4c673378" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;