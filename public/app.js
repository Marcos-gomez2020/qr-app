document.addEventListener('DOMContentLoaded', () => {

    const generateBtn = document.querySelector('#generate');
    const downloadBtn = document.querySelector('#download');

    const qrcodeImg = document.querySelector('#qrcode');

    const textInput = document.querySelector('#text');
    const sizeInput = document.querySelector('#size');
    const formatSelect = document.querySelector('#format');

    const message = document.querySelector('#message');
    const messageIcon = document.querySelector('#messageIcon');
    const messageTitle = document.querySelector('#messageTitle');
    const messageText = document.querySelector('#messageText');
    const messageClose = document.querySelector('#messageClose');

    let generatedQR = null;
    let generatedFormat = null;
    let generatedText = null;

    let messageTimeout = null;


    // ==========================================
    // MOSTRAR NOTIFICACIÓN
    // ==========================================

    function showMessage(title, text, type = 'success') {

        // Cancelar temporizador anterior
        clearTimeout(messageTimeout);

        messageTitle.textContent = title;
        messageText.textContent = text;

        // Limpiar clases anteriores
        message.className = 'message';

        // Agregar tipo
        message.classList.add(type);

        // Icono
        if (type === 'success') {
            messageIcon.textContent = '✓';
        } else if (type === 'error') {
            messageIcon.textContent = '!';
        } else {
            messageIcon.textContent = '!';
        }

        // Mostrar
        requestAnimationFrame(() => {
            message.classList.add('show');
        });

        // Ocultar después de 5 segundos
        messageTimeout = setTimeout(() => {
            hideMessage();
        }, 5000);
    }


    // ==========================================
    // OCULTAR NOTIFICACIÓN
    // ==========================================

    function hideMessage() {

        message.classList.remove('show');

    }


    // ==========================================
    // BOTÓN CERRAR
    // ==========================================

    messageClose.addEventListener('click', () => {

        clearTimeout(messageTimeout);

        hideMessage();

    });


    // ==========================================
    // GENERAR QR
    // ==========================================

    generateBtn.addEventListener('click', async (e) => {

        e.preventDefault();

        hideMessage();


        const text = textInput.value.trim();
        const size = Number(sizeInput.value);
        const format = formatSelect.value;


        // ==========================================
        // VALIDAR URL VACÍA
        // ==========================================

        if (text === '') {

            showMessage(
                'URL requerida',
                'Por favor, ingresa una URL para generar el código QR.',
                'error'
            );

            textInput.focus();

            return;
        }


        // ==========================================
        // VALIDAR URL
        // ==========================================

        try {

            const url = new URL(text);

            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error();
            }

        } catch {

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

        if (
            !Number.isInteger(size) ||
            size < 100 ||
            size > 1000
        ) {

            showMessage(
                'Tamaño incorrecto',
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
                'Formato requerido',
                'Selecciona PNG, JPG o SVG para generar el código QR.',
                'warning'
            );

            formatSelect.focus();

            return;
        }


        // ==========================================
        // GENERANDO
        // ==========================================

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
            // GUARDAR INFORMACIÓN
            // ==========================================

            generatedQR = result.dataUrl;

            generatedFormat = result.format;

            generatedText = result.text || text;


            // ==========================================
            // MOSTRAR QR
            // ==========================================

            qrcodeImg.src = generatedQR;

            qrcodeImg.alt =
                `Código QR para ${generatedText}`;

            qrcodeImg.classList.add('active');


            // ==========================================
            // MOSTRAR BOTÓN DESCARGAR
            // ==========================================

            downloadBtn.style.display = 'inline-block';


            // ==========================================
            // MENSAJE DE ÉXITO
            // ==========================================

            showMessage(
                'Código QR generado',
                `Tu código QR en formato ${format.toUpperCase()} está listo.`,
                'success'
            );


        } catch (error) {

            console.error(error);

            showMessage(
                'Error al generar',
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
                'QR no disponible',
                'Primero debes generar un código QR.',
                'warning'
            );

            return;
        }


        try {

            let downloadData = generatedQR;


            // ==========================================
            // JPG
            // ==========================================

            if (generatedFormat === 'jpg') {

                downloadData =
                    await convertToJPG(generatedQR);

            }


            // ==========================================
            // CREAR NOMBRE
            // ==========================================

            const filename =
                createFilename(
                    generatedText,
                    generatedFormat
                );


            // ==========================================
            // DESCARGAR
            // ==========================================

            downloadFile(
                downloadData,
                filename
            );


            showMessage(
                'Descarga completada',
                `El archivo ${filename} se descargó correctamente.`,
                'success'
            );


        } catch (error) {

            console.error(error);

            showMessage(
                'Error en la descarga',
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

    /*function createFilename(url, extension) {

        try {

            const parsedUrl =
                new URL(url);


            let hostname =
                parsedUrl.hostname
                    .replace(/^www\./, '')
                    .replace(/[^a-zA-Z0-9]/g, '_');


            if (!hostname) {
                hostname = 'codigo_qr';
            }


            const now = new Date();


            const timestamp =
                now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0') +
                '_' +
                String(now.getHours()).padStart(2, '0') +
                String(now.getMinutes()).padStart(2, '0') +
                String(now.getSeconds()).padStart(2, '0');


            return `QR_${hostname}_${timestamp}.${extension}`;

        } catch {

            return `codigo_qr.${extension}`;

        }

    }*/
   function createFilename(url, extension) {

    try {

        const parsedUrl = new URL(url);

        // Obtener la última parte del pathname
        let filename = parsedUrl.pathname
            .split('/')
            .filter(Boolean)
            .pop();


        // Si la URL termina en /
        // utilizar el dominio como nombre
        if (!filename) {

            filename = parsedUrl.hostname
                .replace(/^www\./, '');

        }


        // Eliminar extensión existente
        filename = filename.replace(/\.[^/.]+$/, '');


        // Limpiar caracteres no permitidos
        filename = filename
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');


        // Si después de limpiar queda vacío
        if (!filename) {

            filename = 'codigo-qr';

        }


        return `QR_${filename}.${extension}`;

    } catch {

        return `codigo-qr.${extension}`;

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