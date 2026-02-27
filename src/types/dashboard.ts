export interface TuitionCount {
  pendingTuitions: number;
  liveTuitions: number;
  shortlistedTuitions: number;
  appointedTuitions: number;
  confirmedTuitions: number;
  cancelledTuitions: number;
  totalTuitions: number;
}

export interface TutorCount {
  maleTutors: number;
  femaleTutors: number;
  totalTutors: number;
}

export interface GuardianCount {
  maleGuardians: number;
  femaleGuardians: number;
  totalGuardians: number;
}

export interface StaticCounter {
  createdAt: string;
  updatedAt: string;
  id: number;
  counterName: string;
  value: number;
}

