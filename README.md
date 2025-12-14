# Audiobook Discovery PWA

A modern, responsive Progressive Web App (PWA) for discovering and managing audiobooks using the Spotify Web API.

## 🚀 Features

- **Spotify Integration**: Securely connect with your Spotify account to access and manage your audiobook library.
- **Smart Search**: Search for audiobooks by title, author, or keywords.
- **Detailed Insights**: View comprehensive details including summaries, authors, narrators, and precise duration (calculated from chapters).
- **Library Management**: Seamlessly add or remove audiobooks from your Spotify "My Audiobooks" collection.
- **Persistent Sessions**: Stay logged in across simple page reloads with automatic token management.
- **PWA Support**: Installable on mobile and desktop devices for a native app-like experience with offline capabilities.
- **Responsive Design**: optimized for all screen sizes with a sleek, dark-themed UI.

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **API**: Spotify Web API
- **Deployment**: GitHub Pages (via GitHub Actions)

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- A Spotify Developer account

### 1. Clone the repository
```bash
git clone <repository-url>
cd audiobooks
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/audiobooks/
```

> **Note**: For production or GitHub Pages deployment, update the `VITE_SPOTIFY_REDIRECT_URI` to match your production URL (e.g., `https://your-username.github.io/audiobooks/`). Ensure this URI is also whitelisted in your Spotify Developer Dashboard.

### 4. Run the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173/audiobooks/`.

## 📦 Building for Production

To create a production build:

```bash
npm run build
```

The output will be generated in the `dist` directory.

## 🚀 Deployment

This project is configured for automatic deployment to **GitHub Pages**.

1. The `vite.config.js` is set with `base: '/audiobooks/'` to support GitHub Pages hosting.
2. A GitHub Actions workflow is located in `.github/workflows/deploy.yml`.
3. Pushing to the `main` branch will trigger the deployment workflow.

## 📱 PWA

This application is configured as a PWA. When built for production, it generates a service worker and manifest file allowing users to install the app on their devices.

## License

This project is licensed under the MIT License.

Note: Large portions of the code were generated with the assistance of AI tools. The repository owner claims no exclusive authorship beyond what is permitted by applicable law and licenses the code in good faith.
