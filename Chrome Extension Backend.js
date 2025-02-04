// Backend (Node.js + Express)
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Allow cross-origin requests
app.use(cors());
app.use(express.json());

const product = {
  title: "Stylish Sofa",
  description: "A comfortable and stylish sofa, perfect for any home.",
  price: "250",
  category: "Furniture",
  location: "Paris, France",
  images: ["https://via.placeholder.com/150"],
};

// API endpoint to fetch product details
app.get("/api/product", (req, res) => {
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Chrome Extension Manifest (manifest.json)
const manifest = {
  manifest_version: 3,
  name: "Facebook Marketplace Uploader",
  version: "1.0",
  permissions: ["activeTab", "scripting"],
  background: {
    service_worker: "background.js",
  },
  host_permissions: [
    "http://localhost:3000/api/product",
    "https://www.facebook.com/marketplace/*",
  ],
  action: {
    default_popup: "popup.html",
  },
  content_scripts: [
    {
      matches: ["https://www.facebook.com/marketplace/create/*"],
      js: ["content.js"],
    },
  ],
};

// Chrome Extension Content Script (content.js)
document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch("http://localhost:3000/api/product");
  const product = await response.json();

  function fillInput(selector, value) {
    const input = document.querySelector(selector);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  fillInput("input[aria-label='Title']", product.title);
  fillInput("textarea[aria-label='Description']", product.description);
  fillInput("input[aria-label='Price']", product.price);

  // Click the "Next" button
  const nextButton = document.querySelector("button[type='submit']");
  if (nextButton) nextButton.click();
});

// Popup HTML (popup.html)
const popupHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Marketplace Uploader</title>
    <script src="popup.js"></script>
</head>
<body>
    <h2>Upload Product</h2>
    <button id="uploadButton">Upload to Facebook</button>
</body>
</html>
`;

// Popup JavaScript (popup.js)
document.getElementById("uploadButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    });
  });
});
