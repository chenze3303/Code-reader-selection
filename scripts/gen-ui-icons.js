const { icons } = require('lucide');
const fs = require('fs');

const MAP = {
  home: 'Home', zap: 'Zap', link: 'Link', microscope: 'Microscope',
  clipboard: 'ClipboardList', refresh: 'RefreshCw', search: 'Search',
  phone: 'Smartphone', package: 'Package', more: 'MoreHorizontal',
  sun: 'Sun', moon: 'Moon', x: 'X', check: 'Check',
  lightbulb: 'Lightbulb', warn: 'AlertTriangle', back: 'ArrowLeft',
  pin: 'Pin', folder: 'Folder', folderopen: 'FolderOpen', book: 'BookOpen',
  bookmark: 'BookMarked', star: 'Star', wrench: 'Wrench', settings: 'Settings',
  target: 'Target', library: 'Library', chart: 'BarChart', camera: 'Camera',
  ruler: 'Ruler', tag: 'Bookmark', trophy: 'Trophy', download: 'Download',
  globe: 'Globe', megaphone: 'Megaphone', file: 'FileText', timer: 'Timer',
  frown: 'Frown', sparkles: 'Sparkles', ok: 'CheckCircle', dot: 'Circle',
  cable: 'Cable', shield: 'Shield', battery: 'Battery', bot: 'Bot',
  laptop: 'Laptop', aperture: 'Aperture', eye: 'Eye', gem: 'Gem',
  square: 'Square', plug: 'Plug', info: 'Info', help: 'HelpCircle',
  cameraoff: 'CameraOff', calendar: 'Calendar', clock: 'Clock',
  copy: 'Copy', external: 'ExternalLink', chevronDown: 'ChevronDown',
  chevronUp: 'ChevronUp', layers: 'Layers', list: 'List',
  upload: 'Upload', image: 'Image', trash: 'Trash2', database: 'Database',
  menu: 'Menu',
};

function toSvg(el) {
  const tag = el[0];
  const attrs = Object.entries(el[1] || {}).map(([k, v]) => k + '="' + v + '"').join(' ');
  return '<' + tag + (attrs ? ' ' + attrs : '') + '/>';
}

const out = ['window.UI_ICONS = {'];
const missing = [];
for (const [name, lucideName] of Object.entries(MAP)) {
  const icon = icons[lucideName];
  if (!icon) { missing.push(lucideName); continue; }
  const inner = icon.map(toSvg).join('');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon" aria-hidden="true">' + inner + '</svg>';
  out.push('  "' + name + '": "' + svg.replace(/"/g, '\\"') + '",');
}
out.push('};');
out.push('');
out.push('window.uiIcon = function (name, cls) {');
out.push("  var svg = window.UI_ICONS[name] || window.UI_ICONS.dot;");
out.push("  if (!cls) return svg;");
out.push('  return svg.replace("class=\\"lucide-icon\\"", "class=\\"lucide-icon " + cls + "\\"");');
out.push('};');

fs.writeFileSync('public/js/ui-icons.js', out.join('\n') + '\n');
console.log('Generated public/js/ui-icons.js with', Object.keys(MAP).length - missing.length, 'icons');
if (missing.length) console.log('MISSING:', missing.join(', '));
