const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index.html',
  'article.html',
  'section.html',
  'books.html',
  'book-reader.html',
  'events.html',
  'submit-article.html',
  'register.html',
  'admin-login.html',
  'admin.html',
  'admin-article-editor.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace any old favicon link tags
  content = content.replace(/<link\s+rel=["'](?:shortcut )?icon["'][^>]*>/gi, '');
  content = content.replace(/<link\s+rel=["']alternate icon["'][^>]*>/gi, '');

  // Insert standard high-res favicon right after <head> or charset/viewport
  const favSnippet = `  <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg" />\n  <link rel="alternate icon" type="image/svg+xml" href="favicon.svg" />`;
  if (content.includes('<meta name="viewport"')) {
    content = content.replace(/(<meta name="viewport"[^>]*>)/i, `$1\n${favSnippet}`);
  } else if (content.includes('<head>')) {
    content = content.replace(/<head>/i, `<head>\n${favSnippet}`);
  }

  // Standardize asset paths in admin files
  if (file.startsWith('admin')) {
    content = content.replace(/href=["']admin\.css["']/g, 'href="assets/css/admin.css"');
    content = content.replace(/src=["']admin-auth\.js["']/g, 'src="assets/js/admin-auth.js"');
    content = content.replace(/src=["']supabase-config\.js["']/g, 'src="assets/js/supabase-config.js"');
    content = content.replace(/src=["']admin\.js["']/g, 'src="assets/js/admin.js"');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated favicon & asset paths in: ${file}`);
});
