export const API_ROUTES = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
  },

  USERS: {
    BASE:          '/users',
    BY_ID:         (id: string) => `/users/${id}`,
    BULK_STUDENTS: '/users/bulk-students',
  },

  PROFILES: {
    BY_USER_ID: (userId: number) => `/profiles/${userId}`,
    CREATE:     '/profiles/create',
  },

  DEVICES: {
    BASE:     '/devices',
    REGISTER: '/devices/register',
  },

  ATTENDANCE: {
    ADMIN_STUDENTS: '/attendance/admin/students',
  },

  PRESENCE: {
    BASE: '/presence',
  },
} as const;
