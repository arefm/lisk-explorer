module.exports = function (app, api) {
	this.version = function () {
		return { version: app.get('version') };
	};
	const exchange = app.exchange;

	const searchDelegates = function (id, error, success) {
		const delegates = new api.delegates(app);
		delegates.getSearch(
			id,
			body => error({ success: false, error: body.error }),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'address', id: body.address });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	const searchAccount = function (id, error, success) {
		const accounts = new api.accounts(app);
		accounts.getAccount(
			{ address: id },
			() => searchDelegates(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'address', id });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	const searchPublicKey = function (id, error, success) {
		const accounts = new api.accounts(app);
		accounts.getAccount(
			{ publicKey: id },
			() => searchAccount(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'address', id: body.address });
				}
				return error({ success: false, error: null, found: false });
			});
	};

	const searchTransaction = function (id, error, success) {
		const transactions = new api.transactions(app);
		transactions.getTransaction(
			id,
			() => searchPublicKey(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'tx', id: body.transaction.id });
				}
				return error({ success: false, error: body.error });
			});
	};

	const searchBlock = function (id, error, success) {
		const blocks = new api.blocks(app);
		blocks.getBlock(
			id,
			() => searchTransaction(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'block', id: body.block.id });
				}
				return error({ success: false, error: body.error });
			});
	};

	const searchHeight = function (id, error, success) {
		const blocks = new api.blocks(app);
		blocks.getHeight(
			id,
			() => searchBlock(id, error, success),
			(body) => {
				if (body.success === true) {
					return success({ success: true, type: 'block', id: body.block.id });
				}
				return error({ success: false, error: body.error });
			});
	};

	this.getPriceTicker = function (error, success) {
		if (app.get('exchange enabled')) {
			// If exchange rates are enabled - that endpoint cannot fail,
			// in worst case we return empty object here
			return success({ success: true, tickers: exchange.tickers });
		}
		// We use success callback here on purpose
		return success({ success: false, error: 'Exchange rates are disabled' });
	};

	this.search = function (id, error, success) {
		if (id === null) {
			return error({ success: false, error: 'Missing/Invalid search criteria' });
		}
		return searchHeight(id, error, success);
	};
};
