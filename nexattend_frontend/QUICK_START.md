# NexAttend - Quick Start Guide

## What's New? 🎉

Your NexAttend application now has:
- ✅ **Role-Based UI** - Different views for Admin vs Student
- ✅ **Black Neon Theme** - Modern cyberpunk aesthetic with light mode support
- ✅ **Admin Dashboard** - Full student and device management
- ✅ **Bulk Upload** - Import multiple students from CSV
- ✅ **Settings Page** - Theme toggle and preferences
- ✅ **Fixed Errors** - No more JSX syntax or compilation errors

## Getting Started

### 1. Access the Application
```
Browser: http://localhost:3000
```

### 2. Login
```
Role Selection: Choose "Admin" or "Student"
Email: Any valid email (e.g., admin@example.com)
Password: Any password (e.g., Password@123)
Click: Sign In
```

### 3. Explore Features

#### As Admin
- **Dashboard**: System-wide attendance overview
- **Students**: Add/remove/search students
- **Devices**: Register and manage attendance devices
- **Bulk Upload**: Import multiple students from CSV
- **Attendance**: View and export attendance records
- **Settings**: Customize preferences

#### As Student
- **Dashboard**: Personal attendance stats
- **My Attendance**: View attendance history
- **Devices**: Check assigned devices
- **Settings**: Update preferences

## Key Features by Page

### Login Page (`/`)
- Role selector (Admin/Student)
- Email and password fields
- Demo mode indicator
- Link to register (if implemented)

### Dashboard (`/dashboard`)
- KPI cards showing key metrics
- Hourly attendance trend chart
- Status distribution pie chart
- Recent attendance table
- Real-time data updates

### Admin: Students (`/admin/students`)
- ✏️ Add new students
- 🔍 Search by name/email
- 📋 View all students
- 🗑️ Delete students
- 👤 View status badges

### Admin: Devices (`/admin/devices`)
- ✏️ Register new devices
- 🔍 Search by name/MAC
- 📱 View device status (online/offline)
- 🗑️ Remove devices
- 📍 Track device locations

### Admin: Bulk Upload (`/admin/bulk-upload`)
1. Download sample CSV
2. Fill in student data:
   ```
   email,password,firstName,lastName,phoneNo
   student1@example.com,Pass@123,John,Doe,9876543210
   ```
3. Upload file (drag & drop or select)
4. View results (success/failure count)

CSV Format Rules:
- Header row required
- Email must be valid format
- Password must be strong
- Phone must be numeric
- One student per row

### Admin: Attendance (`/admin/attendance`)
- 📊 Weekly attendance trends
- 📈 Status distribution chart
- 📋 Daily attendance records
- 📅 Filter by date
- 📥 Export reports

### Settings (`/settings`)
- 👤 Profile information (read-only)
- 🌙 Theme toggle (Light/Dark)
- 🔔 Notification preferences
- 🔒 Security options
- 🚪 Sign out

## Theme System

### Colors Used
| Color | Usage |
|-------|-------|
| 🟣 Purple | Primary buttons, highlights |
| 🟢 Cyan | Secondary accents, borders |
| 🟡 Lime | Success states, positive indicators |
| ⚫ Black | Background, dark surfaces |
| ⚪ White | Text, foreground content |
| 🔴 Red | Errors, destructive actions |

### Light vs Dark Mode
- **Light Mode**: High contrast for daytime use
- **Dark Mode**: Eye-friendly neon on black for nighttime use
- **Toggle**: Located in navbar or settings

## Navigation Tips

### Sidebar Navigation
- **Mobile**: Click menu icon (☰) to open/close
- **Desktop**: Always visible on left side
- **Active State**: Highlighted in bright neon color
- **Role-Based**: Shows different items for Admin vs Student

### Top Navbar
- **Left Side**: Logo and breadcrumbs
- **Right Side**: Theme toggle, user menu
- **User Menu**: Profile, Settings, Sign Out

## Common Tasks

