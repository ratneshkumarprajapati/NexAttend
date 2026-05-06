# NexAttend - Attendance Management System

A modern, feature-rich attendance tracking and device management system built with Next.js 16, Redux Toolkit, and Tailwind CSS.

## Features

### Dashboard
- Real-time attendance overview with key metrics
- Weekly attendance breakdown charts
- Current attendance distribution visualization
- Live sync status indicator

![alt text](image.png)
![alt text](image-1.png)

### Device Management
- Register and manage attendance devices
- Filter devices by status and type
- Track device registration dates and last seen timestamps
- Support for multiple device types (attendance machines, biometric scanners, mobile devices)

### Real-time Presence Tracking
- Live attendance status with 5-second auto-refresh
- Filter by user name and status
- Quick stats for present, absent, late, and left early counts
- Detailed presence records with check-in/check-out times

### Attendance Records
- Monthly attendance calendar navigation
- Detailed attendance records with date filtering
- Support for multiple attendance statuses (present, absent, late, left early, half day)
- Monthly statistics and trend analysis
- Search and filter capabilities

### Authentication
- Secure login/register system
- JWT token-based authentication
- Automatic token persistence in localStorage
- Protected routes with automatic redirects

### Theme & UI
- Dark/Light mode toggle
- Responsive design (mobile, tablet, desktop)
- Collapsible sidebar navigation
- User profile menu with logout functionality

## Tech Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **State Management**: Redux Toolkit + React-Redux
- **Styling**: Tailwind CSS + shadcn/ui
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Theme**: next-themes
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Form Validation**: React Hook Form
- **Language**: TypeScript

## Project Structure

```
app/
├── (protected)/               # Protected routes requiring auth
│   ├── dashboard/            # Dashboard page
│   ├── devices/              # Device management
│   ├── presence/             # Real-time presence tracking
│   ├── attendance/           # Attendance records
│   └── layout.tsx            # Protected layout with sidebar/navbar
├── login/                    # Login page
├── register/                 # Registration page
├── page.tsx                  # Root redirect page
└── layout.tsx               # Root layout with Redux provider

components/
├── sidebar.tsx              # Navigation sidebar
├── navbar.tsx               # Top navigation bar
├── theme-provider.tsx       # Theme provider wrapper
└── ui/                      # shadcn/ui components

lib/
├── api.ts                   # Axios API instance with JWT interceptor
├── store.ts                 # Redux store configuration
├── hooks.ts                 # Custom Redux hooks
└── slices/                  # Redux slices
    ├── authSlice.ts         # Authentication state
    ├── deviceSlice.ts       # Device management state
    ├── presenceSlice.ts     # Presence tracking state
    └── attendanceSlice.ts   # Attendance records state
```

## Getting Started

### Prerequisites
- Node.js 18+ or higher
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env.local` file based on `.env.example`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The application expects the following API endpoints. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your backend API.

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Devices
- `GET /devices` - Get all devices
- `POST /devices` - Register new device

### Presence
- `GET /presence` - Get all presence records
- `GET /presence/today` - Get today's presence records

### Attendance
- `GET /attendance` - Get attendance records with optional date filters

## State Management

The application uses Redux Toolkit for state management with the following slices:

### Auth Slice
- Manages user authentication state
- Persists tokens and user data to localStorage
- Handles login/logout operations

### Device Slice
- Manages device list and registration
- Handles device filtering
- Tracks device status and metadata

### Presence Slice
- Manages real-time presence records
- Handles 5-second polling for live updates
- Filters by user and status

### Attendance Slice
- Manages attendance records
- Handles monthly navigation
- Supports filtering and sorting

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: http://localhost:3000/api)

## Building for Production

```bash
pnpm build
pnpm start
```

## Deployment

The application can be deployed to any Node.js hosting provider:

1. Build the application:
```bash
pnpm build
```

2. Deploy the build output to your hosting platform.

### Vercel Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository on [Vercel](https://vercel.com)
3. Set the environment variables
4. Deploy

## Development Notes

- The application uses Redux for global state management
- API requests are intercepted to automatically add JWT tokens from localStorage
- Presence data refreshes every 5 seconds for real-time updates
- All dates are formatted using date-fns library
- The UI is fully responsive and supports dark/light modes

## Security Considerations

- JWT tokens are stored in localStorage (consider using secure cookies for production)
- All API requests include the Authorization header with the Bearer token
- Automatic logout on 401 responses
- Protected routes redirect unauthenticated users to login

## Future Enhancements

- Offline support with service workers
- Advanced analytics and reporting
- Export functionality for attendance records
- Device health monitoring
- Integration with additional device types
- Bulk attendance management
- Automated email notifications

## License

This project is proprietary software for NexAttend.

## Support

For issues or questions, please contact support@nexattend.com
