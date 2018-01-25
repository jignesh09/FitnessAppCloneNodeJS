
var user = require('../../controllers/admin/user.server.controller'),
	passport = require('passport');

module.exports = function(app) {

	// List user 	
	app.get('/admin/user/list', user.list);

	// Edit user 
	app.get('/admin/user/edit/:id', user.edit);

	// Create user 
	app.post('/admin/user/create', user.create);

	// Update user 
	app.post('/admin/user/update', user.update);

	// Add user 	
	app.get('/admin/user/add', user.add);	

	// User list action
	app.post('/admin/user/list', user.list_action);

};
