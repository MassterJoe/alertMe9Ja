const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); 

const context = "Educational and informative post on disaster awareness";


const gemini_api_key = process.env.API_KEY;
    const googleAI = new GoogleGenerativeAI(gemini_api_key);
    const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
    };
    
    const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-pro",
    geminiConfig,
    });
    
    const generate = async () => {
    try {
        const prompt = `${context} + Generate a different educational tweet about disasters, crimes, flooding, or any natural or artificial disaster.`;
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        console.log(response.text());
    } catch (error) {
        console.log("response error", error);
    }
    };
    
    generate();