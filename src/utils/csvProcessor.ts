interface CSVData {
  [key: string]: string;
}

interface ProcessedResults {
  patientName: string;
  prediction: string;
  confidence: number;
  factors: Array<{ name: string; value: number }>;
}

// Simplified disease prediction model based on common blood test ranges
const DISEASE_PATTERNS = {
  'Diabetes': {
    indicators: ['Glucose', 'HbA1c', 'Insulin'],
    thresholds: {
      Glucose: 126,
      HbA1c: 6.5,
      Insulin: 25
    }
  },
  'Anemia': {
    indicators: ['Hemoglobin', 'RBC', 'Iron'],
    thresholds: {
      Hemoglobin: 12,
      RBC: 4.0,
      Iron: 60
    }
  },
  'Thyroid Disorder': {
    indicators: ['TSH', 'T3', 'T4'],
    thresholds: {
      TSH: 4.5,
      T3: 2.0,
      T4: 12
    }
  },
  'Liver Disease': {
    indicators: ['ALT', 'AST', 'Bilirubin'],
    thresholds: {
      ALT: 40,
      AST: 40,
      Bilirubin: 1.2
    }
  },
  'Kidney Disease': {
    indicators: ['Creatinine', 'BUN', 'eGFR'],
    thresholds: {
      Creatinine: 1.2,
      BUN: 20,
      eGFR: 60
    }
  }
};

function calculateDiseaseConfidence(values: CSVData, disease: string): number {
  const pattern = DISEASE_PATTERNS[disease as keyof typeof DISEASE_PATTERNS];
  if (!pattern) return 0;

  let matchingIndicators = 0;
  let totalIndicators = pattern.indicators.length;
  
  for (const indicator of pattern.indicators) {
    const value = parseFloat(values[indicator]);
    const threshold = pattern.thresholds[indicator as keyof typeof pattern.thresholds];
    
    if (!isNaN(value) && value > threshold) {
      matchingIndicators++;
    }
  }

  return matchingIndicators / totalIndicators;
}

function normalizeValue(value: string, fieldName: string): number {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 0;

  // Normalize based on typical ranges for common blood tests
  const normalRanges: { [key: string]: { min: number; max: number } } = {
    Glucose: { min: 70, max: 200 },
    Hemoglobin: { min: 7, max: 18 },
    WBC: { min: 3, max: 15 },
    Platelets: { min: 150, max: 450 },
    Creatinine: { min: 0.5, max: 2.0 },
    // Add more ranges as needed
  };

  const range = normalRanges[fieldName];
  if (range) {
    return (numValue - range.min) / (range.max - range.min);
  }

  // Default normalization if no specific range is defined
  return numValue / 100;
}

export async function processCSVFile(csvContent: string): Promise<ProcessedResults> {
  // Parse CSV content
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const values = lines[1].split(',').map(value => value.trim());
  
  // Create data object
  const data: CSVData = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  // Extract patient name
  const patientName = data['Name'] || 'Unknown Patient';

  // Calculate confidence for each disease
  const predictions = Object.keys(DISEASE_PATTERNS).map(disease => ({
    disease,
    confidence: calculateDiseaseConfidence(data, disease)
  }));

  // Sort predictions by confidence and get the highest
  predictions.sort((a, b) => b.confidence - a.confidence);
  const topPrediction = predictions[0];

  // Process factors (contributing indicators)
  const factors = headers
    .filter(header => header !== 'Name')
    .map(header => ({
      name: header,
      value: normalizeValue(data[header], header)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Determine prediction and confidence
  let prediction = 'Normal Condition';
  let confidence = 0.65;

  if (topPrediction.confidence > 0) {
    prediction = topPrediction.disease;
    confidence = topPrediction.confidence;
  }

  // Add severity level to prediction if confidence is high enough
  if (confidence > 0.8) {
    prediction = `Severe ${prediction}`;
  } else if (confidence > 0.6) {
    prediction = `Moderate ${prediction}`;
  } else if (confidence > 0.4) {
    prediction = `Mild ${prediction}`;
  }

  return {
    patientName,
    prediction,
    confidence,
    factors
  };
}