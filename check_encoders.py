import joblib

encoders = joblib.load("models/encoders.pkl")

print("Encoded Columns:\n")

for column, encoder in encoders.items():
    print(f"{column}:")
    print(list(encoder.classes_))
    print("-" * 50)