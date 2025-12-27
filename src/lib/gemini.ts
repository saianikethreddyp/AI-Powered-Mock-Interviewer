// Google Gemini AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Fallback questions if API fails
const FALLBACK_QUESTIONS = [
    "Can you tell me about yourself and your background?",
    "What interests you about this position?",
    "Describe a challenging project you worked on. What was your role and what was the outcome?",
    "How do you handle tight deadlines and pressure?",
    "What are your greatest strengths and how do they align with this role?",
    "Can you describe a time when you had to learn something new quickly?",
    "Where do you see yourself in five years?",
    "Do you have any questions for me about the role or company?"
];

const FALLBACK_GREETING = "Hi there! Thanks for coming in today. I'm really looking forward to our conversation. Before we dive in, I just want you to know that this is meant to be a relaxed discussion - no need to be nervous. I'll ask you a few questions about your experience and background, and please feel free to ask me anything too. Ready when you are!";

// Call Gemini API
async function callGeminiAPI(systemPrompt: string, userMessage: string, temperature: number = 0.8): Promise<string> {
    try {
        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set');
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: `${systemPrompt}\n\n${userMessage}` }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API error:', response.status, error);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
        console.error('Gemini API call failed:', error);
        throw error;
    }
}

// Interview Question Generation
export const generateInterviewQuestions = async (
    jobRole: string,
    jobDescription: string,
    resumeText: string,
    questionCount: number = 8
): Promise<string[]> => {
    const systemPrompt = `You are Sarah, a friendly AI practice interviewer for mock interviews.

Your style is:
- Conversational and friendly, never robotic
- You use natural language like "I'd love to hear about..." or "Tell me more about..."
- You occasionally add brief personal touches
- You never sound scripted or corporate

IMPORTANT BOUNDARIES:
- You are an AI practice interviewer, NOT a real recruiter at any company
- If asked "who are you" or "what company do you work for", clarify: "I'm Sarah, your AI practice interviewer helping you prepare for real interviews."
- Never invent company details, policies, or pretend to work at a specific company
- Stay focused on helping the candidate practice their interview skills`;

    const userMessage = `Create ${questionCount} interview questions for a ${jobRole} position.

Job Description: ${jobDescription || 'General software development role'}
Candidate's Background: ${resumeText || 'Not provided yet'}

Make each question sound like something a friendly interviewer would naturally ask:
- Start with easy warmup questions
- Progress to more specific/technical ones
- Include questions that reference their specific background if provided
- Make them open-ended to encourage storytelling

IMPORTANT: 
- Don't start every question with "Can you..." - vary your phrasing
- Use phrases like: "I noticed on your resume...", "Walk me through...", "I'm curious about...", "What was it like when..."
- Make 1-2 questions slightly unexpected or creative

Return ONLY a JSON array of question strings. No other text.`;

    try {
        const response = await callGeminiAPI(systemPrompt, userMessage, 0.9);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return FALLBACK_QUESTIONS.slice(0, questionCount);
    } catch (error) {
        console.error('Failed to generate questions:', error);
        return FALLBACK_QUESTIONS.slice(0, questionCount);
    }
};

