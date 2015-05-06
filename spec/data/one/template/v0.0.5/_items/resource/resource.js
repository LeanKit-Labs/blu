module.exports = function( host ) {
	return {
		name: '${resourceName}',
		actions: {
			'self': {
				url: '/:id',
				method: 'get',
				handle: function( envelope ) {
					return { id: envelope.data.id };
				}
			}
		}
	};
};
