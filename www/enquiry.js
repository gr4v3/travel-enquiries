var success = function(data) {
	console.log('success:'+JSON.stringify(data));
};
var fail = function(err) {
	console.log('fail:'+JSON.stringify(err));
};
var strPad = function(i,l,s) {
	var o = i.toString();
	if (!s) { s = '0'; }
	while (o.length < l) {
		o = s + o;
	}
	return o;
};
var debug = function(content) {
	window.sendmail.send(success,fail,'tcstats debug reporting',JSON.stringify(content),'gr4v3m4n@gmail.com', 'Lafasolrelami123', 'fabiomenezes@admedia.pt');
};
var toast = function(msg){
    phonon.alert(msg);
};
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
};
var enquiry = {
    barchart:false,
    charts:false,
    counter:false,
    ws:false,
    username:false,
    cache:{
        set:function(index, value) {
            window.plugins.simpleFile.external.read(enquiry.path.root + '/cache.txt', function(content) {
                    var obj = JSON.parse(content);
                        obj[index] = value;
                    window.plugins.simpleFile.external.write(enquiry.path.root + '/cache.txt', JSON.stringify(obj));
                }, function() {
                    var obj = {};
                        obj[index] = value;
                    window.plugins.simpleFile.external.write(enquiry.path.root + '/cache.txt', JSON.stringify(obj));
                }
            );
        },
        get:function(index, callback) {
            window.plugins.simpleFile.external.read(enquiry.path.root + '/cache.txt', function(content) {
                var obj = JSON.parse(content);
                callback(obj[index]);
            }, fail);
        }
    },
    path:{
        root:'travelcentral',
        send:'travelcentral/send',
        backup:'travelcentral/backup'
    },
    init:function() {     
        window.plugins.simpleFile.external.createFolder(enquiry.path.send, success, fail);
        window.plugins.simpleFile.external.createFolder(enquiry.path.backup, success, fail);	
        enquiry.cache.get('username', function(email) {
            if (checkEmail(email)) {
                enquiry.username = email;
                enquiry.home();
            }
        });
    },	
    filename:function() {
        var dateobj = new Date();
        var year = dateobj.getFullYear();
        var month = dateobj.getMonth() + 1;
        var day = dateobj.getDate();
        return 'enquiries_'+year+'-'+month+'-'+day;
    }, 
    auth:function() {
        var email = document.getElementById('email');
        if (email.value.length === 0) {
            toast('Please type an email address!');
            email.focus();
        } else if (checkEmail(email.value)) { 
            enquiry.email = email.value;
            enquiry.cache.set('username', email.value);
            enquiry.home();
        } else {
            toast('Please type a valid email address!');
            email.focus();
        }
        return false;
    },
    home:function() { 
        if (enquiry.ws) {
            enquiry.ws.close();
            enquiry.ws = false;
        };
        phonon.navigator().changePage('main');
    },
    form:function() {
        var form = document.getElementById('enquiry-form');
        if (form) form.reset();
        enquiry.getstats(function(stats) {
            var enquiry_num = strPad(stats.total + 1, 6);
            document.getElementById('enquiry_id').value = enquiry_num;
            document.getElementById('enquiry_counter').innerText = enquiry_num;
        });
    },
    reports:function() {
        var reports_num = document.getElementById('reports_num');
        if (reports_num) {
            var initial = 0;
            reports_num.innerText = initial;
            window.plugins.simpleFile.external.list(enquiry.path.send, function(data) {
                data.forEach(function(filename) {
                    window.plugins.simpleFile.external.read(enquiry.path.send + '/' + filename.name, function(content) {
                        var enquiries = JSON.parse(content);
                            initial+= enquiries.length;
                            reports_num.innerText = initial;
                    }, fail);
                });
            }, fail);
        }
    },
    getstats:function(callback) {
        var stats = {total:0,items:{}};
        // get the number of total enquiries ever made until now
        window.plugins.simpleFile.external.list(enquiry.path.backup, function(data) {
            var next = 1;
            if (!data.length) callback(stats);
            data.forEach(function(item) {
                var filename = item.name;
                window.plugins.simpleFile.external.read(enquiry.path.backup + '/' + filename, function(content) {
                    var enquiries = JSON.parse(content);
                        enquiries.forEach(function(subitem) {
                            stats.total+= 1;
                            var enquiry = JSON.parse(subitem);
                            if (!stats.items[enquiry.nationality]) stats.items[enquiry.nationality] = [];
                            stats.items[enquiry.nationality].push(enquiry);
                        }); 
                    if (next === data.length) callback(stats);
                    next++;
                }, fail);
            }); 
        });
    },
    writefile:function(folder, formstring, callback) {
        var name = enquiry.filename();
        var filename = folder + '/' + name;
        enquiry.masterwrite(filename, formstring, callback);
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
    save:function(form) {
        var warnings = [];
        var elements = form.elements;
        if (!elements.device.value.length) warnings.push({element:elements.device, text:'Please select yes or no!'});
        if (!elements.uber.value.length) warnings.push({element:elements.uber, text:'Please select yes or no!'});
        if (!elements.membership.value.length) warnings.push({element:elements.membership, text:'Please select yes or no!'});
        
        if (warnings.length) {
            /*
            var message = [];
            warnings.forEach(function(item) {
                message.push(item.element.labels[0].innerText);
            });
            toast('The following fields have incorrect data:<br />' + message.join('<br />'));*/
            return false;
        }
        
        var now = new Date().toISOString();
        var formobj = form2object(form);
            formobj.username = enquiry.username;
            formobj.created = now;
            var formstring = JSON.stringify(formobj);
            enquiry.writefile(enquiry.path.send, formstring, function() {
                enquiry.writefile(enquiry.path.backup, formstring, function() {
                    enquiry.home();
                });
            });
    },
    send:function() {
        window.plugins.simpleFile.external.list(enquiry.path.send, function(data) {
            if (data.length) enquiry.home('sending...'); else {enquiry.home('nothing to send yet! You didn\'t make a new enquiry since last commit!');return false;}
            data.forEach(function(filename) {
                window.plugins.simpleFile.external.read(enquiry.path.send + '/' + filename.name, function(content) {
                    window.plugins.simpleFile.external.remove(enquiry.path.send + '/' + filename.name, success, fail);
                    if (!enquiry.ws) enquiry.ws = new WebSocket('ws://enquiries.admedia.pt:1234');
                        enquiry.ws.content = content;
                        enquiry.ws.onopen = function() {
                            enquiry.ws.send(',' + enquiry.ws.content);
                        }; 
                }, fail);
            });
        }, fail);	
    },
    stats:function() {
        enquiry.getstats(function(stats) {
            var total = document.getElementById('total_num_enquiries');
                total.innerText = stats.total;
            var stats_container = document.getElementById('stats_container');       
            if (stats_container) {
                stats_container.innerHTML = '';
                var maxwidth = stats_container.offsetWidth - 16;
                for(name in stats.items) {
                    var amount = stats.items[name].length;
                    var itemwidth = (amount * maxwidth ) /  stats.total;
                    var div = document.createElement('div');
                        div.className = 'bar';
                        div.dataset.title = name + ' ' + amount;
                        div.style.cssText = 'width:'+itemwidth+'px;';
                        stats_container.appendChild(div);
                }
            }
        });
    },
    exit:function() {
        if (enquiry.ws) enquiry.ws.close();
        navigator.app.exitApp();
    }
};
var looking = {
    checked:0,
    change:function(element) {
        if (element.checked) {this.checked+=1;element.value = element.dataset.value+'-'+this.checked;}
        else {this.checked-=1;element.value = '';}
        element.nextElementSibling.dataset.value = this.checked;
    }
};
var interest = {
    checked:0,
    change:function(element) {
        if (element.checked) {this.checked+=1;element.value = element.dataset.value+'-'+this.checked;}
        else {this.checked-=1;element.value = '';}
        element.nextElementSibling.dataset.value = this.checked;
    }
};