# NER 2 - Emergency Response & Traffic Management System

A modern, responsive web application for emergency response coordination and real-time traffic management. Built with React, TypeScript, and Vite, this system provides comprehensive tools for managing emergency operations, tracking officer locations, monitoring vehicle status, and coordinating rapid response to disruptions.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.1.6-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [Support](#support)

## ✨ Features

- **Live Map Integration**: Real-time map visualization using Leaflet with React integration
- **Emergency Alert System**: Instant notifications and emergency alert banners
- **Dashboard & Analytics**: Comprehensive KPI cards and disruption tracking
- **Officer Management**: Track and manage emergency response officers in real-time
- **Vehicle Tracking**: Monitor vehicle status and location information
- **AI Chatbot**: Integrated AI-powered chatbot for user assistance
- **Multi-Language Support**: Localized interface with language selector
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Rich UI Components**: Professional icons via Lucide React

## 🛠️ Tech Stack

### Frontend
- **React** (18.2.0) - UI library
- **TypeScript** (5.2.2) - Type safety
- **Vite** (5.1.6) - Build tool and dev server
- **React Router DOM** (6.22.3) - Client-side routing

### Styling & UI
- **TailwindCSS** (3.4.1) - Utility-first CSS framework
- **Tailwind Merge** (2.2.1) - Merge Tailwind CSS classes
- **Lucide React** (0.344.0) - Icon library
- **clsx** (2.1.0) - Conditional classname utility

### Maps & Visualization
- **Leaflet** (1.9.4) - Map library
- **React Leaflet** (4.2.1) - React wrapper for Leaflet
- **Recharts** (2.12.2) - Chart library for data visualization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** (8.4.35) - CSS processing
- **Autoprefixer** (10.4.18) - CSS vendor prefixes

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **yarn**
- **Git** (for version control)

## 📦 Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd "NER 2"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   
   Or if you prefer yarn:
   ```bash
   yarn install
   ```

3. **Verify Installation**
   ```bash
   npm run lint
   ```

## 🚀 Running the Application

### Development Server

Start the development server with hot module reloading:

```bash
npm run dev
```

The application will be available at:
- **Local**: `http://localhost:3000`
- **Network**: Check console output for your machine's IP

### Preview Build

Preview the production build locally:

```bash
npm run preview
```

## 🏗️ Building for Production

Build the application for production:

```bash
npm run build
```
