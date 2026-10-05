import JSZip from 'jszip';
import { AirlineDataRecord } from '../types';
import { generateAirlineCsv } from '../data/airlineDataset';

export const REQUIREMENTS_TXT = `pandas
scikit-learn
joblib
streamlit
`;

export const TRAIN_MODEL_PY = `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

print("🔄 Loading Airline Dataset...")
# Ensure 'Airline Dataset.csv' is in the same directory
df = pd.read_csv("Airline Dataset.csv")

print("⚙️ Preprocessing dates and features...")
df["Departure Date"] = pd.to_datetime(df["Departure Date"])
df["dep_month"] = df["Departure Date"].dt.month
df["dep_dayofweek"] = df["Departure Date"].dt.dayofweek

features = ["Gender", "Age", "Nationality", "Airport Country Code",
            "Airport Continent", "dep_month", "dep_dayofweek"]
cat = ["Gender", "Nationality", "Airport Country Code", "Airport Continent"]
num = ["Age", "dep_month", "dep_dayofweek"]
X, y = df[features], df["Flight Status"]

preprocess = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat),
    ("num", StandardScaler(), num)])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y)

print("🏋️ Training final Logistic Regression model pipeline...")
final_pipeline = Pipeline([
    ("preprocess", preprocess), 
    ("model", LogisticRegression(max_iter=500))
])

final_pipeline.fit(X_train, y_train)

# Evaluation
pred = final_pipeline.predict(X_test)
print("\\n📊 Final Test-set Results:")
print(f"Accuracy:  {accuracy_score(y_test, pred)*100:.2f}%")
print(f"F1-Score:  {f1_score(y_test, pred, average='weighted')*100:.2f}%")

print("\\n💾 Saving model to 'flight_status_model.pkl'...")
joblib.dump(final_pipeline, "flight_status_model.pkl")
print("✅ Done! You can now run the Streamlit app.")
`;

export const APP_PY = `import joblib
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Flight Delay Predictor", page_icon="✈️", layout="centered")

# Load model and dataset safely
@st.cache_resource
def load_resources():
    model = joblib.load("flight_status_model.pkl")
    df = pd.read_csv("Airline Dataset.csv")
    return model, df

try:
    model, df = load_resources()
    
    st.title("✈️ Flight Delay Predictor")
    st.caption("Predicts On Time / Delayed / Cancelled from passenger and airport details.")
    st.write("---")

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### 👤 Passenger Details")
        gender = st.selectbox("Gender", sorted(df["Gender"].unique()))
        age = st.slider("Age", 1, 90, 35)
        nationality = st.selectbox("Nationality", sorted(df["Nationality"].unique()))
    with col2:
        st.markdown("### 🛫 Flight Details")
        country = st.selectbox("Airport country code", sorted(df["Airport Country Code"].unique()))
        continent = st.selectbox("Airport continent", sorted(df["Airport Continent"].unique()))
        date = st.date_input("Departure date")

    st.write("")
    if st.button("Predict Flight Status", type="primary", use_container_width=True):
        row = pd.DataFrame([{
            "Gender": gender, "Age": age, "Nationality": nationality,
            "Airport Country Code": country, "Airport Continent": continent,
            "dep_month": date.month, "dep_dayofweek": date.weekday()}])
        
        # Make predictions
        prediction = model.predict(row)[0]
        proba = model.predict_proba(row)[0]
        
        # Display Result UI
        st.write("---")
        st.subheader(f"🔮 Predicted status: **{prediction}**")
        
        prob_df = pd.Series(proba, index=model.classes_, name="Probability")
        st.bar_chart(prob_df)
        
        st.warning("⚠️ **Note:** All class probabilities are close to 33%. The available demographic fields carry very little real predictive signal, so treat this prediction as a demonstration of the data pipeline only.")

except FileNotFoundError:
    st.error("🚨 **Initialization Error:** Please make sure \`flight_status_model.pkl\` and \`Airline Dataset.csv\` are present in this folder. Run \`python train_model.py\` first to generate the model file.")
`;

export const README_MD = `# Flight Delay Predictor

This project trains a multi-class Logistic Regression pipeline with scikit-learn and serves it via an interactive Streamlit web dashboard.

## 🚀 Quick Start Instructions

1. **Install Python dependencies:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. **Train the machine learning model:**
   \`\`\`bash
   python train_model.py
   \`\`\`
   This will train the pipeline on \`Airline Dataset.csv\` and serialize \`flight_status_model.pkl\`.

3. **Launch the Streamlit app:**
   \`\`\`bash
   streamlit run app.py
   \`\`\`

## 📦 Package Contents
- \`requirements.txt\`: Python package dependencies (pandas, scikit-learn, joblib, streamlit)
- \`train_model.py\`: Feature engineering pipeline and logistic regression training script
- \`app.py\`: Interactive Streamlit frontend with passenger & flight inputs
- \`Airline Dataset.csv\`: Sample airline dataset for training and inference
`;

export async function downloadPredictorZip(records?: AirlineDataRecord[]): Promise<void> {
  const zip = new JSZip();

  // Add the primary script files
  zip.file('requirements.txt', REQUIREMENTS_TXT);
  zip.file('train_model.py', TRAIN_MODEL_PY);
  zip.file('app.py', APP_PY);
  zip.file('README.md', README_MD);

  // If dataset records provided, include Airline Dataset.csv so it works out of the box
  if (records && records.length > 0) {
    const csvContent = generateAirlineCsv(records);
    zip.file('Airline Dataset.csv', csvContent);
  }

  // Generate zip blob
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  // Trigger browser download
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Flight_Delay_Predictor_App_Files.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
