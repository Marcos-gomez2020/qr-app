document.addEventListener('DOMContentLoaded', () => {

    const generateBtn = document.querySelector('#generate');
    const downloadBtn = document.querySelector('#download');
    const qrcodeImg = document.querySelector('#qrcode');
    const textInput = document.querySelector('#text');
    const sizeInput = document.querySelector('#size');
    const formatSelect = document.querySelector('#format');

    let generatedQR = null;

    /**
     * Generar QR
     */
    generateBtn.addEventListener('click', async (e) => {

        e.preventDefault();

        const text = textInput.value.trim();
        const size = sizeInput.value;
        const format = formatSelect.value;

        // Validar URL
        if (text === '') {
            alert('Ingresa una URL válida.');
            textInput.focus();
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
                throw new Error(result.message || 'Error generando QR');
            }

            generatedQR = result.dataUrl;

            // Mostrar QR
            qrcodeImg.src = generatedQR;
            qrcodeImg.alt = `Código QR para ${text}`;
            qrcodeImg.classList.add('active');

            // Mostrar botón descargar
            downloadBtn.style.display = 'inline-block';

        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            generateBtn.disabled = false;
            generateBtn.textContent = 'Generar QR';
        }
    });


    /**
     * Descargar QR
     */
    downloadBtn.addEventListener('click', () => {

        if (!generatedQR) {
            alert('Primero genera un código QR.');
            return;
        }

        const format = formatSelect.value;

        const link = document.createElement('a');

        link.href = generatedQR;
        link.download = `QR.${format}`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    });

});