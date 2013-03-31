// ==UserScript==
// @author         mungushume, lemonsqueeze
// @version        1.5.4-google_classic
// @name           GoogleMonkeyRLight
// @namespace      http://www.monkeyr.com
// @description    Google - Multiple columns of results, Remove "Sponsored Links", Number results, Auto-load more results, Remove web search dialogues, Open external links in a new tab, self updating and all configurable from a simple user dialogue.
// @include        http*://www.google.*/webhp?*
// @include        http*://www.google.*/search?*
// @include        http*://www.google.*/
// @include        http*://www.google.*/#*
// @include        https://encrypted.google.*/webhp?*
// @include        https://encrypted.google.*/search?*
// @include        https://encrypted.google.*/
// @include        https://encrypted.google.*/#*
// 
// Exclude google images and igoogle:
// @exclude        http*://www.google.*/search?*&um=1*
// @exclude        https://encrypted.google.*/search?*&um=1*
// @exclude        http*://www.google.*/ig?*
// @exclude        https://encrypted.google.*/ig?*
//
// ==/UserScript==

(function(document, location, navigator,
	  setTimeout, clearTimeout){

if (window != window.top)
    return;  // don't run in iframes

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

function addStyle(css)
{
    var heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
	var node = document.createElement("style");
	node.type = "text/css";
	node.innerHTML = css;
	heads[0].appendChild(node);
    }
}

/* Prototypes and additional document functions */
document.getElementByXPath = function(XPath, contextNode)
{
    var a = this.evaluate(XPath, (contextNode || this), null, window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    return (a.snapshotLength ? a.snapshotItem(0) : null);
};

document.getElementsByXPath = function(XPath, contextNode)
{
    var ret=[], i=0;
    var a = this.evaluate(XPath, (contextNode || this), null, window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    while(a.snapshotItem(i))
    {
        ret.push(a.snapshotItem(i++));
    }
    return ret;
};

document.buildElement = function(type, atArr, inner, action, listen)
{
    var e = document.createElement(type);
    for (var at in atArr)
    {
        if (atArr.hasOwnProperty(at))
        {
            e.setAttribute(at, atArr[at]);
        }
    }
    if(action && listen)
    {
        e.addEventListener(action, listen, false);
    }
    if(inner)
    {
        e.innerHTML = inner;
    }
    return e;
};

var prefs = {};
function load_prefs()
{
    prefs.favicons = get_bool_setting("favicon", false);
}

function load_styles()
{
    addStyle("@namespace url(http://www.w3.org/1999/xhtml); #cnt #center_col, #cnt #foot, .mw {width:auto !important; max-width:100% !important;} #rhs {left:auto; !important}#botstuff .sp_cnt,#botstuff .ssp{display:none} .s{max-width:98%!important;} .vshid{display:inline} #res h3.r {white-space:normal}");

/*    
    if(UIL.Config.getHideSearch())
	addStyle("@namespace url(http://www.w3.org/1999/xhtml); #rcnt{margin-top:1em} #sfcnt,#sftr,#searchform{display:none!important;}#cnt{padding:0}#cnt .mw:first-child{position:absolute;top:4.5em;right:0}#rshdr .sfcc{position:absolute;top:2em;right:0}");

    // Hide entire left toolbar
    //    addStyle("@namespace url(http://www.w3.org/1999/xhtml); div.lnsec {display:none;}");
  */
	
    // Hide useless "Everything toolbar"
    addStyle("@namespace url(http://www.w3.org/1999/xhtml); div#modeselector {display:none;} div.lnsec{border-top:0;}");

    // addStyle("@namespace url(http://www.w3.org/1999/xhtml); #center_col, #foot {margin-right: 0 !important;} #rhs, #tads, #topstuff table.ts, #bottomads{display:none;}");

    /*
    if(UIL.Config.getSearchesRelatedTo())
	addStyle("@namespace url(http://www.w3.org/1999/xhtml); #botstuff #brs{display:none;} #topstuff .tqref{display:none;}");	    
	
    if(UIL.Config.getRemSearchTools())
	addStyle("@namespace url(http://www.w3.org/1999/xhtml); #leftnav {display:none} #center_col {margin-left:0 !important}");
	
    if(UIL.Config.getNumResults())
	addStyle("@namespace url(http://www.w3.org/1999/xhtml); #res h3.r {display:inline}");
     */

    // rhs ads
    addStyle("@namespace url(http://www.w3.org/1999/xhtml); #rhs_block {display:none;}");


    // results styling
    //if (get_bool_setting("favicon"))
    //return;
    
    var hue = "#E5ECF9";  // UIL.Config.getResHue();
    if (hue.length==0)
	hue = "transparent";

    var BGBorder;
    //if (UIL.Config.getBGBorder()=='background')
    if (true)
	BGBorder = "background-color:";
    else
	BGBorder = "border: 1pt solid ";

    var imagePreview = "";
    //if (this.imagePreview)
    //   imagePreview = "min-height:102px;";

    addStyle("@namespace url(http://www.w3.org/1999/xhtml); li.g, div.g { margin-top: 0.15em !important; margin-right: 0.25em !important; margin-bottom: 0.15em !important; margin-left: 0.25em; -moz-border-radius: 10px; border-radius: 10px; " + BGBorder + " "+ hue +" ! important; padding: 0.5em ! important; } li.g {list-style-image:none;list-style-position:outside;list-style-type:none;"+imagePreview+"};");    
}

function remove_ads()
{
    // normally third column is for ads, shrink it so we have more space
    var tr = document.getElementByXPath("//table[@id='mn']//tr");
    if (tr)
    {
	tr.childNodes[1].width = 673; // center column (default 573)
	tr.childNodes[2].width = 0;   // right ads
    }

    // top and bottom ads
    var elems = document.getElementsByXPath("//div[@id='center_col']/div/h2[@class='spon']");
    for (var i = 0; elems[i]; i++)
	elems[i].parentNode.style.display = "none";	      
}


function search_page_processor()
{
    var div = document.getElementByXPath("//div/div[@class='g']/parent::div | //div[@id='res']/div | //div[@id='res']/span[@id='search']");
    if (div)
    {	
	var list = document.getElementsByXPath("//div[@id='ires']//li[starts-with(@class,'g')] | //div[@id='ires']//li/div[@class='g']");
	var length = list.length;
	for (var i = 0; i < list.length; i++)
	    process_link(list, i, length);
    }
}

function process_link(list, i, resLength)  // was resultsToTable()
{
    var link = list[i], div;
    var a = document.getElementByXPath(".//h3[contains(@class,'r')]/a", link);
    if (a)
    {
	//console.log(a.href)	    
	// turn into a direct link
	var indirect_link = a.href.match(/\/url\?q\=(http[^&]*)&/);
	if (indirect_link)
	    a.href = unescape(indirect_link[1]);
	
	a.removeAttribute("onmousedown");

	if (prefs.favicons)
	{
	    var base = a.href.match(/http:\/\/([\w\.\-]+)\//);
	    if(base){
		var fav = document.buildElement('img', {width:'16',height:'16',style:'margin-bottom:-3px;', src:'http://www.google.com/s2/favicons?domain=' + encodeURIComponent(base[1])});
		a.parentNode.insertBefore(fav, a);
		a.parentNode.insertBefore(document.createTextNode(' '), a);
	    }
	}	

	var ele = document.getElementByXPath(".//div[@class='s']//span[@class='vshid']", link);
//			var ele = document.getElementByXPath(".//div[@class='s']//span[@class='vshid'] | .//div[@class='s']//span[@class='flc']", link);
	if (ele)
	{
	    // console.log(ele.innerHTML);
	    var vsl = ele.getElementsByTagName('a');
	    for (var k = 0; k < vsl.length; k++)
	    {
		if (k==0)
		    ele.insertBefore(document.createTextNode(" - "), vsl[k]);
		vsl[k].setAttribute('class', 'fl');
	    }
	}

	if(ele)
	{
	    var notrack = document.buildElement('a',
		{ href:a.href,'class':'fl',title:'Visit the link without Google tracking you'}, 'Trackless');
	    ele.appendChild(document.createTextNode(" - "), ele.nextSibling);
	    ele.appendChild(notrack, ele.nextSibling);
        }
    }

    // ...
    //cell.appendChild(link);
}

function on_document_ready(f)
{
    function check_ready()
    {
	if (document.body)
	    f();
	else
	    setTimeout(check_ready, 50);
    }
    setTimeout(check_ready, 50);
}

function main()
{
    load_prefs();
    load_styles();
}

function dom_loaded()
{
    remove_ads();
    search_page_processor();
}

on_document_ready(main);
document.addEventListener('DOMContentLoaded', dom_loaded, false);   


})(window.document, window.location, window.navigator,
   window.setTimeout, window.clearTimeout);
