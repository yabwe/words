var exists = function (v) {
	return v || v === '' || v === 0 || v === false;
}

var Util = {

	blockNames: ['address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'noscript', 'ol', 'p', 'pre',

	'article', 'aside', 'audio', 'canvas', 'dd', 'figcaption', 'figure', 'footer', 'hgroup', 'main', 'nav', 'output', 'section', 'table', 'tfoot', 'ul', 'video',

	'dt', 'li', 'tbody', 'td', 'th', 'thead', 'tr'],

	isNewLine: function (str) {
		return str === '\r\n' || str === '\n';
	},

	isSpace: function (str) {
		return !!(str.match(/^\s+$/) && str !== '\r');
	},

	on: function (target, event, listener, useCapture) {
		target.addEventListener(event, listener, useCapture);
	}
}