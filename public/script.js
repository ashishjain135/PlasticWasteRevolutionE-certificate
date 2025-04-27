// Function to start scanner and show form

function startScanner() {
  alert("Plastic material found! Please provide your details.");  // Alert message
  document.getElementById("userForm").style.display = "block";  // Show the form
}

// Function to handle form submissio
function submitForm(e) {
  e.preventDefault();// Prevent default form submit


  // Collect form data
  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("address",document.getElementById("address").value);
  formData.append("branch", document.getElementById("branch").value);
  formData.append("college",document.getElementById("college").value);
  formData.append("date", document.getElementById("date").value);
  formData.append("image", document.getElementById("image").files[0]); // Get the selected file


  // Send data to server
  fetch("/submit", {
    method: "POST",
    body: formData, // No need for JSON.stringify now
  })
    .then((res) => res.blob())// Receive PDF file from server
    .then((blob) => {
       // Create a link for PDF download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate.pdf"; // Name of downloaded file
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((err) => {
      //console.error("Error:", err);
      console.error("❌ Error in /submit:", err);
      alert("Something went wrong. Please try again.");
    });
}
