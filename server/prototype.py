import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

def get_prediction_explanation(file_path):
    try:
        # Read the CSV file
        data_df = pd.read_csv(file_path)
        
        # Load the model and label encoder
        model = joblib.load('disease_prediction_model.joblib')
        le = joblib.load('disease_label_encoder.joblib')
        
        # Extract patient name and test results
        patient_name = data_df['Name'].iloc[0]
        blood_test_results = data_df.drop('Name', axis=1).iloc[0].to_dict()
        
        # Prepare input data
        input_data = pd.DataFrame([blood_test_results])
        
        # Get prediction and probabilities
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        
        # Get disease name
        disease_name = le.inverse_transform([prediction])[0]
        
        # Define normal ranges for blood tests
        normal_ranges = {
            'Glucose': 100,
            'Cholesterol': 200,
            'Hemoglobin': 14,
            'Platelets': 250,
            'White Blood Cells': 7.5,
            'Red Blood Cells': 5,
            'HCT': 45,
            'MCH': 30,
            'MCHC': 34,
            'MCV': 90,
            'RDW': 13,
            'Neutrophils': 60,
            'Lymphocytes': 30,
            'Monocytes': 8,
            'Eosinophils': 3,
            'Basophils': 1,
            'AST': 25,
            'ALT': 25,
            'ALP': 100,
            'Bilirubin': 1,
            'Protein': 7,
            'Albumin': 4,
            'Insulin': 10
        }
        
        # Calculate feature importance based on deviation from normal range
        feature_importance_dict = {}
        for feature, value in blood_test_results.items():
            if feature in normal_ranges:
                # Calculate percentage deviation from normal range
                normal_value = normal_ranges[feature]
                deviation = abs((float(value) - normal_value) / normal_value)
                feature_importance_dict[feature] = deviation
        
        # Normalize the importance values
        max_importance = max(feature_importance_dict.values()) if feature_importance_dict else 1
        feature_importance_dict = {
            k: v/max_importance 
            for k, v in feature_importance_dict.items()
        }
        
        # Get top 5 features
        top_features = dict(sorted(
            feature_importance_dict.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5])
        
        # Print results
        print("\nPrediction Results:")
        print("-" * 30)
        print(f"Patient Name: {patient_name}")
        print(f"Predicted Disease: {disease_name}")
        print(f"Confidence: {probabilities[prediction]*100:.2f}%")
        
        print("\nTop Contributing Factors:")
        print("-" * 30)
        for feature, importance in top_features.items():
            print(f"{feature}: {importance:.4f}")
        
        return {
            'patientName': patient_name,
            'prediction': disease_name,
            'confidence': round(float(probabilities[prediction] * 100), 2),
            'factors': [
                {
                    'name': feature.replace('_', ' ').title(),
                    'value': float(importance)
                }
                for feature, importance in top_features.items()
            ]
        }
    
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        raise e

# Test the function
if __name__ == "__main__":
    try:
        # Test files
        test_files = ['bl_tests/3.csv', 'bl_tests/4.csv', 'bl_tests/5.csv']
        
        for file_path in test_files:
            print(f"\nProcessing file: {file_path}")
            print("=" * 50)
            result = get_prediction_explanation(file_path)
            
            # Add a separator between files
            print("\n" + "=" * 50)
            
    except Exception as e:
        print(f"Error during testing: {str(e)}")