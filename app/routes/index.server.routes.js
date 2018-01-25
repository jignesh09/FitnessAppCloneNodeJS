var index = require('../controllers/index.server.controller.js');

module.exports = function(app) {
	// Route to index page 
	app.get('/', index.render);

	// Route to authentication
	app.post('/authentication', index.authentication);

	// Route to forgot password
	app.route('/forgotpassword')
		.get(index.forgotPassword)
		.post(index.forgotPassword);

	// Route to logout 		
	app.get('/logout', index.logout);

	// Route to reset password 
	app.get('/reset_password/:code',index.reset_password);

	// Route to reset password 
	app.post('/reset_password',index.reset_password);

	// Route to register
	app.get('/register',index.register);
};