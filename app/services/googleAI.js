import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

// Google AI API Integration for Ad Generation
// This service handles integration with Google's GenAI SDK for image generation

class GoogleAIService {
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    this.ai = new GoogleGenAI({
      apiKey: this.apiKey
    });
  }

  async downloadImageAsBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async generateImageFromImage(sourceImageUrl, prompt) {
    try {
      // Download and convert image to base64
      const base64Image = await this.downloadImageAsBase64(sourceImageUrl);
      
      // Determine MIME type from URL or default to PNG
      const mimeType = sourceImageUrl.includes('.jpg') || sourceImageUrl.includes('.jpeg') 
        ? 'image/jpeg' 
        : 'image/png';

      // Prepare prompt in correct format
      const promptContent = [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
      ];

      // Generate content using Gemini
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: promptContent,
      });

      // Process response
      const candidate = response.candidates?.[0];
      if (!candidate) {
        throw new Error('No response generated');
      }

      let generatedImageData = null;
      let textResponse = null;

      for (const part of candidate.content.parts) {
        if (part.text) {
          textResponse = part.text;
        } else if (part.inlineData) {
          generatedImageData = part.inlineData.data;
        }
      }

      if (generatedImageData) {
        // Save generated image to temp file or return base64
        const timestamp = Date.now();
        const filename = `generated-ad-${timestamp}.png`;
        const buffer = Buffer.from(generatedImageData, "base64");
        
        // In production, save to cloud storage (AWS S3, Google Cloud Storage, etc.)
        // For now, we'll return the base64 data
        return {
          success: true,
          imageData: generatedImageData,
          imageUrl: `data:image/png;base64,${generatedImageData}`,
          filename: filename,
          textResponse: textResponse
        };
      } else {
        return {
          success: false,
          error: 'No image data in response',
          textResponse: textResponse
        };
      }
    } catch (error) {
      console.error("Error generating image:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateVideoFromImage(sourceImageUrl, prompt, duration = 5) {
    try {
      // Note: Video generation might require a different model or approach
      // For now, we'll use the same image generation approach
      // In the future, this would use Veo3 API when available
      
      const videoPrompt = `${prompt}. Create this as an animated sequence suitable for a ${duration}-second video advertisement with smooth motion and professional cinematography.`;
      
      // For now, generate an enhanced image that suggests motion
      const result = await this.generateImageFromImage(sourceImageUrl, videoPrompt);
      
      if (result.success) {
        return {
          success: true,
          videoUrl: result.imageUrl, // This would be a video URL in production
          thumbnailUrl: result.imageUrl,
          duration: duration,
          imageData: result.imageData,
          textResponse: result.textResponse
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error("Error generating video:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generatePromptWithGemini(productData, preferences) {
    try {
      const promptText = `Generate a detailed prompt for creating an advertising image/video for the following product:

Product: ${productData.title}
Description: ${productData.description}
Target Audience: ${preferences.targetAudience}
Tone: ${preferences.tone}
Purpose: ${preferences.purpose}
Ad Type: ${preferences.adType}

Create a comprehensive prompt that will generate a high-quality, professional advertising ${preferences.adType === 'IMAGE_TO_VIDEO' ? 'video' : 'image'} that effectively showcases the product and appeals to the target audience. Include specific details about composition, lighting, style, and mood.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });

      const result = response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return {
        success: true,
        prompt: result
      };
    } catch (error) {
      console.error("Error generating prompt with Gemini:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkTaskStatus(taskId) {
    try {
      // Since we're using direct generation now, tasks are completed immediately
      // In production with async processing, this would check actual task status
      return {
        success: true,
        status: "completed",
        result: null,
        progress: 100
      };
    } catch (error) {
      console.error("Error checking task status:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const googleAI = new GoogleAIService();