export type Absence = {
  PercentageThreshold: number;
  AbsencesPerSubject: {
    SubjectName: string;
    LessonsCount: number;
    Base: number;
    Late: number;
    Soon: number;
    School: number;
    DistanceTeaching: number;
  }[];
};
