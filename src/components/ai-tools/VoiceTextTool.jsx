import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Volume2, PlayCircle, Square, Loader2 } from 'lucide-react'; // Added Loader2 for Dictate button

const VoiceTextTool = ({ showComingSoonToast }) => {
  // --- Dictate (Voice-to-Text) States & Logic ---
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const speechRecognitionRef = useRef(null); // Ref to hold the SpeechRecognition instance

  useEffect(() => {
    // Check for browser compatibility for SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      // You might want to display a message to the user
      return;
    }

    // Initialize SpeechRecognition
    speechRecognitionRef.current = new SpeechRecognition();
    speechRecognitionRef.current.continuous = true; // Keep listening
    speechRecognitionRef.current.interimResults = true; // Show results while speaking
    speechRecognitionRef.current.lang = 'en-US'; // Set language

    // Event handler for when speech is recognized
    speechRecognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Update state with the new transcript
      setTranscribedText(finalTranscript + interimTranscript);
    };

    // Event handler for when recognition ends (e.g., microphone stops listening)
    speechRecognitionRef.current.onend = () => {
      setIsRecording(false);
      console.log('Speech recognition service disconnected.');
    };

    // Event handler for errors
    speechRecognitionRef.current.onerror = (event) => {
      setIsRecording(false);
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone permissions for this feature.");
      } else if (event.error === 'no-speech') {
        // Optionally, don't show an error if no speech was detected, just stop gracefully
        // console.warn("No speech detected. Stopping recording.");
      } else if (event.error === 'network') {
        alert("Network error during speech recognition. Please check your connection.");
      }
    };

    // Cleanup function when component unmounts
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const startRecording = () => {
    if (speechRecognitionRef.current && !isRecording) {
      setTranscribedText(''); // Clear previous text on new recording
      setIsRecording(true);
      try {
        speechRecognitionRef.current.start();
        console.log('Speech recognition started...');
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        setIsRecording(false);
        // This catch handles cases where start is called when it's already active or pending.
        // The onend/onerror handlers will typically manage the state more robustly.
      }
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current && isRecording) {
      setIsRecording(false);
      speechRecognitionRef.current.stop();
      console.log('Speech recognition stopped.');
    }
  };

  // --- Read Aloud (Text-to-Voice) States & Logic ---
  const [textToRead, setTextToRead] = useState("Hello, welcome to EduLearn AI. We are excited to help you on your learning journey.");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis); // Ref for SpeechSynthesis instance
  const utteranceRef = useRef(null); // Ref for SpeechSynthesisUtterance instance

  useEffect(() => {
    // Cleanup for speech synthesis if component unmounts while speaking
    return () => {
      if (synthRef.current && isSpeaking) {
        synthRef.current.cancel();
      }
    };
  }, [isSpeaking]); // Dependency on isSpeaking to ensure cleanup if state changes

  const readAloud = () => {
    if (!textToRead.trim()) {
      alert("Please enter text to read aloud.");
      return;
    }
    if (synthRef.current.speaking) {
      synthRef.current.cancel(); // Stop current speech if any
    }

    utteranceRef.current = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current.lang = 'en-US'; // Set language for speech
    // Optional: Set voice, pitch, rate
    // const voices = synthRef.current.getVoices();
    // utteranceRef.current.voice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google US English'));
    // utteranceRef.current.pitch = 1; // 0 to 2
    // utteranceRef.current.rate = 1;  // 0.1 to 10

    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      alert("Error reading text aloud. It might be too long or an issue with the voice service.");
    };

    synthRef.current.speak(utteranceRef.current);
  };

  const stopReading = () => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Tabs defaultValue="dictate" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="dictate"><Mic className="mr-2 h-4 w-4" />Dictate</TabsTrigger>
        <TabsTrigger value="read-aloud"><Volume2 className="mr-2 h-4 w-4" />Read Aloud</TabsTrigger>
      </TabsList>
      <TabsContent value="dictate" className="mt-4">
        <div className="space-y-4 text-center">
          <p className="text-gray-600">Click the button to start recording your voice.</p>
          {!isRecording ? (
            <Button onClick={startRecording} size="lg" className="yellow-gradient text-white">
              <Mic className="mr-2 h-5 w-5" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} size="lg" className="red-gradient text-white"> {/* Changed to red for stop */}
              <Square className="mr-2 h-5 w-5" /> Stop Recording
            </Button>
          )}
          <Textarea
            placeholder="Your transcribed text will appear here..."
            rows={8} // Increased rows
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)} // Allow manual editing
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </TabsContent>
      <TabsContent value="read-aloud" className="mt-4">
        <div className="space-y-4">
          <Textarea
            placeholder="Type or paste text here to have it read aloud..."
            rows={8} // Increased rows
            value={textToRead}
            onChange={(e) => setTextToRead(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {!isSpeaking ? (
            <Button onClick={readAloud} className="w-full yellow-gradient text-white" disabled={!textToRead.trim()}>
              <PlayCircle className="mr-2 h-5 w-5" /> Read Aloud
            </Button>
          ) : (
            <Button onClick={stopReading} className="w-full red-gradient text-white"> {/* Changed to red for stop */}
              <Square className="mr-2 h-5 w-5" /> Stop Reading
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default VoiceTextTool;