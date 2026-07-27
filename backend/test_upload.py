import requests

# 1. The address of our Heart
url = 'http://127.0.0.1:5000/api/upload'

# 2. Tell the system who is uploading (User #1)
data = {'user_id': 1}

# 3. Choose your PDF file
# Change 'your_file_name.pdf' to the EXACT name of your PDF
# Make sure the PDF is sitting inside your 'backend' folder!
files = {'file': open('sample_rti.pdf', 'rb')}

print("Sending PDF to NyayaFlow Brain... Please wait...")

# 4. Push the button!
response = requests.post(url, files=files, data=data)

# 5. See what the Brain says
print(response.json())
