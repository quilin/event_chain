var BaseEvent = function (type, element, callback, context) {
	this.element = element;
	this.callback = callback;
	this.context = context;

	this.id = GuidFactory.create();
	this.name = "me_" + this.id;

	if (type instanceof Object) {
		for (var key in type) {
			if (type.hasOwnProperty(key)) {
				this._codes = type[key] instanceof Array
					? type[key]
					: [type[key]];
				type = key;
				this.element = $(document);
				break;
			}
		}
	}

	this.type = type;
	this._uniqueType = type + "." + this.id;

	this._handlers = [];
};
BaseEvent.prototype = {
	on: function (callback, context) {
		this._handlers.push({callback: callback, context: context || this});
		return this;
	},
	trigger: function () {
		for (var i = 0; i < this._handlers.length; ++i) {
			var obj = this._handlers[i];
			obj.callback.apply(obj.context, arguments);
		}
	},
	init: function () {
		var _this = this;
		this.element.on(this._uniqueType, function (evt) {
			if (!_this._codes || _this._codes.indexOf(evt.keyCode) >= 0) {
				_this.trigger(evt);
			}
		})
	},
	dispose: function () {
		this.element.off(this._uniqueType);
	}
};