// Generate natural follow-up/transition based on response
export const generateFollowUpQuestion = async (
    originalQuestion: string,
    userResponse: string,
    jobRole: string,
    conversationHistory: Array<{ question: string; response: string }>,
    nextQuestion?: string
): Promise<string> => {
    const recentHistory = conversationHistory
        .slice(-2)
        .map(item => `Interviewer: ${item.question}\nCandidate: ${item.response}`)
        .join('\n\n');

    const systemPrompt = `You are Sarah, a friendly AI practice interviewer having a genuine conversation.

Your style:
- React authentically to what candidates say (show genuine interest, surprise, curiosity)
- Use natural verbal habits: "Oh interesting!", "I see", "That makes sense"
- Transition smoothly between topics
- NEVER sound like you're reading from a script
- Keep responses concise (2-4 sentences max)

IMPORTANT BOUNDARIES:
- You are an AI practice interviewer, NOT a real recruiter
- If asked about "your company" or "your role", clarify you're an AI helping them practice
- Never invent company details or pretend to work somewhere`;

    // Detect if response is too short or uncertain
    const wordCount = userResponse.trim().split(/\s+/).length;
    const isShortResponse = wordCount < 10;
    const isUncertain = /i don't know|not sure|no experience|i haven't/i.test(userResponse);

    let extraGuidance = '';
    if (isShortResponse || isUncertain) {
        extraGuidance = `\n\nNote: The candidate gave a brief or uncertain response. Gently encourage them to elaborate or offer to rephrase the question if helpful.`;
    }

    const userMessage = `Recent conversation:
${recentHistory || 'Just started'}

You just asked: "${originalQuestion}"
They replied: "${userResponse}"${extraGuidance}

${nextQuestion
            ? `Now smoothly transition and ask this next question: "${nextQuestion}"
DO NOT say "Here's my next question" or anything similar - just naturally weave it into your response.`
            : 'This was the final question - wrap up warmly and thank them for the practice session.'}

Respond naturally as Sarah would:
1. React genuinely to their answer (be specific about what they said - don't be generic!)
2. ${nextQuestion ? 'Smoothly transition to the next question' : 'Thank them warmly and let them know the practice interview is complete.'}

Use contractions (I'm, that's, you've). Be warm but professional.`;

    try {
        const response = await callGeminiAPI(systemPrompt, userMessage, 0.85);
        return response;
    } catch (error) {
        console.error('Failed to generate follow-up:', error);
        // More natural fallback
        if (nextQuestion) {
            return `That's really helpful to know, thank you for sharing that. So, ${nextQuestion}`;
        }
        return "Thank you so much for all your thoughtful answers today! It was really great getting to know you better. We'll be in touch soon!";
    }
};

// Generate comprehensive interview analysis
export const generateInterviewAnalysis = async (
    jobRole: string,
    jobDescription: string,
    responses: Array<{ question: string; userResponse: string }>
) => {
    console.log('generateInterviewAnalysis called with', {
        jobRole,
        responsesCount: responses.length,
        firstResponse: responses[0]
    });

    // Handle case where there are no Q&A pairs
    if (!responses || responses.length === 0) {
        console.warn('No Q&A pairs provided to analysis - returning fallback');
        return {
            ...getFallbackAnalysis(0),
            detailedFeedback: "We couldn't capture enough of your interview responses to provide detailed feedback. This may have happened if the interview ended too quickly or there was a connection issue. Please try another practice interview.",
            strengths: ["You took the initiative to practice interviewing"],
            areasForImprovement: ["Complete more questions for a full analysis"],
            interviewTips: ["Speak clearly into the microphone", "Take your time to give complete answers", "Practice a full interview session"]
        };
    }

    const responsesText = responses
        .map((r, i) => `Q${i + 1}: ${r.question}\nAnswer: ${r.userResponse}`)
        .join('\n\n---\n\n');

    const systemPrompt = `You are an experienced hiring coach providing constructive, encouraging feedback. Your tone is:
- Supportive but honest - you genuinely want them to succeed
- Specific - reference exact things they said
- Actionable - give concrete tips they can use
- Balanced - highlight both strengths and growth areas`;

    const userMessage = `Review this interview for: ${jobRole}

${jobDescription ? `Role Description: ${jobDescription}` : ''}

INTERVIEW TRANSCRIPT:
${responsesText}

Provide detailed analysis as JSON only:
{
  "overallScore": <score 0-100 based on actual performance:
    0-40: Major gaps, needs significant practice
    40-60: Some good points but needs improvement
    60-75: Solid performance, minor areas to polish
    75-90: Strong performance
    90-100: Exceptional, interview-ready>,
  "categoryScores": {
    "communication": <0-100>,
    "technicalKnowledge": <0-100>,
    "problemSolving": <0-100>,
    "cultureFit": <0-100>,
    "confidence": <0-100>,
    "relevantExperience": <0-100>
  },
  "strengths": ["specific strength with example from their answer", "another specific strength", "third strength"],
  "areasForImprovement": ["specific area with actionable tip", "another area", "third area"],
  "detailedFeedback": "2-3 paragraphs of personalized feedback. Reference specific things they said. Be encouraging but honest. Give concrete advice.",
  "questionFeedback": [${responses.map((_, i) => `{"questionNumber": ${i + 1}, "rating": "excellent|good|average|needs improvement", "feedback": "specific feedback about THIS answer"}`).join(', ')}],
  "hiringRecommendation": "Keep Practicing|Good Progress|Interview Ready|Expert Level",
  "interviewTips": ["specific actionable tip", "another tip", "third tip"]
}`;

    try {
        console.log('Calling Gemini API for analysis...');
        const response = await callGeminiAPI(systemPrompt, userMessage, 0.7);
        console.log('Raw Gemini response length:', response?.length);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('Parsed analysis successfully, overallScore:', parsed.overallScore);
            return parsed;
        }
        console.warn('Could not parse JSON from Gemini response');
        return getFallbackAnalysis(responses.length);
    } catch (error) {
        console.error('Failed to generate analysis:', error);
        return getFallbackAnalysis(responses.length);
    }
};

