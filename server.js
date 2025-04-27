// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { jsPDF } = require("jspdf");
require("jspdf");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(cors());// Allow cross-origin
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

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  address: String,
  branch: String,
  college: String,
  date: String,
  imagePath: String,  // Store image path if needed
}));

// POST route to handle form data submission with file upload
app.post("/submit", upload.single('image'), async (req, res) => {
  try {
    // Save user data and uploaded file path to MongoDB
    const userData = new User({
      name: req.body.name,
      address: req.body.address,
      branch: req.body.branch,
      college: req.body.college,
      date: req.body.date,
      imagePath: req.file.path,  // Save the uploaded file path
    });
    await userData.save();

    // Create PDF with jsPDF
    const doc = new jsPDF();
    //doc.setFontSize(18);
    //doc.text("Plastic Waste Management Certificate", 90,20);
    doc.text("Plastic Waste Management Certificate");
    doc.setFontSize(12);
    doc.text(`This is to certify that ${req.body.name} from ${req.body.college}`, 20, 40);
    doc.text(`Branch: ${req.body.branch}`, 20, 50);
    doc.text(`Address: ${req.body.address}`, 20, 60);
    doc.text(`Participated on: ${req.body.date}`, 20, 70); 
    doc.text("Thank you for contributing towards a cleaner environment!", 20, 90);
    
    doc.setFillColor(255, 255, 255); // White background
    doc.rect(0, 0, 210, 297, 'F'); // Full page rectangle
    doc.setFillColor(0, 51, 102); // Dark blue
    doc.rect(0, 0, 210, 40, 'F'); // Top header rectangle

    // Title Section: Big Bold Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(255, 255, 255); // White text
    doc.text("Plastic Waste Management Certificate", 105, 25, null, null, 'center');

    // Add Logo 
    doc.addImage('logo.jpg', 'JPEG', 15, 5, 30, 30); // Top-left logo

    // Certificate Body Section
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black text
    doc.text(`This is to certify that ${req.body.name}`, 105, 80, null, null, 'center');
    doc.text(`from ${req.body.college}`, 105, 90, null, null, 'center');
    doc.text(`Branch: ${req.body.branch}`, 105, 100, null, null, 'center');
    doc.text(`Address: ${req.body.address}`, 105, 110, null, null, 'center');
    doc.text(`Participated on: ${req.body.date}`, 105, 120, null, null, 'center');
    // Thank you message section
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102); // Dark blue text for thank you message
    doc.text("Thank you for contributing towards a cleaner environment!", 105, 140, null, null, 'center');

    // Signature section (Optional)
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Black text
    doc.text("Signature:", 50, 200);
    doc.line(65, 200, 190, 200); // Line for signature

    // Decorative Bottom Section (Optional)
    doc.setLineWidth(1);
    doc.setDrawColor(0, 51, 102); // Dark blue line for bottom border
    doc.line(15, 265, 195, 265); // Horizontal line

    // Footer text section
    doc.setFontSize(10);
    doc.setTextColor(0, 51, 102); // Dark blue text
    doc.text("This certificate is generated and issued digitally", 105, 280, null, null, 'center');

    // Send PDF as response
    const pdf = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdf)); // Send the PDF to the client
  } catch (err) {
    console.error("❌ Error in /submit:", err);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
