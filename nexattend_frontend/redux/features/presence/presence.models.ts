export type PresenceStatus = 'present' | 'absent' | 'late' | 'left_early';

export interface PresenceRecord {
  id:            string;
  userId:        string;
  userName:      string;
  status:        PresenceStatus;
  checkInTime?:  string;
  checkOutTime?: string;
  timestamp:     string;
  location?:     string;
  deviceId?:     string;
}

export interface PresenceState {
  records:      PresenceRecord[];
  isLoading:    boolean;
  error:        string | null;
  lastUpdated:  string | null;
  pollInterval: number;
}
