const express = require('express');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Permitir recibir JSON
app.use(express.json());

// Servir archivos del frontend
app.use(express.static(__dirname));

/**
 * Generar código QR
 */
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { text, size, format } = req.body;

        // -----------------------------
        // VALIDAR URL
        // -----------------------------
        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Debes ingresar una URL.'
            });
        }

        let url;

        try {
            url = new URL(text.trim());

            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error();
            }

        } catch {
            return res.status(400).json({
                success: false,
                message: 'Ingresa una URL válida. Ejemplo: https://www.ejemplo.com'
            });
        }

        // -----------------------------
        // VALIDAR TAMAÑO
        // -----------------------------
        const qrSize = Number(size);

        if (!Number.isInteger(qrSize) || qrSize < 100 || qrSize > 1000) {
            return res.status(400).json({
                success: false,
                message: 'El tamaño debe estar entre 100 y 1000 píxeles.'
            });
        }

        // -----------------------------
        // VALIDAR FORMATO
        // -----------------------------
        const allowedFormats = ['png', 'jpg', 'svg'];

        if (!allowedFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                message: 'Selecciona un formato válido.'
            });
        }

        // -----------------------------
        // CONFIGURACIÓN QR
        // -----------------------------
        const options = {
            width: qrSize,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        };

        let dataUrl;

        // -----------------------------
        // SVG
        // -----------------------------
        if (format === 'svg') {

            const svg = await QRCode.toString(url.toString(), {
                ...options,
                type: 'svg'
            });

            dataUrl = `data:image/svg+xml;base64,${Buffer
                .from(svg)
                .toString('base64')}`;
        }

        // -----------------------------
        // PNG
        // -----------------------------
        else {

            dataUrl = await QRCode.toDataURL(
                url.toString(),
                {
                    ...options,
                    type: 'image/png'
                }
            );
        }

        // -----------------------------
        // RESPUESTA
        // -----------------------------
        res.json({
            success: true,
            dataUrl,
            format,
            size: qrSize,
            text: url.toString()
        });

    } catch (error) {

        console.error('Error generando QR:', error);

        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al generar el código QR.'
        });
    }
});

/**
 * Página principal
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {

    console.log('=================================');
    console.log('       QR GENERATOR');
    console.log('=================================');
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log('=================================');

});