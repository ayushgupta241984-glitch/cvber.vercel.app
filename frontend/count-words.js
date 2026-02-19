import fs from 'fs';
const text = fs.readFileSync('c:/Users/manoj/.gemini/antigravity/scratch/cvber-free/frontend/src/app/page.tsx', 'utf8');
const words = text.split(/\s+/).filter(word => word.length > 0);
console.log('Word count:', words.length);
