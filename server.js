const express = require('express');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Recibir JSON enviado desde el navegador.
app.use(express.json({ limit: '1mb' }));

// En desarrollo local, Express sirve los archivos de public.
// En Vercel, los archivos de public/ se sirven directamente desde su CDN.
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Generar código QR.
 */
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { text, size, format } = req.body || {};

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Debes ingresar una URL.'
            });
        }

        let url;
        try {
            url = new URL(text.trim());
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Protocolo no permitido');
            }
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Ingresa una URL válida. Ejemplo: https://www.ejemplo.com'
            });
        }

        const qrSize = Number(size);
        if (!Number.isInteger(qrSize) || qrSize < 100 || qrSize > 1000) {
            return res.status(400).json({
                success: false,
                message: 'El tamaño debe estar entre 100 y 1000 píxeles.'
            });
        }

        const allowedFormats = ['png', 'jpg', 'svg'];
        if (!allowedFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                message: 'Selecciona un formato válido.'
            });
        }

        const options = {
            width: qrSize,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
                dark: '#000000',
                light: '#00000000'
            }
        };

        let dataUrl;

        if (format === 'svg') {
            const svg = await QRCode.toString(url.toString(), {
                ...options,
                type: 'svg'
            });

            dataUrl = `data:image/svg+xml;base64,${Buffer
                .from(svg)
                .toString('base64')}`;
        } else {
            dataUrl = await QRCode.toDataURL(url.toString(), {
                ...options,
                type: 'image/png'
            });
        }

        return res.json({
            success: true,
            dataUrl,
            format,
            size: qrSize,
            text: url.toString()
        });
    } catch (error) {
        console.error('Error generando QR:', error);
        return res.status(500).json({
            success: false,
            message: 'Ocurrió un error al generar el código QR.'
        });
    }
});

// La página está dentro de public/, no en la raíz del proyecto.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vercel importa/exporta la aplicación; localmente iniciamos el servidor.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log('=================================');
        console.log('       QR GENERATOR');
        console.log('=================================');
        console.log(`Servidor: http://localhost:${PORT}`);
        console.log('=================================');
    });
}

module.exports = app;
