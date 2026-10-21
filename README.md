# TaskMaster Pro: Full-Stack Enterprise To-Do Application

A complete, production-ready, full-stack Task Management system engineered with **Node.js, Express, TypeScript, and MongoDB** on the backend, and **React Native CLI (Android) with TypeScript** on the mobile frontend.

---

## 🌟 Key Architecture Highlights

### 1. Robust Node.js/Express TypeScript Backend (`/backend`)
- **Authentication**: JWT authentication with bcrypt password hashing (10 salt rounds).
- **Mongoose Data Modeling**: Indexed schemas for Users and Tasks, with compound indexes for high-speed multi-filter queries (`userId + isCompleted + deadline`).
- **Composite Priority Sorting Algorithm**: An intelligent mathematical scoring algorithm that weights deadline urgency, hard cutoff proximity, task priority (`urgent` > `high` > `medium` > `low`), and completion state.
- **Embedded Database Fallback**: Built-in zero-config embedded `mongodb-memory-server` fallback if a local or remote MongoDB instance is not currently active, ensuring 100% out-of-the-box testability.
- **Request Validation & Security**: Zod schemas for all request bodies and query parameters, CORS, and Helmet HTTP security headers.
- **Automated Integration Test Suite**: End-to-end integration test runner validating auth flows, task CRUD, filter queries, and priority score rankings.

### 2. High-Performance Android React Native CLI App (`/mobile`)
- **Theme & Design System**: Sleek Dark & Light themes, tailored typography scales, glassmorphic card aesthetics, tactile interactive pills, and status chips.
- **State Management**: Zustand store with `@react-native-async-storage/async-storage` persistence, featuring optimistic UI updates with automatic rollback on network failure.
- **Navigation Architecture**: `@react-navigation/native-stack` with separated `AuthNavigator` (Login, Register) and `AppNavigator` (HomeScreen, CreateEditTaskScreen, TaskDetailScreen).
- **Rich Task Interactions**:
  - Dynamic deadline countdown badges (*"Overdue by 2h"*, *"Due in 3h"*, *"Due tomorrow"*).
  - Priority selector pills with distinct color accents (Red for Urgent, Amber for High, Blue for Medium, Green/Slate for Low).
  - Horizontal category tag carousel with instant filtering.
  - Interactive sorting modal (Smart Composite Score, Deadline Soonest, Priority Highest, Newest).
  - Shimmer loading skeletons and empty state illustrations.

---

## 📂 Project Structure

