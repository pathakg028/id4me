# id4me-test

A React app for onboarding employees using Redux Toolkit, React Hook Form, Zod validation, and JSON Server.

## Features

- Mobile number verification with Redux state
- Profile form with fields: Full Name, Email, Date of Birth (required), Gender (optional)
- Form validation using [zod](https://zod.dev/)
- Auto-save form data to localStorage
- Keyboard accessibility and enhanced navigation
- Loading state management
- JSON Server for mock backend

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Installation

```bash
git clone https://github.com/gauravpathak/id4me-test.git
cd id4me-test
npm install
```

### Running the App

#### 1. Start JSON Server

```bash
npx json-server src/db.json --port 3000
```

#### 2. Start React App

```bash
npm run dev
```

### Running Tests

```bash
npm test
```
## Project Structure

```
src/
  app/                # Redux store and hooks
  components/         # React components (ProfileForm, etc.)
  container/          # Container components (MobileVerification, etc.)
  features/           # Redux slices
  reducer/            # Redux slices (legacy)
  utils/              # Utility functions and validation schemas
  db.json             # Mock database for JSON Server
```

## Keyboard Shortcuts

- **Tab**: Move to next field
- **Enter**: Move to next field
- **Ctrl+Enter**: Submit form
- **Ctrl+S**: Save form
- **Alt+1-5**: Jump to specific fields
- **Shift+Escape**: Blur field

## License

MIT

---
```# id4me-test

A React app Onboarding staff using Redux Toolkit, React Hook Form, Zod validation, and JSON Server.

## Features

- Mobile number verification with Redux state
- Profile form with fields: Full Name, Email, Date of Birth (required), Gender (optional)
- Form validation using [zod](https://zod.dev/)
- Auto-save form data to localStorage
- Keyboard accessibility and enhanced navigation
- Loading state management
- JSON Server for mock backend

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Installation

```bash
git clone https://github.com/gauravpathak/id4me-test.git
cd id4me-test
npm install
```

### Running the App

#### 1. Start JSON Server

```bash
npx json-server src/db.json --port 3000
```

## Project Structure

```
src/
  app/                # Redux store and hooks
  components/         # React components (ProfileForm, etc.)
  container/          # Container components (MobileVerification, etc.)
  features/           # Redux slices
  reducer/            # Redux slices (legacy)
  utils/              # Utility functions and validation schemas
  db.json             # Mock database for JSON Server
```

## Keyboard Shortcuts

- **Tab**: Move to next field
- **Enter**: Move to next field
- **Ctrl+Enter**: Submit form
- **Ctrl+S**: Save form
- **Alt+1-5**: Jump to specific fields
- **Shift+Escape**: Blur field

## License

MIT

---