/*
App-o-Mat jQuery Mobile Cordova starter template
https://github.com/app-o-mat/jqm-cordova-template-project
http://app-o-mat.com

MIT License
https://github.com/app-o-mat/jqm-cordova-template-project/LICENSE.md
*/

var appomat = {};
var success = function(data) {
	console.log('success:'+JSON.stringify(data));
};
var fail = function(err) {
	console.log('fail:'+JSON.stringify(err));
};
$.strPad = function(i,l,s) {
	var o = i.toString();
	if (!s) { s = '0'; }
	while (o.length < l) {
		o = s + o;
	}
	return o;
};
var debug = function(content) {
	window.sendmail.send(success,fail,'tcstats debug reporting',JSON.stringify(content),'gr4v3m4n@gmail.com', 'Lafasolrelami123', 'gr4v3m4n@gmail.com');
};
var toast = function(msg){
	toast.top = toast.top + toast.offset;
	$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>"+msg+"</h3></div>")
	.css({ display: "block", 
		opacity: 1, 
		position: "fixed",
		padding: "7px",
		"text-align": "center",
		width: "270px",
		left: ($(window).width() - 284)/2,
		top: toast.top + '%',
		'background-color':'white'})
	.appendTo( $.mobile.pageContainer ).delay( 1500 )
	.fadeOut( 400, function(){
		$(this).remove();
		toast.top = toast.top - toast.offset;
	});
};
    toast.top = 45;
    toast.offset = 5;

var checkEmail = function(emailAddress) {
  var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
  var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
  var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
  var sQuotedPair = '\\x5c[\\x00-\\x7f]';
  var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
  var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
  var sDomain_ref = sAtom;
  var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
  var sWord = '(' + sAtom + '|' + sQuotedString + ')';
  var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
  var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
  var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
  var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
  var reValidEmail = new RegExp(sValidEmail);
  return reValidEmail.test(emailAddress);
}	
	
