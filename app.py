from flask import Flask, request, jsonify
import pdfplumber
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Leitor de Faturas</title>
    </head>
    <body>
        <h1>Upload de Fatura</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file" accept=".pdf">
            <button type="submit">Enviar</button>
        </form>
    </body>
    </html>
    '''

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "Nenhum arquivo enviado!"

    file = request.files['file']
    if file.filename == '':
        return "Nenhum arquivo selecionado!"

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    if file.filename.endswith('.pdf'):
        data = process_pdf(file_path)
    else:
        return "Formato de arquivo não suportado! Apenas PDFs são aceitos."

    return jsonify(data)

def process_pdf(file_path):
    extracted_data = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted_data.extend(text.split('\n'))
    return {'lines': extracted_data}

if __name__ == '__main__':
    app.run(debug=True)
