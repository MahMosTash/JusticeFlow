# Police Case Management System - Frontend

React-based frontend application for the Police Case Management System.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - UI component library
- **React Router** - Routing
- **Redux Toolkit** - State management
- **React Hook Form** + **Yup** - Form handling and validation
- **Axios** - HTTP client
- **React Flow** - Detective Board visualization
- **Jest** + **React Testing Library** - Testing

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── common/      # Common components (Loading, Skeleton, etc.)
│   │   ├── layout/      # Layout components
│   │   └── ...          # Feature-specific components
│   ├── pages/           # Page components
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── Cases/
│   │   ├── Complaints/
│   │   ├── Evidence/
│   │   ├── DetectiveBoard/
│   │   ├── MostWanted/
│   │   └── Reports/
│   ├── services/        # API service layer
│   ├── store/           # Redux store and slices
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # Application constants
│   ├── utils/           # Utility functions
│   ├── tests/           # Test files
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── jest.config.js
```

## Features

### Pages Implemented

1. **Home Page** - Statistics dashboard (Total cases, Solved cases, Police staff)
2. **Login & Register** - Authentication pages
3. **Dashboard** - Role-based dashboard (Admin, Officer, Detective, User)
4. **Cases** - List, detail, and create case pages
5. **Complaints** - List and submit complaint pages
6. **Evidence** - Evidence list and management
7. **Detective Board** - Visual case analysis with React Flow
8. **Most Wanted** - Suspects under severe surveillance
9. **Reports** - Aggregated reports page

### Key Features

- ✅ Role-based access control
- ✅ Responsive design
- ✅ Skeleton loaders for better UX
- ✅ Form validation
- ✅ Protected routes
- ✅ State management with Redux
- ✅ API integration
- ✅ Error handling
- ✅ Loading states

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and set:
# VITE_API_BASE_URL=http://localhost:8000/api
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Police Case Management System
```

## Testing

The project includes comprehensive tests:

- **Login Page Tests** - Form validation, password visibility toggle
- **Home Page Tests** - Statistics display, loading states
- **Protected Route Tests** - Authentication and authorization
- **Auth Hook Tests** - Role checking, authentication state
- **Service Tests** - API service layer tests

Run tests with:
```bash
npm test
```

## API Integration

All API calls are made through service modules in `src/services/`:

- `authService` - Authentication
- `caseService` - Case management
- `complaintService` - Complaint handling
- `evidenceService` - Evidence management
- `investigationService` - Suspects, interrogations, guilt scores
- `detectiveBoardService` - Detective board operations
- `rewardService` - Reward submissions
- `statsService` - Statistics

## State Management

Redux store structure:

- `auth` - Authentication state (user, token, roles)
- `cases` - Case state (cases list, current case, filters)
- `ui` - UI state (sidebar, notifications, theme)

## Routing

Protected routes require authentication. Role-based access is enforced at the route level.

## Styling

- Material-UI theme is configured in `App.tsx`
- Global styles in `index.css` (left for user customization)
- Component-level styling with MUI's `sx` prop

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Part of the Police Case Management System project.
