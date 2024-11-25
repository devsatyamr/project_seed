from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import io

app = Flask(__name__)
CORS(app)

def get_prediction_explanation(data_df):
    try:
        # Load the model and label encoder
        model = joblib.load('models/disease_prediction_model.joblib')
        le = joblib.load('models/disease_label_encoder.joblib')
        
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
        
        result = {
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
        
        print("Sending result:", result)  # Debug print
        return result
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        raise e

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200
        
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    try:
        file = request.files['file']
        # Read CSV data
        csv_content = file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_content))
        
        print("Received CSV data:")
        print(df.head())  # Log the input data
        
        # Get prediction using updated logic
        result = get_prediction_explanation(df)
        
        print("Calculated factors:")
        for factor in result['factors']:
            print(f"{factor['name']}: {factor['value']}")
            
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in predict route: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)