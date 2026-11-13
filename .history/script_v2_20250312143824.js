document.getElementById("qrForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const url = document.getElementById("url").value;
    const size = document.getElementById("size").value;
    const format = document.getElementById("format").value;
    const qrImage = document.getElementById("qrImage");
    const downloadLink = document.getElementById("downloadLink");
    const qrResult = document.getElementById("qrResult");

    if (!url) {
        alert("Por favor, ingresa una URL válida.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, size, format })
        });

        if (!response.ok) throw new Error("Error al generar el QR");

        const blob = await response.blob();
        const qrURL = URL.createObjectURL(blob);

        qrImage.src = qrURL;
        downloadLink.href = qrURL;
        downloadLink.download = `qrcode.${format}`;
        qrResult.style.display = "block";
    } catch (error) {
        alert("Hubo un problema al generar el QR. Intenta de nuevo.");
    }
});
