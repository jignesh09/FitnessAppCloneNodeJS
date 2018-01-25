var Company = require('mongoose').model('Company'),
Department = require('mongoose').model('Department'),
Team = require('mongoose').model('Team'),
Member = require('mongoose').model('Member'),
MembersEmotionalAnalytics = require('mongoose').model('MembersEmotionalAnalytics'),
MemberCalories = require('mongoose').model('MemberCalories'),
MemberSleep = require('mongoose').model('MemberSleep'),
MemberSleepDetail = require('mongoose').model('MemberSleepDetail'),
MemberSteps = require('mongoose').model('MemberSteps'),
MemberHeartBitRate = require('mongoose').model('MemberHeartBitRate'),
MemberActiveMinutes = require('mongoose').model('MemberActiveMinutes'),
Setting = require('mongoose').model('Setting'),
MemberSocial = require('mongoose').model('MemberSocial'),
MemberSocialMedia = require('mongoose').model('MemberSocialMedia'),
MemberSocialMediaFeedback = require('mongoose').model('MemberSocialMediaFeedback'),
Challenge = require('mongoose').model('Challenge'),
ChallengeAccept = require('mongoose').model('ChallengeAccept'),
Test = require('mongoose').model('Test'),
CMS = require('mongoose').model('CMS'),
CronRun = require('mongoose').model('CronRun'),
MemberExercise = require('mongoose').model('MemberExercise'),
FlashScreen = require('mongoose').model('FlashScreen'),
PushNotification = require('mongoose').model('PushNotification'),
Administrator = require('mongoose').model('Administrator'),
Superadmin = require('mongoose').model('Superadmin'),
MemberSocialPreview = require('mongoose').model('MemberSocialPreview'),
MemberSocialShare = require('mongoose').model('MemberSocialShare'),
MembersAktivoScore = require('mongoose').model('MembersAktivoScore'),
BackgroundImage = require('mongoose').model('BackgroundImage'),
MemberInterest = require('mongoose').model('MemberInterest'),
fs = require('fs'),
moment = require('moment'),
_ = require('underscore'),
_this = this,
request = require('request'),
async = require('async'),
monthNamesShort =  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
path = require('path'),
appDir = path.dirname(require.main.filename),
Analyzer = require('./analyzer-v3'),
AnalyzerObj = new Analyzer('d58a3db3-826a-4bc2-857d-91e91f9c42b7'),
R = require("r-script");

/* Code for common functions */
exports.weekStartDateEndDate = function(req, res, passDate) {
	var curr = new Date(passDate), weekArr = [];
	weekArr[0] = _this.formatDate(req, res, new Date(curr.setDate(curr.getDate() - curr.getDay())));
	weekArr[1] = _this.formatDate(req, res, new Date(curr.setDate(curr.getDate() - curr.getDay()+6)));
	return weekArr;
};

exports.formatDate = function(req, res, passDate) {
    var d = new Date(passDate),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

exports.postCurrentDate = function(req, res) {
    var currentDate = new Date();
    var match_month = (currentDate.getMonth()+1);
    match_month = ('0' + match_month).slice(-2);
    var match_day = (currentDate.getDate());
    match_day = ('0' + match_day).slice(-2);
    return currentDate.getFullYear()+'-' +match_month+ '-'+match_day;
};

exports.postCurrentTime = function(req, res) {
    var currentTime = new Date();
    var hrs = currentTime.getHours();
    hrs = ('0' + hrs).slice(-2);
    var mins = currentTime.getMinutes();
    mins = ('0' + mins).slice(-2);
    var sec = currentTime.getSeconds();
    sec = ('0' + sec).slice(-2);
    return hrs+':'+mins+':'+sec;
};

exports.sendOTPEmail = function(req,res,toemail,subject,content) {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
            user: 'otp@fitnessapp.com',
            pass: '9924699246'
        }
    });

    var mailOptions = {
        from: '"Fitness App" <otp@fitnessapp.com>',
        to: toemail,
        subject: subject,
        html: content
    };

    transporter.sendMail(mailOptions, function(error, info){
        return;
    });
};

exports.randomString = function(req, res, len){
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
};

exports.weekStartWeekEndDatesFromWeekNoAndYear = function(req, res, week, year){
	week-= 1;
	var weekDatesResponse = {'startDate':moment(year.toString()).add(week.toString(), 'weeks').startOf('week').format('YYYY-MM-DD'),'endDate':moment(year.toString()).add(week.toString(), 'weeks').endOf('week').format('YYYY-MM-DD')};
	return weekDatesResponse;
};

exports.postRangeStartEndDates = function(req, res, startDate, stopDate) {
    startDate = new Date(startDate);
    startDate = _this.formatDate(req,res,startDate);

    stopDate = new Date(stopDate);
    stopDate = _this.formatDate(req,res,stopDate);

    var dateArray = [];
    var currentDate = moment(startDate);
    stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
};

exports.convertSecondTimeFormatToHoursMins = function(req, res, seconds) {
    var x = seconds,
    x = x*1000,
    d = moment.duration(x, 'milliseconds'),
    hours = Math.floor(d.asHours()),
    mins = Math.floor(d.asMinutes()) - hours * 60,
    timeObj = {'hour':hours,'min':mins};
    return timeObj;
};

exports.formatSecondToHoursMins = function(req, res, seconds) {
    var x = seconds;   
    x = x*1000;
    var d = moment.duration(x, 'milliseconds'),
    hours = Math.floor(d.asHours()),
    mins = Math.floor(d.asMinutes()) - hours * 60;
    if(hours>0){
        if(mins>0){
        	var hoursStr = (hours>1) ? hours+" hours " : hours+" hour ";
        	var minsStr = (mins>1) ? mins+" mins" : mins+" min";
            return hoursStr+minsStr;
        }
        else {
            return (hours>1) ? hours+" hours" : hours+" hour";
        }
    }
    else {
    	return (mins>1) ? mins+" mins" : mins+" min";
    }
};

exports.postSubstract1DayMinusFromDateWithFormat = function(req , res, passDate){
    var passDate = new Date(passDate);
    passDate.setDate(passDate.getDate()-1);
    passDate = _this.formatDate(req,res,passDate);
    return passDate;
};

exports.modifyPA = function(req, res, LIPA, MVPA, Sleep, SB) {
    if(Sleep>=4 || SB>=4 || LIPA>=4 || MVPA>=4){
        if(Sleep>=4){
            if(SB<1){
                SB = 1;
                Sleep-= 1;
            }
            if(LIPA<1){
                LIPA = 1;
                Sleep-= 1;
            }
            if(MVPA<1){
                MVPA = 1;
                Sleep-= 1;
            }
        }
        else if(SB>=4){
            if(Sleep<1){
                Sleep = 1;
                SB-= 1;
            }
            if(LIPA<1){
                LIPA = 1;
                SB-= 1;
            }
            if(MVPA<1){
                MVPA = 1;
                SB-= 1;
            }   
        }
        else if(LIPA>=4){
            if(Sleep<1){
                Sleep = 1;
                LIPA-= 1;
            }
            if(SB<1){
                SB = 1;
                LIPA-= 1;
            }
            if(MVPA<1){
                MVPA = 1;
                LIPA-= 1;
            }
        }
        else {
            if(Sleep<1){
                Sleep = 1;
                MVPA-= 1;
            }
            if(SB<1){
                SB = 1;
                MVPA-= 1;
            }
            if(LIPA<1){
                LIPA = 1;
                MVPA-= 1;
            }
        }
    }
    else {
        Sleep = (Sleep<1) ? 1 : Sleep;
        SB = (SB<1) ? 1 : SB;
        LIPA = (LIPA<1) ? 1 : LIPA;
        MVPA = (MVPA<1) ? 1 : MVPA;
    }
    var paObj = {
        'LIPA' : parseFloat(LIPA.toFixed(2)),
        'MVPA' : parseFloat(MVPA.toFixed(2)),
        'Sleep' : parseFloat(Sleep.toFixed(2)),
        'SB' : parseFloat(SB.toFixed(2))
    };
    return paObj;
};

exports.postCurrentMonthStartEndDatesPlus1Day = function(req,res,startDate,endDate,month,year) {
    var f = new Date(startDate.toDate()),
    fs = f.getDate() - f.getDay(),
    fds = new Date(f.setDate(fs)).toUTCString();

    var d = new Date(fds),
    mm = (d.getMonth() + 1);
    mm = ('0' + mm).slice(-2);

    var dd = d.getDate();
    dd = ('0' + dd).slice(-2);
    var yyyy = d.getFullYear(),
    startDate = yyyy+"-"+mm+"-"+dd;

    var l = new Date(endDate.toDate()),
    ls = l.getDate() - l.getDay(),
    lf = ls + 6,
    ldf = new Date(l.setDate(lf)).toUTCString();

    var d = new Date(ldf),
    mm = (d.getMonth() + 1);
    mm = ('0' + mm).slice(-2);
    var dd = d.getDate();
    dd = ('0' + dd).slice(-2);
    var yyyy = d.getFullYear(),
    finishDate = yyyy+"-"+mm+"-"+dd;

    var todayday = new Date(),
    main_custom_date = new Date(year+'-'+month+'-'+'01');
    if((year==todayday.getFullYear()) && (month==todayday.getMonth()+1)){
        var noOfDaysInMonth = parseInt(todayday.getDate());
    }
    else {
        var noOfDaysInMonth = new Date(year, month, 0).getDate();
    }

    var startWeekArr = new Array(),
    weekRangeDatesArr = new Array();
    for(var i=1;i<=noOfDaysInMonth;i++){
        var newDate = new Date(main_custom_date.getFullYear(),main_custom_date.getMonth(),i)
        if(newDate.getDay()==0){
            var passDD = ('0' + i).slice(-2),
            passMM = ('0' + month).slice(-2);
            var passDate = year+'-'+passMM+'-'+passDD;
            var weekRangeDates = _this.postSpecificWeekStartEndDatesPlus1Day(req, res, passDate);
            weekRangeDatesArr.push(weekRangeDates);
            startWeekArr.push(year+'-'+month+'-'+i);
        }
    }
    
    if (startWeekArr[0] != year+'-'+month+'-'+1) {
        var passMM = ('0' + month).slice(-2);
        var weekRangeDates = _this.postSpecificWeekStartEndDatesPlus1Day(req, res, year+'-'+passMM+'-'+1);
        weekRangeDatesArr.unshift(weekRangeDates);
        startWeekArr.unshift(year+'-'+month+'-'+1);
    }
    weekRangeDatesArr.reverse();
    return weekRangeDatesArr;
};

exports.postSpecificWeekStartEndDatesPlus1Day = function(req, res, passDate) {
    var dateParts = passDate.split('-'),
    MM = ('0' + dateParts[1]).slice(-2),
    DD = ('0' + dateParts[2]).slice(-2),
    passDate = dateParts[0]+'-'+MM+'-'+DD;
    var curr = new Date(passDate),
    first = curr.getDate() - curr.getDay(),
    d = new Date(curr.setDate(first));
    d.setDate(d.getDate() + 1),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var firstDate = [year, month, day].join('-');

    var d2 = new Date(curr.setDate((curr.getDate()+1) - curr.getDay()+6));
    month2 = '' + (d2.getMonth() + 1),
    day2 = '' + d2.getDate(),
    year2 = d2.getFullYear();
    if (month2.length < 2) month2 = '0' + month2;
    if (day2.length < 2) day2 = '0' + day2;
    var lastDate = [year2, month2, day2].join('-');

    var responsearr = [];
    responsearr[0] = firstDate;
    responsearr[1] = lastDate;
    return responsearr;
};

// get current month start date and end date
exports.postCurrentMonthStartEndDates = function(req,res,startDate,endDate,month,year) {
    var f = new Date(startDate.toDate()),
    fs = f.getDate() - f.getDay(),
    fds = new Date(f.setDate(fs)).toUTCString();

    var d = new Date(fds),
    mm = (d.getMonth() + 1);
    mm = ('0' + mm).slice(-2);

    var dd = d.getDate();
    dd = ('0' + dd).slice(-2);
    var yyyy = d.getFullYear(),
    startDate = yyyy+"-"+mm+"-"+dd;

    var l = new Date(endDate.toDate()),
    ls = l.getDate() - l.getDay(),
    lf = ls + 6,
    ldf = new Date(l.setDate(lf)).toUTCString();

    var d = new Date(ldf),
    mm = (d.getMonth() + 1);
    mm = ('0' + mm).slice(-2);
    var dd = d.getDate();
    dd = ('0' + dd).slice(-2);
    var yyyy = d.getFullYear(),
    finishDate = yyyy+"-"+mm+"-"+dd;

    var todayday = new Date(),
    main_custom_date = new Date(year+'-'+month+'-'+'01');
    if((year==todayday.getFullYear()) && (month==todayday.getMonth()+1)){
        var noOfDaysInMonth = parseInt(todayday.getDate());
    }
    else {
        var noOfDaysInMonth = new Date(year, month, 0).getDate();
    }

    var startWeekArr = new Array(),
    weekRangeDatesArr = new Array();
    for(var i=1;i<=noOfDaysInMonth;i++){
        var newDate = new Date(main_custom_date.getFullYear(),main_custom_date.getMonth(),i)
        if(newDate.getDay()==0){
            var passDD = ('0' + i).slice(-2),
            passMM = ('0' + month).slice(-2);
            var passDate = year+'-'+passMM+'-'+passDD;
            var weekRangeDates = _this.postSpecificWeekStartEndDates(req, res, passDate);
            weekRangeDatesArr.push(weekRangeDates);
            startWeekArr.push(year+'-'+month+'-'+i);
        }
    }
    
    if (startWeekArr[0] != year+'-'+month+'-'+1) {
        var passMM = ('0' + month).slice(-2);
        var weekRangeDates = _this.postSpecificWeekStartEndDates(req, res, year+'-'+passMM+'-'+1);
        weekRangeDatesArr.unshift(weekRangeDates);
        startWeekArr.unshift(year+'-'+month+'-'+1);
    }
    weekRangeDatesArr.reverse();
    return weekRangeDatesArr;
};

// get current month start date and end date
exports.postSpecificWeekStartEndDates = function(req, res, passDate) {
    var dateParts = passDate.split('-'),
    MM = ('0' + dateParts[1]).slice(-2),
    DD = ('0' + dateParts[2]).slice(-2),
    passDate = dateParts[0]+'-'+MM+'-'+DD;
    var curr = new Date(passDate),
    first = curr.getDate() - curr.getDay(),
    d = new Date(curr.setDate(first));
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var firstDate = [year, month, day].join('-');

    var d2 = new Date(curr.setDate((curr.getDate()) - curr.getDay()+6)),
    month2 = '' + (d2.getMonth() + 1),
    day2 = '' + d2.getDate(),
    year2 = d2.getFullYear();
    if (month2.length < 2) month2 = '0' + month2;
    if (day2.length < 2) day2 = '0' + day2;
    var lastDate = [year2, month2, day2].join('-');

    var responsearr = [];
    responsearr[0] = firstDate;
    responsearr[1] = lastDate;
    return responsearr;
};

exports.memberProfilePhotoURL = function(req, res, baseUrl, photo, gender, type){
    gender = (!gender) ? 'Male' : gender;
    if(photo){
        var memberProfileURL = appDir+'/upload/member/'+photo;
        if(fs.existsSync(memberProfileURL)){
            return baseUrl+'/member/'+photo;
        }
        else {
            return (type=='round') ? ((gender=='Male') ? baseUrl+'/img/avatar/maleRound.png' : baseUrl+'/img/avatar/femaleRound.png') : ((gender=='Male') ? baseUrl+'/img/avatar/maleSquare.png' : baseUrl+'/img/avatar/femaleSquare.png');
        }
    }
    else {
        return (type=='round') ? ((gender=='Male') ? baseUrl+'/img/avatar/maleRound.png' : baseUrl+'/img/avatar/femaleRound.png') : ((gender=='Male') ? baseUrl+'/img/avatar/maleSquare.png' : baseUrl+'/img/avatar/femaleSquare.png');
    }
};
/* End of code for common functions */

