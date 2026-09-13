/** Inspect trusted build artifacts without executing or reserializing their contents. */
async function inlineElements(html) {
  const { parse } = await import('parse5');
  const document = parse(html, { sourceCodeLocationInfo: true });
  const blocks = { script: [], style: [] };
  function visit(node) {
    if (node.tagName === 'script' || node.tagName === 'style') {
      const location = node.sourceCodeLocation;
      if (!location?.startTag || !location.endTag)
        throw Error(`Missing closing tag for <${node.tagName}> in artifact`);
      blocks[node.tagName].push(
        html.slice(location.startTag.endOffset, location.endTag.startOffset),
      );
    }
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  }
  visit(document);
  return blocks;
}
module.exports = { inlineElements };
