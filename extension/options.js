
function get_setting(name, default_value)
{
    var val = widget.preferences.getItem(name);
    val = (!val && default_value ? default_value : val);
    return (val ? val : '');
}

function set_setting(name, value)
{
    widget.preferences.setItem(name, value);
}

function get_bool_setting(name, default_value)
{
    var c = get_setting(name);
    return (c != '' ? c == 'y' : default_value);
}

function set_bool_setting(name, val)
{
    set_setting(name, (val ? 'y' : 'n'));
}

/***************************************** color picker **************************************/

// Color Picker Script from Flooble.com
// For more information, visit
//	http://www.flooble.com/scripts/colorpicker.php
// Copyright 2003 Animus Pactum Consulting inc.
// You may use and distribute this code freely, as long as
// you keep this copyright notice and the link to flooble.com
// if you chose to remove them, you must link to the page
// listed above from every web page where you use the color
// picker code.
//---------------------------------------------------------
var colorPicker =
{
  perline : 5,
  divSet : false,
  curId : null,
  pickerId : 'colorpicker',
  colorLevels : Array('A', 'B', 'C', 'D', 'E', 'F'),
  defaultColor: '#e5ecf9',
  colorArray : Array(),

  addColor : function(r, g, b) {
    this.colorArray[this.colorArray.length] = '#' + this.colorLevels[r] + this.colorLevels[r] + this.colorLevels[g] + this.colorLevels[g] + this.colorLevels[b] + this.colorLevels[b];
    },

  setColor : function(color) {
    var that = this;
    return function(){
	var link = document.getElementById(that.curId);
	var field = document.getElementById(that.curId + 'field');
	var picker = document.getElementById(this.pickerId);
	field.value = color;
	field.onchange({srcElement:field}); // fake event
	if (color == '') {
	    link.style.background = 'none';
	    link.style.color = 'none';
	    color = 'none';
	} else {
	    link.style.background = color;
	    link.style.color = color;
	}
	picker.style.display = 'none';
	eval(document.getElementById(that.curId + 'field').title);
    }.bind(this)
    },

  setDiv : function(id) {
    if (!document.createElement) { return; }
    this.genColors();

    var div = document.buildElement('div',{id:this.pickerId, 'class':'colorpicker'});
    var spn = document.buildElement('span',{style:"font-family:Verdana; font-size:11px;"});
    var a1 = document.buildElement('a',{href:"javascript:;"},'No color','click',this.setColor(''));
    var a2 = document.buildElement('a',{href:"javascript:;", style:"margin-left:5px;"},'Default',
				   'click',this.setColor(this.defaultColor));
    spn.appendChild(a1);
    spn.appendChild(a2);    
    spn.appendChild(this.getColorTable());
    div.appendChild(spn);
    document.body.appendChild(div);
    this.divSet = true;
    },

  pickColor : function(event) {
    var id = event.target.id;
    if (!this.divSet) { this.setDiv(id); }
    var picker = document.getElementById(this.pickerId);
    if (id == this.curId && picker.style.display == 'block') {
	picker.style.display = 'none';
	return;
    }
    this.curId = id;
    var thelink = document.getElementById(id);
    picker.style.top = (this.getAbsoluteOffsetTop(thelink) + 20) + "px";
    picker.style.left = this.getAbsoluteOffsetLeft(thelink) + "px";
    picker.style.display = 'block';
    },

  genColors : function () {
    for (a = 0; a < this.colorLevels.length-1; a++)
	this.addColor(a,a,5);

    for (a = 0; a < this.colorLevels.length-1; a++)
	this.addColor(a,5,a);

    for (a = 0; a < this.colorLevels.length-1; a++)
	this.addColor(5,a,a);

    for (a = 0; a < this.colorLevels.length-1; a++)
	this.addColor(5,5,a);

    for (a = 0; a < this.colorLevels.length-1; a++)
	this.addColor(a,5,5);

    for (a = 0; a < this.colorLevels.length-1; a++)
	this.addColor(5,a,5);

    this.colorArray[this.colorArray.length] = "#E5ECF9";
    this.colorArray[this.colorArray.length] = "#FAFAE6";

    return this.colorArray;
    },
  getColorTable : function () {
    var colors = this.colorArray;
    var tab = document.buildElement('table',{border:"0", cellspacing:"1", cellpadding:"1"});

    for (var i = 0; i < colors.length; i++) {
	if (i % this.perline == 0) { var tr = document.buildElement('tr'); tab.appendChild(tr) }
	var td = document.buildElement('td',{bgcolor:colors[i]});
	var a = document.buildElement('a',{style:"outline: 1px solid #000000; color:"+colors[i]+"; background: ' + colors[i] + ';font-size: 11px;", title:colors[i],href:"javascript:;"},"&nbsp;&nbsp;&nbsp;&nbsp;",'click',this.setColor(colors[i]));
	td.appendChild(a);
	tr.appendChild(td)
	}
    return tab;
    },
  getColorTable2 : function () {
    var colors = this.colorArray;
    var tableCode = '';
    tableCode += '<table border="0" cellspacing="1" cellpadding="1">';
    for (i = 0; i < colors.length; i++) {
	if (i % this.perline == 0) { tableCode += '<tr>'; }
	tableCode += '<td bgcolor="#000000"><a style="outline: 1px solid #000000; color: '
	+ colors[i] + '; background: ' + colors[i] + ';font-size: 11px;" title="'
	+ colors[i] + '" href="javascript:setColor(\'' + colors[i] + '\');">&nbsp;&nbsp;&nbsp;&nbsp;</a></td>';
	if (i % this.perline == this.perline - 1) { tableCode += '</tr>'; }
    }
    if (i % this.perline != 0) { tableCode += '</tr>'; }
    tableCode += '</table>';
    return tableCode;
    },
  relateColor : function (id) {

    return function(e){

    var color = (e.srcElement.value)
    var link = document.getElementById(id);
    if (color == '') {
	link.style.background = 'none';
	link.style.color = 'none';
	color = 'none';
    } else {
    link.style.background = color;
    link.style.color = color;
    }
    eval(document.getElementById(id + 'field').title);
    }.bind(this)
    },
  getAbsoluteOffsetTop : function (obj) {
    var top = obj.offsetTop;
    var parent = obj.offsetParent;
    while (parent != document.body && parent!==null) {
	top += parent.offsetTop;
	parent = parent.offsetParent;
    }
    return top;
    },

  getAbsoluteOffsetLeft : function (obj) {
    var left = obj.offsetLeft;
    var parent = obj.offsetParent;
    while (parent != document.body && parent!==null) {
	left += parent.offsetLeft;
	parent = parent.offsetParent;
    }
    return left;
    }
};

