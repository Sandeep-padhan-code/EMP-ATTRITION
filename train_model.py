import pandas as pd
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load Dataset

df = pd.read_csv(r"Z:\Employee-Attrition-Prediction\dataset\archive\employee_attrition.csv")

print("\nDataset Loaded Successfully\n")

print(df.head())

print("\nShape:", df.shape)

print("\nMissing Values:")
print(df.isnull().sum())

# Drop Unnecessary Columns

columns_to_drop = [
    "EmployeeCount",
    "EmployeeNumber",
    "Over18",
    "StandardHours"
]

df.drop(columns=columns_to_drop, inplace=True, errors="ignore")

# Encode Categorical Columns

encoders = {}

for column in df.select_dtypes(include=["object"]).columns:

    le = LabelEncoder()

    df[column] = le.fit_transform(df[column].astype(str))

    encoders[column] = le

print("\nCategorical Columns Encoded Successfully")


# Features and Target


X = df.drop("Attrition", axis=1)
y = df["Attrition"]

print("\nX Shape:", X.shape)
print("y Shape:", y.shape)

# Train Test Split


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


# Train Random Forest Model


model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)


# Prediction


y_pred = model.predict(X_test)

# Evaluation


accuracy = accuracy_score(y_test, y_pred)

print("\n==============================")
print("MODEL PERFORMANCE")
print("==============================")

print(f"\nAccuracy : {accuracy*100:.2f}%")

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))


# Feature Importance


feature_importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="Importance",
    ascending=False
)

print("\nTop 10 Important Features\n")
print(feature_importance.head(10))


# Save Model


joblib.dump(model, "employee_attrition_model.pkl")

print("\nModel saved successfully as employee_attrition_model.pkl")


# Save Encoders


joblib.dump(encoders, "encoders.pkl")

print("Encoders saved successfully as encoders.pkl")

print("\nTraining Completed Successfully")