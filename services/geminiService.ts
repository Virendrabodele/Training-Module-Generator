
import { GoogleGenAI, Type } from "@google/genai";
import type { QAItem } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Transcribes a media file using the Gemini API.
 * @param base64Media The base64 encoded media data.
 * @param mimeType The MIME type of the media file.
 * @returns The transcribed text as a string.
 */
export async function transcribeMedia(base64Media: string, mimeType: string): Promise<string> {
  const mediaPart = {
    inlineData: {
      data: base64Media,
      mimeType: mimeType,
    },
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [mediaPart, { text: "Please transcribe the audio from this file accurately." }] },
  });

  return response.text;
}


/**
 * Generates a list of questions and answers from a given transcript.
 * @param transcript The text transcript to generate questions from.
 * @returns A promise that resolves to an array of QAItem objects.
 */
export async function generateQuestions(transcript: string): Promise<Omit<QAItem, 'step'>[]> {
    const prompt = `
        You are an expert instructional designer. Your task is to create a question-and-answer training module from the provided transcript.
        Analyze the transcript and generate a list of questions that test understanding of the key concepts and steps described.
        For each question, provide a concise and accurate answer based directly on the transcript content.
        The original transcript is:

        ---
        ${transcript}
        ---

        Please provide the output in the specified JSON format.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: {
                            type: Type.STRING,
                            description: "The generated question that tests understanding of a key concept from the transcript.",
                        },
                        answer: {
                            type: Type.STRING,
                            description: "The concise and accurate answer to the question, based directly on the transcript.",
                        },
                    },
                    required: ["question", "answer"],
                },
            },
        },
    });

    try {
        const jsonResponse = JSON.parse(response.text);
        if (Array.isArray(jsonResponse)) {
          return jsonResponse as Omit<QAItem, 'step'>[];
        }
        throw new Error("Invalid JSON structure received from API.");
    } catch (error) {
        console.error("Failed to parse Gemini response as JSON:", response.text, error);
        throw new Error("Could not generate Q&A. The model returned an unexpected format.");
    }
}