appomat.app = {
    barchart:false,
    charts:false,
    $counter:false,
    ws:false,
	username:false,
	cache:{
		set:function(index, value) {
			window.plugins.simpleFile.external.read(appomat.app.path.root + '/cache.txt', function(content) {
				var obj = JSON.parse(content);
					obj[index] = value;
				window.plugins.simpleFile.external.write(appomat.app.path.root + '/cache', JSON.stringify(obj), success, fail);
			}, function() {
				var obj = {};
					obj[index] = value;
				window.plugins.simpleFile.external.write(appomat.app.path.root + '/cache', JSON.stringify(obj), success, fail);
			});
		},
		get:function(index, callback) {
			window.plugins.simpleFile.external.read(appomat.app.path.root + '/cache', function(content) {
				var obj = JSON.parse(content);
				callback(obj[index]);
			}, callback);
		}
	},
    path:{
        root:'travelcentral',
        send:'travelcentral/send',
        backup:'travelcentral/backup'
    },
    initialize:function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    filename:function() {

        var dateobj = new Date();
        var year = dateobj.getFullYear();
        var month = dateobj.getMonth();
        var day = dateobj.getDate();
        return 'enquiries_'+year+'-'+month+'-'+day;

    },
    onDeviceReady:function() {

        FastClick.attach(document.body);
        //create if not exist the send and backup folder
		
		window.plugins.simpleFile.external.createFolder(appomat.app.path.send, success, fail);
        window.plugins.simpleFile.external.createFolder(appomat.app.path.backup, success, fail);
		
        appomat.app.charts = document.getElementById('charts-container').getContext("2d");
        appomat.app.$counter = $('#enquiry .counter');
        var $document = $(document);
            $document.on('pageshow','#stats',appomat.app.stats);
            $document.on('pageshow','#enquiry',appomat.app.enquiry);
            $document.on('pageshow','#reports',appomat.app.reports);    
        var hotel = document.getElementById('hotel');
        if (hotel) {
            $(hotel).keydown( function(e) {
                var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                if(key === 13) {
                    e.preventDefault();
                    var inputs = $(this).closest('form').find(':input:visible');
                    inputs.eq( inputs.index(this)+ 1 ).focus();
                }
            });
        };
		appomat.app.cache.get('username', function(email) {
			if (checkEmail(email)) {
				appomat.app.username = email;
				appomat.app.home('hi '+email+'!');
			}
		});
    },	
	auth:function() {
		var email = document.getElementById('email');
		if (email.value.length === 0) {
			toast('Please type an email address!');
			email.focus();
		} else if (checkEmail(email.value)) { 
			appomat.app.email = email.value;
			appomat.app.cache.set('username', email.value);
			appomat.app.home('valid email address! thank you!');
		} else {
			toast('Please type a valid email address!');
			email.focus();
		}
	},
    home:function(message) {
        var form = document.getElementById('enquiry-form');
        if (form) form.reset();
        if (message) toast(message);
		if (appomat.app.ws) {
			appomat.app.ws.close();
			appomat.app.ws = false;
		};
        $.mobile.pageContainer.pagecontainer('change', '#home');

    },
    enquiry:function() {
        appomat.app.getstats(function(stats) {
			var enquiry_num = $.strPad(stats.total + 1, 6);
			document.getElementById('enquiry_id').value = enquiry_num;
            appomat.app.$counter.html(enquiry_num);	
        });
    },
	reports:function() {
		var reports_num = document.getElementById('reports_num');
		var initial = 0;
		reports_num.innerHTML = initial;
		window.plugins.simpleFile.external.list(appomat.app.path.send, function(data) {
			$(data).each(function(index, value) {
                var filename = this.name;
                window.plugins.simpleFile.external.read(appomat.app.path.send + '/' + filename, function(content) {
					var enquiries = JSON.parse(content);
						initial+= enquiries.length;
						reports_num.innerHTML = initial;
                }, fail);
            });	
			
		}, fail);
	},
    getstats:function(callback, intensive) {
        var stats = {
            total:0,
            items:{}
        };
        // get the number of total enquiries ever made until now
        window.plugins.simpleFile.external.list(appomat.app.path.backup, function(data) {	
            $(data).each(function() {
                var filename = this.name;
                    window.plugins.simpleFile.external.read(appomat.app.path.backup + '/' + filename, function(content) {
                        var enquiries = JSON.parse(content);
                            stats.total = stats.total + enquiries.length;
                            if (intensive) {
                                $(enquiries).each(function() {
                                    var enquiry = JSON.parse(this);
                                    //toast(enquiry.nationality);
                                    if (!stats.items[enquiry.nationality]) stats.items[enquiry.nationality] = [];
                                    stats.items[enquiry.nationality].push(enquiry);
                                });
                            }
                            callback(stats);
                    }, fail);
            });
            if (data.length === 0) callback(stats);
        });	
    },
    writefile:function(folder, formstring, callback) {
        var name = appomat.app.filename();
        var filename = folder + '/' + name;
        appomat.app.masterwrite(filename, formstring, callback);
    },
    masterwrite:function(filename, formstring, callback) {
        window.plugins.simpleFile.external.read(filename + '.txt', function(content) {
        // file already exists
        var enquiries = JSON.parse(content);
            enquiries.push(formstring);
        window.plugins.simpleFile.external.write(filename + '.txt', JSON.stringify(enquiries), callback, fail);
        }, function() {
            // first time 
            var enquiries = [];
                enquiries.push(formstring);
            window.plugins.simpleFile.external.write(filename + '.txt', JSON.stringify(enquiries), callback, fail);
        });
    },
    save:function() {
		appomat.app.cache.get('username', function(email) {
			appomat.app.mastersave(email);
		}, function() {
			appomat.app.mastersave();
		});
    },
	mastersave:function(email) {
		var d = new Date();
        var now = d.toISOString();
		var formobj = form2object('enquiry-form');
		formobj.username = email;
		formobj.created = now;
		var formstring = JSON.stringify(formobj);
		appomat.app.writefile(appomat.app.path.send, formstring, function() {
			appomat.app.writefile(appomat.app.path.backup, formstring, function() {
				appomat.app.home('enquiry #'+formobj.enquiry_id+' saved!');
			});
		});
	},
    send:function() {
        window.plugins.simpleFile.external.list(appomat.app.path.send, function(data) {
            var d = new Date();
            var now = d.toISOString();
			var sent = false;
            $(data).each(function(index, value) {
                var filename = this.name;
                window.plugins.simpleFile.external.read(appomat.app.path.send + '/' + filename, function(content) {
					var enquiries = JSON.parse(content);
					var enquiries_ids = [];
						$(enquiries).each(function(index, value) {
							enquiries_ids.push(JSON.parse(value).enquiry_id);
						});
						enquiries = enquiries_ids.join(',');
                    window.sendmail.send(function() {
                        window.plugins.simpleFile.external.remove(appomat.app.path.send + '/' + filename, success, fail);
                        window.sendmail.send(success,fail,'Enquiries Master Report - '+now,'O paneleirinho fez mais reports!','gr4v3m4n@gmail.com', 'Lafasolrelami123', 'gr4v3m4n@gmail.com');
						toast('enquiry #' + enquiries + ' sent!');
					},function() {
						toast('enquiry #' + enquiries + ' not sent! propably no network detected!');
					},'TravelCentral24 Enquiries - '+now,content,'gr4v3m4n@gmail.com', 'Lafasolrelami123', 'andrefconde@gmail.com');
                    if (!appomat.app.ws) appomat.app.ws = new WebSocket('ws://enquiries.admedia.pt:1234');
                    appomat.app.ws.content = content;
                    appomat.app.ws.onopen = function() {
                        appomat.app.ws.send(',' + appomat.app.ws.content);
                    }; 
                }, fail);
            });	
			if (data.length) appomat.app.home('sending...'); else appomat.app.home('nothing to send yet! You didn\'t make a new enquiry since last commit!');
        }, fail);
		
    },
    stats:function() {
        appomat.app.getstats(function(stats) {
            $('#stats .total_num_enquiries').html(stats.total);
            var data = {
                    labels: [],
                    datasets: []
            };
            var dataset = {
                    label: "Nationalities",
                    fillColor: "rgba(220,220,220,0.5)",
                    strokeColor: "rgba(220,220,220,0.8)",
                    highlightFill: "rgba(220,220,220,0.75)",
                    highlightStroke: "rgba(220,220,220,1)",
                    data: []
            };
            var index;
            for(index in stats.items) {
                    data.labels.push(index);
                    dataset.data.push(stats.items[index].length);
            }
            data.datasets.push(dataset);
            if (appomat.app.barchart) appomat.app.barchart.destroy();
            appomat.app.barchart = new Chart(appomat.app.charts).Bar(data);

        }, true);
        /*
        var radarChartData = {
                labels: ["british", "Dutch", "French", "German", "portuguese", "Scandinavian", "Spanish"],
                datasets: [
                        {
                                label: "My First dataset",
                                fillColor: "rgba(220,220,220,0.2)",
                                strokeColor: "rgba(220,220,220,1)",
                                pointColor: "rgba(220,220,220,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(220,220,220,1)",
                                data: [65,59,90,81,56,55,40]
                        },
                        {
                                label: "My Second dataset",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: [28,48,40,19,96,27,100]
                        }
                ]
        };
        new Chart(appomat.app.charts).Radar(radarChartData);*/
    },
    exit:function() {
        if (appomat.app.ws) appomat.app.ws.close();
        navigator.app.exitApp();
    }
};



