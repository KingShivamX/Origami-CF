# 🎯 Origami-CF

A professional Codeforces virtual contest practice platform with custom problem selection, cloud data storage, and secure PIN authentication.

## ✨ Key Features

- **🔐 PIN Authentication**: 4-digit PIN login with unique forgot PIN recovery via compilation error
- **🎮 Custom Contests**: Set individual problem ratings (P1-P4), filter by tags and contest rounds
- **⏱️ Live Contest**: Real-time timer, status updates, and problem tracking
- **📊 Progress Tracking**: Cloud-stored training history with performance analytics
- **🔄 Smart Upsolving**: Auto-collect unsolved problems with cloud sync
- **🎨 Modern UI**: Professional design with dark/light mode and responsive layout

## 📱 How to Use

### Authentication

- **Register**: Enter Codeforces handle + create 4-digit PIN
- **Login**: Handle + PIN
- **Forgot PIN**: Submit compilation error to [Problem 4A](https://codeforces.com/problemset/problem/4/A), then verify

### Creating Contests

1. Select tags (optional)
2. Set problem ratings for P1-P4
3. Set contest round range (optional)
4. Generate → Start → Solve on Codeforces
5. Use "Refresh" button to update status

### Progress Tracking

- **Statistics**: View performance charts and training history
- **Upsolve**: Auto-collected unsolved problems with status tracking

## 🛡️ Security

- bcrypt PIN encryption
- JWT session management
- Unique compilation error verification for PIN reset
- Cloud data storage with user isolation

## 🔧 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes, MongoDB, JWT
- **External**: Codeforces API integration

## 🚀 Quick Start

1. **Setup**

   ```bash
   git clone https://github.com/yourusername/origami-cf.git
   cd origami-cf
   npm install
   ```

2. **Run**
   ```bash
   npm run dev
   ```

## 🙏 Acknowledgments

This project is inspired by the work of [C0ldSmi1e](https://github.com/C0ldSmi1e/training-tracker) and ThemeCP.

---

**Made with <3 for competitive programmers**
