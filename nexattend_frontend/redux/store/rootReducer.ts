import authReducer      from '../features/auth/authSlice';
import userReducer      from '../features/user/userSlice';
import profileReducer   from '../features/profile/profileSlice';
import deviceReducer    from '../features/device/deviceSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import presenceReducer  from '../features/presence/presenceSlice';

const rootReducer = {
  auth:       authReducer,
  user:       userReducer,
  profile:    profileReducer,
  device:     deviceReducer,
  attendance: attendanceReducer,
  presence:   presenceReducer,
};

export default rootReducer;
