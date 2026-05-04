const fs = require('fs');
const path = require('path');

const filePaths = [
    'src/app/page.tsx',
    'src/app/listings/[id]/page.tsx',
    'src/app/listings/page.tsx',
    'src/app/dashboard/layout.tsx',
    'src/app/auth/verify-email/page.tsx',
    'src/app/auth/register/page.tsx',
    'src/app/auth/login/page.tsx',
    'src/app/post-requirement/page.tsx',
    'src/lib/email.ts'
];

for (const fp of filePaths) {
    const fullPath = path.join(__dirname, fp);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    // Pattern for auth & post-requirement center logo
    content = content.replace(
        /<Link href="\/" className="inline-block mb-6">[\s\S]*?<span className="gradient-text">Mate<\/span>[\s\S]*?<\/Link>/g,
        '<Link href="/" className="logo-container" style={{ justifyContent: \'center\', marginBottom: \'2rem\' }}>\n            <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />\n          </Link>'
    );

    content = content.replace(
        /<Link href="\/" className="flex items-center justify-center gap-2 mb-8">[\s\S]*?<span className="gradient-text">Mate<\/span>[\s\S]*?<\/Link>/g,
        '<Link href="/" className="logo-container" style={{ justifyContent: \'center\', marginBottom: \'2rem\' }}>\n          <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />\n        </Link>'
    );

    // Pattern for dashboard sidebar
    content = content.replace(
        /<Link href="\/" className="flex items-center gap-2 px-2">[\s\S]*?<span className="gradient-text">Mate<\/span>[\s\S]*?<\/Link>/g,
        '<Link href="/" className="logo-container" style={{ padding: \'0 8px\' }}>\n            <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />\n          </Link>'
    );

    // Pattern for dashboard mobile header
    content = content.replace(
        /<span className="font-bold text-xl" style={{ fontFamily: 'Outfit' }}>\s*<span className="gradient-text">Mate<\/span>\s*<\/span>/g,
        '<img src="/logo.svg" alt="Mate Logo" className="mate-logo" style={{ height: \'24px\' }} />'
    );

    // Pattern for listings and page footer
    content = content.replace(
        /<Link href="\/" className="flex items-center gap-2 mb-4">[\s\S]*?<span className="gradient-text">Mate<\/span>[\s\S]*?<\/Link>/g,
        '<Link href="/" className="logo-container" style={{ padding: 0, marginBottom: \'1rem\' }}>\n              <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />\n            </Link>'
    );

    // Standard navbar Pattern for listings/page.tsx
    content = content.replace(
        /<Link href="\/" className="flex items-center gap-2">[\s\S]*?<span className="gradient-text">Mate<\/span>[\s\S]*?<\/Link>/g,
        '<Link href="/" className="logo-container">\n          <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />\n        </Link>'
    );

    // Email templates
    content = content.replace(
        /<h1 style="color:white;margin:8px 0 0;font-size:24px;font-family:Arial;">Mate<\/h1>/g,
        '<h1 style="color:white;margin:8px 0 0;font-size:24px;font-family:Arial;">Mate</h1>'
    );

    if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fp);
    }
}