exports.postAktivoMyStats = function(req, res, next){
	var resObj = new Object,
	aktivoMyStatsObj = new Object,
	currentDate = _this.postCurrentDate(req,res);

    var previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate()-1);
    var previousDateFormat = _this.formatDate(req,res,previousDate);
    
	if(req.body.member_id && req.body.type && req.body.week && req.body.year){
		Member.findOne({_id : req.body.member_id},{'company_id':1},function(err, memberInfo){
			if(memberInfo){
				Member.find({company_id:memberInfo.company_id},{firstname:1,lastname:1},function(err, companyMembers){
					var memIds = _.pluck(companyMembers, '_id'),
					memIds = memIds.join().split(','),
					weekDates = _this.weekStartWeekEndDatesFromWeekNoAndYear(req, res, req.body.week, req.body.year),
					startDate = new Date(weekDates.startDate),
					endDate = new Date(weekDates.endDate),
					startDateFormattted = startDate.getDate()+' '+monthNamesShort[startDate.getMonth()].toUpperCase(),
					endDateFormattted = endDate.getDate()+' '+monthNamesShort[endDate.getMonth()].toUpperCase(),
					weekStartDateFormatted = weekDates.startDate+'T00:00:00+00:00',
	        		weekEndDateFormatted = weekDates.endDate+'T23:59:00+00:00',
	        		weekDateRange = _this.postRangeStartEndDates(req,res,weekDates.startDate,weekDates.endDate);
	        		if(req.body.type=='AKTIVO'){
						var pipelineAktivo = [
						    {"$match": { "member_id": req.body.member_id,"created_date":{$in:weekDateRange}} },
						    {
						        "$group": {
						            "_id": null,
						            "average": { "$avg": "$aktivo_score" }
						        }
						    }
						];

						var pipelineAktivoNetwork = [
						    {"$match": { "created_date":currentDate,"member_id":{$in:memIds}} },
						    {
						        "$group": {
						            "_id": null,
						            "average_network": { "$avg": "$aktivo_score" }
						        }
						    }
						];
						MembersAktivoScore.aggregate(pipelineAktivo).exec(function (err, resultAktivo){
							var weekAvgAktivo = (resultAktivo.length>0) ? ((resultAktivo[0].average>=45) ? resultAktivo[0].average : 45) : 45;
							MembersAktivoScore.aggregate(pipelineAktivoNetwork).exec(function (err, resultAktivoNetwork){
								var networkAvgAktivo = (resultAktivoNetwork.length>0) ? ((resultAktivoNetwork[0].average_network>=45) ? resultAktivoNetwork[0].average_network : 45) : 45;
								MembersAktivoScore.findOne({"member_id": req.body.member_id,"created_date":currentDate},function(err, aktivoScoreInfo){
									var todaysScore = (aktivoScoreInfo) ? ((aktivoScoreInfo.aktivo_score>=45) ? aktivoScoreInfo.aktivo_score : 45) : 45;
									aktivoMyStatsObj = {'score':parseInt(weekAvgAktivo),'caption':'You have <b>a really good</b> Aktivo score! <b>Well done!</b>','you':parseInt(todaysScore),'your_network':parseInt(networkAvgAktivo),'week_start':startDateFormattted,'week_end':endDateFormattted};
									resObj.data = aktivoMyStatsObj;
							    	resObj.status = 1;
							        resObj.message = '';
							        res.json(resObj);
								})
							})
						})
				    }
					else if(req.body.type=='POSITIVITY'){
						var pipelinePositivityWeekly = [
						    {"$match": { "member_id": req.body.member_id,"currentDate":{$in:weekDateRange}} },
						    {
						        "$group": {
						            "_id": null,
						            "average_weekly": { "$avg": "$valence_score" }
						        }
						    }
						];

						var pipelinePositivityToday = [
						    {"$match": { "currentDate":currentDate,"member_id":req.body.member_id} },
						    {
						        "$group": {
						            "_id": null,
						            "average_today": { "$avg": "$valence_score" }
						        }
						    }
						];

						var pipelinePositivityNetwork = [
						    {"$match": { "currentDate":currentDate,"member_id":{$in:memIds}} },
						    {
						        "$group": {
						            "_id": null,
						            "average_network": { "$avg": "$valence_score" }
						        }
						    }
						];

						MembersEmotionalAnalytics.aggregate(pipelinePositivityWeekly).exec(function (err, resultPositivityWeekly){
							var weekAvgValence = (resultPositivityWeekly.length>0) ? resultPositivityWeekly[0].average_weekly : 0;
							MembersEmotionalAnalytics.aggregate(pipelinePositivityNetwork).exec(function (err, resultPositivityNetwork){
								var networkAvgValence = (resultPositivityNetwork.length>0) ? resultPositivityNetwork[0].average_network : 0;
								MembersEmotionalAnalytics.aggregate(pipelinePositivityToday).exec(function (err, resultPositivityToday){
									var todaysScore = (resultPositivityToday.length>0) ? resultPositivityToday[0].average_today : 0;
									aktivoMyStatsObj = {'score':parseInt(weekAvgValence),'caption':"You're still up! What's on your mind...",'you':parseInt(todaysScore),'your_network':parseInt(networkAvgValence),'week_start':startDateFormattted,'week_end':endDateFormattted};
									resObj.data = aktivoMyStatsObj;
							    	resObj.status = 1;
							        resObj.message = '';
							        res.json(resObj);
								})
							})
						})
					}
					else if(req.body.type=='CALORIES'){
                        var pipelineCaloriesNetwork = [
                            {"$match": { "created_date":previousDateFormat,"member_id":{$in:memIds}} },
                            {
                                "$group": {
                                    "_id": null,
                                    "average_calories_network": { "$avg": "$calories_burned" }
                                }
                            }
                        ];

                        MemberCalories.aggregate(pipelineCaloriesNetwork).exec(function (err, resultCaloriesNetwork){
                            var networkAvgCalories = (resultCaloriesNetwork.length>0) ? ((resultCaloriesNetwork[0].average_calories_network>=500) ? resultCaloriesNetwork[0].average_calories_network : 500) : 500;
                            MemberCalories.findOne({ member_id: req.body.member_id,created_date:previousDateFormat}, function(err, caloriesInfo) {
                                var totalCalories = (caloriesInfo) ? ((caloriesInfo.calories_burned>=500) ? caloriesInfo.calories_burned : 500) : 500;
                                aktivoMyStatsObj = {'score':0,'caption':'','you':parseInt(totalCalories),'your_network':parseInt(networkAvgCalories),'week_start':startDateFormattted,'week_end':endDateFormattted};
                                resObj.data = aktivoMyStatsObj;
                                resObj.status = 1;
                                resObj.message = '';
                                res.json(resObj);
                            });
                        })
					}
					else if(req.body.type=='STEPS_TAKEN'){
                        var pipelineStepsTakenNetwork = [
                            {"$match": { "created_date":previousDateFormat,"member_id":{$in:memIds}} },
                            {
                                "$group": {
                                    "_id": null,
                                    "average_steps_network": { "$avg": "$steps" }
                                }
                            }
                        ];

                        MemberSteps.aggregate(pipelineStepsTakenNetwork).exec(function (err, resultStepsNetwork){
                            var networkAvgSteps = (resultStepsNetwork.length>0) ? ((resultStepsNetwork[0].average_steps_network>=500) ? resultStepsNetwork[0].average_steps_network : 500) : 500;
                            MemberSteps.findOne({ member_id: req.body.member_id,created_date:previousDateFormat}, function(err, stepsInfo) {
                                var totalSteps = (stepsInfo) ? ((stepsInfo.steps>=500) ? stepsInfo.steps : 500) : 500;
                                aktivoMyStatsObj = {'score':0,'caption':'','you':parseInt(totalSteps),'your_network':parseInt(networkAvgSteps),'week_start':startDateFormattted,'week_end':endDateFormattted};
                                resObj.data = aktivoMyStatsObj;
                                resObj.status = 1;
                                resObj.message = '';
                                res.json(resObj);
                            });
                        })
					}
					else if(req.body.type=='BPM'){
                        var pipelineBPMTakenNetwork = [
                            {"$match": { "created_date":previousDateFormat,"member_id":{$in:memIds}} },
                            {
                                "$group": {
                                    "_id": null,
                                    "average_bpm_network": { "$avg": "$resting_heart_rate" }
                                }
                            }
                        ];

                        MemberHeartBitRate.aggregate(pipelineBPMTakenNetwork).exec(function (err, resultBPMNetwork){
                            var networkAvgHR = (resultBPMNetwork && resultBPMNetwork.length>0) ? ((resultBPMNetwork[0].average_bpm_network && resultBPMNetwork[0].average_bpm_network>=40) ? resultBPMNetwork[0].average_bpm_network : 40) : 40;
                            MemberHeartBitRate.findOne({ member_id: req.body.member_id,created_date:previousDateFormat}, function(err, HRInfo) {
                                var totalHR = (HRInfo && HRInfo.resting_heart_rate && HRInfo.resting_heart_rate>=40) ? HRInfo.resting_heart_rate : 40;
                                aktivoMyStatsObj = {'score':0,'caption':'','you':parseInt(totalHR),'your_network':parseInt(networkAvgHR),'week_start':startDateFormattted,'week_end':endDateFormattted};
                                resObj.data = aktivoMyStatsObj;
                                resObj.status = 1;
                                resObj.message = '';
                                res.json(resObj);
                            });
                        })
					}
					else if(req.body.type=='SLEEP'){
                        var pipelineSleepNetwork = [
                            {"$match": { "created_date":previousDateFormat,"member_id":{$in:memIds}} },
                            {
                                "$group": {
                                    "_id": null,
                                    "average_sleep_network": { "$avg": "$total_sleep" }
                                }
                            }
                        ];

                        var pipelineSleepMine = [
                            {"$match": { "created_date":previousDateFormat,"member_id":req.body.member_id} },
                            {
                                "$group": {
                                    "_id": null,
                                    "total_sleep_mine": { "$sum": "$total_sleep" }
                                }
                            }
                        ];

                        MemberSleep.aggregate(pipelineSleepNetwork).exec(function (err, resultSleepNetwork){
                            var networkAvgSleep = (resultSleepNetwork.length>0) ? resultSleepNetwork[0].average_sleep_network : 0;
                            networkAvgSleep = parseInt(Math.ceil(networkAvgSleep / 3600));
                            MemberSleep.aggregate(pipelineSleepMine).exec(function (err, resultSleepMine){
                                var totalSleep = (resultSleepMine.length>0) ? (resultSleepMine[0].total_sleep_mine/3600) : 0;
                                aktivoMyStatsObj = {'score':0,'caption':'','you':parseInt(totalSleep),'your_network':parseInt(networkAvgSleep),'week_start':startDateFormattted,'week_end':endDateFormattted};
                                resObj.data = aktivoMyStatsObj;
                                resObj.status = 1;
                                resObj.message = '';
                                res.json(resObj);
                            })    
                        })
					}
					else {
						aktivoMyStatsObj = {'score':0,'caption':'','you':0,'your_network':0,'week_start':startDateFormattted,'week_end':endDateFormattted};
					    resObj.data = aktivoMyStatsObj;
                        resObj.status = 1;
                        resObj.message = '';
                        res.json(resObj);
                    }
				});
			}
			else {
				resObj.status = 0;
		        resObj.message = 'Member not exist.';
		        res.json(resObj);
			}
		})
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postDisplayProfile = function(req,res){
    var resObj = new Object,
    baseUrl = req.protocol + '://' + req.get('host');
    if(req.body.member_id){
        Member.findOne({_id : req.body.member_id},{firstname:1,lastname:1,phone:1,date_of_birth:1,height:1,photo:1,weight:1,smokes:1,drinks:1,badtime:1,wakeup:1,area_of_interest:1,sex:1,height_unit:1,weight_unit:1},function(err, memberInfo){
            if(memberInfo){
                memberInfo = JSON.parse(JSON.stringify(memberInfo));
                memberInfo.photo = _this.memberProfilePhotoURL(req, res, baseUrl, memberInfo.photo, memberInfo.sex, 'round');
                memberInfo.firstname = (memberInfo.firstname) ? memberInfo.firstname : '';
                memberInfo.lastname = (memberInfo.lastname) ? memberInfo.lastname : '';
                memberInfo.phone = (memberInfo.phone) ? memberInfo.phone : '';
                memberInfo.date_of_birth = (memberInfo.date_of_birth) ? memberInfo.date_of_birth : '';
                memberInfo.height = (memberInfo.height) ? memberInfo.height : 0;
                memberInfo.height_unit = (memberInfo.height_unit) ? memberInfo.height_unit : 'feet';
                memberInfo.weight = (memberInfo.weight) ? memberInfo.weight : 0;
                memberInfo.weight_unit = (memberInfo.weight_unit) ? memberInfo.weight_unit : 'kg';
                memberInfo.smokes = (memberInfo.smokes) ? memberInfo.smokes : 0;
                memberInfo.drinks = (memberInfo.drinks) ? memberInfo.drinks : 0;
                memberInfo.badtime = (memberInfo.badtime) ? memberInfo.badtime : '';
                memberInfo.wakeup = (memberInfo.wakeup) ? memberInfo.wakeup : '';
                memberInfo.area_of_interest = (memberInfo.area_of_interest) ? memberInfo.area_of_interest : '';
                delete memberInfo.sex;

                MemberInterest.find({},{title:1},function(err, areaOfInterest){
                    areaOfInterest = JSON.parse(JSON.stringify(areaOfInterest));

                    async.forEachSeries(areaOfInterest, function(singleAreaOfInterest, callback_singleAreaOfInterest) {
                        singleAreaOfInterest.status = 'No';
                        if(_.contains(memberInfo.area_of_interest, singleAreaOfInterest._id)){
                            singleAreaOfInterest.status = 'Yes';
                        }
                        callback_singleAreaOfInterest();
                    }, function (err) {
                        resObj.data = memberInfo;
                        resObj.area_of_interest = areaOfInterest;
                        resObj.status = 1;
                        resObj.message = '';
                        res.json(resObj);
                    })
                })
            }
            else {
                resObj.status = 0;
                resObj.message = 'Member not exist.';
                res.json(resObj);
            }
        })
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postUpdateProfile = function(req,res){
    var resObj = new Object, memberObj = new Object;
    if(req.body.member_id){
        if(req.body.firstname){
            memberObj.firstname = req.body.firstname;
        }
        if(req.body.lastname){
            memberObj.lastname = req.body.lastname;
        }
        if(req.body.phone){
            memberObj.phone = req.body.phone;
        }
        if(req.body.date_of_birth){
            memberObj.date_of_birth = req.body.date_of_birth;
        }
        if(req.body.height){
            memberObj.height = req.body.height;
        }
        if(req.body.height_unit){
            memberObj.height_unit = req.body.height_unit;
        }
        if(req.body.weight){
            memberObj.weight = req.body.weight;
        }
        if(req.body.weight_unit){
            memberObj.weight_unit = req.body.weight_unit;
        }
        if(req.body.smokes){
            memberObj.smokes = req.body.smokes;
        }
        if(req.body.drinks){
            memberObj.drinks = req.body.drinks;
        }
        if(req.body.badtime){
            memberObj.badtime = req.body.badtime;
        }
        if(req.body.wakeup){
            memberObj.wakeup = req.body.wakeup;
        }
        if(req.body.area_of_interest){
            var areaOfInterest = req.body.area_of_interest;
            memberObj.area_of_interest = areaOfInterest.split("|"); 
        }
        if(req.files){
            var fileName = '';
            async.forEachSeries(req.files, function(singlePhotoFile, callback_singlePhotoFile) {
                var length = 10,
                fileExt = singlePhotoFile.name.split('.').pop();
                fileName = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
                fileName+= '.'+fileExt;
                memberObj.photo = fileName;
                singlePhotoFile.mv(appDir+'/upload/member/'+fileName, function(err) {
                    callback_singlePhotoFile();
                });
            }, function (err) {
                Member.findByIdAndUpdate(req.body.member_id, memberObj, function(err, memberInfo) {
                    resObj.status = 1;
                    resObj.message = 'Your profile updated successfully.';
                    res.json(resObj);
                })
            })
        }
        else {
            Member.findByIdAndUpdate(req.body.member_id, memberObj, function(err, memberInfo) {
                resObj.status = 1;
                resObj.message = 'Your profile updated successfully.';
                res.json(resObj);
            })
        }
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postGenerateAktivoScore = function(req, res, next){
    var resObj = new Object,
    currentDate = _this.postCurrentDate(req,res);
    if(req.body.member_id){
    	var R = require("r-script");
    	R(appDir+"/public/rAktivoScore/AktivoScoreCalculationPhase2.R").data(req.body.member_id, currentDate).call(function(err, d) {
            if (err) {
                
            }
            else {
                resObj.status = 1;
		        resObj.message = '';
		        res.json(resObj);
            }
        });
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.userStatisticsPhase2 = function(req, res, next){
	var resarr = new Object();
    if(req.query.id && req.query.date){
    	var id=req.query.id, date=req.query.date, age=0, gender='M';

        Member.findOne({_id : id},{'age':1,'sex':1,'_id':0},function(err, memberInfo){
            age = (memberInfo.age) ? memberInfo.age : 0;
            gender = (memberInfo.sex) ? (memberInfo.sex=='Male') ? 'M' : 'F' : 'M';
            MembersAktivoScore.findOne({member_id : id,aktivo_score:{$ne:0}},function(err, singleAktivoScore){
                if(!singleAktivoScore){
                    var aktivoStartDate = new Date(date);
                    aktivoStartDate.setDate(aktivoStartDate.getDate()-7);
                    var singleAktivoScore = {
                        'created_date' : _this.formatDate(req,res,aktivoStartDate)
                    };
                }
                var generateAktivoStart = new Date(singleAktivoScore.created_date);
                generateAktivoStart.setDate(generateAktivoStart.getDate()+1);
                generateAktivoStart = _this.formatDate(req,res,generateAktivoStart);
                
                var generateAktivoEnd = new Date(date);
                generateAktivoEnd.setDate(generateAktivoEnd.getDate()-1);
                generateAktivoEnd = _this.formatDate(req,res,generateAktivoEnd);

                var historyStart = new Date(singleAktivoScore.created_date);
                historyStart.setDate(historyStart.getDate()-7);
                historyStart = _this.formatDate(req,res,historyStart);
                
                var historyEnd = new Date(singleAktivoScore.created_date);
                historyEnd.setDate(historyEnd.getDate()-1);
                historyEnd = _this.formatDate(req,res,historyEnd);

                var resDateRangeGenerateAktivo = _this.postRangeStartEndDates(req,res,generateAktivoStart,generateAktivoEnd);
                var resDateRangeHistory = _this.postRangeStartEndDates(req,res,historyStart,historyEnd);
                var historicalScores = [],paScores = [];
                async.forEachSeries(resDateRangeGenerateAktivo.reverse(), function(singleDate, callback_singleDate) {
                	var LIPA=0, MVPA=0, Sleep=0,SB=0;

                    MemberHeartBitRate.findOne({member_id:id,created_date:singleDate},function(err, hrInfo){
                        if(hrInfo){
                            LIPA = (hrInfo.minutes_lightly_active) ? parseFloat((hrInfo.minutes_lightly_active/60).toFixed(2)) : 0;
                            SB = (hrInfo.minutes_sedentary) ? parseFloat((hrInfo.minutes_sedentary/60).toFixed(2)) : 0;
                        }
                        MemberExercise.findOne({member_id:id,created_date:singleDate},function(err, exerciseInfoInner){
                            if(exerciseInfoInner){
                                MVPA = (exerciseInfoInner.duration) ? parseFloat((exerciseInfoInner.duration/60).toFixed(2)) : 0;
                            }
                            MemberSleep.findOne({member_id:id,created_date:singleDate},function(err, sleepInfoInner){
                                if(sleepInfoInner){
                                    Sleep = (sleepInfoInner.total_sleep) ? parseFloat((sleepInfoInner.total_sleep/60).toFixed(2)) : 0;
                                }

                                var totalPA = (LIPA + MVPA + Sleep + SB);
                                if((!LIPA && !MVPA && !Sleep && !SB) || (totalPA>1440)){
                                    callback_singleDate();
                                }
                                else {
                                    var modifyPAResponse = _this.modifyPA(req, res, LIPA, MVPA, Sleep, SB);
                                    modifyPAResponse.date = singleDate;
                                    paScores.push(modifyPAResponse);
                                    callback_singleDate();
                                }
                            });
                        })
                    })
                }, function (err) {
                	async.forEachSeries(resDateRangeHistory.reverse(), function(singleHistoryDate, callback_singleHistoryDate) {
                        MembersAktivoScore.findOne({member_id : id,created_date : singleHistoryDate},{'aktivo_score':1,'loaded_score':1,'LIPA_Modified':1,'MVPA_Modified':1,'Sleep_Modified':1,'SB_Modified':1,'created_date':1,'_id':0},function(err, singleDatedAktivoScore){
                            if(singleDatedAktivoScore){
                                var historyObj = {
                                    'aktivo_score' : singleDatedAktivoScore.aktivo_score,
                                    'loaded_score' : singleDatedAktivoScore.loaded_score,
                                    'LIPA_Modified' : singleDatedAktivoScore.LIPA_Modified,
                                    'MVPA_Modified' : singleDatedAktivoScore.MVPA_Modified,
                                    'Sleep_Modified' : singleDatedAktivoScore.Sleep_Modified,
                                    'SB_Modified' : singleDatedAktivoScore.SB_Modified,
                                    'date' : singleDatedAktivoScore.created_date
                                };
                                historicalScores.push(historyObj);
                            }
                            callback_singleHistoryDate();
                        });
                    }, function (err) {
                        if(paScores.length==0){
                            historicalScores = [];
                        }
                        var aktivoScoreResObj = {
                            'statistics' : {
                                'id' : id,
                                'age' : age,
                                'gender' : gender,
                                'date' : date
                            },
                            'scores' : paScores,
                            'historical_scores' : historicalScores
                        };
                        console.log(aktivoScoreResObj);
                        resarr.data = aktivoScoreResObj;
                        resarr.msg = 1;
                        res.json(resarr);
                    }); 
                });
            }).sort({created_at: 'desc'})
        });
    }
    else {
        resarr.msg = 0;
        res.json(resarr);
    }
};

exports.setStatisticsPhase2 = function(req, res, next){
	console.log(req.body);
    var resarr = new Object();
    if(req.body.id && req.body.generated_score){
        async.forEachSeries(req.body.generated_score, function(singleScore, callback_singleScore) {
            var aktivoGeneratedDate = new Date(singleScore.date);
            aktivoGeneratedDate.setDate(aktivoGeneratedDate.getDate()+1);
            aktivoGeneratedDate = _this.formatDate(req,res,aktivoGeneratedDate)
            var aktivoScoreObj = {
                'member_id': req.body.id,
                'aktivo_score' : singleScore.aktivo_score,
                'loaded_score' : singleScore.loaded_score,
                'LIPA_Modified' : singleScore.LIPA_Modified,
                'MVPA_Modified' : singleScore.MVPA_Modified,
                'Sleep_Modified' : singleScore.Sleep_Modified,
                'SB_Modified' : singleScore.SB_Modified,
                'created_date' : aktivoGeneratedDate,
                'created_at' : aktivoGeneratedDate+'T00:00:00.000Z'
            };
            MembersAktivoScore.findOne({member_id:req.body.id,created_date:aktivoScoreObj.created_date},function(err, aktivoInfo){
                if(aktivoInfo){
                    MembersAktivoScore.findOneAndUpdate({_id:aktivoInfo._id},aktivoScoreObj, function(err) { 
                        callback_singleScore();
                    });
                }
                else {
                    var aktivoStore = new MembersAktivoScore(aktivoScoreObj);
                    aktivoStore.save(function(err) { 
                        callback_singleScore();
                    });
                }
            })
        }, function (err) {
			resarr.msg = 1;
            res.json(resarr);
        }); 
    }
    else {
        resarr.msg = 0;
        res.json(resarr);
    }
};

exports.postExercise = function(req, res) {
    var resObj = new Object,
	fullUrl = req.protocol + '://' + req.get('host');
	if(req.body.member_id && req.body.week && req.body.year){
		var weekDates = _this.weekStartWeekEndDatesFromWeekNoAndYear(req, res, req.body.week, req.body.year),
		resDateRange = _this.postRangeStartEndDates(req,res,weekDates.startDate,weekDates.endDate),
        startDate = new Date(weekDates.startDate),
        endDate = new Date(weekDates.endDate),
        startDateFormattted = startDate.getDate()+' '+monthNamesShort[startDate.getMonth()].toUpperCase(),
        endDateFormattted = endDate.getDate()+' '+monthNamesShort[endDate.getMonth()].toUpperCase(),
		totalAktivityThisWeek = 0, tableActivityArr = [];
        
		async.forEachSeries(resDateRange.reverse(), function(singleDate, callback_singleDate) {
            var startDateActivity = singleDate+'T00:00:00+00:00',
            endDateActivity = singleDate+'T23:59:59+00:00';
            MemberExercise.find({ "start_time":{$gte:startDateActivity,$lte:endDateActivity}, member_id : req.body.member_id }, function(err, memExerciseInfo) {
                var singleDayAktivityObj = new Object(), multipleAktivity = [];
				async.forEachSeries(memExerciseInfo, function(singleExercise, callback_singleExercise) {
					var exerciseStartTime = singleExercise.start_time.toString();
                    totalAktivityThisWeek+= singleExercise.duration;
					typeURLTitle = singleExercise.type.replace(" ", "-");
					
                    var heartRateZones = {'peak':singleExercise.heart_rate_zones_peak_minutes,'cardio':singleExercise.heart_rate_zones_cardio_minutes,'fat_burn':singleExercise.heart_rate_zones_fat_burn_minutes},
                    caloriesBurned = {'cals':singleExercise.calories,'cals_min':parseInt(singleExercise.calories/(parseFloat(singleExercise.duration/60)))},
                    impactOnMyDay = {'steps':{'from':2680,'to':19200},'calories':{'from':190,'to':2250},'active_minutes':{'from':39,'to':39}},
                    singleAktivityObj = {'type':singleExercise.type,'typeURL': (fullUrl+'/img/activity_phase2/'+typeURLTitle.toLowerCase()+'.png'),'time':(exerciseStartTime.split("T").pop().substr(0,5)),'duration':(parseInt(singleExercise.duration/60)+' min'),'average_heart_rate':((singleExercise.average_heart_rate==null) ? '0 avg. BPM' : singleExercise.average_heart_rate+' avg. BPM'),'calories':singleExercise.calories+' burned','heartRateZones':heartRateZones,'caloriesBurned':caloriesBurned,'impactOnMyDay':impactOnMyDay};
					multipleAktivity.push(singleAktivityObj);
                    callback_singleExercise();
				}, function (err) {
					var singleActualDate = new Date(singleDate);
					singleDayAktivityObj = {'date':singleActualDate.getDate()+' '+monthNamesShort[singleActualDate.getMonth()].toUpperCase(),'activites':multipleAktivity};
					tableActivityArr.push(singleDayAktivityObj);
					callback_singleDate();
				});
			});
		}, function (err) {
			var currentDate = _this.postCurrentDate(req,res),
			date = new Date(weekDates.endDate),
			firstDay = _this.formatDate(req,res,new Date(date.getFullYear(), date.getMonth(), 1)),
			lastDay = _this.formatDate(req, res,new Date(date.getFullYear(), date.getMonth() + 1, 0)),
			resDateRange = _this.postRangeStartEndDates(req,res,firstDay,lastDay);
			var overviewArr = [];
			async.forEachSeries(resDateRange, function(singleDateOverview, callback_singleDateOverview) {
                var startDateActivity = singleDateOverview+'T00:00:00+00:00',
                endDateActivity = singleDateOverview+'T23:59:59+00:00';
				MemberExercise.findOne({ "start_time":{$gte:startDateActivity,$lte:endDateActivity}, member_id : req.body.member_id }, function(err, memExerciseInfo) {
					var availabilityStatus = (memExerciseInfo) ? 'Yes' : 'No',
					todayStatus = (singleDateOverview==currentDate) ? 'Yes' : 'No',
					overviewObj = {'availability_status':availabilityStatus,'today_status':todayStatus,'date':singleDateOverview};
					overviewArr.push(overviewObj);
					callback_singleDateOverview();
				});
			}, function (err) {
				var aktivityObj = {'first_slide':_this.convertSecondTimeFormatToHoursMins(req,res,totalAktivityThisWeek),'second_slide':overviewArr,'table_activity_data':tableActivityArr,'week_start':startDateFormattted,'week_end':endDateFormattted};
				resObj.data = aktivityObj;
				resObj.status = 1;
		        resObj.message = '';
		        res.json(resObj);
			});
		});
	}
	else {
		resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
	}
};

// save sleep details
exports.postSaveValidicSleepDetails = function(req, res, member_id, startDate) {
    var currentDate = _this.postCurrentDate(req,res);
    var currentTime = _this.postCurrentTime(req,res);
    var async = require('async');
    var request = require('request');
    Member.find({_id:member_id}, function(err, member) {
        if(member.length>0){
            async.forEachSeries(member, function(n1, callback_s1) {
                if(n1.validic_uid){
                    var sleep_url = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+member[0].validic_uid+"/sleep.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5&start_date="+startDate+"+00:00&end_date="+currentDate+"+00:00&expanded=1";
                    request(sleep_url, function (error, response, body) {
                        var myjson = JSON.parse(body);
                        if(myjson.summary){
                            if(myjson.summary.status==200){
                                if(myjson.sleep.length>0){
                                    async.forEachSeries(myjson.sleep, function(n2, callback_s2) {
                                        n2.member_id = member_id;
                                        var res_timestamp = n2.timestamp;
                                        res_timestamp = res_timestamp.substring(0, res_timestamp.indexOf("+"));
                                        res_timestamp = res_timestamp.replace('T', ' ');
                                        var res_timestamp = new Date(res_timestamp);
                                        var match_month = (res_timestamp.getMonth()+1);
                                        match_month = ('0' + match_month).slice(-2);
                                        var match_day = (res_timestamp.getDate());
                                        match_day = ('0' + match_day).slice(-2);
                                        n2.created_date = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        
                                        var hrs = res_timestamp.getHours();
                                        hrs = ('0' + hrs).slice(-2);
                                        var mins = res_timestamp.getMinutes();
                                        mins = ('0' + mins).slice(-2);
                                        var sec = res_timestamp.getSeconds();
                                        sec = ('0' + sec).slice(-2);
                                        n2.created_time = hrs+':'+mins+':'+sec;
                                        n2.platform_type = 'validic';
                                        MemberSleepDetail.findOne({ member_id: n1._id,created_date:n2.created_date,created_time:n2.created_time}, function(err, memSleepDetails) {
                                            if(!memSleepDetails){
                                                var msd = new MemberSleepDetail(n2);
                                                msd.save(function(err) {
                                                    callback_s2();
                                                });
                                            }
                                            else {
                                                MemberSleepDetail.findByIdAndUpdate(memSleepDetails._id, n2, function(err, memSleepDetailResponse) {
                                                    callback_s2();
                                                });
                                            }
                                        });
                                    }, function (err) {
                                        callback_s1();
                                    });
                                }
                                else {
                                    callback_s1();
                                }
                            }
                            else {
                                callback_s1();
                            }
                        }
                        else {
                            callback_s1();
                        }
                    });
                }
                else {
                    callback_s1();
                }   
            }, function (err) {
                return;
            });
        }
        else {
            return;
        }
    });
};

// save active minutes
exports.postSaveValidicActiveMinutes = function(req, res, member_id, startDate) {
    var currentDate = _this.postCurrentDate(req,res);
    var currentTime = _this.postCurrentTime(req,res);
    var async = require('async');
    var request = require('request');
    Member.find({_id:member_id}, function(err, member) {
        if(member.length>0){
            async.forEachSeries(member, function(n1, callback_s1) {
                if(n1.validic_uid){
                    var routine_url = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+n1.validic_uid+"/routine.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5&start_date="+startDate+"T00:00:00+00:00&end_date="+currentDate+"T23:59:59+00:00&expanded=0";
                    request(routine_url, function (error, response, body) {
                        var myjson = JSON.parse(body);
                        if(myjson.summary){
                            if(myjson.summary.status==200){
                                if(myjson.routine.length>0){
                                    async.forEachSeries(myjson.routine, function(n2, callback_s2) {
                                        n2.member_id = member_id;
                                        var res_timestamp = n2.timestamp;
                                        res_timestamp = res_timestamp.substring(0, res_timestamp.indexOf("+"));
                                        res_timestamp = res_timestamp.replace('T', ' ');
                                        var res_timestamp = new Date(res_timestamp);
                                        var match_month = (res_timestamp.getMonth()+1);
                                        match_month = ('0' + match_month).slice(-2);
                                        var match_day = (res_timestamp.getDate());
                                        match_day = ('0' + match_day).slice(-2);
                                        n2.created_date = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        
                                        var hrs = res_timestamp.getHours();
                                        hrs = ('0' + hrs).slice(-2);
                                        var mins = res_timestamp.getMinutes();
                                        mins = ('0' + mins).slice(-2);
                                        var sec = res_timestamp.getSeconds();
                                        sec = ('0' + sec).slice(-2);
                                        n2.created_time = hrs+':'+mins+':'+sec;
                                        n2.platform_type = 'validic';
                                        MemberActiveMinutes.findOne({ member_id: n1._id,created_date:n2.created_date}, function(err, memActiveMinutes) {
                                            if(n2.active_duration!=0){
                                                if(!memActiveMinutes){
                                                    var mam = new MemberActiveMinutes(n2);
                                                    mam.save(function(err) {
                                                        callback_s2();
                                                    });
                                                }
                                                else {
                                                    MemberActiveMinutes.findByIdAndUpdate(memActiveMinutes._id, n2, function(err, activeMinutesResponse) {
                                                        callback_s2();
                                                    });
                                                }
                                            }
                                            else {
                                                callback_s2();
                                            }
                                        });
                                    }, function (err) {
                                        callback_s1();
                                    });
                                }
                                else {
                                    callback_s1();
                                }
                            }
                            else {
                                callback_s1();
                            }
                        }
                        else {
                            callback_s1();
                        }
                    });
                }
                else {
                    callback_s1();
                }   
            }, function (err) {
                return;
            });
        }
        else {
            return;
        }
    });
};

// save exercise - activities
exports.postSaveValidicExercise = function(req, res, member_id, startDate) {
    var currentDate = _this.postCurrentDate(req,res);
    var currentTime = _this.postCurrentTime(req,res);
    var async = require('async');
    var request = require('request');
    Member.find({_id:member_id}, function(err, member) {
        if(member.length>0){
            async.forEachSeries(member, function(n1, callback_s1) {
                if(n1.validic_uid){
                    var fitness_url = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+n1.validic_uid+"/fitness.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5&start_date="+startDate+"T00:00:00+00:00&end_date="+currentDate+"T23:59:59+00:00&expanded=1";
                    request(fitness_url, function (error, response, body) {
                        var myjson = JSON.parse(body);
                        if(myjson.summary){
                            if(myjson.summary.status==200){
                                if(myjson.fitness.length>0){
                                    async.forEachSeries(myjson.fitness, function(n2, callback_s2) {
                                        n2.member_id = n1._id;
                                        n2.exercise_id = n2._id;
                                        n2.activity_level_sedentary_minutes = (n2.activity_level.length>0) ? n2.activity_level[0].minutes : 0;
                                        n2.activity_level_lightly_minutes = (n2.activity_level.length>0) ? n2.activity_level[1].minutes : 0;
                                        n2.activity_level_fairly_minutes = (n2.activity_level.length>0) ? n2.activity_level[2].minutes : 0;
                                        n2.activity_level_very_minutes = (n2.activity_level.length>0) ? n2.activity_level[3].minutes : 0;
                                        
                                        if(n2.heart_rate_zones!=null){
                                            n2.heart_rate_zones_out_of_range_max = n2.heart_rate_zones[0].max;
                                            n2.heart_rate_zones_out_of_range_min = n2.heart_rate_zones[0].min;
                                            n2.heart_rate_zones_out_of_range_minutes = n2.heart_rate_zones[0].minutes;
                                            n2.heart_rate_zones_fat_burn_max = n2.heart_rate_zones[1].max;
                                            n2.heart_rate_zones_fat_burn_min = n2.heart_rate_zones[1].min;
                                            n2.heart_rate_zones_fat_burn_minutes = n2.heart_rate_zones[1].minutes;
                                            n2.heart_rate_zones_cardio_max = n2.heart_rate_zones[2].max;
                                            n2.heart_rate_zones_cardio_min = n2.heart_rate_zones[2].min;
                                            n2.heart_rate_zones_cardio_minutes = n2.heart_rate_zones[2].minutes;
                                            n2.heart_rate_zones_peak_max = n2.heart_rate_zones[3].max;
                                            n2.heart_rate_zones_peak_min = n2.heart_rate_zones[3].min;
                                            n2.heart_rate_zones_peak_minutes = n2.heart_rate_zones[3].minutes;
                                        }
                                        else {
                                            n2.heart_rate_zones_out_of_range_max = 0;
                                            n2.heart_rate_zones_out_of_range_min = 0;
                                            n2.heart_rate_zones_out_of_range_minutes = 0;
                                            n2.heart_rate_zones_fat_burn_max = 0;
                                            n2.heart_rate_zones_fat_burn_min = 0;
                                            n2.heart_rate_zones_fat_burn_minutes = 0;
                                            n2.heart_rate_zones_cardio_max = 0;
                                            n2.heart_rate_zones_cardio_min = 0;
                                            n2.heart_rate_zones_cardio_minutes = 0;
                                            n2.heart_rate_zones_peak_max = 0;
                                            n2.heart_rate_zones_peak_min = 0;
                                            n2.heart_rate_zones_peak_minutes = 0;
                                        }
                                        n2.manual_values_specified_calories = n2.manual_values_specified.calories;
                                        n2.manual_values_specified_distance = n2.manual_values_specified.distance;
                                        n2.manual_values_specified_steps = n2.manual_values_specified.steps;                                    
                                        delete n2._id;
                                        delete n2.activity_level;
                                        delete n2.heart_rate_zones;
                                        delete n2.manual_values_specified;
                                        var res_timestamp = n2.timestamp;
                                        res_timestamp = res_timestamp.substring(0, res_timestamp.indexOf("+"));
                                        res_timestamp = res_timestamp.replace('T', ' ');
                                        var res_timestamp = new Date(res_timestamp);
                                        var match_month = (res_timestamp.getMonth()+1);
                                        match_month = ('0' + match_month).slice(-2);
                                        var match_day = (res_timestamp.getDate());
                                        match_day = ('0' + match_day).slice(-2);
                                        var res_timestamp_str = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        n2.created_date = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        
                                        var hrs = res_timestamp.getHours();
                                        hrs = ('0' + hrs).slice(-2);
                                        var mins = res_timestamp.getMinutes();
                                        mins = ('0' + mins).slice(-2);
                                        var sec = res_timestamp.getSeconds();
                                        sec = ('0' + sec).slice(-2);
                                        n2.created_time = hrs+':'+mins+':'+sec;
                                        n2.platform_type = 'validic';
                                        
                                        MemberExercise.find({ member_id: n1._id,created_date:n2.created_date,platform_type: {'$ne':'validic'}}, function(err, memExerciseTotalRec) {
                                            if(n2.active_duration!=0){
                                                if(memExerciseTotalRec.length>0){
                                                    MemberExercise.remove({ member_id: n1._id,created_date:n2.created_date},function(err, delRec){
                                                        var me = new MemberExercise(n2);
                                                        me.save(function(err) {
                                                            callback_s2();
                                                        });                                             
                                                    });
                                                }
                                                else {
                                                    MemberExercise.find({ member_id: n1._id,created_date:n2.created_date,created_time:n2.created_time}, function(err, exercise) {
                                                        if(exercise.length==0){
                                                            var me = new MemberExercise(n2);
                                                            me.save(function(err) {
                                                                callback_s2();
                                                            });
                                                        }
                                                        else {
                                                            var matchStatus = 'No';
                                                            async.forEachSeries(exercise, function(n3, callback_s3) {
                                                                if(n2.active_duration==n3.active_duration){
                                                                    matchStatus = 'Yes';
                                                                }
                                                                callback_s3();
                                                            }, function (err) {
                                                                if(matchStatus=='No'){
                                                                    var me = new MemberExercise(n2);
                                                                    me.save(function(err) {
                                                                        callback_s2();
                                                                    });
                                                                }
                                                                else {
                                                                    callback_s2();
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                            else {
                                                callback_s2();
                                            }
                                        });

                                    }, function (err) {
                                        callback_s1();
                                    });
                                }
                                else {
                                    callback_s1();
                                }
                            }
                            else {
                                callback_s1();
                            }
                        }
                        else {
                            callback_s1();
                        }
                    });
                }
                else {
                    callback_s1();
                }   
            }, function (err) {
                return;
            });
        }
        else {
            return;
        }
    });
};

// save validic heart rate
exports.postSaveValidicHeartRate = function(req, res, member_id, startDate) {
    var currentDate = _this.postCurrentDate(req,res);
    var currentTime = _this.postCurrentTime(req,res);
    var async = require('async');
    var request = require('request');
    Member.find({_id:member_id}, function(err, member) {
        if(member.length>0){
            async.forEachSeries(member, function(n1, callback_s1) {
                if(n1.validic_uid){
                    var heartbitrate_url = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+n1.validic_uid+"/routine.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5&start_date="+startDate+"T00:00:00+00:00&end_date="+currentDate+"T23:59:59+00:00&expanded=1";
                    request(heartbitrate_url, function (error, response, body) {
                        var myjson = JSON.parse(body);
                        if(myjson.summary){
                            if(myjson.summary.status==200){
                                if(myjson.routine.length>0){
                                    async.forEachSeries(myjson.routine, function(n2, callback_s2) {
                                        n2.member_id = n1._id;
                                        n2.heart_rate_id = n2._id;
                                        delete n2._id;

                                        var res_timestamp = n2.timestamp;
                                        res_timestamp = res_timestamp.substring(0, res_timestamp.indexOf("+"));
                                        res_timestamp = res_timestamp.replace('T', ' ');
                                        var res_timestamp = new Date(res_timestamp);
                                        var match_month = (res_timestamp.getMonth()+1);
                                        match_month = ('0' + match_month).slice(-2);
                                        var match_day = (res_timestamp.getDate());
                                        match_day = ('0' + match_day).slice(-2);
                                        var res_timestamp_str = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        n2.created_date = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        
                                        var hrs = res_timestamp.getHours();
                                        hrs = ('0' + hrs).slice(-2);
                                        var mins = res_timestamp.getMinutes();
                                        mins = ('0' + mins).slice(-2);
                                        var sec = res_timestamp.getSeconds();
                                        sec = ('0' + sec).slice(-2);
                                        n2.created_time = hrs+':'+mins+':'+sec;
                                        n2.platform_type = 'validic';
                                        MemberHeartBitRate.findOne({ member_id: n1._id,created_date:n2.created_date}, function(err, heartRate) {
                                            if(n2.resting_heart_rate!=null && n2.resting_heart_rate!=0){
                                                if(!heartRate){
                                                    var hr = new MemberHeartBitRate(n2);
                                                    hr.save(function(err) {
                                                        callback_s2();
                                                    });
                                                }
                                                else {
                                                    MemberHeartBitRate.findByIdAndUpdate(heartRate._id, n2, function(err, heartRateResponse) {
                                                        callback_s2();
                                                    });
                                                }
                                            }
                                            else {
                                                callback_s2();
                                            }
                                        });
                                    }, function (err) {
                                        callback_s1();
                                    });
                                }
                                else {
                                    callback_s1();
                                }
                            }
                            else {
                                callback_s1();
                            }   
                        }
                        else {
                            callback_s1();
                        }
                    });
                }
                else {
                    callback_s1();
                }   
            }, function (err) {
                return;
            });
        }
        else {
            return;
        }
    });
};

// save validic steps
exports.postSaveValidicSteps = function(req, res, member_id, startDate) {
    var currentDate = _this.postCurrentDate(req,res);
    var currentTime = _this.postCurrentTime(req,res);
    var async = require('async');
    var request = require('request');
    Member.find({_id:member_id}, function(err, member) {
        if(member.length>0){
            async.forEachSeries(member, function(n1, callback_s1) {
                if(n1.validic_uid){
                    var steps_url = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+n1.validic_uid+"/routine.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5&start_date="+startDate+"T00:00:00+00:00&end_date="+currentDate+"T23:59:59+00:00&expanded=0";
                    request(steps_url, function (error, response, body) {
                        var myjson = JSON.parse(body);
                        if(myjson.summary){
                            if(myjson.summary.status==200){
                                if(myjson.routine.length>0){
                                    async.forEachSeries(myjson.routine, function(n2, callback_s2) {
                                        n2.member_id = n1._id;
                                        n2.steps_id = n2._id;
                                        delete n2._id;

                                        var res_timestamp = n2.timestamp;
                                        res_timestamp = res_timestamp.substring(0, res_timestamp.indexOf("+"));
                                        res_timestamp = res_timestamp.replace('T', ' ');
                                        var res_timestamp = new Date(res_timestamp);
                                        var match_month = (res_timestamp.getMonth()+1);
                                        match_month = ('0' + match_month).slice(-2);
                                        var match_day = (res_timestamp.getDate());
                                        match_day = ('0' + match_day).slice(-2);
                                        var res_timestamp_str = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        n2.created_date = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        
                                        var hrs = res_timestamp.getHours();
                                        hrs = ('0' + hrs).slice(-2);
                                        var mins = res_timestamp.getMinutes();
                                        mins = ('0' + mins).slice(-2);
                                        var sec = res_timestamp.getSeconds();
                                        sec = ('0' + sec).slice(-2);
                                        n2.created_time = hrs+':'+mins+':'+sec;
                                        n2.platform_type = 'validic';
                                        MemberSteps.findOne({ member_id: n1._id,created_date:n2.created_date}, function(err, steps) {
                                            if(n2.steps!=0){
                                                if(!steps){
                                                    var st = new MemberSteps(n2);
                                                    st.save(function(err) {
                                                        callback_s2();
                                                    });
                                                }
                                                else {
                                                    MemberSteps.findByIdAndUpdate(steps._id, n2, function(err, stepsResponse) {
                                                        callback_s2();
                                                    });
                                                }
                                            }
                                            else {
                                                callback_s2();
                                            }
                                        });
                                    }, function (err) {
                                        callback_s1();
                                    });
                                }
                                else {
                                    callback_s1();
                                }
                            }
                            else {
                                callback_s1();
                            }   
                        }
                        else {
                            callback_s1();
                        }
                    });
                }
                else {
                    callback_s1();
                }   
            }, function (err) {
                return;
            });
        }
        else {
            return;
        }
    });
};

// save validic sleep info
exports.postSaveValidicSleep = function(req, res,member_id,startDate) {
    var currentDate = _this.postCurrentDate(req,res);
    var currentTime = _this.postCurrentTime(req,res);
    var async = require('async');
    var request = require('request');
    Member.find({_id:member_id}, function(err, member) {
        if(member.length>0){
            async.forEachSeries(member, function(n1, callback_s1) {
                if(n1.validic_uid){
                    var sleep_url = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+n1.validic_uid+"/sleep.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5&start_date="+startDate+"T00:00:00+00:00&end_date="+currentDate+"T23:59:59+00:00&expanded=0";
                    request(sleep_url, function (error, response, body) {
                        var myjson = JSON.parse(body);
                        if(myjson.summary){
                            if(myjson.summary.status==200){
                                if(myjson.sleep.length>0){
                                    async.forEachSeries(myjson.sleep, function(n2, callback_s2) {
                                        n2.member_id = n1._id;
                                        n2.sleep_id = n2._id;
                                        delete n2._id;

                                        var res_timestamp = n2.timestamp;
                                        res_timestamp = res_timestamp.substring(0, res_timestamp.indexOf("+"));
                                        res_timestamp = res_timestamp.replace('T', ' ');
                                        var res_timestamp = new Date(res_timestamp);
                                        var match_month = (res_timestamp.getMonth()+1);
                                        match_month = ('0' + match_month).slice(-2);
                                        var match_day = (res_timestamp.getDate());
                                        match_day = ('0' + match_day).slice(-2);
                                        var res_timestamp_str = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        n2.created_date = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        
                                        var hrs = res_timestamp.getHours();
                                        hrs = ('0' + hrs).slice(-2);
                                        var mins = res_timestamp.getMinutes();
                                        mins = ('0' + mins).slice(-2);
                                        var sec = res_timestamp.getSeconds();
                                        sec = ('0' + sec).slice(-2);
                                        n2.created_time = hrs+':'+mins+':'+sec;
                                        n2.platform_type = 'validic';
                                        MemberSleep.find({ member_id: n1._id,created_date:n2.created_date,platform_type: {'$ne':'validic'}}, function(err, sleepTotalRec) {
                                            if(n2.total_sleep!=0){
                                                if(sleepTotalRec.length>0){
                                                    MemberSleep.remove({ member_id: n1._id,created_date:n2.created_date},function(err, delRec){
                                                        var sleptInfo = new MemberSleep(n2);
                                                        sleptInfo.save(function(err) {
                                                            callback_s2();
                                                        });                                             
                                                    });
                                                }
                                                else {
                                                    MemberSleep.find({ member_id: n1._id,created_date:n2.created_date,created_time:n2.created_time}, function(err, slept) {
                                                        if(slept.length==0){
                                                            var sleptInfo = new MemberSleep(n2);
                                                            sleptInfo.save(function(err) {
                                                                callback_s2();
                                                            });
                                                        }
                                                        else {
                                                            var matchStatus = 'No';
                                                            async.forEachSeries(slept, function(n3, callback_s3) {
                                                                if(n2.total_sleep==n3.total_sleep){
                                                                    matchStatus = 'Yes';
                                                                }
                                                                callback_s3();
                                                            }, function (err) {
                                                                if(matchStatus=='No'){
                                                                    var sleptInfo = new MemberSleep(n2);
                                                                    sleptInfo.save(function(err) {
                                                                        callback_s2();
                                                                    });
                                                                }
                                                                else {
                                                                    callback_s2();
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                            else {
                                                callback_s2();
                                            }
                                        });
                                    }, function (err) {
                                        callback_s1();
                                    });
                                }
                                else {
                                    callback_s1();
                                }
                            }
                            else {
                                callback_s1();
                            }
                        }
                        else {
                            callback_s1();
                        }
                    });
                }
                else {
                    callback_s1();
                }   
            }, function (err) {
                return;
            });
        }
        else {
            return;
        }
    });
};

// save validic calories burned
exports.postSaveValidicCaloriesBurned = function(req, res,member_id,startDate) {
    var currentDate = _this.postCurrentDate(req,res);
    var currentTime = _this.postCurrentTime(req,res);
    var async = require('async');
    var request = require('request');
    Member.find({_id:member_id}, function(err, member) {
        if(member.length>0){
            async.forEachSeries(member, function(n1, callback_s1) {
                if(n1.validic_uid){
                    var calories_url = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+n1.validic_uid+"/routine.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5&start_date="+startDate+"T00:00:00+00:00&end_date="+currentDate+"T23:59:59+00:00&expanded=0";
                    request(calories_url, function (error, response, body) {
                        var myjson = JSON.parse(body);
                        if(myjson.summary){
                            if(myjson.summary.status==200){
                                if(myjson.routine.length>0){
                                    async.forEachSeries(myjson.routine, function(n2, callback_s2) {
                                        n2.member_id = n1._id;
                                        n2.calories_id = n2._id;
                                        delete n2._id;

                                        var res_timestamp = n2.timestamp;
                                        res_timestamp = res_timestamp.substring(0, res_timestamp.indexOf("+"));
                                        res_timestamp = res_timestamp.replace('T', ' ');
                                        var res_timestamp = new Date(res_timestamp);
                                        var match_month = (res_timestamp.getMonth()+1);
                                        match_month = ('0' + match_month).slice(-2);
                                        var match_day = (res_timestamp.getDate());
                                        match_day = ('0' + match_day).slice(-2);
                                        var res_timestamp_str = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        n2.created_date = res_timestamp.getFullYear()+'-' +match_month+ '-'+match_day;
                                        
                                        var hrs = res_timestamp.getHours();
                                        hrs = ('0' + hrs).slice(-2);
                                        var mins = res_timestamp.getMinutes();
                                        mins = ('0' + mins).slice(-2);
                                        var sec = res_timestamp.getSeconds();
                                        sec = ('0' + sec).slice(-2);
                                        n2.created_time = hrs+':'+mins+':'+sec;
                                        n2.platform_type = 'validic';
                                        MemberCalories.findOne({ member_id: n1._id,created_date:n2.created_date}, function(err, cal) {
                                            if(n2.calories_burned!=0){
                                                if(!cal){
                                                    var ca = new MemberCalories(n2);
                                                    ca.save(function(err) {
                                                        callback_s2();
                                                    });
                                                }
                                                else {
                                                    MemberCalories.findByIdAndUpdate(cal._id, n2, function(err, caloriesResponse) {
                                                        callback_s2();
                                                    });
                                                }
                                            }
                                            else {
                                                callback_s2();
                                            }
                                        });
                                    }, function (err) {
                                        callback_s1();
                                    });
                                }
                                else {
                                    callback_s1();
                                }
                            }
                            else {
                                callback_s1();
                            }
                        }
                        else {
                            callback_s1();
                        }
                    });
                }
                else {
                    callback_s1();
                }   
            }, function (err) {
                return;
            });
        }
        else {
            return;
        }
    });
};

exports.postSaveValidicAHKGFData = function(req, res){
	var resObj = new Object;
    if(req.body.member_id){
        if((req.body.type=='apple_health_kit' || req.body.type=='google_fit') && req.body.jsonInfo){
            var async = require('async'),
            json2Arr = JSON.parse(req.body.jsonInfo);
            async.forEachSeries(json2Arr.calories_burned, function(singleCalRec, callback_singleCalRec) {
                singleCalRec.created_date = _this.postSubstract1DayMinusFromDateWithFormat(req,res,singleCalRec.created_date);
                MemberCalories.findOne({member_id:req.body.member_id,created_date:singleCalRec.created_date},function(err,memCalRecords){
                    singleCalRec.calories_burned = Math.ceil(singleCalRec.calories_burned);
                    singleCalRec.timestamp = singleCalRec.created_date+'T'+singleCalRec.created_time+'+00:00';
                    singleCalRec.platform_type = req.body.type;
                    singleCalRec.calories_id = '';
                    singleCalRec.distance = '';
                    singleCalRec.elevation = 0;
                    singleCalRec.floors = 0;
                    singleCalRec.last_updated = singleCalRec.created_date+'T'+singleCalRec.created_time+'+00:00';
                    singleCalRec.source = '';
                    singleCalRec.source_name = '';
                    singleCalRec.steps = 0;
                    singleCalRec.user_id = '';
                    singleCalRec.utc_offset = '';
                    singleCalRec.validated = false;
                    singleCalRec.water = 0;

                    if(singleCalRec.calories_burned!=0){
                        if(memCalRecords){
                            if(memCalRecords.platform_type!='validic'){
                                MemberCalories.findByIdAndUpdate(memCalRecords._id, singleCalRec, function(err, updateRec) {
                                    callback_singleCalRec();
                                });
                            }
                            else {
                                callback_singleCalRec();
                            }
                        }
                        else {
                            singleCalRec.member_id = req.body.member_id;
                            var storeObj = new MemberCalories(singleCalRec);
                            storeObj.save(function(err) {
                                callback_singleCalRec();
                            });
                        }
                    }
                    else {
                        callback_singleCalRec();
                    }
                })
            }, function (err) {
                async.forEachSeries(json2Arr.steps, function(singleStepRec, callback_singleStepRec) {
                    singleStepRec.created_date = _this.postSubstract1DayMinusFromDateWithFormat(req,res,singleStepRec.created_date);
                    MemberSteps.findOne({member_id:req.body.member_id,created_date:singleStepRec.created_date},function(err,memStepRecords){
                        singleStepRec.timestamp = singleStepRec.created_date+'T'+singleStepRec.created_time+'+00:00';
                        singleStepRec.platform_type = req.body.type;
                        singleStepRec.steps_id = '';
                        singleStepRec.calories_burned = 0;
                        singleStepRec.distance = '';
                        singleStepRec.elevation = 0;
                        singleStepRec.floors = 0;
                        singleStepRec.last_updated = singleStepRec.created_date+'T'+singleStepRec.created_time+'+00:00';
                        singleStepRec.source = '';
                        singleStepRec.source_name = '';
                        singleStepRec.user_id = '';
                        singleStepRec.utc_offset = '';
                        singleStepRec.validated = false;
                        singleStepRec.water = 0;
                        
                        if(singleStepRec.steps!=0){
                            if(memStepRecords){
                                if(memStepRecords.platform_type!='validic'){
                                    MemberSteps.findByIdAndUpdate(memStepRecords._id, singleStepRec, function(err, updateRec) {
                                        callback_singleStepRec();
                                    });
                                }
                                else {
                                    callback_singleStepRec();
                                }
                            }
                            else {
                                singleStepRec.member_id = req.body.member_id;
                                var storeObj = new MemberSteps(singleStepRec);
                                storeObj.save(function(err) {
                                    callback_singleStepRec();
                                });
                            }
                        }
                        else {
                            callback_singleStepRec();
                        }
                    })
                }, function (err) {
                    async.forEachSeries(json2Arr.heart_rate, function(singleHRRec, callback_singleHRRec) {
                        singleHRRec.created_date = _this.postSubstract1DayMinusFromDateWithFormat(req,res,singleHRRec.created_date);
                        MemberHeartBitRate.findOne({member_id:req.body.member_id,created_date:singleHRRec.created_date},function(err,memHRRecords){
                            singleHRRec.timestamp = singleHRRec.created_date+'T'+singleHRRec.created_time+'+00:00';
                            singleHRRec.platform_type = req.body.type;
                            singleHRRec.heart_rate_id = '';
                            singleHRRec.activity_calories = 0;
                            singleHRRec.activity_id = '';
                            singleHRRec.calories_bmr = 0;
                            singleHRRec.calories_burned = 0;
                            singleHRRec.distance = '';
                            singleHRRec.elevation = 0;
                            singleHRRec.floors = 0;
                            singleHRRec.last_updated = singleHRRec.created_date+'T'+singleHRRec.created_time+'+00:00';
                            singleHRRec.minutes_fairly_active = 0;
                            singleHRRec.minutes_very_active = 0;
                            singleHRRec.source = '';
                            singleHRRec.source_name = '';
                            singleHRRec.steps = 0;
                            singleHRRec.user_id = '';
                            singleHRRec.utc_offset = '';
                            singleHRRec.validated = false;
                            singleHRRec.water = 0;
                            singleHRRec.member_id = req.body.member_id;

                            if(singleHRRec.resting_heart_rate!=0){
                                if(memHRRecords){
                                    if(memHRRecords.platform_type!='validic'){
                                        MemberHeartBitRate.findByIdAndUpdate(memHRRecords._id, singleHRRec, function(err, updateRec) {
                                            callback_singleHRRec();
                                        });
                                    }
                                    else {
                                        callback_singleHRRec();
                                    }
                                }
                                else {
                                    var storeObj = new MemberHeartBitRate(singleHRRec);
                                    storeObj.save(function(err) {
                                        callback_singleHRRec();
                                    });
                                }
                            }
                            else {
                                callback_singleHRRec();
                            }
                        })
                    }, function (err) {
                        async.forEachSeries(json2Arr.sleep, function(singleSleepRec, callback_singleSleepRec) {
                            singleSleepRec.created_date = _this.postSubstract1DayMinusFromDateWithFormat(req,res,singleSleepRec.created_date);
                            MemberSleep.find({member_id:req.body.member_id,created_date:singleSleepRec.created_date},function(err,memSleepRecords){
                                singleSleepRec.timestamp = singleSleepRec.created_date+'T'+singleSleepRec.created_time+'+00:00';
                                singleSleepRec.platform_type = req.body.type;
                                singleSleepRec.awake = 0;
                                singleSleepRec.deep = 0;
                                singleSleepRec.last_updated = singleSleepRec.created_date+'T'+singleSleepRec.created_time+'+00:00';
                                singleSleepRec.light = 0;
                                singleSleepRec.rem = 0;
                                singleSleepRec.source = '';
                                singleSleepRec.source_name = '';
                                singleSleepRec.times_woken = 0;
                                singleSleepRec.total_sleep = (singleSleepRec.total_sleep * 60);
                                singleSleepRec.user_id = '';
                                singleSleepRec.utc_offset = '';
                                singleSleepRec.validated = false;
                                singleSleepRec.sleep_id = '';
                                singleSleepRec.member_id = req.body.member_id;

                                var validicStatus = 'No';
                                if(singleSleepRec.total_sleep>0){
                                    if(memSleepRecords.length>0){
                                        async.forEachSeries(memSleepRecords, function(singleInnerSleepRec, callback_singleInnerSleepRec) {
                                            if(singleInnerSleepRec.platform_type=='validic'){
                                                validicStatus = 'Yes';
                                            }
                                            callback_singleInnerSleepRec();
                                        }, function (err) {
                                            if(validicStatus == 'No'){
                                                MemberSleep.findOneAndUpdate({member_id:req.body.member_id,created_date:singleSleepRec.created_date},singleSleepRec, function(err,updateRec) {
                                                    callback_singleSleepRec();
                                                });
                                            }
                                            else {
                                                callback_singleSleepRec();
                                            }
                                        });
                                    }
                                    else {
                                        var storeObj = new MemberSleep(singleSleepRec);
                                        storeObj.save(function(err) {
                                            callback_singleSleepRec();
                                        });
                                    }
                                }
                                else {
                                    callback_singleSleepRec();
                                }
                            })
                        }, function (err) {
                            async.forEachSeries(json2Arr.active_minutes, function(singleAMRec, callback_singleAMRec) {
                                singleAMRec.timestamp = singleAMRec.created_date+'T'+singleAMRec.created_time+'+00:00';
                                singleAMRec.exercise_id = '';
                                singleAMRec.active_duration = 0;
                                singleAMRec.activity_category = 'Walking';
                                singleAMRec.activity_id = '';
                                singleAMRec.activity_level_sedentary_minutes = 0;
                                singleAMRec.activity_level_lightly_minutes = 0;
                                singleAMRec.activity_level_fairly_minutes = 0;
                                singleAMRec.activity_level_very_minutes = 0;
                                singleAMRec.activity_name = '';
                                singleAMRec.activity_type_id = 0;
                                singleAMRec.average_heart_rate = 0;
                                singleAMRec.calories = 0;
                                singleAMRec.distance = 0;
                                singleAMRec.distance_unit = '';
                                singleAMRec.duration = (parseFloat(singleAMRec.total_active_minutes) * 60);
                                singleAMRec.heart_rate_zones_out_of_range_max = 0;
                                singleAMRec.heart_rate_zones_out_of_range_min = 0;
                                singleAMRec.heart_rate_zones_out_of_range_minutes = 0;
                                singleAMRec.heart_rate_zones_fat_burn_max = 0;
                                singleAMRec.heart_rate_zones_fat_burn_min = 0;
                                singleAMRec.heart_rate_zones_fat_burn_minutes = 0;
                                singleAMRec.heart_rate_zones_cardio_max = 0;
                                singleAMRec.heart_rate_zones_cardio_min = 0;
                                singleAMRec.heart_rate_zones_cardio_minutes = 0;
                                singleAMRec.heart_rate_zones_peak_max = 0;
                                singleAMRec.heart_rate_zones_peak_min = 0;
                                singleAMRec.heart_rate_zones_peak_minutes = 0;
                                singleAMRec.intensity = '';
                                singleAMRec.last_modified = singleAMRec.created_date+'T'+singleAMRec.created_time+'+00:00';
                                singleAMRec.last_updated = singleAMRec.created_date+'T'+singleAMRec.created_time+'+00:00';
                                singleAMRec.log_id = 0;
                                singleAMRec.log_type = '';
                                singleAMRec.manual_values_specified_calories = false;
                                singleAMRec.manual_values_specified_distance = false;
                                singleAMRec.manual_values_specified_steps = false;
                                singleAMRec.pace = '';
                                singleAMRec.resting_heart_rate = 0;
                                singleAMRec.source = '';
                                singleAMRec.source_name = '';
                                singleAMRec.speed = '';
                                singleAMRec.start_time = singleAMRec.created_date+'T'+singleAMRec.created_time+'+00:00';
                                singleAMRec.steps = 0;
                                singleAMRec.type = 'Walk';
                                singleAMRec.user_id = '';
                                singleAMRec.utc_offset = '';
                                singleAMRec.validated = false;
                                singleAMRec.member_id = req.body.member_id;
                                singleAMRec.platform_type = req.body.type;
                                delete singleAMRec.total_active_minutes;
                                MemberExercise.find({member_id:req.body.member_id,created_date:singleAMRec.created_date},function(err,memAMRecords){
                                    var validicStatus = 'No';
                                    if(singleAMRec.duration>0){
                                        if(memAMRecords.length>0){
                                            async.forEachSeries(memAMRecords, function(singleInnerExerciseRec, callback_singleInnerExerciseRec) {
                                                if(singleInnerExerciseRec.platform_type=='validic'){
                                                    validicStatus = 'Yes';
                                                }
                                                callback_singleInnerExerciseRec();
                                            }, function (err) {
                                                if(validicStatus == 'No'){
                                                    MemberExercise.findOneAndUpdate({member_id:req.body.member_id,created_date:singleAMRec.created_date}, singleAMRec, function(err, updateRec) {
                                                        callback_singleAMRec();
                                                    });
                                                }
                                                else {
                                                    callback_singleAMRec();
                                                }
                                            })
                                        }
                                        else {
                                            var storeObj = new MemberExercise(singleAMRec);
                                            storeObj.save(function(err) {
                                                callback_singleAMRec();
                                            });
                                        }
                                    }
                                    else {
                                        callback_singleAMRec();
                                    }
                                })
                            }, function (err) {
                                async.forEachSeries(json2Arr.sb, function(singleSBRec, callback_singleSBRec) {
                                    singleSBRec.created_date = _this.postSubstract1DayMinusFromDateWithFormat(req,res,singleSBRec.created_date);
                                    MemberHeartBitRate.findOne({member_id:req.body.member_id,created_date:singleSBRec.created_date},function(err,memSBRecords){
                                        singleSBRec.timestamp = singleSBRec.created_date+'T'+singleSBRec.created_time+'+00:00';
                                        singleSBRec.platform_type = req.body.type;
                                        singleSBRec.heart_rate_id = '';
                                        singleSBRec.activity_calories = 0;
                                        singleSBRec.activity_id = '';
                                        singleSBRec.calories_bmr = 0;
                                        singleSBRec.calories_burned = 0;
                                        singleSBRec.distance = '';
                                        singleSBRec.elevation = 0;
                                        singleSBRec.floors = 0;
                                        singleSBRec.last_updated = singleSBRec.created_date+'T'+singleSBRec.created_time+'+00:00';
                                        singleSBRec.minutes_fairly_active = 0;
                                        singleSBRec.minutes_very_active = 0;
                                        singleSBRec.source = '';
                                        singleSBRec.source_name = '';
                                        singleSBRec.steps = 0;
                                        singleSBRec.user_id = '';
                                        singleSBRec.utc_offset = '';
                                        singleSBRec.validated = false;
                                        singleSBRec.water = 0;
                                        if(memSBRecords){
                                            if(!memSBRecords.minutes_sedentary){
                                                singleSBRec.minutes_sedentary = singleSBRec.total_sb;
                                                delete singleSBRec.total_sb;
                                                MemberHeartBitRate.findByIdAndUpdate(memSBRecords._id, singleSBRec, function(err, updateRec) {
                                                    callback_singleSBRec();
                                                });
                                            }
                                            else {
                                                callback_singleSBRec();
                                            }
                                        }
                                        else {
                                            singleSBRec.minutes_sedentary = singleSBRec.total_sb;
                                            delete singleSBRec.total_sb;
                                            singleSBRec.member_id = req.body.member_id;
                                            var storeObj = new MemberHeartBitRate(singleSBRec);
                                            storeObj.save(function(err) {
                                                callback_singleSBRec();
                                            });
                                        }
                                    })
                                }, function (err) {
                                    async.forEachSeries(json2Arr.light_activity, function(singleLARec, callback_singleLARec) {
                                        singleLARec.created_date = _this.postSubstract1DayMinusFromDateWithFormat(req,res,singleLARec.created_date);
                                        MemberHeartBitRate.findOne({member_id:req.body.member_id,created_date:singleLARec.created_date},function(err,memLARecords){
                                            singleLARec.platform_type = req.body.type;
                                            singleLARec.timestamp = singleLARec.created_date+'T'+singleLARec.created_time+'+00:00';
                                            singleLARec.heart_rate_id = '';
                                            singleLARec.activity_calories = 0;
                                            singleLARec.activity_id = '';
                                            singleLARec.calories_bmr = 0;
                                            singleLARec.calories_burned = 0;
                                            singleLARec.distance = '';
                                            singleLARec.elevation = 0;
                                            singleLARec.floors = 0;
                                            singleLARec.last_updated = singleLARec.created_date+'T'+singleLARec.created_time+'+00:00';
                                            singleLARec.minutes_fairly_active = 0;
                                            singleLARec.minutes_very_active = 0;
                                            singleLARec.sototal_light_activityurce = '';
                                            singleLARec.source_name = '';
                                            singleLARec.steps = 0;
                                            singleLARec.user_id = '';
                                            singleLARec.utc_offset = '';
                                            singleLARec.validated = false;
                                            singleLARec.water = 0;

                                            if(memLARecords){
                                                if(!memLARecords.minutes_lightly_active){
                                                    singleLARec.minutes_lightly_active = singleLARec.total_light_activity;
                                                    delete singleLARec.total_light_activity;
                                                    MemberHeartBitRate.findByIdAndUpdate(memLARecords._id, singleLARec, function(err, updateRec) {
                                                        callback_singleLARec();
                                                    });
                                                }
                                                else {
                                                    callback_singleLARec();
                                                }
                                            }
                                            else {
                                                singleLARec.minutes_lightly_active = singleLARec.total_light_activity;
                                                delete singleLARec.total_light_activity;
                                                singleLARec.member_id = req.body.member_id;
                                                var storeObj = new MemberHeartBitRate(singleLARec);
                                                storeObj.save(function(err) {
                                                    callback_singleLARec();
                                                });
                                            }
                                        })
                                    }, function (err) {
                                    	resObj.status = 1;
								        resObj.message = '';
								        res.json(resObj);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
        else if(req.body.type=='validic'){
            var currentDate = _this.postCurrentDate(req,res),
            d = new Date(currentDate);
            d.setMonth(d.getMonth() - 3);
            var startdate = _this.formatDate(req,res,d);

            _this.postSaveValidicCaloriesBurned(req,res,req.body.member_id,startdate);
            _this.postSaveValidicSleep(req,res,req.body.member_id,startdate);
            _this.postSaveValidicSteps(req,res,req.body.member_id,startdate);
            _this.postSaveValidicHeartRate(req,res,req.body.member_id,startdate);
            _this.postSaveValidicExercise(req,res,req.body.member_id,startdate);
            _this.postSaveValidicActiveMinutes(req,res,req.body.member_id,startdate);
            _this.postSaveValidicSleepDetails(req,res,req.body.member_id,startdate);
            setTimeout(function(){
                resObj.status = 1;
		        resObj.message = '';
		        res.json(resObj);
            }, 15000);
        }
        else {
            resObj.status = 0;
	        resObj.message = 'Platform type is incorrect.';
	        res.json(resObj);
        }
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters.';
        res.json(resObj);
    }
};

exports.postCreateValidicUser = function(req, res){
	var resObj = new Object();
	if(req.body.member_id){
		Member.findOne({ _id: req.body.member_id },{validic_uid:1,validic_access_token:1}, function(err, memberInfo) {
			if(memberInfo){
				if(memberInfo.validic_access_token){
					var validicRefreshTokenURL = "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users/"+memberInfo.validic_uid+"/refresh_token.json?access_token=1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5";
	                request(validicRefreshTokenURL, function (error, response, body) {
	                    var validicRefreshTokenResponse = JSON.parse(body);
	                    if(validicRefreshTokenResponse.code==200){
	                        var validicRefreshTokenObj = new Object;
	                        validicRefreshTokenObj.validic_access_token = validicRefreshTokenResponse.user.authentication_token;
	                        validicRefreshTokenObj.validic_access_token_updated_datetime = new Date();
	                        Member.findByIdAndUpdate(req.body.member_id, validicRefreshTokenObj, function(err, memberInfo) {
	                        	var validicMarketPlaceURL = "https://app.validic.com/58eb9ceeff9d9300800000ad/"+validicRefreshTokenResponse.user.authentication_token;
					            resObj.data = {'member_id' : req.body.member_id,'validic_uid' : memberInfo.validic_uid, 'validic_access_token' : validicRefreshTokenResponse.user.authentication_token, 'marketplaceurl' : validicMarketPlaceURL};
					            resObj.status = 1;
						        resObj.message = '';
						        res.json(resObj);    
	                        });             
	                    }
	                    else {
	                        var validicMarketPlaceURL = "https://app.validic.com/58eb9ceeff9d9300800000ad/"+memberInfo.validic_access_token;
				            resObj.data = {'member_id' : req.body.member_id,'validic_uid' : memberInfo.validic_uid, 'validic_access_token' : memberInfo.validic_access_token, 'marketplaceurl' : validicMarketPlaceURL};
				            resObj.status = 1;
					        resObj.message = '';
					        res.json(resObj);
	                    }
	                });
				}
				else {
					var myObj = {
				        user: { uid: req.body.member_id}, 
				        access_token: '1cfc38b63c8e0ed5cb8f37d1815ed6e1774f828be3558e75bfe259f2efc671d5'
				    }

				    request({
				        url: "https://api.validic.com/v1/organizations/58eb9ceeff9d9300800000ad/users.json",
				        method: "POST",
				        json: true,
				        body: myObj
				    }, function (error, response, body){
				    	if(body.code==201){
				            Member.findByIdAndUpdate(req.body.member_id, { validic_uid: body.user._id,validic_access_token : body.user.access_token}, function(err, memberInfo) {
				            	var validicMarketPlaceURL = "https://app.validic.com/58eb9ceeff9d9300800000ad/"+body.user.access_token;
					            resObj.data = {'member_id' : req.body.member_id,'validic_uid' : body.user._id, 'validic_access_token' : body.user.access_token, 'marketplaceurl' : validicMarketPlaceURL};
					            resObj.status = 1;
						        resObj.message = '';
						        res.json(resObj);
					        });
				        }
				        else if(body.code==409){
				        	resObj.status = 0;
					        resObj.message = body.message;
					        res.json(resObj);
				        }
				        else {
				            resObj.status = 0;
					        resObj.message = 'Error while creating new user at validic.';
					        res.json(resObj);
				        }
				    });
				}
			}
			else {
				resObj.status = 0;
		        resObj.message = 'Member not exist.';
		        res.json(resObj);
			}
		});
	}
	else {
		resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
	}
};

exports.postRecordValenceScore = function(req, res){
    var resObj = new Object();
    if(req.body.member_id && req.files){
        var fileName = '';
        async.forEachSeries(req.files, function(singleAudioFile, callback_singleAudioFile) {
            var length = 10,
            fileExt = singleAudioFile.name.split('.').pop();
            fileName = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
            fileName+= '.'+fileExt;
            singleAudioFile.mv(appDir+'/upload/samplefiles/'+fileName, function(err) {
                callback_singleAudioFile();
            });
        }, function (err) {
            AnalyzerObj.analyze(fs.createReadStream(appDir+'/upload/samplefiles/'+fileName),function(err,analyzerInfo){
                if(err || analyzerInfo.status=='failure'){
                    resObj.status = 0;
                    resObj.message = 'Recorded file was not proper.';
                    res.json(resObj);
                }
                else if(!analyzerInfo.result.analysisSegments){
                    resObj.status = 0;
                    resObj.message = 'Recorded file was not proper.';
                    res.json(resObj);
                }
                else {
                    var analysisObj = new Object;
                    analysisObj.member_id = req.body.member_id;
                    analysisObj.currentDate = _this.postCurrentDate(req,res);
                    analysisObj.currentTime = _this.postCurrentTime(req,res);
                    analysisObj.mood = analyzerInfo.result.analysisSegments[0].analysis.Mood.Group11.Primary.Phrase;
                    analysisObj.valence_score = parseInt(analyzerInfo.result.analysisSegments[0].analysis.Valence.Value);
                    analysisObj.moodForHighestPoint = analyzerInfo.result.analysisSegments[0].analysis.Mood.Composite.Primary.Phrase;
                    analysisObj.moodForLowestPoint = analyzerInfo.result.analysisSegments[0].analysis.Mood.Composite.Secondary.Phrase;
                    analysisObj.temperValue = analyzerInfo.result.analysisSegments[0].analysis.Temper.Value;
                    var saveValenceObj = new MembersEmotionalAnalytics(analysisObj);
                    saveValenceObj.save(function(err) {
                        fs.unlinkSync(appDir+'/upload/samplefiles/'+fileName);
                        resObj.data = analysisObj;
                        resObj.status = 1;
                        resObj.message = 'Valence score generated successfully.';
                        res.json(resObj);
                    });
                }
            });
        });
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postSocialUserTag = function(req, res){
    var baseUrl = req.protocol + '://' + req.get('host'),
    resObj = new Object();
    if(req.body.userTag && req.body.member_id){
        Member.findOne({ _id: req.body.member_id },{firstname:1,lastname:1,company_id:1}, function(err, memberInfo) {
            Member.find({ company_id: memberInfo.company_id, $or:[{firstname:{'$regex':req.body.userTag}},{lastname:{'$regex':req.body.userTag}}]},{firstname:1,lastname:1,company_id:1,photo:1,sex:1}, function(err, memberCompanyInfo) {
                var userListArr = [];
                async.forEachSeries(memberCompanyInfo, function(single_CompanyMember, callback_single_CompanyMember) {
                    var singleMemberInfo = {'name':(single_CompanyMember.firstname+' '+single_CompanyMember.lastname),'userTag':('@'+single_CompanyMember.firstname+single_CompanyMember.lastname).toLowerCase()};
                    singleMemberInfo.photo = _this.memberProfilePhotoURL(req, res, baseUrl, single_CompanyMember.photo, single_CompanyMember.sex, 'round');
                    userListArr.push(singleMemberInfo);
                    callback_single_CompanyMember();
                }, function (err) {
                    resObj.data = userListArr;
                    resObj.status = 1;
                    resObj.message = '';
                    res.json(resObj);
                })
            })
        })
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postSocialHashTag = function(req, res){
    var resObj = new Object;
    if(req.body.hashTag){
        MemberSocial.find({'hash_tags':{'$regex': req.body.hashTag}},{hash_tags:1},function(err, memberSocialInfo) {
            if(memberSocialInfo.length>0){
                var hashTags = _.pluck(memberSocialInfo, 'hash_tags');
                hashTags = _.uniq(hashTags.join().split(','));
                resObj.data = hashTags;
            }
            else {
                resObj.data = [];
            }
            resObj.status = 1;
            resObj.message = '';
            res.json(resObj);
        })
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postListSocial = function(req, res) {
    var baseUrl = req.protocol + '://' + req.get('host'),
    resObj = new Object();

    if(req.body.member_id && req.body.page){
        Member.findOne({ _id: req.body.member_id }, function(err, memberInfo) {
            if(memberInfo){
                var pageEnd = (req.body.page * 10),
                pageStart = (pageEnd - 10);
                MemberSocial.find({},{},{skip : pageStart, limit : pageEnd },function(err, memberSocialInfo) {
                    var memberSocialObj = new Object,
                    memberSocialObjArr = [],
                    memberSocialObjArrCnt = 0;

                    async.forEachSeries(memberSocialInfo, function(single_memberSocialInfo, callback_memberSocialInfo) {
                        var schemaName = '',departmentBlank = '';
                        if(single_memberSocialInfo.usertype=='Super'){
                            schemaName = Superadmin;
                            departmentBlank = 'Super Admin';
                        }   
                        else if(single_memberSocialInfo.usertype=='Insurance' || single_memberSocialInfo.usertype=='Broker'){
                            schemaName = Administrator;
                            departmentBlank = single_memberSocialInfo.usertype+' Admin';
                        }
                        else if(single_memberSocialInfo.usertype=='HR'){
                            schemaName = Company;
                            departmentBlank = 'HR Admin'
                        }
                        else {
                            schemaName = Member;
                            departmentBlank = 'Member';
                        }

                        schemaName.findOne({ _id: single_memberSocialInfo.member_id }, function(err, memberSocialCreator) {
                            var deptTitle = '';
                            Department.find({'_id':{$in: memberSocialCreator.multiple_departments}},function(err, departmentsInfo) {
                                async.forEachSeries(departmentsInfo, function(single_department, callback_single_department) {
                                    if(deptTitle==''){
                                        deptTitle = single_department.title;
                                    }
                                    else {
                                        deptTitle = deptTitle+', '+single_department.title;
                                    }
                                    callback_single_department();
                                }, function (err) {
                                    var socialObj = new Object;
                                    socialObj._id = single_memberSocialInfo._id;
                                    socialObj.caption_title = (single_memberSocialInfo.caption_title) ? single_memberSocialInfo.caption_title : '';
                                    socialObj.name = memberSocialCreator.firstname+' '+memberSocialCreator.lastname;
                                    socialObj.photo = _this.memberProfilePhotoURL(req, res, baseUrl, memberSocialCreator.photo, memberSocialCreator.sex, 'square');
                                    socialObj.department = (deptTitle) ? deptTitle : departmentBlank;
                                    var createdAt = new Date(single_memberSocialInfo.created_at);
                                    socialObj.created_at = (monthNamesShort[createdAt.getMonth()]+' '+createdAt.getDate()).toUpperCase();
                                    memberSocialObjArr[memberSocialObjArrCnt] = socialObj;
                                    
                                    memberSocialObjArr[memberSocialObjArrCnt]['likes'] = [], memberSocialObjArr[memberSocialObjArrCnt]['likes_count'] = '0';
                                    memberSocialObjArr[memberSocialObjArrCnt]['comments'] = [], memberSocialObjArr[memberSocialObjArrCnt]['comments_count'] = '0';
                                    memberSocialObjArr[memberSocialObjArrCnt]['social_media'] = [];

                                    var memberLikesFeedbackArr = [];
                                    var memberLikesFeedbackArrCnt = 0;
                                    var memberCommentsFeedbackArr = [];
                                    var memberCommentsFeedbackArrCnt = 0;

                                    MemberSocialMedia.find({ social_timeline_id: single_memberSocialInfo._id }, function(err, memberSocialMediaInfo) {
                                        var memberSocialMediaArr = [];
                                        var memberSocialMediaCnt = 0;    
                                        async.forEachSeries(memberSocialMediaInfo, function(single_socialMedia, callback_single_socialMedia) {
                                            var socialMediaObj = new Object;
                                            socialMediaObj._id = single_socialMedia._id;
                                            socialMediaObj.social_timeline_id = single_socialMedia.social_timeline_id;
                                            socialMediaObj.media_type = single_socialMedia.media_type;
                                            var foldertype = (single_socialMedia.media_type=='Image') ? 'image' : 'video';
                                            if(single_socialMedia.media_type=='Link'){
                                                socialMediaObj.file = single_socialMedia.file;
                                            }
                                            else {
                                                socialMediaObj.file = (single_socialMedia.file!='') ? baseUrl+'/socialmedia/'+foldertype+'/'+single_socialMedia.file : '';
                                            }
                                            if(single_socialMedia.media_type=='Video'){
                                                socialMediaObj.thumbnail = (single_socialMedia.thumbnail!='') ? baseUrl+'/socialmedia/'+foldertype+'/'+single_socialMedia.thumbnail : '';
                                            }
                                            memberSocialMediaArr[memberSocialMediaCnt] = socialMediaObj;
                                            memberSocialObjArr[memberSocialObjArrCnt]['social_media'] = memberSocialMediaArr;
                                            memberSocialMediaCnt++;
                                            callback_single_socialMedia();
                                        }, function () {
                                            MemberSocialMediaFeedback.find({ social_id: single_memberSocialInfo._id }, function(err, memberSocialMediaFeedbackInfo) {
                                                async.forEachSeries(memberSocialMediaFeedbackInfo, function(single_memberSocialMediaFeedback, callback_single_memberSocialMediaFeedback) {
                                                    var socialFeedObj = new Object;
                                                    socialFeedObj._id = single_memberSocialMediaFeedback._id;

                                                    var schemaName = '';
                                                    if(single_memberSocialMediaFeedback.usertype=='Super'){
                                                        schemaName = Superadmin;
                                                    }   
                                                    else if(single_memberSocialMediaFeedback.usertype=='Insurance' || single_memberSocialMediaFeedback.usertype=='Broker'){
                                                        schemaName = Administrator;
                                                    }
                                                    else if(single_memberSocialMediaFeedback.usertype=='HR'){
                                                        schemaName = Company;
                                                    }
                                                    else {
                                                        schemaName = Member;
                                                    }

                                                    schemaName.findOne({ _id: single_memberSocialMediaFeedback.member_id }, function(err, memberFeedbackInfo) {
                                                        socialFeedObj.member_id = memberFeedbackInfo._id;
                                                        socialFeedObj.name = memberFeedbackInfo.firstname+' '+memberFeedbackInfo.lastname;
                                                        socialFeedObj.photo = (memberFeedbackInfo.photo!='') ? baseUrl+'/member/'+memberFeedbackInfo.photo : '';
                                                        socialFeedObj.social_id = single_memberSocialMediaFeedback.social_id;
                                                        socialFeedObj.feedbacktype = single_memberSocialMediaFeedback.feedbacktype;
                                                        socialFeedObj.created_at = moment(single_memberSocialMediaFeedback.created_at).format('HH:mm MMMM DD, YYYY');
                                                        if(single_memberSocialMediaFeedback.feedbacktype=='Comment'){
                                                            socialFeedObj.comment = single_memberSocialMediaFeedback.comment;
                                                            memberCommentsFeedbackArr[memberCommentsFeedbackArrCnt] = socialFeedObj;
                                                            memberCommentsFeedbackArrCnt++;
                                                        }
                                                        else if(single_memberSocialMediaFeedback.feedbacktype=='Like'){
                                                            memberLikesFeedbackArr[memberLikesFeedbackArrCnt] = socialFeedObj;
                                                            memberLikesFeedbackArrCnt++;
                                                        }
                                                        
                                                        memberSocialObjArr[memberSocialObjArrCnt]['likes'] = memberLikesFeedbackArr;
                                                        memberSocialObjArr[memberSocialObjArrCnt]['comments'] = memberCommentsFeedbackArr;
                                                        memberSocialObjArr[memberSocialObjArrCnt]['likes_count'] = memberLikesFeedbackArr.length.toString();
                                                        memberSocialObjArr[memberSocialObjArrCnt]['comments_count'] = memberCommentsFeedbackArr.length.toString();
                                                        callback_single_memberSocialMediaFeedback();
                                                    });
                                                }, function () {
                                                    memberSocialObjArrCnt++;
                                                    callback_memberSocialInfo();
                                                });
                                            }).sort({created_at: 'desc'})
                                        });
                                    });
                                });
                            });
                        });
                    }, function (err) {
                        resObj.data = memberSocialObjArr;
                        resObj.status = 1;
                        resObj.message = '';
                        res.json(resObj);
                    });
                }).sort({created_at: 'desc'})
            } //end of main if
            else {
                resObj.status = 0;
                resObj.message = 'Member not exist.';
                res.json(resObj);
            }
        }); // end of main
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.singleSocialPostInfo = function(req, res, social_id){
    var resObj = new Object(),
    baseUrl = req.protocol + '://' + req.get('host');
    MemberSocial.find({_id:social_id},function(err, memberSocialInfo) {
        var memberSocialObj = new Object,
        memberSocialObjArr = [],
        memberSocialObjArrCnt = 0;

        async.forEachSeries(memberSocialInfo, function(single_memberSocialInfo, callback_memberSocialInfo) {
            var schemaName = '';
            if(single_memberSocialInfo.usertype=='Super'){
                schemaName = Superadmin;
            }   
            else if(single_memberSocialInfo.usertype=='Insurance' || single_memberSocialInfo.usertype=='Broker'){
                schemaName = Administrator;
            }
            else if(single_memberSocialInfo.usertype=='HR'){
                schemaName = Company;
            }
            else {
                schemaName = Member;
            }

            schemaName.findOne({ _id: single_memberSocialInfo.member_id }, function(err, memberSocialCreator) {
                var deptTitle = '';
                Department.find({'_id':{$in: memberSocialCreator.multiple_departments}},function(err, departmentsInfo) {
                    async.forEachSeries(departmentsInfo, function(single_department, callback_single_department) {
                        if(deptTitle==''){
                            deptTitle = single_department.title;
                        }
                        else {
                            deptTitle = deptTitle+', '+single_department.title;
                        }
                        callback_single_department();
                    }, function (err) {
                        var socialObj = new Object;
                        socialObj._id = single_memberSocialInfo._id;
                        socialObj.caption_title = (single_memberSocialInfo.caption_title) ? single_memberSocialInfo.caption_title : '';
                        socialObj.name = memberSocialCreator.firstname+' '+memberSocialCreator.lastname;
                        socialObj.photo = _this.memberProfilePhotoURL(req, res, baseUrl, memberSocialCreator.photo, memberSocialCreator.sex, 'square');
                        socialObj.department = deptTitle;
                        var createdAt = new Date(single_memberSocialInfo.created_at);
                        socialObj.created_at = (monthNamesShort[createdAt.getMonth()]+' '+createdAt.getDate()).toUpperCase();
                        memberSocialObjArr[memberSocialObjArrCnt] = socialObj;
                        
                        memberSocialObjArr[memberSocialObjArrCnt]['likes'] = [], memberSocialObjArr[memberSocialObjArrCnt]['likes_count'] = '0';
                        memberSocialObjArr[memberSocialObjArrCnt]['comments'] = [], memberSocialObjArr[memberSocialObjArrCnt]['comments_count'] = '0';
                        memberSocialObjArr[memberSocialObjArrCnt]['social_media'] = [];

                        var memberLikesFeedbackArr = [];
                        var memberLikesFeedbackArrCnt = 0;
                        var memberCommentsFeedbackArr = [];
                        var memberCommentsFeedbackArrCnt = 0;

                        MemberSocialMedia.find({ social_timeline_id: single_memberSocialInfo._id }, function(err, memberSocialMediaInfo) {
                            var memberSocialMediaArr = [];
                            var memberSocialMediaCnt = 0;    
                            async.forEachSeries(memberSocialMediaInfo, function(single_socialMedia, callback_single_socialMedia) {
                                var socialMediaObj = new Object;
                                socialMediaObj._id = single_socialMedia._id;
                                socialMediaObj.social_timeline_id = single_socialMedia.social_timeline_id;
                                socialMediaObj.media_type = single_socialMedia.media_type;
                                var foldertype = (single_socialMedia.media_type=='Image') ? 'image' : 'video';
                                if(single_socialMedia.media_type=='Link'){
                                    socialMediaObj.file = single_socialMedia.file;
                                }
                                else {
                                    socialMediaObj.file = (single_socialMedia.file!='') ? baseUrl+'/socialmedia/'+foldertype+'/'+single_socialMedia.file : '';
                                }
                                if(single_socialMedia.media_type=='Video'){
                                    socialMediaObj.thumbnail = (single_socialMedia.thumbnail!='') ? baseUrl+'/socialmedia/'+foldertype+'/'+single_socialMedia.thumbnail : '';
                                }
                                memberSocialMediaArr[memberSocialMediaCnt] = socialMediaObj;
                                memberSocialObjArr[memberSocialObjArrCnt]['social_media'] = memberSocialMediaArr;
                                memberSocialMediaCnt++;
                                callback_single_socialMedia();
                            }, function () {
                                MemberSocialMediaFeedback.find({ social_id: single_memberSocialInfo._id }, function(err, memberSocialMediaFeedbackInfo) {
                                    async.forEachSeries(memberSocialMediaFeedbackInfo, function(single_memberSocialMediaFeedback, callback_single_memberSocialMediaFeedback) {
                                        var socialFeedObj = new Object;
                                        socialFeedObj._id = single_memberSocialMediaFeedback._id;

                                        var schemaName = '';
                                        if(single_memberSocialMediaFeedback.usertype=='Super'){
                                            schemaName = Superadmin;
                                        }   
                                        else if(single_memberSocialMediaFeedback.usertype=='Insurance' || single_memberSocialMediaFeedback.usertype=='Broker'){
                                            schemaName = Administrator;
                                        }
                                        else if(single_memberSocialMediaFeedback.usertype=='HR'){
                                            schemaName = Company;
                                        }
                                        else {
                                            schemaName = Member;
                                        }

                                        schemaName.findOne({ _id: single_memberSocialMediaFeedback.member_id }, function(err, memberFeedbackInfo) {
                                            socialFeedObj.member_id = memberFeedbackInfo._id;
                                            socialFeedObj.name = memberFeedbackInfo.firstname+' '+memberFeedbackInfo.lastname;
                                            socialFeedObj.photo = _this.memberProfilePhotoURL(req, res, baseUrl, memberFeedbackInfo.photo, memberFeedbackInfo.sex, 'square');
                                            socialFeedObj.social_id = single_memberSocialMediaFeedback.social_id;
                                            socialFeedObj.feedbacktype = single_memberSocialMediaFeedback.feedbacktype;
                                            socialFeedObj.created_at = moment(single_memberSocialMediaFeedback.created_at).format('HH:mm MMMM DD, YYYY');
                                            if(single_memberSocialMediaFeedback.feedbacktype=='Comment'){
                                                socialFeedObj.comment = single_memberSocialMediaFeedback.comment;
                                                memberCommentsFeedbackArr[memberCommentsFeedbackArrCnt] = socialFeedObj;
                                                memberCommentsFeedbackArrCnt++;
                                            }
                                            else if(single_memberSocialMediaFeedback.feedbacktype=='Like'){
                                                memberLikesFeedbackArr[memberLikesFeedbackArrCnt] = socialFeedObj;
                                                memberLikesFeedbackArrCnt++;
                                            }
                                            
                                            memberSocialObjArr[memberSocialObjArrCnt]['likes'] = memberLikesFeedbackArr;
                                            memberSocialObjArr[memberSocialObjArrCnt]['comments'] = memberCommentsFeedbackArr;
                                            memberSocialObjArr[memberSocialObjArrCnt]['likes_count'] = memberLikesFeedbackArr.length.toString();
                                            memberSocialObjArr[memberSocialObjArrCnt]['comments_count'] = memberCommentsFeedbackArr.length.toString();
                                            callback_single_memberSocialMediaFeedback();
                                        });
                                    }, function () {
                                        memberSocialObjArrCnt++;
                                        callback_memberSocialInfo();
                                    });
                                }).sort({created_at: 'desc'})
                            });
                        });
                    });
                });
            });
        }, function (err) {
            resObj.data = memberSocialObjArr;
            resObj.status = 1;
            resObj.message = '';
            res.json(resObj);
        });
    })
};

exports.postSocialFeedback =  function(req, res){
    var resObj = new Object();
    if(req.body.social_id && req.body.feedback_type && req.body.member_id){
        if(req.body.feedback_type=='Like' || req.body.feedback_type=='Unlike'){
            MemberSocialMediaFeedback.findOne({social_id:req.body.social_id,member_id:req.body.member_id,$or:[{feedbacktype:"Like"},{feedbacktype:"Unlike"}]}, function(err, memberSocialFeedbackInfo) {
                if(memberSocialFeedbackInfo){
                    if(memberSocialFeedbackInfo.feedbacktype == 'Like'){
                        MemberSocialMediaFeedback.findOneAndUpdate({ _id: memberSocialFeedbackInfo._id },{feedbacktype : 'Unlike'}, function(err) { 
                            _this.singleSocialPostInfo(req, res, req.body.social_id);
                        });
                    }
                    else {
                        MemberSocialMediaFeedback.findOneAndUpdate({ _id: memberSocialFeedbackInfo._id },{feedbacktype : 'Like'}, function(err) { 
                            _this.singleSocialPostInfo(req, res, req.body.social_id);
                        });
                    }
                }
                else {
                    var feedbackObj = {
                        'member_id' : req.body.member_id,
                        'social_id' : req.body.social_id,
                        'feedbacktype' : req.body.feedback_type,
                        'usertype' : 'Member'
                    };
                    var feedbackSaveObj = new MemberSocialMediaFeedback(feedbackObj);
                    feedbackSaveObj.save(function(err) {
                        _this.singleSocialPostInfo(req, res, req.body.social_id);
                    });
                }
            })
        }
        else {
            var feedbackObj = {
                'member_id' : req.body.member_id,
                'social_id' : req.body.social_id,
                'feedbacktype' : req.body.feedback_type,
                'usertype' : 'Member',
                'comment' : req.body.comment
            };
            var feedbackSaveObj = new MemberSocialMediaFeedback(feedbackObj);
            feedbackSaveObj.save(function(err) { 
                _this.singleSocialPostInfo(req, res, req.body.social_id);
            });
        }
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postAktivoScoreTodayYouHave = function(req, res){
    var resObj = new Object(),
    baseUrl = req.protocol + '://' + req.get('host');
    if(req.body.member_id){
    	var currentDate = _this.postCurrentDate(req,res),
        startDate = new Date(currentDate),
        endDate = new Date(currentDate);

		startDate.setDate(startDate.getDate()-1);
        startDate = _this.formatDate(req,res,startDate);

        endDate.setDate(endDate.getDate()-2);
        endDate = _this.formatDate(req,res,endDate);

        var matchDateArr = [startDate,endDate],
        weekDates = _this.weekStartDateEndDate(req, res, currentDate),
        weekStartDateFormatted = weekDates[0]+'T00:00:00+00:00',
        weekEndDateFormatted = weekDates[1]+'T23:59:00+00:00',
        startDateActivity = currentDate+'T00:00:00+00:00',
        endDateActivity = currentDate+'T23:59:59+00:00';

        var pipelineAktivoMine = [
            {"$match": { "member_id": req.body.member_id}},
            {
                "$group": {
                    "_id": null,
                    "average": { "$avg": "$aktivo_score" }
                }
            }
        ];

        var pipelineAktivoNetwork = [
            {
                "$group": {
                    "_id": null,
                    "average": { "$avg": "$aktivo_score" }
                }
            }
        ];

        var pipelineCalories = [
		    {"$match": { "member_id": req.body.member_id,"timestamp":{$gte:weekStartDateFormatted,$lte:weekEndDateFormatted}} },
		    {
		        "$group": {
		            "_id": null,
		            "sumCalories": { "$sum": "$calories_burned" }
		        }
		    }
		];

		var pipelineSteps = [
		    {"$match": { "member_id": req.body.member_id,"timestamp":{$gte:weekStartDateFormatted,$lte:weekEndDateFormatted}} },
		    {
		        "$group": {
		            "_id": null,
		            "sumSteps": { "$sum": "$steps" }
		        }
		    }
		];

        var pipelinePhysicalActivity = [
            {"$match": { "member_id": req.body.member_id,"start_time":{$gte:startDateActivity,$lte:endDateActivity}} },
            {
                "$group": {
                    "_id": null,
                    "sumPhysicalActivity": { "$sum": "$duration" }
                }
            }
        ];

        var mineAktivoScore = 0, networkAktivoScore = 0, minePhysicalActivityToday = 0, aktivoScoreText = "", activityText = "";
        MembersAktivoScore.aggregate(pipelineAktivoMine).exec(function (err, resultAktivoMine){
            mineAktivoScore = (resultAktivoMine.length>0) ? parseInt(resultAktivoMine[0].average) : 0;
            MembersAktivoScore.aggregate(pipelineAktivoNetwork).exec(function (err, resultAktivoNetwork){
                networkAktivoScore = (resultAktivoNetwork.length>0) ? parseInt(resultAktivoNetwork[0].average) : 0;
                if(mineAktivoScore>networkAktivoScore){
                    var aktivoPercentage = parseInt(100 - ((networkAktivoScore * 100) / mineAktivoScore));
                    aktivoScoreText = "Your Aktivo Score is <b>better than "+aktivoPercentage+"%</b> of people in your network. Keep it up!";
                }
                else {
                    aktivoScoreText = "Your Aktivo Score is <b>within "+(networkAktivoScore - mineAktivoScore)+" points</b> of the average in your network! Keep going!";
                }
                MemberExercise.aggregate(pipelinePhysicalActivity).exec(function (err, resultPhysicalActivity){
                    var totalPhysicalActivity = (resultPhysicalActivity.length>0) ? resultPhysicalActivity[0].sumPhysicalActivity : 0;
                    activityText = "You have clocked up <b>"+_this.formatSecondToHoursMins(req,res,totalPhysicalActivity)+"<b> in physical activity today. See more stats.";
                    MemberCalories.aggregate(pipelineCalories).exec(function (err, resultCalories){
                        MemberSteps.aggregate(pipelineSteps).exec(function (err, resultSteps){
                            MemberCalories.find({member_id:req.body.member_id,created_date: {$in: matchDateArr}}, function(err, memCalories) {
                                var startDateCalories = 1, endDateCalories = 1, startDateSteps = 1, endDateSteps = 1, startDateRHR = 1, endDateRHR = 1, startDateAM = 1, endDateAM = 1, startDateSleep = 1, endDateSleep = 1, caloriesCaption = '', stepsCaption = '', restingHeartRateCaption = '', activeMinutesCaption = '', sleepCaption = '';
                                var todaysCalories = 0, todaysSteps = 0, todaysRHR = 0, todaysAM = 0, todaysSleep = 0;
                                async.forEachSeries(memCalories, function(single_Calories, callback_single_Calories) {
                                    if(matchDateArr[0]==single_Calories.created_date){
                                        startDateCalories = single_Calories.calories_burned;
                                        todaysCalories = single_Calories.calories_burned;
                                    }
                                    else {
                                        endDateCalories = single_Calories.calories_burned;
                                    }
                                    callback_single_Calories();
                                }, function () {
                                    if(startDateCalories>endDateCalories){
                                        var percentage = parseInt(100 - ((endDateCalories * 100) / startDateCalories));
                                        caloriesCaption = "Today you have burned "+percentage+"% more calories than yesterday! A total of "+resultCalories[0].sumCalories+" Kcal this week!";
                                    }
                                    else if(startDateCalories<endDateCalories){
                                        var percentage = parseInt(100 - ((startDateCalories * 100) / endDateCalories));
                                        caloriesCaption = "Today you have burned "+percentage+"% fewer calories than yesterday! Don’t forget to eat your greens!";
                                    }
                                    else {
                                        caloriesCaption = "Today you have burned "+todaysCalories+" Kcal calories. Exactly the same as yesterday! Steady going!";
                                    }

                                    MemberSteps.find({member_id:req.body.member_id,created_date: {$in: matchDateArr}}, function(err, memSteps) {
                                        async.forEachSeries(memSteps, function(single_Steps, callback_single_Steps) {
                                            if(matchDateArr[0]==single_Steps.created_date){
                                                startDateSteps = single_Steps.steps;
                                                todaysSteps = single_Steps.steps;
                                            }
                                            else {
                                                endDateSteps = single_Steps.steps;
                                            }
                                            callback_single_Steps();
                                        }, function () {
                                            if(startDateSteps>endDateSteps){
                                                var percentage = parseInt(100 - ((endDateSteps * 100) / startDateSteps));
                                                stepsCaption = "Today you have covered "+percentage+"% more steps than yesterday. A total of "+resultCalories[0].sumSteps+" of stepping this week!";
                                            }
                                            else if(startDateSteps<endDateSteps){
                                                var percentage = parseInt(100 - ((startDateSteps * 100) / endDateSteps));
                                                stepsCaption = "Today you have covered "+percentage+"% less steps than yesterday. Don’t worry, every walk counts!";
                                            }
                                            else {
                                                stepsCaption = "Today you have covered "+todaysSteps+" steps, the same as yesterday! Consistency is your game!";
                                            }   

                                            MemberHeartBitRate.find({member_id:req.body.member_id,created_date: {$in: matchDateArr}}, function(err, memHeartRate) {
                                                async.forEachSeries(memHeartRate, function(single_HeartRate, callback_single_HeartRate) {
                                                    single_HeartRate.resting_heart_rate = (single_HeartRate.resting_heart_rate) ? single_HeartRate.resting_heart_rate : 0;
                                                    if(matchDateArr[0]==single_HeartRate.created_date){
                                                        startDateRHR = single_HeartRate.resting_heart_rate;
                                                        todaysRHR = single_HeartRate.resting_heart_rate;
                                                    }
                                                    else {
                                                        endDateRHR = single_HeartRate.resting_heart_rate;
                                                    }
                                                    callback_single_HeartRate();
                                                }, function () {
                                                    if(startDateRHR>endDateRHR){
                                                        restingHeartRateCaption = "Today your resting heart-rate is "+todaysRHR+"! A good head cares for a healthy heart!";
                                                    }
                                                    else if(startDateRHR<endDateRHR){
                                                        var percentage = parseInt(100 - ((startDateRHR * 100) / endDateRHR));
                                                        restingHeartRateCaption = "Today your resting heart-rate is "+todaysRHR+" which is "+percentage+"% lower than yesterday. Your heart says thank you!";
                                                    }
                                                    else {
                                                        restingHeartRateCaption = "Today your resting heartrate is "+todaysRHR+"! Last we checked, it was the same!";
                                                    }

                                                    MemberActiveMinutes.find({member_id:req.body.member_id,created_date: {$in: matchDateArr}}, function(err, memActiveMinutes) {
                                                        async.forEachSeries(memActiveMinutes, function(single_ActiveMinutes, callback_single_ActiveMinutes) {
                                                            if(matchDateArr[0]==single_ActiveMinutes.created_date){
                                                                startDateAM = single_ActiveMinutes.resting_heart_rate;
                                                            }
                                                            else {
                                                                endDateAM = single_ActiveMinutes.resting_heart_rate;
                                                            }
                                                            callback_single_ActiveMinutes();
                                                        }, function () {
                                                            if(startDateAM>endDateAM){
                                                                activeMinutesCaption = "";
                                                            }
                                                            else if(startDateAM<endDateAM){
                                                                activeMinutesCaption = "";
                                                            }
                                                            else {
                                                                activeMinutesCaption = "";
                                                            }

                                                            MemberSleep.find({member_id:req.body.member_id,created_date: {$in: matchDateArr}}, function(err, memSleeps) {
                                                                async.forEachSeries(memSleeps, function(single_Sleep, callback_single_Sleep) {
                                                                    if(matchDateArr[0]==single_Sleep.created_date){
                                                                        startDateSleep+= single_Sleep.total_sleep;
                                                                        todaysSleep+= single_Sleep.total_sleep;
                                                                    }
                                                                    else {
                                                                        endDateSleep+= single_Sleep.total_sleep;
                                                                    }
                                                                    callback_single_Sleep();
                                                                }, function () {
                                                                    var startDateSleepFormat = _this.formatSecondToHoursMins(req, res, todaysSleep);
                                                                    if(startDateSleep>endDateSleep){
                                                                        sleepCaption = "You slept for "+startDateSleepFormat+"! You’re more well-rested than yesterday.";
                                                                    }
                                                                    else if(startDateSleep<endDateSleep){
                                                                        sleepCaption = "You have slept for "+startDateSleepFormat+"! snooze!";
                                                                    }
                                                                    else {
                                                                        sleepCaption = "You have slept for "+startDateSleepFormat+". You matched yesterday’s time exactly!";
                                                                    }

                                                                    var aktivoScoreTodayYouHave = {
                                                                        'slider' : [aktivoScoreText,'You are in <b>3rd</b> spot in the Aktivo Challenge. <b>3 days to go!</b>',activityText],
                                                                        'calories_burned' : caloriesCaption,
                                                                        'steps_taken' : stepsCaption,
                                                                        'resting_heart_rate' : restingHeartRateCaption,
                                                                        'active_minutes' : activeMinutesCaption,
                                                                        'sleep' : sleepCaption
                                                                    };

                                                                    BackgroundImage.findOne({selected_status:"Yes"},function(err, selectedImages){
                                                                        aktivoScoreTodayYouHave.home_background_image = baseUrl+"/background_image/signin_placeholder.jpg",
                                                                        aktivoScoreTodayYouHave.home_blurred_background_image = baseUrl+"/background_image/home_placeholder.jpg";

                                                                        aktivoScoreTodayYouHave.sign_in_background_image = baseUrl+"/background_image/signin_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.home_background_image = baseUrl+"/background_image/home_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.compete_background_image = baseUrl+"/background_image/compete_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.edit_profile_background_image = baseUrl+"/background_image/edit_profile_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.connected_devices_background_image = baseUrl+"/background_image/connected_devices_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.exercise_background_image = baseUrl+"/background_image/exercise_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.help_background_image = baseUrl+"/background_image/help_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.stats_background_image = baseUrl+"/background_image/stats_placeholder.jpg";
                                                                        aktivoScoreTodayYouHave.tutorial_background_image = baseUrl+"/background_image/tutorial_placeholder.jpg";

                                                                        if(selectedImages){
                                                                            var signInBackImgPath = appDir+'/upload/background_image/'+selectedImages.sign_in_image;
                                                                            if(fs.existsSync(signInBackImgPath)){
                                                                                aktivoScoreTodayYouHave.sign_in_background_image = baseUrl+'/background_image/'+selectedImages.sign_in_image;
                                                                            }

                                                                            var homeBackImgPath = appDir+'/upload/background_image/'+selectedImages.home_image;
                                                                            if(fs.existsSync(homeBackImgPath)){
                                                                                aktivoScoreTodayYouHave.home_background_image = baseUrl+'/background_image/'+selectedImages.home_image;
                                                                            }

                                                                            var competeBackImgPath = appDir+'/upload/background_image/'+selectedImages.compete_image;
                                                                            if(fs.existsSync(competeBackImgPath)){
                                                                                aktivoScoreTodayYouHave.compete_background_image = baseUrl+'/background_image/'+selectedImages.compete_image;
                                                                            }

                                                                            var editProfileBackImgPath = appDir+'/upload/background_image/'+selectedImages.edit_profile_image;
                                                                            if(fs.existsSync(editProfileBackImgPath)){
                                                                                aktivoScoreTodayYouHave.edit_profile_background_image = baseUrl+'/background_image/'+selectedImages.edit_profile_image;
                                                                            }

                                                                            var connectedDevicesBackImgPath = appDir+'/upload/background_image/'+selectedImages.connected_devices_image;
                                                                            if(fs.existsSync(connectedDevicesBackImgPath)){
                                                                                aktivoScoreTodayYouHave.connected_devices_background_image = baseUrl+'/background_image/'+selectedImages.connected_devices_image;
                                                                            }

                                                                            var exerciseBackImgPath = appDir+'/upload/background_image/'+selectedImages.exercise_image;
                                                                            if(fs.existsSync(exerciseBackImgPath)){
                                                                                aktivoScoreTodayYouHave.exercise_background_image = baseUrl+'/background_image/'+selectedImages.exercise_image;
                                                                            }

                                                                            var helpBackImgPath = appDir+'/upload/background_image/'+selectedImages.help_faq_image;
                                                                            if(fs.existsSync(helpBackImgPath)){
                                                                                aktivoScoreTodayYouHave.help_background_image = baseUrl+'/background_image/'+selectedImages.help_faq_image;
                                                                            }

                                                                            var statBackImgPath = appDir+'/upload/background_image/'+selectedImages.stats_image;
                                                                            if(fs.existsSync(statBackImgPath)){
                                                                                aktivoScoreTodayYouHave.stats_background_image = baseUrl+'/background_image/'+selectedImages.stats_image;
                                                                            }

                                                                            var tutorialBackImgPath = appDir+'/upload/background_image/'+selectedImages.tutorial_walkthrough_image;
                                                                            if(fs.existsSync(tutorialBackImgPath)){
                                                                                aktivoScoreTodayYouHave.tutorial_background_image = baseUrl+'/background_image/'+selectedImages.tutorial_walkthrough_image;
                                                                            }
                                                                        }

                                                                        // code for check data is available or not for last 2 days
                                                                        MembersAktivoScore.findOne({member_id : req.body.member_id,aktivo_score:{$ne:0}},function(err, singleAktivoScore){
                                                                            aktivoScoreTodayYouHave.aktivo_score = (singleAktivoScore) ? Math.ceil(singleAktivoScore.aktivo_score) : 0;
                                                                            aktivoScoreTodayYouHave.aktivo_score = parseInt(aktivoScoreTodayYouHave.aktivo_score);
                                                                            MemberCalories.find({member_id:req.body.member_id,platform_type:'validic',created_date: {$in: matchDateArr}}, function(err, memCalories) {
                                                                                var platTypeArr = ['apple_health_kit','google_fit'];
                                                                                MemberCalories.find({member_id:req.body.member_id,platform_type: {$in: platTypeArr},created_date: {$in: matchDateArr}}, function(err, memCaloriesAppleGoogle) {
                                                                                    if(memCalories.length>0 || memCaloriesAppleGoogle.length>0){
                                                                                        resObj.data = aktivoScoreTodayYouHave;
                                                                                        resObj.availability_status = 'available';
                                                                                        resObj.status = 1;
                                                                                        resObj.message = '';
                                                                                        res.json(resObj);
                                                                                    }
                                                                                    else {
                                                                                        resObj.data = aktivoScoreTodayYouHave;
                                                                                        resObj.availability_status = 'not_available';
                                                                                        resObj.status = 1;
                                                                                        resObj.message = '';
                                                                                        res.json(resObj);
                                                                                    }
                                                                                });
                                                                            });
                                                                        }).sort({created_at: 'desc'})
                                                                        // end of code for check data is available or not for last 2 days
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postSocial = function(req, res){
    var resObj = new Object(),
    path = require('path'),
    appDir = path.dirname(require.main.filename);
    if(req.body.member_id){
        Member.findOne({ _id: req.body.member_id },{'_id':0,'company_id':1}, function(err, memberInfo) {
            if(memberInfo){
                var postObj = {
                    'member_id' : req.body.member_id,
                    'usertype' : 'Member'
                };

                if(req.body.text){
                    postObj.caption_title = req.body.text;

                    var allHashTags = req.body.text.match(/#\w+/g);
                    postObj.hash_tags = allHashTags;

                    var allUserTags = req.body.text.match(/@\w+/g);
                    postObj.user_tags = allUserTags;
                }
                
                var saveObj = new MemberSocial(postObj);
                saveObj.save(postObj, function (error, socialRes) {
                    async.forEachSeries(req.files, function(single_media, callback_single_media) {
                        var length = 10;
                        var fileName = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
                        var fileExtLower = single_media.name.split('.').pop().toLowerCase();
                        fileName = fileName+'.'+fileExtLower;
                        var folderName = '',mediaType = '';
                        if(fileExtLower=='jpg' || fileExtLower=='jpeg' || fileExtLower=='png' || fileExtLower=='gif'){
                            folderName = 'image';
                            mediaType = 'Image';
                        }
                        else {
                            folderName = 'video';
                            mediaType = 'Video';
                        }

                        single_media.mv(appDir+'/upload/socialmedia/'+folderName+'/'+fileName, function(err) {
                            if(mediaType=='Image'){
                                var mediaObj = {
                                    'social_timeline_id' : socialRes._id,
                                    'media_type' : mediaType,
                                    'file' : fileName,
                                    'thumbnail' : ''
                                };

                                var saveMediaObj = new MemberSocialMedia(mediaObj);
                                saveMediaObj.save(function(err) {
                                    callback_single_media();
                                });
                            }
                            else {
                                var randomString = _this.randomString(req,res,8);
                                var ffmpeg = require('ffmpeg');
                                var process = new ffmpeg(appDir+'/upload/socialmedia/'+folderName+'/'+fileName);
                                process.then(function (video) {
                                    video.fnExtractFrameToJPG(appDir+'/upload/socialmedia/'+folderName, {
                                        frame_rate : 1,
                                        number : 1,
                                        file_name : 'thumb_'+randomString
                                    }, function (error, files) {
                                        if(!error){
                                            var mediaObj = {
                                                'social_timeline_id' : socialRes._id,
                                                'media_type' : mediaType,
                                                'file' : fileName,
                                                'thumbnail' : 'thumb_'+randomString+'_1.jpg'
                                            };

                                            var saveMediaObj = new MemberSocialMedia(mediaObj);
                                            saveMediaObj.save(function(err) {
                                                callback_single_media();
                                            });
                                        }
                                        else {
                                            callback_single_media();
                                        }
                                    });
                                }, function (err) {
                                    callback_single_media();
                                });
                            }
                        });
                    }, function () {
                        if(req.body.link){
                            var mediaObj = {
                                'social_timeline_id' : socialRes._id,
                                'media_type' : 'Link',
                                'file' : req.body.link,
                                'thumbnail' : ''
                            };

                            var saveMediaObj = new MemberSocialMedia(mediaObj);
                            saveMediaObj.save(function(err) {
                                resObj.status = 1;
                                resObj.message = '';
                                res.json(resObj);
                            });
                        }
                        else {
                            resObj.status = 1;
                            resObj.message = '';
                            res.json(resObj);
                        }
                    });
                });
            }
            else {
                resObj.status = 0;
                resObj.message = 'Member not exist.';
                res.json(resObj);        
            }
        });
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

/*exports.postCompete = function(req, res){
    var resObj = new Object(),
    baseUrl = req.protocol + '://' + req.get('host'),
    currentDate = _this.postCurrentDate(req,res);
    if(req.body.member_id){
        Challenge.find({ member_id: { $elemMatch: { $eq: req.body.member_id } },status: {'$eq':'Active'} },{'_id':1,'photo':1,'company_id':1,'title':1,'description':1,'startdate':1,'enddate':1,'days':1,'target':1,'video_url':1,'category':1}, function(err, challengesInfo) {
            var ongoingArr = [], almostOverArr = [], overArr = [];
            async.forEachSeries(challengesInfo, function(singleChallenge, callback_singleChallenge) {
                singleChallenge = JSON.parse(JSON.stringify(singleChallenge));
                var startDate = new Date(singleChallenge.startdate),
                endDate = new Date(singleChallenge.enddate);
                singleChallenge.dayRange = (monthNamesShort[startDate.getMonth()]+' '+startDate.getDate())+' - '+(monthNamesShort[endDate.getMonth()]+' '+endDate.getDate());
                singleChallenge.photo = (singleChallenge.photo!='') ? baseUrl+'/challenges/'+singleChallenge.photo : baseUrl+'/challenges/no-image.png';
                    
                var competitors = [{'name':'Stephen Anderson','achieve':'9.5 km'},{'name':'Steven Smith','achieve':'9.2 km'},{'name':'Brett Lee','achieve':'9.0 km'}];
                singleChallenge.competitors = competitors;

                if(moment(currentDate).isBefore(singleChallenge.startdate)){
                    ongoingArr.push(singleChallenge);
                }
                else if(moment(currentDate).isAfter(singleChallenge.enddate)){
                    overArr.push(singleChallenge);
                }
                else {
                    almostOverArr.push(singleChallenge);
                }
                callback_singleChallenge();
            }, function (err) {
                var competeObj = {
                    'ongoing' : ongoingArr,
                    'almost_over' : almostOverArr,
                    'over' : overArr
                };
                resObj.data = competeObj;
                resObj.status = 1;
                resObj.message = '';
                res.json(resObj);
            });
        });
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};*/

exports.postCompete = function(req, res){
    function aktivoChallenge(params,next){
        var dateRange = _this.postRangeStartEndDates(req,res,params.startdate,params.enddate),
        startDateFormatted = params.startdate+'T00:00:00+00:00',
        endDateFormatted = params.enddate+'T23:59:00+00:00',
        category = params.category,
        category = category.replace(/ /g , "_");
        if(category=='Aktivo_Score_Challange'){
            var pipelineAktivo = [
                {"$match": { "member_id": {$in:params.ids},"created_date":{$in:dateRange}} },
                {
                    "$group": {
                        "_id": null,
                        "sum": { "$sum": "$aktivo_score" }
                    }
                }
            ];

            MembersAktivoScore.aggregate(pipelineAktivo).exec(function (err, resultAktivo){
                var aktivoScore = (resultAktivo.length>0) ? parseInt(Math.ceil(resultAktivo[0].sum)) : 0;
                next("no", aktivoScore);
            })
        }
        else if(category=='Positivity_Challange'){
            var pipelinePositivity = [
                {"$match": { "member_id": {$in:params.ids},"currentDate":{$in:dateRange}} },
                {
                    "$group": {
                        "_id": null,
                        "sum": { "$sum": "$valence_score" }
                    }
                }
            ];

            MembersEmotionalAnalytics.aggregate(pipelinePositivity).exec(function (err, resultValence){
                var valenceScore = (resultValence.length>0) ? parseInt(Math.ceil(resultValence[0].sum)) : 0;
                next("no", valenceScore);
            })
        }
        else if(category=='Steps_Challange'){
            var pipelineSteps = [
                {"$match": { "member_id": {$in:params.ids},"timestamp":{$gte:startDateFormatted,$lte:endDateFormatted}} },
                {
                    "$group": {
                        "_id": null,
                        "sum": { "$sum": "$steps" }
                    }
                }
            ];

            MemberSteps.aggregate(pipelineSteps).exec(function (err, resultSteps){
                var totalSteps = (resultSteps.length>0) ? parseInt(Math.ceil(resultSteps[0].sum)) : 0;
                next("no", totalSteps);
            })   
        }
        else if(category=='Calories_Challenge'){
            var pipelineCalories = [
                {"$match": { "member_id": {$in:params.ids},"timestamp":{$gte:startDateFormatted,$lte:endDateFormatted}} },
                {
                    "$group": {
                        "_id": null,
                        "sum": { "$sum": "$calories_burned" }
                    }
                }
            ];

            MemberCalories.aggregate(pipelineCalories).exec(function (err, resultCalories){
                var totalCalories = (resultCalories.length>0) ? parseInt(Math.ceil(resultCalories[0].sum)) : 0;
                next("no", totalCalories);
            })
        }
        else {
            var pipelineActiveMinutes = [
                {"$match": { "member_id": {$in:params.ids},"timestamp":{$gte:startDateFormatted,$lte:endDateFormatted}} },
                {
                    "$group": {
                        "_id": null,
                        "sum": { "$sum": "$active_duration" }
                    }
                }
            ];

            MemberActiveMinutes.aggregate(pipelineActiveMinutes).exec(function (err, resultAM){
                var totalAM = (resultAM.length>0) ? parseInt(Math.ceil(resultAM[0].sum/60)) : 0;
                next("no", totalAM);
            })
        }
    }

    var resObj = new Object(),
    baseUrl = req.protocol + '://' + req.get('host'),
    currentDate = _this.postCurrentDate(req,res);
    if(req.body.member_id){
        Member.findOne({ _id: req.body.member_id},{firstname:1,lastname:1,company_id:1,multiple_departments:1,multiple_teams:1}, function(err, memberInfo) {
            Challenge.find({
                $or: [
                    { "department_id": {$in : memberInfo.multiple_departments}},
                    { "team_id": {$in : memberInfo.multiple_teams}},
                    { "member_id": {$in : [memberInfo._id]}}
                ],status: {'$eq':'Active'}
            },{title:1,description:1,startdate:1,enddate:1,challenge:1,category:1,target:1,member_id:1,team_id:1,department_id:1},function(err, challengesInfo){
                var ongoingArr = [], almostOverArr = [], overArr = [];
                async.forEachSeries(challengesInfo, function(singleChallenge, callback_singleChallenge) {
                    singleChallenge = JSON.parse(JSON.stringify(singleChallenge));
                    var startDate = new Date(singleChallenge.startdate),
                    endDate = new Date(singleChallenge.enddate);
                    singleChallenge.dayRange = (monthNamesShort[startDate.getMonth()]+' '+startDate.getDate())+' - '+(monthNamesShort[endDate.getMonth()]+' '+endDate.getDate());
                    var baseIconUploadPath = appDir+'/upload/challenges/'+singleChallenge.photo;
                    singleChallenge.photo = baseUrl+'/challenges/no-image.png';
                    if (fs.existsSync(baseIconUploadPath)) {
                        singleChallenge.photo = baseUrl+'/challenges/'+singleChallenge.photo;
                    }

                    var overStartDate = new Date(singleChallenge.enddate);
                    overStartDate.setDate(overStartDate.getDate()-2);

                    var competitors = [],
                    startOverDate = moment(overStartDate, "YYYY-MM-DD"),
                    endOverDate = moment(singleChallenge.enddate, "YYYY-MM-DD"),
                    todaysDate = moment(currentDate, "YYYY-MM-DD");
                    
                    if(singleChallenge.challenge=='Department'){
                        Department.find({'_id':{$in: singleChallenge.department_id}},{title:1},function(err, departmentsInfo) {
                            async.forEachSeries(departmentsInfo, function(singleDepartment, callback_singleDepartment) {
                                Member.find({ multiple_departments: { $elemMatch: { $eq: singleDepartment._id.toString() } }},{firstname:1,lastname:1},function(err,deptMembers){
                                    var deptMemIds = _.pluck(deptMembers, '_id'),
                                    deptMemIds = deptMemIds.join().split(','),
                                    aktivoParamObj = {'ids':deptMemIds,'category':singleChallenge.category,'startdate':singleChallenge.startdate,'enddate':singleChallenge.enddate};
                                    aktivoChallenge(aktivoParamObj,function(err, total){
                                        competitors.push({'name':singleDepartment.title,'achieve':total});
                                        callback_singleDepartment();
                                    });                             
                                })
                            }, function (err) {
                                competitors.sort(function(a,b) {
                                    return b.achieve - a.achieve;
                                });
                                singleChallenge.competitors = competitors;
                                if(moment(currentDate).isBefore(singleChallenge.startdate)){
                                    ongoingArr.push(singleChallenge);
                                }
                                else if(moment(currentDate).isAfter(singleChallenge.enddate)){
                                    overArr.push(singleChallenge);
                                }
                                else {
                                    if(todaysDate.isBetween(startOverDate, endOverDate) || moment(currentDate).isSame(singleChallenge.enddate)){
                                        almostOverArr.push(singleChallenge);
                                    }
                                    else {
                                        ongoingArr.push(singleChallenge);
                                    }
                                }
                                callback_singleChallenge();
                            })
                        });
                    }
                    else if(singleChallenge.challenge=='Team'){
                        Team.find({'_id':{$in: singleChallenge.team_id}},{title:1},function(err, teamsInfo) {
                            var teamIds = _.pluck(teamsInfo, '_id'),
                            teamIds = teamIds.join().split(',');
                            async.forEachSeries(teamsInfo, function(singleTeam, callback_singleTeam) {
                                Member.find({ multiple_teams: { $elemMatch: { $eq: singleTeam._id.toString() } }},{firstname:1,lastname:1},function(err,deptTeams){
                                    var teamMemIds = _.pluck(deptTeams, '_id'),
                                    teamMemIds = teamMemIds.join().split(','),
                                    aktivoParamObj = {'ids':teamMemIds,'category':singleChallenge.category,'startdate':singleChallenge.startdate,'enddate':singleChallenge.enddate};
                                    aktivoChallenge(aktivoParamObj,function(err, total){
                                        competitors.push({'name':singleTeam.title,'achieve':total});
                                        callback_singleTeam();
                                    });
                                })
                            }, function (err) {
                                competitors.sort(function(a,b) {
                                    return b.achieve - a.achieve;
                                });
                                singleChallenge.competitors = competitors;
                                if(moment(currentDate).isBefore(singleChallenge.startdate)){
                                    ongoingArr.push(singleChallenge);
                                }
                                else if(moment(currentDate).isAfter(singleChallenge.enddate)){
                                    overArr.push(singleChallenge);
                                }
                                else {
                                    if(todaysDate.isBetween(startOverDate, endOverDate) || moment(currentDate).isSame(singleChallenge.enddate)){
                                        almostOverArr.push(singleChallenge);
                                    }
                                    else {
                                        ongoingArr.push(singleChallenge);
                                    }
                                }
                                callback_singleChallenge();
                            })
                        });
                    }
                    else {
                        Member.find({_id:{$in:singleChallenge.member_id}},function(err,membersInfo){
                            async.forEachSeries(membersInfo, function(singleMember, callback_singleMember) {
                                aktivoParamObj = {'ids':[singleMember._id.toString()],'category':singleChallenge.category,'startdate':singleChallenge.startdate,'enddate':singleChallenge.enddate};
                                aktivoChallenge(aktivoParamObj,function(err, total){
                                    competitors.push({'name':singleMember.firstname+' '+singleMember.lastname,'achieve':total});
                                    callback_singleMember();
                                });
                            }, function (err) {
                                competitors.sort(function(a,b) {
                                    return b.achieve - a.achieve;
                                });
                                singleChallenge.competitors = competitors;
                                if(moment(currentDate).isBefore(singleChallenge.startdate)){
                                    ongoingArr.push(singleChallenge);
                                }
                                else if(moment(currentDate).isAfter(singleChallenge.enddate)){
                                    overArr.push(singleChallenge);
                                }
                                else {
                                    if(todaysDate.isBetween(startOverDate, endOverDate) || moment(currentDate).isSame(singleChallenge.enddate)){
                                        almostOverArr.push(singleChallenge);
                                    }
                                    else {
                                        ongoingArr.push(singleChallenge);
                                    }
                                }
                                callback_singleChallenge();
                            })
                        })
                    }
                }, function (err) {
                    var competeObj = {
                        'ongoing' : ongoingArr,
                        'almost_over' : almostOverArr,
                        'over' : overArr
                    };
                    resObj.data = competeObj;
                    resObj.status = 1;
                    resObj.message = '';
                    res.json(resObj);
                });
            });
        })
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postVerifyOTP = function(req, res){
    var resObj = new Object(),
    baseUrl = req.protocol + '://' + req.get('host');
    if(req.body.otp && req.body.email){
        Member.findOne({ otp: req.body.otp,email:req.body.email },{firstname:1,lastname:1,phone:1,date_of_birth:1,height:1,photo:1,weight:1,smokes:1,drinks:1,badtime:1,wakeup:1,area_of_interest:1,sex:1,otp:1,otp_posted:1,height_unit:1,weight_unit:1}, function(err, memberInfo) {
            if(memberInfo){
                memberInfo = JSON.parse(JSON.stringify(memberInfo));

                var currentDate = new Date(),
                otpPosted = new Date(memberInfo.otp_posted),
                diff = moment(currentDate).diff(moment(otpPosted), 'hours');
                if(diff<24){
                    memberInfo.photo = _this.memberProfilePhotoURL(req, res, baseUrl, memberInfo.photo, memberInfo.sex, 'round');
                    memberInfo.firstname = (memberInfo.firstname) ? memberInfo.firstname : '';
                    memberInfo.lastname = (memberInfo.lastname) ? memberInfo.lastname : '';
                    memberInfo.phone = (memberInfo.phone) ? memberInfo.phone : '';
                    memberInfo.date_of_birth = (memberInfo.date_of_birth) ? memberInfo.date_of_birth : '';
                    memberInfo.height = (memberInfo.height) ? memberInfo.height : 0;
                    memberInfo.height_unit = (memberInfo.height_unit) ? memberInfo.height_unit : 'feet';
                    memberInfo.weight = (memberInfo.weight) ? memberInfo.weight : 0;
                    memberInfo.weight_unit = (memberInfo.weight_unit) ? memberInfo.weight_unit : 'kg';
                    memberInfo.smokes = (memberInfo.smokes) ? memberInfo.smokes : 0;
                    memberInfo.drinks = (memberInfo.drinks) ? memberInfo.drinks : 0;
                    memberInfo.badtime = (memberInfo.badtime) ? memberInfo.badtime : '';
                    memberInfo.wakeup = (memberInfo.wakeup) ? memberInfo.wakeup : '';
                    memberInfo.area_of_interest = (memberInfo.area_of_interest) ? memberInfo.area_of_interest : '';
                    delete memberInfo.sex;
                    delete memberInfo.otp;
                    delete memberInfo.otp_posted;

                    var updateMemberObj = {otp:''};
                    Member.findByIdAndUpdate(memberInfo._id, updateMemberObj, function(err, memberResponse) {
                        resObj.data = memberInfo;
                        resObj.status = 1;
                        resObj.message = '';
                        res.json(resObj); 
                    });
                }
                else {
                    resObj.status = 0;
                    resObj.message = "You've entered an incorrect verification code";
                    res.json(resObj);
                }
            }
            else {
                resObj.status = 0;
                resObj.message = "You've entered an incorrect verification code";
                res.json(resObj);
            }
        });
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postSignIn = function(req, res){
    var resObj = new Object();
    if(req.body.email){
        Member.findOne({ email: req.body.email },{'_id':1,'firstname':1,'lastname':1,'company_id':1,'status':1}, function(err, memberInfo) {
            if(memberInfo){
                if(memberInfo.status=='Active'){
                    Company.findOne({ _id: memberInfo.company_id }, function(err, companyInfo) {
                        if(companyInfo){
                            if(companyInfo.status=='Active'){
                                var otp = Math.floor(Math.random()*89999+10000),
                                currentDate = _this.postCurrentDate(req,res),
                                currentTime = _this.postCurrentTime(req,res);

                                var dbObj = {
                                    otp : otp,
                                    otp_posted : new Date()
                                };

                                Member.findByIdAndUpdate(memberInfo._id, dbObj, function(err, memberResponse) {
                                    var otpEmailTemplate = "<html xmlns='http://www.w3.org/1999/xhtml'><head><meta name='viewport' content='width=device-width' /><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /><title>Email</title><style type='text/css'>table tr td a{color:#ffffff!important;text-decoration:none}.reset_password{color:#ffffff!important;text-decoration:none!important}</style></head><body bgcolor='#FFFFFF'><table width='96%' border='0' cellspacing='0' cellpadding='0' bgcolor='#f2f5f7' style='border-right:1px solid #d3d9dd;border-bottom:20px solid #000;padding:1% 2% 2% 2%;margin:0 0 0 2%;border-radius:10px'><tr><td><table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td><table width='100%' border='0' cellspacing='0' cellpadding='0' bgcolor='#000' style='border-radius:5px;padding:20px 0'><tr><td align='center' valign='middle'><img src='https://i.imgur.com/n2nLbtv.png' alt='' width='200'></td></tr></table></td></tr><tr><td><table width='100%' border='0' cellspacing='0' cellpadding='0' style='padding:10px 0 0 0'><tr><td style='font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#000;padding:15px 0 10px 10px'><span>Dear #NAME#,</span></td></tr><tr><td style='font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#000;padding:10px 0 10px 10px'><span>Your One-Time Password (OTP) is - #OTP#,</span></td></tr><tr><td style='font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#000;padding:10px 0 10px 10px'><span>This OTP is to be used for activating aktivolabs application to your smartphone as requested on #OTPDATE#, at #OTPTIME# SGT and it is valid for 24 hours only.</span></td></tr><tr><td style='font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#000;padding:10px 0 0 10px'>Thank you,<br>Aktivolabs</td></tr></table></td></tr></table></td></tr></table></body></html>";
                                    otpEmailTemplate = otpEmailTemplate.replace("#NAME#", memberInfo.firstname+' '+memberInfo.lastname);
                                    otpEmailTemplate = otpEmailTemplate.replace("#OTP#", otp);
                                    otpEmailTemplate = otpEmailTemplate.replace("#OTPDATE#", moment(Date()).format('MMMM Do YYYY'));
                                    otpEmailTemplate = otpEmailTemplate.replace("#OTPTIME#", moment(Date()).format('LT'));
                                    
                                    _this.sendOTPEmail(req,res,req.body.email,'Your One-Time Password Request',otpEmailTemplate);
                                    
                                    resObj.status = 1;
                                    resObj.message = 'Verification code has been sent to <b>your inbox</b>';
                                    res.json(resObj);
                                });
                            }
                            else {
                                resObj.status = 0;
                                resObj.message = 'Your organization has been frozen, please contact to administrator';
                                res.json(resObj);
                            }
                        }
                        else {
                            resObj.status = 0;
                            resObj.message = 'Organization not assigned to this email address';
                            res.json(resObj);
                        }
                    });
                }
                else {
                    resObj.status = 0;
                    resObj.message = 'Your account has been frozen. please contact to administrator';
                    res.json(resObj);
                }
            }
            else {
                resObj.status = 0;
                resObj.message = 'Email Address is not registered <b> Verify your email and try again.</b>';
                res.json(resObj);
            }
        });
    }
    else {
        resObj.status = 0;
        resObj.message = 'Not passed required parameters';
        res.json(resObj);
    }
};

exports.postCMS = function(req, res){
    var resObj = new Object();
    CMS.find(function(err, cms) {
        resObj.data = cms;
        resObj.status = 1;
        resObj.message = '';
        res.json(resObj);
    });
};

exports.postFlashScreen = function(req, res){
    var resObj = new Object();
    baseUrl = req.protocol + '://' + req.get('host'),
    path = require('path'),
    basePath = path.dirname(require.main.filename);
    FlashScreen.find({},{_id:0,image:1,description:1},function(err, flashscreens) {
        for(var scr=0;scr<flashscreens.length;scr++){
            var baseFlashUploadPath = basePath+'/upload/flashscreen/'+flashscreens[scr].image;
            if (fs.existsSync(baseFlashUploadPath)) {
                flashscreens[scr].image = baseUrl+'/flashscreen/'+flashscreens[scr].image;
            }
            else {
                flashscreens[scr].image = baseUrl+'/flashscreen/no_image.jpg';
            }
        }

        BackgroundImage.findOne({selected_status:"Yes"},function(err, selectedImages){
            var loginBackImgURL = baseUrl+"/background_image/signin_placeholder.jpg";
            if(selectedImages){
                var loginBackImgPath = appDir+'/upload/background_image/'+selectedImages.sign_in_image;
                if(fs.existsSync(loginBackImgPath)){
                    loginBackImgURL = baseUrl+'/background_image/'+selectedImages.sign_in_image;
                }
            }
            resObj.data = flashscreens;
            resObj.login_background_image = loginBackImgURL;
            resObj.status = 1;
            resObj.message = '';
            res.json(resObj);
        })
    });
};

