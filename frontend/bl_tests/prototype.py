import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt
import numpy as np

def explain_prediction(model, input_data, feature_names):
    try:
        # Create SHAP explainer
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(input_data)
        
        # Try SHAP visualization
        try:
            plt.figure(figsize=(12, 8))
            if isinstance(shap_values, list):  # Multi-class case
                prediction = model.predict(input_data)[0]
                shap.plots.force(
                    explainer.expected_value[prediction],
                    shap_values[prediction],
                    input_data,
                    feature_names=feature_names,
                    matplotlib=True,
                    show=False
                )
            else:  # Binary classification case
                shap.plots.force(
                    explainer.expected_value,
                    shap_values,
                    input_data,
                    feature_names=feature_names,
                    matplotlib=True,
                    show=False
                )
            plt.tight_layout()
            plt.show()
        except Exception as e:
            print(f"Note: SHAP visualization could not be displayed: {e}")
        
        # Calculate feature importance (this will work even if visualization fails)
        if isinstance(shap_values, list):
            importance_values = np.abs(np.array(shap_values)).mean(axis=0)[0]
        else:
            importance_values = np.abs(shap_values)[0]
        
        # Create feature importance dictionary
        feature_importance_dict = dict(zip(feature_names, importance_values))
        
        # Get top 5 features
        top_features = dict(sorted(
            feature_importance_dict.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5])
        
        # Try to create bar plot
        try:
            plt.figure(figsize=(12, 6))
            features, values = zip(*top_features.items())
            plt.barh(features, values)
            plt.title('Top Contributing Factors')
            plt.xlabel('Importance')
            plt.tight_layout()
            plt.show()
        except Exception as e:
            print(f"Note: Feature importance plot could not be displayed: {e}")
        
        return {
            'top_features': top_features,
            'feature_importance': feature_importance_dict
        }
        
    except Exception as e:
        print(f"Warning: SHAP explanation failed: {e}")
        # Fallback to feature importances from the model itself
        try:
            importances = model.feature_importances_
            feature_importance_dict = dict(zip(feature_names, importances))
            top_features = dict(sorted(
                feature_importance_dict.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5])
            return {
                'top_features': top_features,
                'feature_importance': feature_importance_dict
            }
        except:
            return None

def get_prediction_explanation(csv_file_path):
    try:
        # Load the model and label encoder
        model = joblib.load('disease_prediction_model.joblib')
        le = joblib.load('disease_label_encoder.joblib')
        
        # Read the CSV file
        df = pd.read_csv(csv_file_path)
        
        # Extract patient name and test results
        patient_name = df['Name'].iloc[0]
        blood_test_results = df.drop('Name', axis=1).iloc[0].to_dict()
        
        # Prepare input data
        input_data = pd.DataFrame([blood_test_results])
        
        # Get prediction and probabilities
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        
        # Get disease name
        disease_name = le.inverse_transform([prediction])[0]
        
        # Get explanation
        explanation = explain_prediction(model, input_data, list(blood_test_results.keys()))
        
        # Format results
        result = {
            'patient_name': patient_name,
            'prediction': disease_name,
            'confidence': probabilities[prediction],
            'top_contributing_features': explanation['top_features'] if explanation else {},
            'feature_importance': explanation['feature_importance'] if explanation else {}
        }
        
        return result
    
    except Exception as e:
        return {
            'error': f"An error occurred: {str(e)}"
        }

def print_friendly_report(result):
    """
    Print the results in a user-friendly format
    """
    print("\n" + "="*50)
    print(f"Blood Test Analysis Report for {result['patient_name']}")
    print("="*50)
    
    print(f"\nPredicted Condition: {result['prediction']}")
    print(f"Confidence Level: {result['confidence']*100:.1f}%")
    
    print("\nTop Contributing Factors:")
    print("-"*30)
    for feature, importance in result['top_contributing_features'].items():
        # Convert feature names to more readable format
        readable_feature = feature.replace('_', ' ').title()
        print(f"{readable_feature}: {abs(importance):.4f}")
    
    print("\nNote: This is an AI-assisted analysis and should be reviewed by a healthcare professional.")
    print("="*50)

# Example usage
if __name__ == "__main__":
    # Get the file path from user input
    file_path = ('5.csv')
    
    # Get prediction and explanation
    result = get_prediction_explanation(file_path)
    
    # Check for errors
    if 'error' in result:
        print(f"\nError: {result['error']}")
    else:
        # Print the friendly report
        print_friendly_report(result)