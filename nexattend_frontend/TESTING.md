# Testing Guide for NexAttend

This guide provides instructions for testing the NexAttend attendance management system.

## Manual Testing

### 1. Authentication Testing

#### Test Login
1. Navigate to `http://localhost:3000/login`
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Should redirect to dashboard on successful login
4. Check that user data is stored in localStorage

#### Test Registration
1. Navigate to `http://localhost:3000/register`
2. Fill in:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `secure123`
   - Confirm Password: `secure123`
3. Should create account and redirect to dashboard

#### Test Logout
1. Click user profile menu (top-right)
2. Click "Logout"
3. Should redirect to login page
4. Verify localStorage is cleared

### 2. Dashboard Testing

1. Login to access dashboard
2. Verify the following components load:
   - Welcome message with user name
   - Total Devices card
   - Total Users card
   - Present Today card
   - Sync Status card
3. Check that charts render with sample data
4. Verify dark/light theme toggle works (top-right)

### 3. Device Management Testing

1. Navigate to Devices page
2. Click "Register Device" button
3. Fill in:
   - Device Name: `Main Entrance Machine`
   - Device ID: `DEV-001`
   - Device Type: `Attendance Machine`
4. Submit and verify device appears in table
5. Test search functionality
6. Test status filter dropdown

### 4. Real-time Presence Testing

1. Navigate to Presence page
2. Verify presence records load
3. Check that:
   - Stats cards update correctly
   - Records show in table with proper formatting
   - Search filter works
   - Status filter dropdown works
4. Test live update indicator (green pulse dot)
5. Verify 5-second auto-refresh (check timestamp changes)

### 5. Attendance Records Testing

1. Navigate to Attendance page
2. Test month navigation:
   - Click left arrow to go to previous month
   - Click right arrow to go to next month
3. Verify:
   - Stats cards show correct counts
   - Records filter by user name
   - Status filter works properly
   - Date display format is correct

### 6. Responsive Design Testing

Test on different screen sizes:

#### Mobile (375px)
- Sidebar should collapse
- Menu button should appear top-left
- Cards should stack vertically
- Tables should be scrollable

#### Tablet (768px)
- Sidebar should be accessible
- 2-column card layouts
- Tables readable

#### Desktop (1920px)
- Sidebar always visible
- Multi-column layouts
- Full table display

## API Testing

### Required Backend Endpoints

Ensure your backend API implements these endpoints:

```
POST /auth/login
- Request: { email, password }
- Response: { user, accessToken }

POST /auth/register
- Request: { name, email, password }
- Response: { user, accessToken }

GET /devices
- Response: { devices: [] }

POST /devices
- Request: { name, identifier, type }
- Response: { device }

GET /presence
- Response: { records: [] }

GET /presence/today
- Response: { records: [] }

GET /attendance
- Query params: dateFrom, dateTo, userId, status
- Response: { records: [] }
```

### Testing with Postman

1. Import the `NexAttend.postman_collection.json` file into Postman
2. Set your API base URL in the Postman environment
3. Test each endpoint with sample data

## Theme Testing

### Light Mode
1. Check all text is readable against light background
2. Verify button colors are visible
3. Check chart colors are distinct

### Dark Mode
1. Click moon icon in navbar
2. Verify all colors adapt correctly
3. Check no elements are lost in dark mode
4. Verify theme persistence on page reload

## Browser Compatibility

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Common Test Cases

### Navigation
- [ ] Sidebar menu items navigate correctly
- [ ] Navbar user menu works
- [ ] Theme toggle saves preference
- [ ] Logout removes auth state

### Data Display
- [ ] Charts render with correct data
- [ ] Tables paginate/scroll properly
- [ ] Filters work correctly
- [ ] Search functionality responds instantly

### Form Validation
- [ ] Required fields show error messages
- [ ] Password confirmation validation works
- [ ] Email format validation works
- [ ] Device registration validates input

### State Management
- [ ] Redux state updates correctly on API calls
- [ ] Filters persist within page navigation
- [ ] User data loads on page refresh
- [ ] Presence data auto-refreshes every 5 seconds

## Performance Testing

1. Open DevTools (F12)
2. Go to Performance tab
3. Record page load
4. Check:
   - Page load time < 2 seconds
   - No memory leaks
   - Smooth animations

5. Monitor Network:
   - Verify JWT token is sent in Authorization header
   - Check API response times < 500ms
   - Verify no failed requests

## Error Handling Testing

1. Disable network to test offline behavior
2. Send invalid credentials to test error messages
3. Test expired token handling (clear localStorage token)
4. Verify error notifications appear

## Accessibility Testing

1. Test keyboard navigation:
   - Tab through buttons
   - Enter activates buttons
   - Escape closes dialogs

2. Test with screen reader:
   - Buttons have proper labels
   - Form inputs are labeled
   - Tables are properly structured

3. Check color contrast:
   - Text on background meets WCAG standards
   - Focus indicators are visible

## Deployment Testing

Before deploying to production:

1. [ ] Build completes without errors: `pnpm build`
2. [ ] No TypeScript errors: `pnpm build` should succeed
3. [ ] Environment variables are set correctly
4. [ ] API URL points to production backend
5. [ ] All features work on production domain
6. [ ] Performance metrics are acceptable
7. [ ] Security headers are present
