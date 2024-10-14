import pandas as pd

df = pd.read_csv('newdata.csv')

# Filter rows where the 'Code' column contains valid country codes 
df_cleaned = df[df['Code'].notna()]

df_cleaned.to_csv('cleaned_file.csv', index=False)

print("Non-country entries removed.")