document.buildElement = function(type, atArr, inner, action, listen)
{
    var e = document.createElement(type);
    for (var at in atArr)
    {
        if (atArr.hasOwnProperty(at))
            e.setAttribute(at, atArr[at]);
    }
    if (action && listen)
        e.addEventListener(action, listen, false);
    if (inner)
        e.innerHTML = inner;
    return e;
};

// for old opera versions
Function.prototype.bind = function(object)
{
    var __method = this;
    return function()
    {
        __method.apply(object, arguments);
    }
};


function clone(obj)
{
    var copy = {};
    for (var attr in obj) {
	if (obj.hasOwnProperty(attr))
	{
	    if (typeof obj[attr] == 'function')
		copy[attr] = obj[attr];
	    else
		copy[attr] = JSON.parse(JSON.stringify(obj[attr]));
	}
    }
    return copy;
}

var darkPicker = clone(colorPicker);
darkPicker.pickerId = 'darkpicker';
darkPicker.colorLevels = Array('0', '1', '2', '3', '4', '5');
darkPicker.defaultColor = '#222';
darkPicker.genColors = function()
{
    for (a = 0; a < this.colorLevels.length-1; a++)
	this.addColor(a,a,a);

    return this.colorArray;
};


/***************************************** color picker end **************************************/


function update_bool_setting()
{
    set_bool_setting(this.name, this.checked);
}

function setup_checkbox(name)
{
    var checkbox = form.elements.namedItem(name);
    checkbox.checked = get_bool_setting(name);
    checkbox.onclick = update_bool_setting;
}

function setup_field(name, default_value)
{
    var field = form.elements.namedItem(name);
    field.value = get_setting(name, default_value);
    field.onchange = function(){ set_setting(name, this.value); };
}

