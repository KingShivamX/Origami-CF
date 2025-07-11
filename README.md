# 🎯 Origami-CF

A better way to practice competitive programming on Codeforces with custom virtual contests and progress tracking.

## What it does

Tired of messy Codeforces practice sessions? This platform helps you create focused virtual contests, track your progress, and never lose sight of problems you need to solve.

## Key Features

**🔐 Simple Authentication** - Codeforces handle + 4-digit PIN

**🎮 Custom Contests** - Set problem ratings (P1-P4), filter by tags and contest rounds

**⏱️ Live Contest Mode** - Real-time timer and status updates

**📊 Progress Analytics** - Track performance across all training sessions

**🔄 Smart Upsolving** - Auto-collect unsolved problems for later practice

**🎨 Clean Interface** - Modern UI with dark/light mode support

## Performance Prediction Engine

Accurate rating prediction using ELO-based algorithm similar to Codeforces:

**🧮 ELO Algorithm** - Expected solve probability: `1 / (1 + 10^((problem_rating - user_rating) / 400))`

**⚡ Time Factors** - Early solve bonus (1.1x), normal solve (1.0x), late penalty (0.9x)

**❌ Submission Penalties** - Wrong submissions reduce performance (~2% each)

**⚖️ Difficulty Weighting** - Harder problems have higher impact on final rating

**🎯 Completion Bonus** - 5% bonus for solving all problems

Predicts performance within ±50-100 rating points of actual Codeforces results.

## Quick Start

### Setup

1. Enter your Codeforces handle
2. Create a 4-digit PIN
3. Start practicing!

### Forgot PIN?

Submit a compilation error to [Problem 4A](https://codeforces.com/problemset/problem/4/A) for verification.

### Creating Contests

1. Select tags (optional)
2. Set problem difficulties for each slot
3. Generate and start solving
4. Use refresh to update progress

## Tech Stack

Next.js 15, TypeScript, Tailwind CSS, MongoDB, JWT authentication, Codeforces API integration.

## Development

```bash
git clone https://github.com/yourusername/origami-cf.git
cd origami-cf
npm install
npm run dev
```

## Credits

Inspired by [C0ldSmi1e](https://github.com/C0ldSmi1e/training-tracker) and ThemeCP.

---

Made for competitive programmers who want organized practice sessions.
