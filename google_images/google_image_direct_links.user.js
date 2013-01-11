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
// ==/UserScript==

// don't need these for images.google.com (but we do for google.com -> image search)
// include        http*://*.google.*/images?*
// include        http*://*.google.*/imgres?*
// include        http*://*.google.*/imghp*


(function () {

function evalNodes(path) {
	return document.evaluate(path, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
}

function evalNode(path) {
	return evalNodes(path).snapshotItem(0);
}

function basicVersion() {
	if (typeof GM_deleteValue == 'undefined') {
		return localStorage.getItem('basic') == 'true';
	} else {
		return GM_getValue('basic')?true:false;
	}
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
	a.setAttribute('style', "text-decoration: inherit; color: inherit");
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
		a.setAttribute('style', "text-decoration: inherit; color: inherit");

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

var n = document.getElementById("rg_hr");

checkVersion();
changeVersion();

//if ((/&sout=1/).test(document.location.href)) {
if (true) { // force old stuff, for now. -ml
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

document.addEventListener('click', cleanClick, false);

})();