try {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();
    doc.text("Test PDF", 10, 10);
    console.log("jsPDF loaded and instantiated successfully!");
} catch (err) {
    console.error("Failed to load jsPDF:", err);
}
