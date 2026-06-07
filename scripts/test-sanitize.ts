/**
 * Verifica que sanitize.ts preserva:
 *   - <img src="data:image/svg+xml;base64,..."> (decorações render-v3)
 *   - <link rel="stylesheet" href="https://fonts.googleapis.com/..."> (Syne)
 */

import { sanitizeHtml } from '../src/lib/sanitize'

const tests: Array<[string, string, (out: string) => boolean]> = [
  [
    'data:image em <img>',
    '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" alt="x" />',
    out => out.includes('src="data:image/svg+xml;base64'),
  ],
  [
    '<link> Google Fonts',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700" />',
    out => out.includes('fonts.googleapis.com'),
  ],
  [
    '<link rel=preconnect>',
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    out => out.includes('preconnect'),
  ],
  [
    'data: em <a href=> NÃO permitido (XSS guard)',
    '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
    out => !out.includes('data:text/html'),
  ],
  [
    '<script> tag descartada',
    '<div>ok<script>alert(1)</script></div>',
    out => !out.includes('<script'),
  ],
  [
    'id em <div> preservado (âncoras de nav)',
    '<div id="funcionalidades" style="position:absolute"></div>',
    out => out.includes('id="funcionalidades"'),
  ],
]

let pass = 0, fail = 0
for (const [name, input, check] of tests) {
  const output = sanitizeHtml(input)
  const ok = check(output)
  if (ok) { pass++; console.log(`✓ ${name}`) }
  else    { fail++; console.log(`✗ ${name}\n    input:  ${input}\n    output: ${output}`) }
}

console.log(`\n${pass} passou · ${fail} falhou`)
process.exit(fail === 0 ? 0 : 1)