```
todo-fullstack/
├── docker-compose.yml              # Single-command MongoDB + Node.js deployment
├── TaskMaster_API.postman_collection.json # Ready-to-import Postman API test collection
├── backend/
│   ├── Dockerfile                  # Multi-stage production container build
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # Database connection + zero-config in-memory fallback
│   │   │   └── env.ts              # Strongly-typed environment variables
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts  # Register, Login, Me handlers
│   │   │   └── task.controller.ts  # Task CRUD, toggle, composite sort handlers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT Bearer token authentication guard
│   │   │   ├── error.middleware.ts # Centralized operational & unhandled error handler
│   │   │   └── validate.middleware.ts # Zod schema validation middleware
│   │   ├── models/
│   │   │   ├── user.model.ts       # Mongoose User schema with bcrypt hooks
│   │   │   └── task.model.ts       # Mongoose Task schema with compound indexes
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      # /api/auth endpoints
│   │   │   ├── task.routes.ts      # /api/tasks endpoints
│   │   │   └── index.ts            # Root API router & health check
│   │   ├── services/
│   │   │   └── sort.service.ts     # Composite priority & urgency scoring engine
│   │   ├── types/
│   │   │   └── index.ts            # Shared TypeScript types & interfaces
│   │   ├── utils/
│   │   │   └── seed.ts             # Rich demo database seeder script
│   │   ├── validators/
│   │   │   ├── auth.validator.ts   # Zod validation schemas for auth
│   │   │   └── task.validator.ts   # Zod validation schemas for tasks & queries
│   │   ├── app.ts                  # Express application configuration
│   │   └── server.ts               # Application entry point with graceful shutdown
│   ├── tests/
│   │   └── api-test.ts             # Comprehensive E2E API integration suite
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Badge.tsx       # Priority & Countdown badge components
    │   │   │   ├── Button.tsx      # Multi-variant button with loading state
    │   │   │   ├── EmptyState.tsx  # Polished empty state illustration
    │   │   │   ├── FAB.tsx         # Floating action button
    │   │   │   ├── Header.tsx      # Top bar with greeting & theme switch
    │   │   │   ├── Input.tsx       # Floating-label input with validation errors
    │   │   │   └── Skeleton.tsx    # Shimmer placeholder skeleton cards
    │   │   └── task/
    │   │       ├── CategoryChipGroup.tsx # Horizontal category filter carousel
    │   │       ├── DateTimePickerModal.tsx # Native date/time picker wrapper
    │   │       ├── PrioritySelector.tsx  # Urgent/High/Medium/Low selector
    │   │       ├── SortModal.tsx         # Sort selection bottom sheet
    │   │       └── TaskCard.tsx          # Card with countdown badge & strikethrough
    │   ├── navigation/
    │   │   ├── AppNavigator.tsx    # Authenticated app stack
    │   │   ├── AuthNavigator.tsx   # Login and Register stack
    │   │   ├── RootNavigator.tsx   # Conditional session router
    │   │   └── types.ts            # Screen route parameter types
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── LoginScreen.tsx    # Login screen with demo autofill
    │   │   │   └── RegisterScreen.tsx # User registration screen
    │   │   └── task/
    │   │       ├── HomeScreen.tsx           # Dashboard with search & metrics
    │   │       ├── CreateEditTaskScreen.tsx # Creation and editing form
    │   │       └── TaskDetailScreen.tsx     # Full detail & countdown view
    │   ├── services/
    │   │   ├── api.ts              # Axios instance with Bearer interceptors
    │   │   ├── authService.ts      # Auth network service
    │   │   └── taskService.ts      # Task network service
    │   ├── store/
    │   │   ├── useAuthStore.ts     # Persistent auth Zustand store
    │   │   ├── useTaskStore.ts     # Optimistic tasks Zustand store
    │   │   └── useThemeStore.ts    # Dark/Light mode Zustand store
    │   ├── theme/
    │   │   ├── colors.ts           # Dark/Light palettes and priority accents
    │   │   ├── spacing.ts          # Spacing & border radius tokens
    │   │   ├── theme.ts            # Theme provider hook
    │   │   └── typography.ts       # Type scales & weights
    │   ├── types/
    │   │   ├── navigation.ts
    │   │   ├── task.ts
    │   │   └── user.ts
    │   └── utils/
    │       ├── dateUtils.ts        # Deadline countdown & date formatting
    │       └── sortAlgorithm.ts    # Client-side composite score algorithm
    ├── android/                    # Android React Native CLI build files
    ├── App.tsx                     # Root App component
    ├── index.js                    # React Native registration
    ├── package.json
    └── tsconfig.json
```

---

## 🧮 The Composite Priority Sorting Algorithm

The composite score dynamically ranks tasks so engineers always tackle the most impactful and time-sensitive work first:

$$\text{Composite Score} = (1.5 \times \text{Priority Weight}) + \text{Deadline Urgency Score} + \text{Due Proximity Score} + \text{Completion Penalty}$$

1. **Base Priority Weight**:
   - `urgent` $\rightarrow$ 100 points
   - `high` $\rightarrow$ 70 points
   - `medium` $\rightarrow$ 40 points
   - `low` $\rightarrow$ 10 points
2. **Deadline Urgency Score**:
   - Overdue tasks ($\Delta t < 0$): $200 + \min(50, |\Delta t| \times 2)$ points (highest urgency).
   - Due within 6 hours: $160 + (6 - \Delta t) \times 6$ points.
   - Due within 24 hours: $120 + (24 - \Delta t) \times 2$ points.
   - Due within 48 hours: $80 + (48 - \Delta t) \times 1.5$ points.
   - Due within 7 days: $30 + \left(\frac{168 - \Delta t}{120}\right) \times 40$ points.
   - Beyond 7 days: decays gradually towards baseline.
3. **Due Date Proximity Bonus**:
   - Up to $+30$ bonus points as target `dueDateTime` nears.
