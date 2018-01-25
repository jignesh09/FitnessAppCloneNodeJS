var companies = require('../../controllers/admin/administrators.server.controller.js');
	
module.exports = function(app) {
	// Route to add administrator
	app.get('/admin/administrators/add', administrators.add);
};

