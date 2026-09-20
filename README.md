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

This command:
1. Compiles TypeScript (`tsc -b`)
2. Bundles the application using Vite

The build output will be in the `dist/` directory, ready for deployment.

### Deployment

The `dist/` directory contains all static files needed for production deployment:
- `index.html` - Main HTML file
- `assets/` - Bundled JavaScript and CSS

You can deploy this to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## 📁 Project Structure

```
NER 2/
├── src/
│   ├── components/
│   │   ├── chat/              # AI Chatbot components
│   │   ├── layout/            # Layout components (Header, Sidebar, etc.)
│   │   ├── map/               # Map-related components
│   │   ├── alerts/            # Emergency alert components
│   │   └── dashboard/         # Dashboard and data visualization
│   ├── data/
│   │   └── translations.ts    # Multi-language translations
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── App.tsx                # Main App component
│   └── main.tsx               # Application entry point
├── public/                    # Static assets
├── dist/                      # Production build output
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── package.json               # Project dependencies
└── .eslintrc                  # ESLint configuration
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint to check code quality |
| `npm run preview` | Preview production build locally |

## ⚙️ Configuration

### Port Configuration
The development server runs on port **3000** by default. To change this, edit `vite.config.ts`:

```typescript
server: {
  port: 3000,  // Change this value
  host: true
}
```

### Path Aliases
The project uses `@` as an alias for the `src` directory. Use it in imports:

```typescript
// Instead of:
import { Component } from '../../../components/Component'

// Use:
import { Component } from '@/components/Component'
```

### Multi-Language Support
Language strings are stored in `src/data/translations.ts`. Add new languages or modify existing translations there.

## ⚠️ Known Issues

### Problem #26002
**Status**: Known issue - ji yeh sih problem hain problem number 26002

This is a known problem that requires attention. For specific details about this issue and workarounds, please refer to the [Issues](../../issues) section or contact the development team.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Write component documentation
- Ensure code passes ESLint
- Test changes before submitting

## 📝 Development Guidelines

### Component Structure
- Create reusable, single-responsibility components
- Use TypeScript interfaces for props
- Include PropTypes or TypeScript types for type safety

### Styling
- Use TailwindCSS utility classes for styling
- Follow mobile-first design approach
- Maintain consistent spacing and colors

### File Organization
- Keep components in their respective feature folders
- Group related types in a single index.ts
- Use descriptive filenames

## 🐛 Reporting Issues

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment details (Node version, OS, etc.)

## 📞 Support

For support and questions:
- Check existing documentation and FAQs
- Review [Issues](../../issues) for known problems
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Future Enhancements

Potential features and improvements planned for future releases:
- Enhanced real-time notifications
- Advanced filtering and search
- Offline functionality
- Performance optimizations
- Additional integrations

---

**Last Updated**: September 2026

For the latest updates and releases, visit the [Releases](../../releases) page.
