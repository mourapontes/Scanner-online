const startCameraButton = document.getElementById('startCamera');
const stopCameraButton = document.getElementById('stopCamera');
const captureImageButton = document.getElementById('captureImage');
const generatePDFButton = document.getElementById('generatePDF');
const clearImagesButton = document.getElementById('clearImages');
const cameraElement = document.getElementById('camera');
const imagesList = document.getElementById('imagesList');
let mediaStream;
let capturedImages = [];

// Inicia a câmera
startCameraButton.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            mediaStream = stream;
            cameraElement.srcObject = stream;
            startCameraButton.disabled = true;
            stopCameraButton.disabled = false;
            captureImageButton.disabled = false;
        })
        .catch(err => {
            console.error('Erro ao acessar a câmera:', err);
        });
});

// Para a câmera e mantém as imagens capturadas
stopCameraButton.addEventListener('click', () => {
    mediaStream.getTracks().forEach(track => track.stop());
    cameraElement.srcObject = null;
    startCameraButton.disabled = false;
    stopCameraButton.disabled = true;
    captureImageButton.disabled = true;
    // Não desabilita o botão de gerar PDF ao desligar a câmera
    generatePDFButton.disabled = capturedImages.length === 0;
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
    
    capturedImages.forEach((image, index) => {
        if (index > 0) doc.addPage(); // Adiciona uma nova página após a primeira
        doc.addImage(image, 'PNG', 10, 10, 180, 160); // Adiciona a imagem capturada
    });

    // Salva o PDF
    doc.save('images.pdf');
});

// Limpa as imagens capturadas
clearImagesButton.addEventListener('click', () => {
    capturedImages = [];
    imagesList.innerHTML = '';
    generatePDFButton.disabled = true;
    clearImagesButton.disabled = true;
});
