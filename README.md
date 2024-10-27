# Squigosauri NeuralWave Job Portal

This application is a job listing portal with an upload interface for adding new job posts. Users can view job listings on the main page and upload new job posts through a dedicated URL.

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Running the Application](#running-the-application)

---

### Overview

The Squigosauri NeuralWave Job Portal is built with SvelteKit and Vite, with Tailwind CSS for styling and Firebase for backend integrations. This portal includes:

- Job listings viewable on the homepage.
- A form for creating new job posts accessible via the `/job-upload` URL.

### Requirements

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (Recommended version: 23.1.0, managed by Volta)
- [npm](https://www.npmjs.com/)

### Running the Application

1. **Install Dependencies**: Run the following command to install all necessary packages:

   ```bash
   npm install
   ```

2. **Run the Application**: Start the application in development mode:
   ```bash
   npm run dev
   ```
   The application will be available on your local server, usually at `http://localhost:5173`. The main page displays the job listings, while new job posts can be added at the `/job-upload` URL.

### Dependencies

All required dependencies are listed in the `requirements.txt` file for easy setup.