// Fallback analysis
const getFallbackAnalysis = (questionCount: number) => ({
    overallScore: 72,
    categoryScores: {
        communication: 70,
        technicalKnowledge: 72,
        problemSolving: 75,
        cultureFit: 74,
        confidence: 68,
        relevantExperience: 73,
    },
    strengths: [
        "Completed the full interview practice session",
        "Showed commitment to improving interview skills",
        "Engaged thoughtfully with each question"
    ],
    areasForImprovement: [
        "Practice the STAR method for behavioral questions",
        "Prepare 2-3 strong examples from past experience",
        "Research the company and role before interviews"
    ],
    detailedFeedback: "Great job completing this practice session! Keep practicing to build your confidence. The more you interview, the more natural it becomes. Focus on having specific examples ready and remember - interviews are conversations, not tests.",
    questionFeedback: Array.from({ length: questionCount }, (_, i) => ({
        questionNumber: i + 1,
        rating: "good" as const,
        feedback: "Keep practicing with specific examples!"
    })),
    hiringRecommendation: "Keep Practicing",
    interviewTips: [
        "Use the STAR method: Situation, Task, Action, Result",
        "Prepare 3-5 stories that showcase different skills",
        "Have thoughtful questions ready for the interviewer"
    ]
});

// Generate warm, human greeting
export const generateInterviewGreeting = async (jobRole: string, candidateName: string): Promise<string> => {
    const systemPrompt = `You are Sarah, a friendly and experienced interviewer. You're warm, genuine, and make candidates feel at ease. You speak naturally with contractions and conversational language.`;

    const userMessage = `You're starting an interview with ${candidateName || 'the candidate'} for a ${jobRole} position.

Create a warm, natural greeting that:
1. Welcomes them genuinely (use their name if provided)
2. Introduces yourself as Sarah
3. Puts them at ease - maybe acknowledge interview nerves are normal
4. Briefly explain you'll chat about their experience
5. Ask if they're ready in a friendly way

Keep it natural and conversational - 3-4 sentences. Sound like a real person, not a corporate script.`;

    try {
        const response = await callGeminiAPI(systemPrompt, userMessage, 0.85);
        return response;
    } catch (error) {
        console.error('Failed to generate greeting:', error);
        const name = candidateName ? `${candidateName}! ` : '';
        return `Hey ${name}Thanks so much for joining me today! I'm Sarah, and I'll be chatting with you about the ${jobRole} role. Don't worry about being perfect - this is really just a conversation to get to know you better. Take your time with answers, and feel free to ask me anything too. Ready to dive in?`;
    }
};
