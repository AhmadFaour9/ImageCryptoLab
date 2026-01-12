#!/usr/bin/env node
/**
 * CSS Minification Script
 * Removes comments, whitespace, and optimizes selectors
 */

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

const inputFile = path.join(__dirname, '..', 'styles.css');
const outputFile = path.join(__dirname, '..', 'styles.min.css');

console.log('📦 Minifying CSS...');

try {
  const cssContent = fs.readFileSync(inputFile, 'utf8');
  
  const minified = new CleanCSS({
    level: 2,
    inline: ['all'],
    aggressiveMerging: true,
    reduceNonAdjacentRules: true,
    rebase: false
  }).minify(cssContent);

  if (minified.errors.length > 0) {
    console.error('❌ CSS Minification errors:');
    minified.errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  if (minified.warnings.length > 0) {
    console.warn('⚠️  CSS Minification warnings:');
    minified.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  fs.writeFileSync(outputFile, minified.styles, 'utf8');
  
  const originalSize = fs.statSync(inputFile).size;
  const minifiedSize = fs.statSync(outputFile).size;
  const reduction = (100 - (minifiedSize / originalSize * 100)).toFixed(2);

  console.log(`✅ CSS minified successfully`);
  console.log(`   Original: ${(originalSize / 1024).toFixed(2)}KB`);
  console.log(`   Minified: ${(minifiedSize / 1024).toFixed(2)}KB`);
  console.log(`   Reduction: ${reduction}%`);
  
} catch (err) {
  console.error('❌ Error minifying CSS:', err.message);
  process.exit(1);
}
