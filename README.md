# AI-Powered Mock Interview Platform

A modern web application that provides realistic AI-driven mock interviews to help job seekers practice and improve their interview skills. Built with Next.js, Google Gemini AI, and Supabase.

## Overview

This platform simulates real interview experiences by generating contextual questions based on the job role, job description, and candidate's resume. The AI interviewer provides natural conversation flow with follow-up questions and delivers comprehensive feedback and analysis after each interview session.

## Features

- **Personalized Interview Questions**: AI-generated questions tailored to specific job roles and candidate backgrounds
- **Natural Conversation Flow**: Dynamic follow-up questions based on candidate responses
- **Voice Interaction**: Text-to-speech capabilities for a realistic interview experience
- **Real-time Voice Visualization**: Visual feedback during voice interactions
- **Comprehensive Analysis**: Detailed performance scoring with strengths and areas for improvement
- **Interview History**: Track past interviews and review feedback
- **User Authentication**: Secure login and signup with Supabase Auth

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- Google Gemini AI (interview questions and analysis)
- ElevenLabs (text-to-speech)

### Database
- Supabase (PostgreSQL with Row Level Security)

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes for interview operations
│   ├── dashboard/        # User dashboard page
│   ├── interview/        # Interview session pages
│   ├── login/            # Authentication pages
│   └── signup/
├── components/
│   ├── AIAvatar.tsx      # AI interviewer avatar component
│   ├── VoiceVisualizer.tsx # Voice activity visualization
│   └── ui/               # Reusable UI components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/
│   ├── gemini.ts         # Google Gemini AI integration
│   └── supabase.ts       # Supabase client configuration
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Google Gemini API key
- ElevenLabs API key (optional, for voice features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/AI-Powered-Mock-Interview.git
cd AI-Powered-Mock-Interview
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your `.env.local` file with your API keys:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

5. Set up the database by running the SQL schema in your Supabase SQL Editor:
```bash
# Copy contents of supabase-schema.sql and run in Supabase Dashboard
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses three main tables:

- **interviews**: Stores interview session metadata (job role, description, resume, status)
- **responses**: Stores question-answer pairs during the interview
- **analysis**: Stores AI-generated performance analysis and feedback

All tables implement Row Level Security (RLS) to ensure users can only access their own data.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/interview/create` | POST | Create a new interview session |
| `/api/interview/start` | POST | Start an interview and generate questions |
| `/api/interview/respond` | POST | Submit a response and get follow-up |
| `/api/interview/complete` | POST | Complete interview and generate analysis |
| `/api/interview/[id]` | GET | Retrieve interview details |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Configuration

### Supabase Setup

1. Create a new project in Supabase
2. Run the SQL from `supabase-schema.sql` in the SQL Editor
3. Enable Email authentication in Authentication settings
4. Copy your project URL and anon key to environment variables

### Google Gemini Setup

1. Go to Google AI Studio
2. Create an API key
3. Add the key to your environment variables

### ElevenLabs Setup (Optional)

1. Create an account at ElevenLabs
2. Generate an API key from your profile
3. Add the key to your environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and feature requests, please open an issue in the repository.