### Add a New Student
```
1. Click "Students" in sidebar
2. Click "Add Student" button
3. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Phone: 9876543210
   - Enrollment: ENR001
4. Click "Add Student"
```

### Register a Device
```
1. Click "Devices" in sidebar
2. Click "Register Device"
3. Fill in:
   - Device Name: Device-1
   - MAC Address: AA:BB:CC:DD:EE:FF
   - Location: Main Entrance
4. Click "Register Device"
```

### Upload Students in Bulk
```
1. Click "Bulk Upload" in sidebar
2. Click "Download Sample CSV"
3. Open CSV file in Excel
4. Add your students
5. Save file
6. Drag & drop file or click "Select File"
7. Click "Upload Students"
8. View results
```

### Change Theme
```
Option 1: Click sun/moon icon in navbar
Option 2: Go to Settings → Click Light/Dark button
```

### Sign Out
```
Option 1: Click user avatar → Click "Sign Out"
Option 2: Go to Settings → Click "Sign Out" button
```

## Keyboard Shortcuts (Coming Soon)
- `Cmd/Ctrl + K`: Command palette
- `Cmd/Ctrl + /`: Help menu
- `Esc`: Close modals
- `Tab`: Navigate through fields

## Accessibility Features
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast mode compatible
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels throughout

## Troubleshooting

### I can't login
- Make sure you're entering valid email format
- Try different role (Admin vs Student)
- Clear browser cache and reload

### Theme isn't changing
- Refresh page after toggling
- Check browser allows localStorage
- Try different theme and toggle back

### Bulk upload not working
- Check CSV format matches sample
- Verify all required columns present
- Check file is not corrupted

### Page not loading
- Check internet connection
- Clear browser cache
- Try incognito mode
- Check browser console for errors

## Browser Console Tips

Check for errors:
```javascript
// Open browser console (F12)
// Look for red error messages
// Copy error and search online
```

Check local storage:
```javascript
// View stored theme
localStorage.getItem('theme')

// View stored user
localStorage.getItem('user')

// View stored token
localStorage.getItem('accessToken')
```

## API Integration (Next Step)

When connecting to backend, these endpoints will be used:
```
POST   /api/v1/auth/register      - Register user
POST   /api/v1/auth/login         - Login user
POST   /api/v1/users              - Create student
GET    /api/v1/users              - List students
DELETE /api/v1/users/:id          - Delete student
POST   /api/v1/users/bulk         - Bulk import
POST   /api/v1/devices            - Register device
GET    /api/v1/devices            - List devices
DELETE /api/v1/devices/:id        - Delete device
GET    /api/v1/attendance         - Get records
POST   /api/v1/attendance         - Create record
GET    /api/v1/attendance/export  - Export data
```

## File Locations Reference

Key files to know about:
```
app/
├── login/page.tsx                    # Login with role selector
├── (protected)/
│   ├── dashboard/page.tsx            # Main dashboard
│   ├── admin/
│   │   ├── students/page.tsx         # Manage students
│   │   ├── devices/page.tsx          # Manage devices
│   │   ├── bulk-upload/page.tsx      # Bulk import
│   │   └── attendance/page.tsx       # Attendance view
│   └── settings/page.tsx             # Settings page
├── globals.css                       # Theme colors
└── layout.tsx                        # Root layout

components/
├── sidebar.tsx                       # Role-based navigation
├── navbar.tsx                        # Top navigation bar
└── ui/                               # Shadcn components
```

## Support Documentation

- **Detailed Features**: See `ROLE_BASED_FEATURES.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **API Docs**: Check Postman collection

## What's Next?

1. ✅ Explore all pages
2. ✅ Test role switching (Admin vs Student)
3. ✅ Try bulk CSV upload
4. ✅ Toggle theme (light/dark)
5. 🔲 Connect to backend API
6. 🔲 Implement real authentication
7. 🔲 Set up database
8. 🔲 Deploy to production

Enjoy your new NexAttend system! 🚀
