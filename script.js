const startCameraButton = document.getElementById('startCamera');
const stopCameraButton = document.getElementById('stopCamera');
const captureImageButton = document.getElementById('captureImage');
const switchCameraButton = document.getElementById('switchCamera');
const generatePDFButton = document.getElementById('generatePDF');
const clearImagesButton = document.getElementById('clearImages');
const cameraElement = document.getElementById('camera');
const imagesList = document.getElementById('imagesList');
let mediaStream;
let currentFacingMode = 'environment'; // Modo padrão: câmera traseira
let capturedImages = [];

// Inicia a câmera
startCameraButton.addEventListener('click', () => {
    startCamera(currentFacingMode);
});

function startCamera(facingMode) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
        .then((stream) => {
            mediaStream = stream;
            cameraElement.srcObject = stream;
            startCameraButton.disabled = true;
            stopCameraButton.disabled = false;
            captureImageButton.disabled = false;
            switchCameraButton.disabled = false;
        })
        .catch(err => {
            console.error('Erro ao acessar a câmera:', err);
        });
}

// Para a câmera
stopCameraButton.addEventListener('click', () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        cameraElement.srcObject = null;
    }
    startCameraButton.disabled = false;
    stopCameraButton.disabled = true;
    captureImageButton.disabled = true;
    switchCameraButton.disabled = true;
    generatePDFButton.disabled = capturedImages.length === 0;
});

// Troca entre câmera frontal e traseira
switchCameraButton.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    startCamera(currentFacingMode);
});

// Captura uma imagem da câmera
captureImageButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const videoWidth = cameraElement.videoWidth;
    const videoHeight = cameraElement.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    context.drawImage(cameraElement, 0, 0, videoWidth, videoHeight);
    const img = canvas.toDataURL('image/png');
    capturedImages.push(img);

    const imgElement = document.createElement('img');
    imgElement.src = img;
    imagesList.appendChild(imgElement);

    generatePDFButton.disabled = false;
    clearImagesButton.disabled = false;
});

// Gera um PDF a partir das imagens capturadas
generatePDFButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const promises = capturedImages.map((image, index) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = image;

            img.onload = () => {
                const imgAspectRatio = img.width / img.height;
                const pageAspectRatio = pageWidth / pageHeight;

                let imgScaledWidth, imgScaledHeight;

                if (imgAspectRatio > pageAspectRatio) {
                    // A imagem é mais larga que a página
                    imgScaledWidth = pageWidth;
                    imgScaledHeight = pageWidth / imgAspectRatio;
                } else {
                    // A imagem é mais alta que a página
                    imgScaledHeight = pageHeight;
                    imgScaledWidth = pageHeight * imgAspectRatio;
                }

                const posX = (pageWidth - imgScaledWidth) / 2; // Centraliza horizontalmente
                const posY = (pageHeight - imgScaledHeight) / 2; // Centraliza verticalmente

                if (index > 0) doc.addPage(); // Adiciona uma nova página após a primeira
                doc.addImage(image, 'PNG', posX, posY, imgScaledWidth, imgScaledHeight); // Adiciona a imagem escalada

                resolve(); // Resolve a Promise quando a imagem é processada
            };

            img.onerror = () => {
                console.error('Erro ao carregar a imagem para o PDF');
                resolve(); // Resolve a Promise mesmo em caso de erro
            };
        });
    });

    // Aguarda todas as imagens serem processadas
    Promise.all(promises).then(() => {
        doc.save('images.pdf'); // Salva o PDF após todas as imagens serem carregadas
    });
});

// Limpa as imagens capturadas
clearImagesButton.addEventListener('click', () => {
    capturedImages = [];
    imagesList.innerHTML = '';
    generatePDFButton.disabled = true;
    clearImagesButton.disabled = true;
});
