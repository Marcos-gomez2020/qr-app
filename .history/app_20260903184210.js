document.addEventListener('DOMContentLoaded', () => {

    const generateBtn = document.querySelector('#generate');
    const downloadBtn = document.querySelector('#download');

    const qrcodeImg = document.querySelector('#qrcode');

    const textInput = document.querySelector('#text');
    const sizeInput = document.querySelector('#size');
    const formatSelect = document.querySelector('#format');

    // QR generado actualmente
    let generatedQR = null;

    // Formato real del QR generado
    let generatedFormat = null;

    // Texto utilizado para generar el QR
    let generatedText = null;


    // ==========================================
    // GENERAR QR
    // ==========================================

    generateBtn.addEventListener('click', async (e) => {

        e.preventDefault();

        const text = textInput.value.trim();
        const size = Number(sizeInput.value);
        const format = formatSelect.value;


        // ==========================================
        // VALIDAR URL
        // ==========================================

        if (text === '') {

            alert('Ingresa una URL.');

            textInput.focus();

            return;
        }


        try {

            new URL(text);

        } catch {

            alert(
                'Ingresa una URL válida.\n\nEjemplo:\nhttps://www.ejemplo.com'
            );

            textInput.focus();

            return;
        }


        // ==========================================
        // VALIDAR TAMAÑO
        // ==========================================

        if (!Number.isInteger(size) || size < 100 || size > 1000) {

            alert(
                'El tamaño debe estar entre 100 y 1000 píxeles.'
            );

            sizeInput.focus();

            return;
        }


        // ==========================================
        // VALIDAR FORMATO
        // ==========================================

        if (!['png', 'jpg', 'svg'].includes(format)) {

            alert('Selecciona un formato.');

            formatSelect.focus();

            return;
        }


        try {

            generateBtn.disabled = true;

            generateBtn.textContent = 'Generando...';


            // ==========================================
            // SOLICITUD AL SERVIDOR
            // ==========================================

            const response = await fetch('/api/generate-qr', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    text,
                    size,
                    format
                })

            });


            const result = await response.json();


            if (!response.ok || !result.success) {

                throw new Error(
                    result.message || 'No fue posible generar el QR.'
                );

            }


            // ==========================================
            // GUARDAR INFORMACIÓN DEL QR
            // ==========================================

            generatedQR = result.dataUrl;

            generatedFormat = result.format;

            generatedText = result.text;


            // ==========================================
            // MOSTRAR QR
            // ==========================================

            qrcodeImg.src = generatedQR;

            qrcodeImg.alt = `Código QR para ${generatedText}`;

            qrcodeImg.classList.add('active');


            // ==========================================
            // MOSTRAR BOTÓN DESCARGAR
            // ==========================================

            downloadBtn.style.display = 'inline-block';


        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            generateBtn.disabled = false;

            generateBtn.textContent = 'Generar QR';

        }

    });


    // ==========================================
    // DESCARGAR QR
    // ==========================================

    downloadBtn.addEventListener('click', async () => {

        if (!generatedQR || !generatedFormat) {

            alert('Primero genera un código QR.');

            return;
        }


        try {

            // ==========================================
            // SVG
            // ==========================================

            if (generatedFormat === 'svg') {

                downloadFile(
                    generatedQR,
                    'qrcode.svg'
                );

                return;
            }


            // ==========================================
            // PNG
            // ==========================================

            if (generatedFormat === 'png') {

                downloadFile(
                    generatedQR,
                    'qrcode.png'
                );

                return;
            }


            // ==========================================
            // JPG
            // ==========================================

            if (generatedFormat === 'jpg') {

                const jpgDataUrl = await convertToJPG(
                    generatedQR
                );

                downloadFile(
                    jpgDataUrl,
                    'qrcode.jpg'
                );

            }

        } catch (error) {

            console.error(error);

            alert(
                'No fue posible descargar el código QR.'
            );

        }

    });


    // ==========================================
    // CONVERTIR PNG A JPG
    // ==========================================

    function convertToJPG(imageSource) {

        return new Promise((resolve, reject) => {

            const image = new Image();

            image.onload = () => {

                const canvas = document.createElement('canvas');

                canvas.width = image.width;
                canvas.height = image.height;

                const context = canvas.getContext('2d');


                // Fondo blanco
                context.fillStyle = '#ffffff';

                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                // Dibujar QR
                context.drawImage(
                    image,
                    0,
                    0
                );


                // Convertir a JPG
                const jpgDataUrl = canvas.toDataURL(
                    'image/jpeg',
                    0.95
                );


                resolve(jpgDataUrl);

            };


            image.onerror = () => {

                reject(
                    new Error('No se pudo convertir el QR a JPG.')
                );

            };


            image.src = imageSource;

        });

    }


    // ==========================================
    // FUNCIÓN DE DESCARGA
    // ==========================================

    function downloadFile(dataUrl, filename) {

        const link = document.createElement('a');

        link.href = dataUrl;

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    }

});