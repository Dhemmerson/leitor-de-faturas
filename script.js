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
    // Regex para identificar o número de telefone (ajustado para o formato fornecido)
    const phoneRegex = /Detalhamento de Serviços N° \d{2} \d{5}-\d{4}/g;
    const phones = text.match(phoneRegex);

    if (phones) {
        let phoneData = {};

        phones.forEach(phone => {
            phoneData[phone] = [];
        });

        // Dividir o texto em linhas
        const lines = text.split('\n');
        let currentPhone = null;

        lines.forEach(line => {
            // Verifica se a linha contém um número de telefone
            let match = line.match(phoneRegex);
            if (match) {
                currentPhone = match[0];
            } else if (currentPhone) {
                // Se a linha não contiver um telefone, tentamos extrair os dados desejados
                const data = extractDataFromLine(line);
                if (data) {
                    phoneData[currentPhone].push(data);
                }
            }
        });

        // Exibir as informações
        displayPhoneData(phoneData);
    }
}

// Função para extrair os dados das linhas após o número de telefone
function extractDataFromLine(line) {
    // Regex para identificar os dados: DATA HORA ORIGEM DESTINO QUANTIDADE TIPO PACOTE REALIZADO TARIFADO VALOR
    const dataRegex = /(\d{2}\/\d{2}\/\d{4})\s(\d{2}:\d{2})\s([A-Za-zá-úÁ-Ú\s]+)\s([A-Za-zá-úÁ-Ú\s]+)\s(\d+)\s([A-Za-zá-úÁ-Ú]+)\s([A-Za-zá-úÁ-Ú]+)\s([A-Za-zá-úÁ-Ú]+)\s([A-Za-zá-úÁ-Ú]+)\s([\d,]+(?:\.\d{2})?)/;
    const match = line.match(dataRegex);

    if (match) {
        return {
            DATA: match[1],
            HORA: match[2],
            ORIGEM: match[3],
            DESTINO: match[4],
            QUANTIDADE: match[5],
            TIPO: match[6],
            PACOTE: match[7],
            REALIZADO: match[8],
            TARIFADO: match[9],
            VALOR: match[10]
        };
    }

    return null;
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

        phoneData[phone].forEach(entry => {
            let entryList = document.createElement('ul');
            for (const key in entry) {
                let listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${key}:</strong> ${entry[key]}`;
                entryList.appendChild(listItem);
            }
            phoneSection.appendChild(entryList);
        });
        
        container.appendChild(phoneSection);
    }
}
