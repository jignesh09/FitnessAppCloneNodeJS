var dashboard = require('../../controllers/admin/dashboard.server.controller.js');
	
module.exports = function(app) {
	
	// Route to administrator dashboard list
	app.get('/admin/dashboard/list', dashboard.list);

	// Route to administrator dashboard chart
	app.get('/admin/dashboard/loadDashboardChart', dashboard.ajax_loadchart);
};