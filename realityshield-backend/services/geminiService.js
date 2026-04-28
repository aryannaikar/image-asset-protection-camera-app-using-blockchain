const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Converts local file information to a GoogleGenerativeAI.Part object.
 */
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

/**
 * Analyzes an image for authenticity and potential manipulation using Gemini.
 */
exports.analyzeImageAuthenticity = async (filePath) => {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("[Gemini] GOOGLE_AI_API_KEY is not set. Skipping AI analysis.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this image for authenticity. 
      Act as a digital forensics expert. 
      Check for:
      1. Signs of AI generation (warped textures, unnatural eyes/hands, inconsistent lighting).
      2. Signs of digital manipulation (cloning, inconsistent shadows, sharpening artifacts).
      3. Contextual clues that suggest the image might be misleading.
      
      Provide a concise summary of your findings in JSON format with the following fields:
      - "isAIGenerated": (boolean)
      - "isManipulated": (boolean)
      - "confidenceScore": (0-100)
      - "analysisSummary": (string)
    `;

    const imagePart = fileToGenerativePart(filePath, "image/jpeg");

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      analysisSummary: text,
      isAIGenerated: text.toLowerCase().includes("ai generated") || text.toLowerCase().includes("synthetic"),
      confidenceScore: 70 // Default if we can't parse a score
    };
  } catch (error) {
    console.error("[Gemini] Error analyzing image:", error);
    return null;
  }
};
