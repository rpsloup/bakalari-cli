export type MarkEntry = {
  Marks: {
    MarkText: string;
    Weight: number;
    Theme: string;
    Caption: string;
  }[];
  Subject: {
    Abbrev: string;
    Name: string;
  };
  AverageText: string;
};
