
// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const PDFDocument = require("pdfkit"); // ✅ Correct way for Node.js
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Set up Multer for file upload
const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/plastic-scan", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Mongoose Schema
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  address: String,
  branch: String,
  college: String,
  date: String,
  imagePath: String,  
}));

// POST route to handle form data submission
app.post("/submit", upload.single('image'), async (req, res) => {
  try {
    // Save user data in MongoDB
    const userData = new User({
      name: req.body.name,
      address: req.body.address,
      branch: req.body.branch,
      college: req.body.college,
      date: req.body.date,
      imagePath: req.file ? req.file.path : "", // handle if image not uploaded
    });
    await userData.save();

    // Create a new PDF document
    const doc = new PDFDocument({ size: "A4" });

    // Set headers to download the file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${req.body.name}_certificate.pdf`);

    // Pipe the PDF into the response
    doc.pipe(res);

    // ====== PDF Content ======

    // White Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');

    // Header
    doc.fillColor('#003366')
      .rect(0, 0, doc.page.width, 50)
      .fill();

    doc.fontSize(20)
      .fillColor('Skyblue')
      .text('Plastic Waste Management Certificate', {
        align: 'center',
        valign: 'center',
      });

    // Add Logo (optional)
    const logoPath = path.join(__dirname, 'public', 'logo.jpg'); 
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 30, 10, { width: 30 });
    }

    // Move down to content area
    doc.moveDown(4);

    // Certificate Body
    doc.fillColor('black')
      .fontSize(16)
      .text(`This is to certify that ${req.body.name}`, { align: 'center' })
      .text(`from ${req.body.college}`, { align: 'center' })
      .text(`Branch: ${req.body.branch}`, { align: 'center' })
      .text(`Address: ${req.body.address}`, { align: 'center' })
      .text(`Participated on: ${req.body.date}`, { align: 'center' });

    // Thank you section
    doc.moveDown(2);
    doc.fillColor('#003366')
      .fontSize(18)
      .text("Thank you for contributing towards a cleaner environment!", { align: 'center' });

    // Signature line
    doc.moveDown(5);
    doc.fillColor('black')
      .fontSize(14)
      .text('Signature:', 70, doc.y)
      .moveTo(130, doc.y + 5)
      .lineTo(350, doc.y + 5)
      .stroke();

    // Footer
    doc.moveDown(8);
    doc.fontSize(10)
      .fillColor('#003366')
      .text("This certificate is generated and issued digitally.", { align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();

  } catch (err) {
    console.error("❌ Error in /submit:", err);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
