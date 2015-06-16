var CycleEvent = function (cycle, element, context) {
	this._cycle = cycle;
	this._element = element;
	this._context = context;
	this.callback = function () {};

	this.id = GuidFactory.create();
	this.name = "me_" + this.id;
	this.type = "cycle_" + this.id;
};
CycleEvent.prototype = {
	init: function () {
		this._cycleChain = this._cycle
			.apply(this._context || this, [this._element.eventChain()])
			.atLast(this._restartCycle, this);
		this._cycleChain.init();
		return this._cycleChain;
	},
	dispose: function () {
		this._cycleChain.dispose();
	},
	_restartCycle: function () {
		this.dispose();
		this.init();
		this.trigger("caught");
	}
};