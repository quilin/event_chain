var GuidFactory = (function () {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
	    		   .toString(16)
	    		   .substring(1);
	}
	function gen(t) {
		var result = "";
		for (var i = 0; i < t; ++i)
			result += s4();
		return result;
	}

	return {
		create: function () {
	    	return [gen(2), gen(1), gen(1), gen(1), gen(3)].join("-");
		}
	};
})();