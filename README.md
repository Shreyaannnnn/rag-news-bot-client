RAG-Powered News Chatbot - Client

Run
- npm install
- npm start

Config
- Create `.env` with:
  REACT_APP_API_BASE=http://localhost:8080

About the Code
- src/App.js
  - Initializes a session on load (POST /api/session)
  - Fetches recent sessions (GET /api/session) and renders a sidebar
  - Sends messages (POST /api/chat) and displays assistant responses (Markdown via react-markdown)
  - Supports streaming tokens via Socket.io when available
  - New Chat creates a fresh session without deleting previous ones
  - Clicking a session loads its history (GET /api/session/:id/history)
- src/index.css
  - Provides a professional dark theme, improved layout, and styles
  - Sidebar session list, message bubbles, inputs, and sources styling

Features
- Creates a session on load
- Shows messages, sends questions
- Streams Gemini responses via Socket.io when available
- Reset button clears session and starts a new one

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
