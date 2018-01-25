var User = require('mongoose').model('User');
var async = require('async');
var fs = require('fs'); 

// Get all user list
exports.list = function(req, res, next) {
	User.find({status: {'$ne':'Deleted' }}, function(err, users) {
		if (err) {
			return next(err);
		}
		else {	
			res.render('admin/user/list', {
				logintype : req.session.type,
				loginid : req.session.uniqueid,
				loginname : req.session.name,
				loginemail : req.session.email,
				users : users,
				messages : req.flash('error') || req.flash('info'),
				messages : req.flash('info'),
			});	
		}
	}).sort({created_at:'desc'});
};


// Route to add  user page
exports.add = function(req, res, next) {
	User.find({status:'Active' }, function(err, users) {		
		res.render('admin/user/add', {
			logintype : req.session.type,
			loginid : req.session.uniqueid,
			loginname : req.session.name,
			loginemail : req.session.email,
			messages: req.flash('error') || req.flash('info')
		});		
	});
};


// Route to edit user
exports.edit = function(req, res, next) {
	var id = req.params.id;
	User.findOne({
	 		_id: id
		}, 
		function(err, users) {
			if (err) {
				return next(err);
			}
			else
			{
				res.render('admin/user/edit', {
					logintype : req.session.type,
					loginid : req.session.uniqueid,
					loginname : req.session.name,
					loginemail : req.session.email,
					users : users,
					messages: req.flash('error') || req.flash('info')
				});
			}
		}
	
	);			
			
};


// Add user ot database
exports.create = function(req, res, next) {
	console.log(req.body);
	var data = new User(req.body);
	data.save(function(err) {
		if (err) {
			return next(err);
		}
		else {
			req.flash('info', 'New User Added Successfully.');
			return res.redirect('/admin/user/list');
		}
	});
};

exports.update = function(req, res, next) {
	
	User.findByIdAndUpdate(req.body.id, req.body, function(err, state) {
		if (err) {
			return next(err);
		}
		else {
			req.flash('info', 'User Updated Successfully.');
			return res.redirect('/admin/user/list');
		}
	});
};

// User delete / activate / deactivate actions
exports.list_action = function(req, res, next) {
	req.body.loginid=req.session.historyid;
	var async = require('async');
	var action = req.body.btnAction;
	var ids=req.body.iId;
	var str = (req.body.iId.length>1) ? 'Records' : 'Record';
	switch(action)
	{
		case "Active":
		case "Inactive":
		case "Deleted":
			User.updateMany(
				{ '_id':{ $in : req.body.iId } },
				{ $set: { "status": req.body.btnAction } },
				function (err,val) {
					if (err) {
						return next(err);
					}
					else {
						async.forEachSeries(req.body.iId, function(n1, callback_s1) {
							var date = new Date();
							if(action=='Active')
							{
								perform_action="activated";
							}
							else if(action=='Inactive')
							{
								perform_action="deactivated";
							}
							else if(action=='Deleted')
							{
								perform_action="deleted";
							}
							callback_s1();
						// });
						}, function (err) {
							if(req.body.btnAction=='Deleted'){
								req.flash('info', str+' Deleted Successfully.');
							}
							else {
								req.flash('info', str+' Updated Successfully.');
							}
							return res.redirect('/admin/user/list');
						});
						
					}
				}
			)
			break;
	}
	
};