function color_changed(e)
{
    //alert("changed!");
    var field = e.srcElement;
    colorPicker.relateColor(field.div_id)(e);
    var value = field.value;
    value = (value == '' ? 'none' : value);
    set_setting(field.setting, value);
}

var form;
function init()
{
    // Google Search    
    form = document.getElementById("preferences");
    setup_checkbox("favicon");
    setup_checkbox("autoload");
    setup_checkbox("use_border");
    setup_checkbox("remove_related_searches");
    setup_checkbox("numbers");
    setup_checkbox("highlight_on_hover");    
    setup_field("border_radius", 10);
    setup_field("results_width", 673);
    
    var field = document.getElementById("ResHuefield");
    document.getElementById("ResHue").addEventListener("click", colorPicker.pickColor.bind(colorPicker), false);
    field.div_id = 'ResHue';
    field.setting = "background_color";
    field.onchange = color_changed;
    field.value = get_setting(field.setting, "#e5ecf9");
    field.onchange({srcElement:field});

    // Google Images
    form = document.getElementById("images_preferences");
    setup_checkbox("images_zoom_on_hover");
    
    var field = document.getElementById("NightHuefield");
    document.getElementById("NightHue").addEventListener("click", darkPicker.pickColor.bind(darkPicker), false);
    field.div_id = 'NightHue';
    field.setting = "images_night_bgcolor";
    field.onchange = color_changed;
    field.value = get_setting(field.setting, "#222");
    field.onchange({srcElement:field});    
}

/*
function orig_init()
{
    var form = document.getElementById("preferences");

    // Set up form state
    form.elements.namedItem("numcol" + UIL.Config.getNumCol()).checked = true;
    form.elements.namedItem("remsponsor").checked = UIL.Config.getRemSponsor();
    form.elements.namedItem("numresults").checked = UIL.Config.getNumResults();
    form.elements.namedItem("remsearchtools").checked = UIL.Config.getRemSearchTools();
    form.elements.namedItem("autoload").checked = UIL.Config.getAutoLoad();
    form.elements.namedItem("hidesearch").checked = UIL.Config.getHideSearch();
    form.elements.namedItem("noSitePreview").checked = UIL.Config.getNoSitePreview();
    form.elements.namedItem("extlinksearch").checked = UIL.Config.getExtLinkSearch();
    form.elements.namedItem("extlinkigoogle").checked = UIL.Config.getExtLinkiGoogle();
    form.elements.namedItem("searchlinktracking").checked = UIL.Config.getSearchLinkTracking();
    form.elements.namedItem("ResHuefield").value = UIL.Config.getResHue();
    form.elements.namedItem("imagepreview").checked = UIL.Config.getImagePreview();
    form.elements.namedItem("favicon").checked = UIL.Config.getFavIcon();
    form.elements.namedItem("remsearchesrelatedto").checked = UIL.Config.getSearchesRelatedTo();
    //this.prefs.contentDocument.getElementById("ResHue").style.color = UIL.Config.getResHue();
    document.getElementById("ResHue").style.background = UIL.Config.getResHue();
    document.getElementById("BGBorderlink").innerHTML = UIL.Config.getBGBorder();
    document.getElementById("flowimg").className = UIL.Config.getResultFlow();

    // Set up event handlers
    form.elements.namedItem("close_button").addEventListener("click", this.hide.bind(this), false);
    form.elements.namedItem("save_button").addEventListener("click", this.preferencesSaveConfigurationHandler.bind(this), false);
    document.getElementById("ResHue").addEventListener("click", UIL.RES.colorPicker.pickColor.bind(UIL.RES.colorPicker), false);
    document.getElementById("flowimg").addEventListener("click", UIL.RES.flowtog, false);
    document.getElementById("BGBorderlink").addEventListener("click", UIL.RES.bgBordertog, false);
    document.getElementById("ResHuefield").addEventListener("change", UIL.RES.colorPicker.relateColor('ResHue'), false);

    document.getElementById("version").innerHTML=UIL.scriptVersion;
    if(BrowserDetect.csQuery){
	this.getURL("http://userscripts.org/scripts/source/"+UIL.scriptId+".meta.js", this.updateTestOnPreferences.bind(this));
    }
    else{
	this.updateLink(false);
    }
}
*/

init();
