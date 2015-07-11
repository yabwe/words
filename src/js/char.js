var Char = function (char, parent) {
	this.parent = parent;

	this.char = char || '';
	this.props = {};
}

Char.prototype = {

	toString: function () {
		return this.char;
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

	getProps: function () {
		var props = [];
		Object.keys(this.props).forEach(function (prop) {
			if (this.props[prop]) {
				props.push(prop);
			}
		}, this);
		return props;
	},

	toHTML: function () {
		return this.char;
	}
}