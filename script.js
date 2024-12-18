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
        let fullText = '';
        let numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
            pdf.getPage(i).then(page => {
                page.getTextContent().then(text => {
                    fullText += text.items.map(item => item.str).join(' ') + ' ';
                    if (i === numPages) {
                        console.log(fullText);  // Verifique o conteúdo extraído
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
    console.log(text);  // Adicionado para exibir o conteúdo extraído do PDF

    // Regex para capturar números de telefone no formato "xx xxxxxx-xxxx"
    const phoneRegex = /\d{2} \d{5}-\d{4}/g;
    const phones = text.match(phoneRegex);

    if (phones) {
        displayPhoneNumbers(phones);
    } else {
        console.log("Nenhum número de telefone encontrado.");
    }
}

// Função para exibir os números de telefone encontrados
function displayPhoneNumbers(phones) {
    const container = document.getElementById('pdf-content');
    container.innerHTML = ''; // Limpa o conteúdo anterior

    phones.forEach(phone => {
        let phoneElement = document.createElement('p');
        phoneElement.innerText = phone;
        container.appendChild(phoneElement);
    });
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
