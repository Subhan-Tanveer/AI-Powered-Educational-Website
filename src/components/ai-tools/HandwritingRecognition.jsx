import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, Image as ImageIcon } from 'lucide-react'; // Added Loader2 and ImageIcon for preview
import { Textarea } from '@/components/ui/textarea'; // Import Textarea for the output

const HandwritingRecognition = ({ showComingSoonToast }) => {
  // State for the selected file and its preview
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  // State for the recognized text
  const [recognizedText, setRecognizedText] = useState('');
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a PNG, JPG, or GIF image.");
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) { // 10MB in bytes
        setError("File size exceeds 10MB. Please upload a smaller image.");
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        return;
      }

      setError(null);
      setSelectedImageFile(file);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setError(null);
    }
  };

  const handleRecognizeText = async () => {
    if (!selectedImageFile) {
      setError("Please select an image file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecognizedText(''); // Clear previous text

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`; // Use gemini-pro-vision for image input

    // Read file as base64 for API payload
    const reader = new FileReader();
    reader.readAsDataURL(selectedImageFile);

    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1]; // Get base64 string without data:image/... part

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: "Extract all text from this image, including any handwritten text. Provide only the extracted text and nothing else.",
              },
              {
                inlineData: {
                  mimeType: selectedImageFile.type,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
          const extractedText = data.candidates[0].content.parts[0].text;
          setRecognizedText(extractedText);
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

    reader.onerror = (err) => {
      setError("Failed to read image file.");
      console.error("FileReader error:", err);
      setIsLoading(false);
    };
  };

  return (
    <div className="space-y-4 p-4 sm:max-w-[800px] max-h-[70vh] overflow-y-auto p-6">
      <Card className="border-2 border-dashed">
        <CardContent className="p-6 text-center">
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="Selected Preview" className="mx-auto max-h-48 object-contain mb-4 border rounded" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {selectedImageFile ? selectedImageFile.name : "Upload a file"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
          <div className="mt-6">
            {/* Hidden file input */}
            <Input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".png,.jpg,.jpeg,.gif"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <Button
              onClick={() => fileInputRef.current?.click()} // Trigger click on hidden input
              className="yellow-gradient text-white"
              disabled={isLoading}
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Select Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedImageFile && ( // Only show "Recognize Text" button if an image is selected
        <Button
          onClick={handleRecognizeText}
          className="w-full yellow-gradient text-white"
          disabled={isLoading || !selectedImageFile}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recognizing...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" /> Recognize Text
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="p-3 text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Display Recognized Text */}
      {recognizedText && (
        <Card className="mt-4 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center font-bold">
              <FileText className="mr-2 text-blue-500" /> Recognized Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={recognizedText}
              readOnly
              rows={8} // Increased rows for more text
              className="font-mono text-gray-700 p-2 border border-gray-300 rounded-md bg-white"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HandwritingRecognition;