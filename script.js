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
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
            pdf.getPage(i).then(page => {
                page.getTextContent().then(text => {
                    fullText += text.items.map(item => item.str).join(' ') + ' ';
                    if (i === numPages) {
                        processText(fullText);
                    }
                });
            });
        }
    }).catch(error => {
        alert("Erro ao ler o PDF: " + error);
    });
}

function processText(text) {
    // Regex para identificar números de telefone (ajuste conforme a formatação do seu PDF)
    const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-\d{4}/g;
    const phones = text.match(phoneRegex);
    
    if (phones) {
        let phoneData = {};

        phones.forEach(phone => {
            phoneData[phone] = [];
        });

        // Dividir o texto em linhas ou partes baseadas nos números
        const lines = text.split('\n');
        let currentPhone = null;

        lines.forEach(line => {
            // Verifica se a linha contém um número de telefone
            let match = line.match(phoneRegex);
            if (match) {
                currentPhone = match[0];
            } else if (currentPhone) {
                // Se a linha não contiver um telefone, adiciona a linha ao número atual
                phoneData[currentPhone].push(line.trim());
            }
        });

        // Exibir as informações
        displayPhoneData(phoneData);
    }
}

function displayPhoneData(phoneData) {
    const container = document.getElementById('pdf-content');
    container.innerHTML = ''; // Limpa o conteúdo anterior

    for (const phone in phoneData) {
        let phoneSection = document.createElement('div');
        phoneSection.classList.add('phone-section');
        
        let phoneTitle = document.createElement('h3');
        phoneTitle.innerText = `Número: ${phone}`;
        phoneSection.appendChild(phoneTitle);

        let phoneDetails = document.createElement('ul');
        phoneData[phone].forEach(detail => {
            let listItem = document.createElement('li');
            listItem.innerText = detail;
            phoneDetails.appendChild(listItem);
        });
        
        phoneSection.appendChild(phoneDetails);
        container.appendChild(phoneSection);
    }
}
