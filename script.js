document.getElementById('file-input').addEventListener('change', handleFile, false);

function handleFile(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const pdfData = new Uint8Array(e.target.result);
            extractPDFContent(pdfData);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Por favor, selecione um arquivo PDF.");
    }
}

function extractPDFContent(pdfData) {
    pdfjsLib.getDocument(pdfData).promise.then(pdf => {
        let content = '';
        let numPages = pdf.numPages;
        for (let i = 1; i <= numPages; i++) {
            pdf.getPage(i).then(page => {
                page.getTextContent().then(text => {
                    content += text.items.map(item => item.str).join(' ') + ' ';
                    document.getElementById('pdf-content').innerText = content;
                });
            });
        }
    }).catch(error => {
        alert("Erro ao ler o PDF: " + error);
    });
}
