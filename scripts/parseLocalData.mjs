import fs from 'fs';
import path from 'path';

const dataFile = path.resolve('../amresources/data.js');
const sourceImagesDir = path.resolve('../amresources/images');
const outputDir = path.resolve('src/data');
const targetImagesDir = path.resolve('public/images/books');
const outputFile = path.join(outputDir, 'siteData.json');

// Ensure directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(targetImagesDir)) {
  fs.mkdirSync(targetImagesDir, { recursive: true });
}

// Read data.js
const rawData = fs.readFileSync(dataFile, 'utf8');

// Extract the SITE_DATA object using eval or Function
let siteData = {};
try {
  // Creating a new function context to safely evaluate the file content
  // Assuming it defines `const SITE_DATA = {...};`
  const wrappedCode = rawData.replace(/const SITE_DATA = /, 'return ') + ';';
  siteData = new Function(wrappedCode)();
} catch (e) {
  console.error("Error evaluating data.js:", e);
  process.exit(1);
}

// Process books to copy images
const allBooks = [...(siteData.freeBooks || []), ...(siteData.otherBooks || [])];

for (const book of allBooks) {
  if (book.img) {
    const imgName = path.basename(book.img);
    const sourcePath = path.join(sourceImagesDir, imgName);
    const destPath = path.join(targetImagesDir, imgName);
    
    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${imgName}`);
      }
      book.localImg = `/images/books/${imgName}`;
    } else {
      console.warn(`Warning: Image not found ${sourcePath}`);
    }
  }
}

// Save as JSON
fs.writeFileSync(outputFile, JSON.stringify(siteData, null, 2));
console.log('Successfully generated siteData.json and copied images.');
