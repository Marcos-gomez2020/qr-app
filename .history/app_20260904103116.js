document.addEventListener('DOMContentLoaded', () => {

    const generateBtn = document.querySelector('#generate');
    const downloadBtn = document.querySelector('#download');

    const qrcodeImg = document.querySelector('#qrcode');

    const textInput = document.querySelector('#text');
    const sizeInput = document.querySelector('#size');
    const formatSelect = document.querySelector('#format');

    const sizeInfo = document.querySelector('#sizeInfo');
    const message = document.querySelector('#message');


    let generatedQR = null;
    let generatedFormat = null;
    let generatedText = null;


    // ==========================================
    // ACTUALIZAR INFORMACIÓN DEL TAMAÑO
    // ==========================================

    function updateSizeInfo() {

        const size = Number(sizeInput.value);

        if (size >= 100 && size <= 1000) {

            sizeInfo.textContent = `${size} × ${size} px`;

        } else {

            sizeInfo.textContent = 'Tamaño entre 100 y 1000 px';

        }
    }


    sizeInput.addEventListener('input', updateSizeInfo);

    updateSizeInfo();


    // ==========================================
    // MOSTRAR MENSAJE
    // ==========================================

    /*function showMessage(text, type = 'error') {

        message.textContent = text;

        message.className = `message ${type}`;

    }*/
   function showMessage(title, text, type = 'success') {

    const messageTitle =
        document.querySelector('#messageTitle');

    const messageText =
        document.querySelector('#messageText');

    const messageIcon =
        document.querySelector('#messageIcon');


    // Contenido
    messageTitle.textContent = title;

    messageText.textContent = text;


    // Tipo de mensaje
    message.className = `message ${type}`;


    // Icono
    if (type === 'success') {

        messageIcon.textContent = '✓';

    } else if (type === 'error') {

        messageIcon.textContent = '!';

    } else if (type === 'warning') {

        messageIcon.textContent = '!';

    }


    // Mostrar
    requestAnimationFrame(() => {

        message.classList.add('show');

    });

}
//cerrar
function hideMessage() {

    message.classList.remove('show');

}
const messageClose =
    document.querySelector('#messageClose');

messageClose.addEventListener(
    'click',
    hideMessage
);

let messageTimeout;

function showMessage(title, text, type = 'success') {

    const messageTitle =
        document.querySelector('#messageTitle');

    const messageText =
        document.querySelector('#messageText');

    const messageIcon =
        document.querySelector('#messageIcon');


    clearTimeout(messageTimeout);


    messageTitle.textContent = title;
    messageText.textContent = text;


    message.className =
        `message ${type}`;
    if (type === 'success') {
        messageIcon.textContent = '✓';
    } else {
        messageIcon.textContent = '!';
    }


    requestAnimationFrame(() => {
        message.classList.add('show');
    });
    messageTimeout = setTimeout(() => {
        hideMessage();
    }, 5000);
}


    // ==========================================
    // LIMPIAR MENSAJE
    // ==========================================

    function clearMessage() {

        message.textContent = '';

        message.className = 'message';

    }


    // ==========================================
    // GENERAR QR
    // ==========================================

    generateBtn.addEventListener('click', async (e) => {

        e.preventDefault();

        clearMessage();


        const text = textInput.value.trim();
        const size = Number(sizeInput.value);
        const format = formatSelect.value;


        // ==========================================
        // VALIDAR URL
        // ==========================================

        if (text === '') {

           /* showMessage(
                'Por favor, ingresa una URL.',
                'error'
            );*/
            showMessage(
    'URL requerida',
    'Por favor, ingresa una URL.',
    'error'
);

            textInput.focus();

            return;
        }


        try {

            const url = new URL(text);

            if (!['http:', 'https:'].includes(url.protocol)) {

                throw new Error();

            }

        } catch {

            /*showMessage(
                'Ingresa una URL válida. Ejemplo: https://www.ejemplo.com',
                'error'
            );*/
            showMessage(
    'URL no válida',
    'Ingresa una URL válida. Ejemplo: https://www.ejemplo.com',
    'error'
);

            textInput.focus();

            return;
        }


        // ==========================================
        // VALIDAR TAMAÑO
        // ==========================================

        if (!Number.isInteger(size) || size < 100 || size > 1000) {

            showMessage(
                'El tamaño debe estar entre 100 y 1000 píxeles.',
                'error'
            );

            sizeInput.focus();

            return;
        }


        // ==========================================
        // VALIDAR FORMATO
        // ==========================================

        if (!['png', 'jpg', 'svg'].includes(format)) {

            showMessage(
                'Selecciona un formato para el código QR.',
                'error'
            );

            formatSelect.focus();

            return;
        }


        try {

            generateBtn.disabled = true;

            generateBtn.textContent = 'Generando...';


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
                    result.message ||
                    'No fue posible generar el código QR.'
                );

            }


            // ==========================================
            // GUARDAR QR
            // ==========================================

            generatedQR = result.dataUrl;

            generatedFormat = result.format;

            generatedText = result.text;


            // ==========================================
            // MOSTRAR QR
            // ==========================================

            qrcodeImg.src = generatedQR;

            qrcodeImg.alt =
                `Código QR para ${generatedText}`;

            qrcodeImg.classList.add('active');


            // ==========================================
            // MOSTRAR DESCARGA
            // ==========================================

            downloadBtn.style.display = 'inline-block';


            showMessage(
                `QR generado correctamente en formato ${format.toUpperCase()}.`,
                'success'
            );


        } catch (error) {

            console.error(error);

            showMessage(
                error.message,
                'error'
            );

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

            showMessage(
                'Primero debes generar un código QR.',
                'error'
            );

            return;
        }


        try {

            let downloadData = generatedQR;

            let extension = generatedFormat;


            // ==========================================
            // JPG
            // ==========================================

            if (generatedFormat === 'jpg') {

                downloadData =
                    await convertToJPG(generatedQR);

            }


            // ==========================================
            // NOMBRE DEL ARCHIVO
            // ==========================================

            const filename =
                createFilename(generatedText, extension);


            downloadFile(
                downloadData,
                filename
            );


            showMessage(
                `QR descargado correctamente como ${filename}`,
                'success'
            );


        } catch (error) {

            console.error(error);

            showMessage(
                'No fue posible descargar el código QR.',
                'error'
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

                const canvas =
                    document.createElement('canvas');


                canvas.width = image.width;

                canvas.height = image.height;


                const context =
                    canvas.getContext('2d');


                // Fondo blanco
                context.fillStyle = '#ffffff';

                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                // QR
                context.drawImage(
                    image,
                    0,
                    0
                );


                // JPG
                const jpgData =
                    canvas.toDataURL(
                        'image/jpeg',
                        0.95
                    );


                resolve(jpgData);

            };


            image.onerror = () => {

                reject(
                    new Error(
                        'No se pudo convertir el QR a JPG.'
                    )
                );

            };


            image.src = imageSource;

        });

    }


    // ==========================================
    // CREAR NOMBRE DEL ARCHIVO
    // ==========================================

    function createFilename(url, extension) {

        try {

            const parsedUrl = new URL(url);

            let hostname =
                parsedUrl.hostname
                    .replace('www.', '')
                    .replace(/[^a-zA-Z0-9]/g, '_');


            if (!hostname) {

                hostname = 'codigo_qr';

            }


            const timestamp =
                new Date()
                    .toISOString()
                    .replace(/[-:T]/g, '')
                    .slice(0, 14);


            return `QR_${hostname}_${timestamp}.${extension}`;

        } catch {

            return `codigo_qr.${extension}`;

        }

    }


    // ==========================================
    // DESCARGAR ARCHIVO
    // ==========================================

    function downloadFile(dataUrl, filename) {

        const link =
            document.createElement('a');


        link.href = dataUrl;

        link.download = filename;


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    }

});