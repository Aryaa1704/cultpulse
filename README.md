# CultPulse

> AI-powered fitness, nutrition, and wellness companion with multimodal food analysis, personalized goals, workout tracking, and resilient multi-provider AI inference.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cultpulse.vercel.app-black?style=flat-square&logo=vercel)](https://cultpulse.vercel.app)
[![CI](https://github.com/Aryaa1704/cultpulse/actions/workflows/ci.yml/badge.svg)](https://github.com/Aryaa1704/cultpulse/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

## Overview

CultPulse is a full-stack AI fitness application designed around a simple idea: turn everyday nutrition and training data into actionable guidance.

The application combines a React + TypeScript client, an Express API layer, Firebase-based authentication/state integration, and a server-side AI routing layer for multimodal food analysis and recipe generation.

## Core Capabilities

- **AI Food Scanner** — analyzes food images and returns meal-level nutrition estimates, item breakdowns, macronutrients, dietary flags, and health insights.
- **AI Recipe Generation** — converts available ingredients into structured recipes with preparation time, instructions, nutrition estimates, and dietary classification.
- **Personalized Goals** — adapts calorie and macro targets around selectable goals such as muscle building, nutrition-focused tracking, and endurance/HIIT.
- **Nutrition Diary** — tracks meals, hydration, daily targets, and nutrition progress.
- **Workout Tracking** — provides workout protocols and live-session oriented fitness tracking.
- **Progress & Analytics** — surfaces nutrition and performance-oriented metrics.
- **Authentication** — supports Google/email-oriented authentication flows with guest-mode fallback.
- **Multi-provider AI resilience** — uses a server-side waterfall router across multiple AI providers and a deterministic Tier-0 fallback.
- **Smart vision cache** — caches repeated image-analysis requests in memory to avoid unnecessary model calls for identical inputs.
- **Security and usage controls** — includes client-side input sanitization and AI usage management.

## Architecture

~~~text
┌──────────────────────────────┐
│        React + Vite UI       │
│  Diary • Workouts • Progress │
│  Scanner • Recipes • Auth    │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│       Express API Layer      │
│ /api/health                  │
│ /api/analyze-food            │
│ /api/generate-recipe-...     │
│ /api/ai-providers-status     │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│      AI Waterfall Router     │
│ Provider fallback + timeout  │
│ response parsing + telemetry │
└──────────────┬───────────────┘
               │
      ┌────────┼─────────┬───────────┐
      ▼        ▼         ▼           ▼
     HF    Cloudflare  OpenRouter  Gemini
      │        │         │           │
      └────────┴─────────┴───────────┘
                    │
                    ▼
          Tier-0 deterministic fallback
~~~

## Engineering Highlights

### Server-side AI orchestration

Provider credentials are intended to remain behind the Express API instead of being exposed in browser code.

### Waterfall routing

A provider failure does not automatically fail the user request. The backend can move to the next configured provider and finally fall back to a deterministic engine.

### Timeout-bound inference

External AI requests use bounded timeouts so a slow provider does not block the request indefinitely.

### Cache-before-inference

Repeated vision requests are checked against an in-memory image signature before an external model is called.

### Optimistic application state

The frontend applies optimistic state updates for responsive interactions such as hydration, goals, and diary changes.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| UI | Tailwind CSS, Lucide React, Motion |
| Backend | Node.js, Express, TypeScript |
| AI | Google Gemini, Hugging Face, Cloudflare Workers AI, OpenRouter, Mistral, SambaNova, Cerebras, NVIDIA NIM, Groq |
| Auth / App State | Firebase + application state services |
| Tooling | Bun, TypeScript, esbuild, tsx |
| Deployment | Vercel-compatible frontend / Node server, Docker |

> Provider availability depends on which credentials are configured in the deployment environment.

## Repository Structure

~~~text
cultpulse/
├── api/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── services/
│   │   ├── aiPlateAndRecipeService.ts
│   │   ├── aiUsageManager.ts
│   │   ├── googleAuth.ts
│   │   ├── scaleEngine.ts
│   │   ├── securityEngine.ts
│   │   └── workspaceApi.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── server/
│   ├── aiWaterfallRouter.ts
│   └── app.ts
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
├── vercel.json
└── vite.config.ts
~~~

## API

### GET /api/health

Returns service health and the number of cached vision results.

### GET /api/ai-providers-status

Returns configured provider status and the AI execution strategy.

### POST /api/analyze-food

Analyzes an uploaded food image.

Example request:

~~~json
{
  "image": "data:image/jpeg;base64,...",
  "note": "Lunch with extra rice",
  "language": "en"
}
~~~

The normalized response includes a meal name, calorie/macronutrient estimates, item-level breakdown, confidence, dietary flags, and provider metadata.

### POST /api/generate-recipe-from-ingredients

Generates a recipe from raw ingredients and optional nutrition/dietary constraints.

Example request:

~~~json
{
  "ingredients": ["rice", "tomato", "onion"],
  "dietaryPreference": "veg",
  "mealType": "lunch",
  "targetKcal": 550,
  "language": "en"
}
~~~

## AI Reliability Model

CultPulse's AI layer is provider-agnostic.

1. Check whether the required API credential is configured.
2. Call the provider with a bounded timeout.
3. Parse and normalize the model response.
4. Record the provider/model used.
5. Fall through to the next provider when inference fails.
6. Use the deterministic local fallback when no AI provider succeeds.

This reduces coupling to a single vendor and improves resilience against provider outages, rate limits, and quota exhaustion.

## Configuration

Copy the example environment file:

~~~bash
cp .env.example .env
~~~

Then configure only the providers you want to use.

Never commit real API keys or production credentials.

## Local Development

### Prerequisites

- Node.js 20+
- Bun or npm
- Firebase project for authentication features
- At least one configured AI provider for AI endpoints

### Install

~~~bash
bun install
~~~

### Run

~~~bash
bun run dev
~~~

### Build

~~~bash
bun run build
~~~

### Type-check

~~~bash
bun run lint
~~~

### Production

~~~bash
bun run build
bun run start
~~~

## Docker

~~~bash
docker build -t cultpulse .
docker run --env-file .env -p 3000:3000 cultpulse
~~~

## Security Notes

- Keep AI provider secrets server-side.
- Use `.env.example` only as a configuration template.
- Do not place real credentials in source control.
- Production deployments should restrict CORS and add authentication/rate limiting around sensitive endpoints before exposing them to untrusted clients.
- Nutrition values inferred from images are estimates and are not medical-grade measurements.

## Roadmap

- persistent server-side user data layer
- stronger API authentication and authorization
- distributed cache for multi-instance deployments
- background processing for long-running AI jobs
- automated integration tests
- structured logs and metrics
- OpenAPI/Swagger documentation
- production-grade rate limiting and request tracing

## Author

**Aryaa1704**

Built as a full-stack AI engineering project focused on resilient inference, product UX, and scalable application .

