const cleanOptionList = [
  { key: 'clearInlineStyles', label: 'Clear inline styles' },
  { key: 'clearClassesAndIds', label: 'Clear classes and IDs' },
  { key: 'characterEncoding', label: 'Character encoding' },
  { key: 'clearComments', label: 'Clear comments' },
  { key: 'clearSpanTags', label: 'Clear span tags' },
  { key: 'clearSuccessiveNbsp', label: "Clear successive &nbsp;'s" },
  { key: 'clearTagsWithOneNbsp', label: 'Clear tags with one &nbsp;' },
  { key: 'clearEmptyTags', label: 'Clear empty tags' },
  { key: 'clearTagAttributes', label: 'Clear tag attributes' },
  { key: 'clearAllTags', label: 'Clear all tags' },
  { key: 'clearImages', label: 'Clear images' },
  { key: 'clearLinks', label: 'Clear links' },
  { key: 'clearTables', label: 'Clear tables' },
  { key: 'convertTablesToDivs', label: 'Convert tables to <div>s' },
  { key: 'organizeTreeView', label: 'Organize tree-view' },
];

const defaultCleanOptions = Object.fromEntries(
  cleanOptionList.map((option) => [option.key, true]),
);

const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const unwrapElement = (element) => {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
};

const removeComments = (root) => {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null);
  const comments = [];
  let current = walker.nextNode();
  while (current) {
    comments.push(current);
    current = walker.nextNode();
  }
  comments.forEach((comment) => comment.remove());
};

const removeEmptyElements = (root, predicate) => {
  const elements = Array.from(root.querySelectorAll('*'));
  elements.forEach((element) => {
    if (element === root) return;
    if (predicate(element)) {
      element.remove();
    }
  });
};

const normalizeNbsp = (input) => input.replace(/(&nbsp;|\u00a0){2,}/gi, '&nbsp;');

const encodeCharacters = (input) =>
  input.replace(/[\u00A0-\u9999]/g, (character) => `&#${character.charCodeAt(0)};`);

const formatHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const indent = (depth) => '  '.repeat(depth);

  const serializeNode = (node, depth) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return '';
      return `${indent(depth)}${text}\n`;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const tagName = node.tagName.toLowerCase();
    const attrs = Array.from(node.attributes)
      .map((attr) => ` ${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`)
      .join('');
    const openTag = `<${tagName}${attrs}>`;

    if (voidElements.has(tagName)) {
      return `${indent(depth)}${openTag}\n`;
    }

    const children = Array.from(node.childNodes)
      .map((child) => serializeNode(child, depth + 1))
      .join('');

    if (!children.trim()) {
      return `${indent(depth)}${openTag}</${tagName}>\n`;
    }

    return `${indent(depth)}${openTag}\n${children}${indent(depth)}</${tagName}>\n`;
  };

  const formatted = Array.from(doc.body.childNodes)
    .map((child) => serializeNode(child, 0))
    .join('')
    .trim();

  return formatted;
};

const convertTablesToDivs = (doc) => {
  const tables = Array.from(doc.querySelectorAll('table'));
  tables.forEach((table) => {
    const tableDiv = doc.createElement('div');
    tableDiv.className = 'table';

    const rows = Array.from(table.querySelectorAll('tr'));
    rows.forEach((row) => {
      const rowDiv = doc.createElement('div');
      rowDiv.className = 'table-row';

      const cells = Array.from(row.querySelectorAll('th, td'));
      cells.forEach((cell) => {
        const cellDiv = doc.createElement('div');
        cellDiv.className = 'table-cell';
        cellDiv.innerHTML = cell.innerHTML;
        rowDiv.appendChild(cellDiv);
      });

      tableDiv.appendChild(rowDiv);
    });

    table.replaceWith(tableDiv);
  });
};

const cleanHtml = (html, options = defaultCleanOptions) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  if (options.clearComments) {
    removeComments(body);
  }

  if (options.clearImages) {
    body.querySelectorAll('img').forEach((img) => img.remove());
  }

  if (options.clearLinks) {
    body.querySelectorAll('a').forEach((link) => unwrapElement(link));
  }

  if (options.clearTables) {
    body.querySelectorAll('table').forEach((table) => table.remove());
  } else if (options.convertTablesToDivs) {
    convertTablesToDivs(doc);
  }

  if (options.clearSpanTags) {
    body.querySelectorAll('span').forEach((span) => unwrapElement(span));
  }

  if (options.clearInlineStyles) {
    body.querySelectorAll('[style]').forEach((element) => element.removeAttribute('style'));
  }

  if (options.clearClassesAndIds) {
    body.querySelectorAll('[class]').forEach((element) => element.removeAttribute('class'));
    body.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  }

  if (options.clearTagAttributes) {
    body.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attr) => element.removeAttribute(attr.name));
    });
  }

  if (options.clearTagsWithOneNbsp || options.clearEmptyTags) {
    removeEmptyElements(body, (element) => {
      if (element.children.length) return false;
      const rawText = element.textContent;
      const textWithoutSpaces = rawText.replace(/[ \t\n\r]/g, '');
      const textWithoutNbsp = rawText.replace(/\u00a0/g, '').replace(/[ \t\n\r]/g, '');
      if (options.clearTagsWithOneNbsp && textWithoutSpaces === '\u00a0') {
        return true;
      }
      if (options.clearEmptyTags && textWithoutNbsp.length === 0) {
        return true;
      }
      return false;
    });
  }

  if (options.clearSuccessiveNbsp) {
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while (node) {
      node.textContent = node.textContent.replace(/\u00a0{2,}/g, '\u00a0');
      node = walker.nextNode();
    }
  }

  let output = options.clearAllTags ? body.textContent ?? '' : body.innerHTML;

  if (options.clearSuccessiveNbsp) {
    output = normalizeNbsp(output);
  }

  if (options.characterEncoding) {
    output = encodeCharacters(output);
  }

  if (options.organizeTreeView && !options.clearAllTags) {
    output = formatHtml(output);
  }

  if (options.clearAllTags) {
    return output.replace(/\u00a0/g, ' ').trim();
  }

  return output;
};

export { cleanHtml, cleanOptionList, defaultCleanOptions };
