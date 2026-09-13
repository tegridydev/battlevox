/** Encode a string as a JavaScript literal that is also safe inside an HTML script. */
function javascriptString(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
module.exports = { javascriptString };