4. **Completion Penalty**:
   - Once marked complete, tasks receive a $-10,000$ point modifier. This drops them to the bottom of the list while keeping active pending tasks prominent.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js $\ge 18$ (tested on v24.19.0)
- npm $\ge 9$
- Android SDK & Android Studio (for running React Native Android)

---

### Step 1: Start the Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies (already built and verified):
   ```bash
   npm install
   ```
3. Configure environment variables (a pre-configured `.env` is already prepared):
   ```bash
   # Optional: customize MONGODB_URI or PORT in .env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmaster
   JWT_SECRET=super_secret_jwt_key_taskmaster_prod_2026_xyz
   ```
   > **Note**: If your local MongoDB daemon is not running, the backend **automatically initializes an in-memory MongoDB instance** so you can run and test immediately without configuring a database.

4. Start development server:
   ```bash
   npm run dev
   ```
   The API will be live at `http://localhost:5000/api`.

5. Populate Demo Data (Optional):
   ```bash
   npm run seed
   ```
   Seeds a full set of urgent, high, medium, and low tasks with imminent and future deadlines for the demo account (`demo.engineer@taskmaster.dev` / `Password123!`).

6. Run the Automated E2E Test Suite:
   ```bash
   npm run test:api
   ```
   **Output**:
   ```
   --- STARTING TASKMASTER BACKEND E2E TEST SUITE ---
   [PASS] Health Check Status: 200 (healthy)
   [PASS] Register User Status: 201
   [PASS] Auth Me: Alex Principal
   [PASS] Created Urgent Task: Score: 350
   [PASS] Created Low Task: Score: 36.6
   [PASS] Created Medium Task: Score: 146
   [PASS] Fetched 3 tasks with composite sort.
   Composite Rank Order:
     #1 [Score: 350] [Priority: urgent] Fix critical mobile crash on launch
     #2 [Score: 146] [Priority: medium] Update React Native dependencies
     #3 [Score: 36.6] [Priority: low] Review quarterly tech roadmap documentation
   [PASS] Toggled Urgent Task isCompleted: true
   [PASS] After completion, lowest ranked task is now: Fix critical mobile crash (Score: -9998)
   [PASS] Filter pending returned 2 tasks (expected 2)
   [PASS] Delete Task Status: 200
   ========================================================
    ALL BACKEND INTEGRATION & ALGORITHM TESTS PASSED 100%! 
   ========================================================
   ```

---

### Step 2: Run the Mobile Application (Android)

1. Open a new terminal and navigate to the mobile folder:
   ```bash
   cd mobile
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Reverse the port for Android emulator / physical USB device:
   ```bash
   adb reverse tcp:5000 tcp:5000
   ```
4. Launch Metro Bundler:
   ```bash
   npx react-native start
   ```
5. Run Android build:
   ```bash
   npx react-native run-android
   ```

---

## 📱 Mobile App Screens & Flows

1. **Authentication Flow**:
   - `LoginScreen`: Modern glassmorphic card with validation feedback, password show/hide toggle, and a **"Quick Demo Autofill"** button for 1-tap testing.
   - `RegisterScreen`: Full account registration with name, email, password, and confirmation checks.
2. **Task Dashboard (`HomeScreen`)**:
   - **Metrics Banner**: Real-time counter of total tasks, completion percentage, and urgent tasks remaining.
   - **Search Bar**: Debounced instant search filtering by title and description.
   - **Filter Pills**: Seamlessly toggle between `All`, `Active`, and `Done`.
   - **Category Carousel**: Horizontally scrollable chips for `All`, `Work`, `Personal`, `Fitness`, `Engineering`, etc.
   - **Composite Sort Modal**: Choose between Smart Composite Score, Deadline Soonest, Priority Highest, or Recently Added.
   - **Pull-To-Refresh**: Native pull-down refresh with haptic feedback.
3. **Task Creation & Editing (`CreateEditTaskScreen`)**:
   - Title & description inputs with validation errors.
   - Priority Selector pills (Urgent, High, Medium, Low).
   - DateTimePickers for both Target Due Date and Hard Deadline.
   - Preset category tag selectors + custom tag generator.
4. **Task Overview (`TaskDetailScreen`)**:
   - Full view of countdown badge, composite score breakdown, schedule timings, and tags.
   - Interactive completion status toggle button.
   - Edit navigation and delete with confirmation dialog.
