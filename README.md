# TikTok Shop Compliance V2 - Next.js Export

This project is a complete Next.js implementation of the TikTok Shop Compliance V2 app, ready for deployment on Vercel.

## 🚀 Quick Start for Beginners

### 1. Prerequisites
- A [GitHub](https://github.com) account.
- A [Vercel](https://vercel.com) account.
- A [Google AI Studio](https://aistudio.google.com) API Key.

### 2. Local Setup
1. Download or copy the files from the `nextjs-export` directory.
2. Open your terminal in the project folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file in the root:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Deploying to Vercel

1. **Push to GitHub**:
   - Create a new repository on GitHub.
   - Initialize git in your local folder: `git init`.
   - Add files: `git add .`.
   - Commit: `git commit -m "Initial commit"`.
   - Push to your GitHub repo.

2. **Import to Vercel**:
   - Go to the Vercel Dashboard and click **"Add New"** > **"Project"**.
   - Import your GitHub repository.
   - In the **Environment Variables** section, add:
     - Key: `GEMINI_API_KEY`
     - Value: `your_actual_api_key`
   - Click **"Deploy"**.

## 🛠 Project Structure
- `src/app/page.tsx`: The main user interface (Client Component).
- `src/lib/gemini.ts`: Server Actions that handle secure communication with the Gemini API.
- `src/types/compliance.ts`: TypeScript definitions for the analysis results.
- `tailwind.config.ts`: Styling configuration.

## 🔒 Security Note
The Gemini API key is handled exclusively on the server side via **Next.js Server Actions**. This prevents your API key from being exposed to the user's browser.
