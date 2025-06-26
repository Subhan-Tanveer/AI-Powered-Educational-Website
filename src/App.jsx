import React from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import CoursesSection from '@/components/sections/CoursesSection';
import AIToolsSection from '@/components/sections/AIToolsSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/layout/Footer';

function App() {
  const { toast } = useToast();

  const showComingSoonToast = () => {
    toast({
      title: "🚧 Feature Coming Soon!",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  return (
    <>
      <Helmet>
        <title>EduLearn AI - Modern Educational Platform with AI Tools</title>
        <meta name="description" content="Transform your learning experience with our AI-powered educational platform. Access personalized courses, AI tutoring, and advanced learning tools." />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <HeroSection showComingSoonToast={showComingSoonToast} />
          <AboutSection />
          <CoursesSection showComingSoonToast={showComingSoonToast} />
          <AIToolsSection showComingSoonToast={showComingSoonToast} />
          <ContactSection showComingSoonToast={showComingSoonToast} />
        </main>
        <Footer showComingSoonToast={showComingSoonToast} />
        <Toaster />
      </div>
    </>
  );
}

export default App;