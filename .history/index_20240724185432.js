const QRCode = require('qrcode');

// Unique ids => https://zelark.github.io/nano-id-cc/
// Nombre del archivo destino, Link del QRCode


QRCode.toFile('qr-code-image/yaris-cross-fest.png', 'https://www.toyota.com.co/wp-content/uploads/2024/05/FT-Yaris-Cross-modelo-2025.pdf', {
    color: {
        dark: '#000000', // Color principal
        light: '#0000', // Color de fondo
    },
    width: 400,  // Tamaño
}

, function(err) {
    if (err) throw err
    console.log('Código generado exitosamente')
})
