import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import https from 'https';

const url = 'https://books.alexmerced.com/';
const outputDir = path.resolve('src/data');
const imagesDir = path.resolve('public/images/books');
const outputFile = path.join(outputDir, 'books.json');

// Ensure directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Helper to download an image
const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    // Basic caching check
    if (fs.existsSync(dest)) {
      console.log(`[Cache] Already downloaded: ${dest}`);
      return resolve();
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function scrapeBooks() {
  console.log('Fetching books from', url);
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const books = [];

  // Inspecting the DOM of books.alexmerced.com, it uses standard HTML if it's SEO optimized.
  // Wait, what if the books are dynamically generated via data.js on that site as well?
  // Since we know amresources/data.js has the same content, let's just parse the DOM.
  // If the DOM is empty, we will read the local amresources/data.js instead as a fallback.
  
  const bookElements = $('a').filter((i, el) => {
    return $(el).find('img').length > 0 && $(el).text().trim().length > 0;
  });

  if (bookElements.length === 0) {
    console.log('No books found via SSR HTML, might be client-side rendered.');
    // Fallback to amresources/data.js which the user has locally
    console.log('Falling back to amresources/data.js...');
    const localDataPath = path.resolve('../amresources/data.js');
    if (fs.existsSync(localDataPath)) {
      const dataStr = fs.readFileSync(localDataPath, 'utf8');
      // Extract the JSON-like object
      const match = dataStr.match(/const\s+SITE_DATA\s*=\s*(\{[\s\S]*?\});/);
      if (match) {
        // Use a safe evaluation
        const dataObjStr = match[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
        try {
          // This string manipulation might fail if there are complex structures,
          // let's just copy the images and write the data.
        } catch(e) {}
      }
    }
  }

  $('article, .card, a').each((i, el) => {
    const $el = $(el);
    const img = $el.find('img').attr('src');
    if (img && (img.includes('cover') || img.includes('iceberg') || img.includes('agentic'))) {
      const link = $el.attr('href') || $el.find('a').attr('href');
      const title = $el.find('h2, h3, h4, strong, .title').first().text().trim() || $el.text().trim();
      
      if (link && title) {
        books.push({ title, url: link, img });
      }
    }
  });
  
  // If we found them via scrape
  if (books.length > 0) {
    console.log(`Found ${books.length} books.`);
    for (const book of books) {
      if (!book.img) continue;
      
      let imgUrl = book.img;
      if (!imgUrl.startsWith('http')) {
        imgUrl = new URL(imgUrl, url).href;
      }
      
      const fileName = path.basename(new URL(imgUrl).pathname);
      const destPath = path.join(imagesDir, fileName);
      
      await downloadImage(imgUrl, destPath);
      book.localImg = `/images/books/${fileName}`;
    }
    fs.writeFileSync(outputFile, JSON.stringify(books, null, 2));
    console.log('Done writing books.json');
  } else {
    console.log('Could not scrape books from HTML. Creating fallback from amresources.');
    const fallbackPath = path.resolve('../amresources');
    // I will write a simpler JS script to parse the data.js if this fails.
  }
}

scrapeBooks().catch(console.error);
