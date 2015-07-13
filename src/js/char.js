/*
 * A Char is an object which represents a single character of text. Currently, this will be where all formatting information will be stored (ie bold, italic, blockquote, etc.).
 *
 * Char objects will represent every single character within a **Document**.  This includes spaces, newlines, and the empty character terminator.
 *
 * Char objects have 2 main properties:
 *
 * 1. props
 *    - Key-Value pair representing a formatting property and whether it is applied (ie bold, italic, blockquote)
 * 2. parent
 *    - A reference to its parent Word object.
 */
var Char = function (char, parent) {
	this.parent = parent;

	this.char = char || '';
	this.props = {};
}

Char.prototype = {

	getProps: function () {
		var props = [];
		Object.keys(this.props).forEach(function (prop) {
			if (this.props[prop]) {
				props.push(prop);
			}
		}, this);
		return props;
	},

	toJSON: function (id) {
		var name = this.char;
		if (Util.isNewLine(this.char)) {
			name = '\\n';
		} else if (Util.isSpace(this.char)) {
			name = '[ ]';
		}
		return {
			id: 'c' + id,
			name: name,
			children: this.getProps()
		};
	},

	toString: function () {
		return this.char;
	},

	toHTML: function () {
		return this.char;
	}
}