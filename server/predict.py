import sys
import pandas as pd
import joblib
import json

def get_prediction(csv_path, model_path, encoder_path):
    try:
        # Load the model and label encoder
        model = joblib.load(model_path)
        le = joblib.load(encoder_path)
        
        # Read the CSV file
        df = pd.read_csv(csv_path)
        
        # Extract patient name and test results
        patient_name = df['Name'].iloc[0]
        input_data = df.drop('Name', axis=1).iloc[0:1]
        
        # Get prediction and probabilities
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        
        # Get disease name
        disease_name = le.inverse_transform([prediction])[0]
        
        # Get feature importance
        importance = model.feature_importances_
        features = input_data.columns
        
        # Get top 5 contributing factors
        factors = [
            {"name": feat, "value": float(imp)}
            for feat, imp in sorted(
                zip(features, importance),
                key=lambda x: x[1],
                reverse=True
            )[:5]
        ]
        
        result = {
            "patientName": patient_name,
            "prediction": disease_name,
            "confidence": float(probabilities[prediction]),
            "factors": factors
        }
        
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Invalid arguments"}), file=sys.stderr)
        sys.exit(1)
        
    csv_path = sys.argv[1]
    model_path = sys.argv[2]
    encoder_path = sys.argv[3]
    
    get_prediction(csv_path, model_path, encoder_path)