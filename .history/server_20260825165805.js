const express = require('express');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Permitir recibir datos JSON
app.use(express.json());

// Servir los archivos del frontend
app.use(express.static(__dirname));

/**
 * Endpoint para generar códigos QR
 */
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { text, size, format } = req.body;

        // Validar URL/texto
        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Debes ingresar una URL.'
            });
        }

        // Validar tamaño
        const qrSize = Number(size);

        if (!qrSize || qrSize < 100 || qrSize > 1000) {
            return res.status(400).json({
                success: false,
                message: 'El tamaño debe estar entre 100 y 1000 píxeles.'
            });
        }

        // Validar formato
        const allowedFormats = ['png', 'jpg', 'svg'];

        if (!allowedFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                message: 'Formato no válido.'
            });
        }

        const options = {
            width: qrSize,
            margin: 2,
            errorCorrectionLevel: 'M'
        };

        let dataUrl;

        if (format === 'svg') {

            const svg = await QRCode.toString(text, {
                ...options,
                type: 'svg'
            });

            dataUrl = `data:image/svg+xml;base64,${Buffer
                .from(svg)
                .toString('base64')}`;

        } else {

            dataUrl = await QRCode.toDataURL(text, {
                ...options,
                type: 'image/png'
            });

            // Para JPG convertiremos posteriormente en el frontend.
            // QRCode genera directamente PNG.
            if (format === 'jpg') {
                dataUrl = dataUrl;
            }
        }

        res.json({
            success: true,
            dataUrl,
            format,
            size: qrSize
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

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`   QR Generator`);
    console.log(`=================================`);
    console.log(`Servidor ejecutándose en:`);
    console.log(`http://localhost:${PORT}`);
    console.log(`=================================`);
});