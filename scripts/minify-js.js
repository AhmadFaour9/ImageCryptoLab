#!/usr/bin/env node
/**
 * JavaScript Minification Script
 * Uses Terser to minify and optimize JavaScript
 */

const fs = require('fs');
const path = require('path');
const Terser = require('terser');

const inputFile = path.join(__dirname, '..', 'app.js');
const outputFile = path.join(__dirname, '..', 'app.min.js');

console.log('📦 Minifying JavaScript...');

(async () => {
  try {
    const jsContent = fs.readFileSync(inputFile, 'utf8');

    const result = await Terser.minify(jsContent, {
      output: {
        comments: false
      },
      mangle: {
        keep_fnames: false
      },
      compress: {
        drop_console: false,
        passes: 2
      }
    });

    if (result.error) {
      console.error('❌ JavaScript Minification error:', result.error.message);
      process.exit(1);
    }

    fs.writeFileSync(outputFile, result.code, 'utf8');

    const originalSize = fs.statSync(inputFile).size;
    const minifiedSize = fs.statSync(outputFile).size;
    const reduction = (100 - (minifiedSize / originalSize * 100)).toFixed(2);

    console.log(`✅ JavaScript minified successfully`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)}KB`);
    console.log(`   Minified: ${(minifiedSize / 1024).toFixed(2)}KB`);
    console.log(`   Reduction: ${reduction}%`);

  } catch (err) {
    console.error('❌ Error minifying JavaScript:', err.message);
    process.exit(1);
  }
})();
