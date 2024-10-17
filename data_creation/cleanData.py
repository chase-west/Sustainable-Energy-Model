import pandas as pd

# filter rows for only countries 
df = pd.read_csv('newdata.csv')
df_cleaned = df[df['Code'].notna()]
df_cleaned.to_csv('cleaned_file.csv', index=False)
print("Non-country entries removed.")