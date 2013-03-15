// ==UserScript==
// @name           Google Images direct links
// @author         Dwoo, lemonsqueeze
// @version        2011-10-06-google_classic
// @namespace      http://userscripts.org/scripts/show/48293
// @scriptsource   https://raw.github.com/lemonsqueeze/google_classic/master/google_images/google_image_direct_links.user.js
// @upstreamscriptsource      https://userscripts.org/scripts/source/48293.meta.js
// @description    Makes images link directly to the original in Google Images search. The source website link is moved to the green URL below the image. Also gives the option to always use the basic (old) version of Google Images.
// @include        http*://images.google.*/*
// @include        http*://www.google.*/search*tbm=isch*
// @include        http*://www.google.*/images?*
// @include        http*://www.google.*/imghp*
// @include        https://encrypted.google.*/images?*
// @include        https://encrypted.google.*/imghp*
// ==/UserScript==

(function (document, location, setTimeout, scriptStorage) {

if (window != window.top) // don't run in iframes
    return;
    
function evalNodes(path) {
	return document.evaluate(path, document, null, window.XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
}

function evalNode(path) {
	return evalNodes(path).snapshotItem(0);
}

function basicVersion() {
    return true;
    /*
	if (typeof GM_deleteValue == 'undefined') {
		return localStorage.getItem('basic') == 'true';
	} else {
		return GM_getValue('basic')?true:false;
	}
     */
}

function checkVersion() {
	if (basicVersion() && (/&tbm=isch/).test(document.location.href) && !(/&sout=1/).test(document.location.href)) {
		window.location = window.location + "&sout=1";
	}
}

function saveVersion() {
	var v = (/&sout=1/).test(document.location.href)?false:true;
	if (typeof GM_deleteValue == 'undefined') {
		localStorage.setItem('basic', v);
	} else {
		GM_setValue('basic', v);
	}
	window.location = window.location+"sout=1";
}

function changeVersion() {
	var t = evalNode('//div[@id="foot"]//p/a[contains(@href, "tbm=isch")]');
	if (!t) return;
	var a = document.createElement('a');
	a.innerHTML = "(Always)";
	a.href = t.href;
	a.setAttribute('style', 'margin-left: -12px; font-size: smaller;');
	a.addEventListener('click', saveVersion, false);
	var s = document.createElement('span');
	var t = t.parentNode.replaceChild(s, t);
	s.appendChild(t);
	s.appendChild(document.createTextNode(' '));
	s.appendChild(a);
}

function cleanURL() {
	this.href = this.href.replace(/.iact=.*/, '');
}

function link() {
	this.removeEventListener('DOMNodeInserted', link, false);
	var host = this;
	var a = document.createElement('a');
	a.innerHTML = host.innerHTML;
	var name = this.parentNode.parentNode.firstChild.firstChild;
	a.setAttribute('href', decodeURIComponent(decodeURIComponent(name.href.match(/imgrefurl=([^&]+)/)[1])));
	//a.setAttribute('style', "text-decoration: inherit; color: inherit");
	a.addEventListener('mouseup', cleanURL, false);
	host.replaceChild(a, host.firstChild);
	try {
		var img = this.parentNode.parentNode.previousSibling;
		name.href = img.href = decodeURIComponent(decodeURIComponent(name.href.match(/imgurl=([^&]+)/)[1]));
		name.addEventListener('mouseup', cleanURL, false);
		img.addEventListener('mouseup', cleanURL, false);
	} catch (e) {}
	this.addEventListener('DOMNodeInserted', link, false);
}

function setTrig() {
	var t = document.getElementById("rg_hr");
	t.removeEventListener('DOMNodeInserted', link, false);
	t.addEventListener('DOMNodeInserted', link, false);
	setTimeout(setTrig, 1000);
}

function oldLinks() {
	var imgs = evalNodes('//a[contains(@href, "/imgres")]');
	var img, a, host;
	for (var i = 0; img = imgs.snapshotItem(i);  i++) {
	    // host = img.parentNode.lastChild;
	    host = img.parentNode.childNodes[2];
	    
		a = document.createElement('a');
		a.innerHTML = host.innerHTML;
		//a.setAttribute('style', "text-decoration: inherit; color: inherit");

		a.setAttribute('href', decodeURIComponent(decodeURIComponent(img.href.match(/imgrefurl=([^&]+)/)[1])));

		// host.replaceChild(a, host.firstChild);
		img.parentNode.replaceChild(a, host);
		try {
			img.href = decodeURIComponent(decodeURIComponent(img.href.match(/imgurl=([^&]+)/)[1]));
		} catch (e) {}
	}
//	t.addEventListener('DOMNodeInserted', oldTrig, false);
}

function oldTrig() {
	t.removeEventListener('DOMNodeInserted', oldTrig, false);
	setTimeout(oldLinks, 100);
}

function cleanClick(e) {
	var a = e.target;
	var url;
	if ((a.tagName == 'A' || (a.tagName == 'IMG' && (a = a.parentNode) && a.tagName == 'A')) && (url = a.href.match(/imgurl=([^&]+)/))) {
		a.href = decodeURIComponent(url[1]);
	}
}

var dark_style = "\n\
body { background-color:#000; color:#fff} \n\
#leftnav a {color:#888}  \n\
a:link { color:#48f } \n\
.csb { background-image:url('data:image/png;base64,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'); }  \n\
";


function add_style(css)
{
    var head = document.querySelector('head');    
    var node = document.createElement('style');
    node.type = "text/css";
    node.innerHTML = css;
    head.appendChild(node);
    return node;
}

var applied_style;
function apply_style()
{
    if (night_mode_on())
	applied_style = add_style(dark_style);
    else
	if (applied_style)
	{
	    applied_style.parentNode.removeChild(applied_style);
	    applied_style = null;
	}
}

function night_mode_on()
{
    return (scriptStorage.getItem("google_images_style") == 'dark');
}

function toggle_style()
{
    scriptStorage.setItem("google_images_style", (night_mode_on() ? '' : 'dark'));
    set_style_toggle_button_text(this);
    apply_style();
}

function set_style_toggle_button_text(a)
{
    a.innerText = 'Night Mode' + (night_mode_on() ? ' Off' : '');    
}

function add_style_toggle_button()
{
//    var div = document.body.querySelector('#subform_ctrl');
    var div = document.body.querySelector('#resultStats');
    if (!div)
	return;
    var a = document.createElement('a');
    a.className = 'q';
    set_style_toggle_button_text(a);
    a.style = 'float:right';
    a.onclick = toggle_style;
    div.appendChild(a);
}

function main()
{
    var n = document.getElementById("rg_hr");

    checkVersion();
    changeVersion();

    add_style_toggle_button();
    apply_style();
    
    //if ((/&sout=1/).test(document.location.href)) {
    if (true) { // force old stuff, for now.
	oldLinks();
    } else if (n) {
	setTrig();
    } else if (n = evalNode('//input[@name="bih"]')) {
	if (basicVersion()) {
		var i = document.createElement('input');
		i.setAttribute('type', 'hidden');
		i.setAttribute('name', 'sout');
		i.setAttribute('value', '1')
		n.parentNode.appendChild(i);
	}
    } else {
	var link = document.getElementById('thumbnail');
	if (!link) {
		link = evalNode('//ul[@class="il_ul"]/li/a');
		if (!link) {
			return;
		}
		window.location.replace(link.href);
	}
    }
}


document.addEventListener('DOMContentLoaded', main, false); 
document.addEventListener('click', cleanClick, false);

})(window.document, window.location, window.setTimeout, widget.preferences);