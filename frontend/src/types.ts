export interface Factor {
    name: string;
    value: number;
  }
  
  export interface ResultsProps {
    results: {
      patientName: string;
      prediction: string;
      confidence: number;
      factors: Factor[];
    };
  }