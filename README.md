# Clinical Trials Platform

AI-Powered Clinical Trials Research for Indian Physicians

## Overview

 
## Features

- 🔍 **Comprehensive CTRI Search** - Access complete Indian clinical trials database with advanced filtering
- 🤖 **AI Document Generation** - Generate research summaries and literature reviews with GPT-4
- 👥 **Patient-Trial Matching** - AI-powered eligibility screening and confidence scoring
- 📱 **Progressive Web App** - Offline functionality and mobile-optimized experience
- 🎨 **Medical-Focused Design** - Professional interface designed for healthcare practitioners

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Material-UI v5** with custom medical theme
- **Vite** for fast development and building
- **Vitest** for testing with React Testing Library
- **ESLint + Prettier** for code quality

### Development Tools
- TypeScript strict mode enabled
- Path aliases configured for clean imports
- Comprehensive testing setup
- Professional linting and formatting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (buttons, inputs, etc.)
│   ├── layout/         # Layout components (header, sidebar, etc.)
│   ├── search/         # Search-related components
│   ├── trials/         # Trial card and display components
│   └── documents/      # Document generation components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── services/           # API services and data fetching
├── styles/             # Theme and global styles
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test setup and utilities
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm run test
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Check TypeScript types

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Use path aliases for imports (`@/components`, `@/types`, etc.)
- Write tests for all components and utilities

### Component Structure
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow Material-UI theming patterns
- Ensure accessibility compliance (WCAG 2.1 AA)

### Testing
- Write unit tests for components using React Testing Library
- Test user interactions and accessibility
- Maintain good test coverage
- Use descriptive test names

## Theme and Design

The application uses a custom Material-UI theme optimized for medical professionals:

- **Primary Color**: #1A73E8 (Medical Blue)
- **Typography**: Inter font family for readability
- **Spacing**: 8px base unit system
- **Components**: Custom styled Material-UI components

## Requirements Covered

This setup addresses the following requirements:
- **1.1**: Professional landing page with clear value proposition
- **1.6**: Responsive design for all devices
- **8.4**: Comprehensive testing environment

## Next Steps

After completing this setup, the next tasks involve:
1. Design System and Theme Implementation
2. Core Layout Components
3. Landing Page Hero Section
4. Search Bar Component with Demo Functionality

## Contributing

1. Follow the established code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure accessibility compliance

## License

This project is proprietary and confidential.