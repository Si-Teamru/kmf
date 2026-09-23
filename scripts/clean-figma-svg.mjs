/**
 * Чистит SVG, выгруженные из Figma MCP (`download_assets`), от артефактов экспорта:
 *   - фон холста `<rect … fill="#F5F5F5"/>` первым элементом;
 *   - фоны родительских фреймов/доски — `<rect>` со сдвигом `translate(-x -y)` вне `<defs>`;
 *   - id с именами слоёв (ссылочные id для clip-path/mask остаются).
 * Сам вектор иконки не меняется.
 *
 *   node scripts/clean-figma-svg.mjs public/icons/*.svg
 */
import fs from 'node:fs'

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8')
  const [body, defs = ''] = src.split(/(?=<defs>)/)
  const cleanedBody = body
    .replace(/<rect width="[\d.]+" height="[\d.]+" fill="#F5F5F5"\/>\n?/, '')
    .replace(/<rect [^>]*transform="translate\(-[^"]*"[^>]*\/>\n?/g, '')
  // id с именами слоёв не нужны; ссылочные (clip/filter/mask/paint/pattern) оставляем.
  const out = (cleanedBody + defs).replace(/ id="[^"]*"/g, (m) =>
    /clip|filter|mask|paint|pattern/i.test(m) ? m : '',
  )
  fs.writeFileSync(file, out)
  console.log(`${file}: ${src.length} → ${out.length} B`)
}
