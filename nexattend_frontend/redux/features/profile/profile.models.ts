export interface PreparationGoal {
  target: string;
  focus:  string;
}

export interface ProfilePayload {
  userId:         number;
  firstName:      string;
  lastName:       string;
  phoneNo:        string;
  department:     string;
  enrolmentNo:    string;
  year:           number;
  preprationGoal: PreparationGoal;
}

export interface ProfileUpdatePayload {
  firstName?:      string;
  lastName?:       string;
  phoneNo?:        string;
  department?:     string;
  enrolmentNo?:    string;
  year?:           number;
  preprationGoal?: Partial<PreparationGoal>;
}

export interface ProfileRecord {
  id:             string;
  userId:         number;
  firstName:      string;
  lastName:       string;
  phoneNo:        string;
  department:     string;
  enrolmentNo:    string;
  year:           number;
  preprationGoal: PreparationGoal;
  createdAt?:     string;
  updatedAt?:     string;
}

export interface ProfileState {
  isEditing: boolean;
}
