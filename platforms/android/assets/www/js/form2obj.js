function form2obj(){
	var r = {};
	// for all enabled? inputs
	$(':input[name]', $(this)).each(function(i, field){
		// get the field
		var $field = $(field);
		// sanitize field value
		var value = $field.val();
		// we don't store empty values
		if (!value) return;
		var type = $field.attr('type');
		// TODO: what with selects?
		// IE7 reports array for select option!
		if (value instanceof Array) value = value[0];
		// shim types for <HTML5 browsers
		if (type === 'text') type = $field.attr('data-type');
		// field type determines its value transformation
		if (type === 'checkbox') {
			value = $field.is(':checked');
			if (!value && !$field.attr('required')) return; // N.B. we ignore unset checkboxes unless they're required
		} else if (type === 'number') {
			// FIXME: do we need integers?!
			value = parseFloat(value);
		} else if (type === 'isodate') {
			//value = Date.toDB(value);
			var x = value;
			// four-digit year
			x = '0000'.substr(0,4-x.length)+x;
			// pattern for partial dates
			x += '0000-01-01T00:00:00.000Z'.substring(x.length);
			x = Date.parse(x.replace(/-/g,'/').replace('T', ' ').replace(/\.\d+Z$/,''));
			if (!isNaN(x) && typeof x === 'number') {
				x = new Date(x);
			}
			if (x instanceof Date) x = x.toJSON();
			value = x;
		}
		//console.log('KV', $field.attr('name'), value, type, typeof value, value instanceof Array);
		// put a key-value
		var name = $field.attr('name');
		var path, p;
		// split name to path components
		path = name.replace(/\]/g, '').replace(/\[/g, '.').split('.');
		var o = r;
		// in resulting object sequentially create all path components
		while (p = path.shift()) {
			if (!o[p]) {
				// N.B. handle arrays: if next path component looks like a number -- create array, otherwise object
				o[p] = !path.length || isNaN(+path[0]) ? {} : [];
			}
			// to leaf assign the value
			if (!path.length) {
				o[p] = value;
			}
			o = o[p];
		}
	});
	return r;
};