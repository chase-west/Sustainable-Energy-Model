import pandas as pd

# Load the CSV file into a DataFrame
df = pd.read_csv('newdata.csv')

# Filter rows where the 'Code' column contains valid country codes (assuming non-country entries have missing or non-standard codes)
df_cleaned = df[df['Code'].notna()]

# Save the cleaned DataFrame to a new CSV
df_cleaned.to_csv('cleaned_file.csv', index=False)

print("Non-country entries removed.")