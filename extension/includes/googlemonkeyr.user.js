// ==UserScript==
// @author         mungushume, lemonsqueeze
// @version        1.5.4-google_classic (Ported to nojs Google Search)
// @name           GoogleMonkeyR 
// @namespace      http://www.monkeyr.com
// @description    Google - Remove "Sponsored Links", Number results, Auto-load more results, Remove web search dialogues, Open external links in a new tab, self updating and all configurable from a simple user dialogue.
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

var version_number = "1.3";
var version_date = "$Date Apr 10 2013 $";
    
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

function my_alert(msg)
{
    alert("Google Classic\n\n" + msg);    
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

function to_int(s)
{
    return (isNaN(s) ? 0 : (+s));
}

function getURL(url, callback, error_callback)
{
    doXHR(url, callback, error_callback);
}

function doXHR(url, callback, error_callback)  // asynchronous
{
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function()
    {
       if (this.readyState == 4)
       {
           if (this.status == 200 && this.responseText)	// Error check for fetching the URL
	       callback(this.responseText);
	   else
	   {
	       opera.postError('XHR ERROR: ' + this.status + ' : ' + url);
	       if (error_callback)
		   error_callback();
	       return false;
	   }
       }
    }    
    xhr.send();
}    


function _matchNum(subject, test, def)
{
    var out = subject.match(test);
    return (out ? +(out[1]) : (def || 0));
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
            e.setAttribute(at, atArr[at]);
    }
    if (action && listen)
        e.addEventListener(action, listen, false);
    if (inner)
        e.innerHTML = inner;
    return e;
};

var prefs = {};
function load_prefs()
{
    prefs.favicons = get_bool_setting("favicon", false);
    prefs.autoload = get_bool_setting("autoload", false);
    prefs.remove_related_searches = get_bool_setting("remove_related_searches", false);
    prefs.background_color = get_setting("background_color", "#e5ecf9");
    prefs.use_border = get_bool_setting("use_border", false);
    prefs.border_radius = get_setting("border_radius", 10);
    prefs.numbers = get_bool_setting("numbers", false);
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

    
    if (prefs.remove_related_searches)
	addStyle("@namespace url(http://www.w3.org/1999/xhtml); #center_col > div:not(#res) {display:none;} ");

    /*
    if(UIL.Config.getRemSearchTools())
	addStyle("@namespace url(http://www.w3.org/1999/xhtml); #leftnav {display:none} #center_col {margin-left:0 !important}");
	
    if(UIL.Config.getNumResults())
	addStyle("@namespace url(http://www.w3.org/1999/xhtml); #res h3.r {display:inline}");
     */

    // rhs ads
    addStyle("@namespace url(http://www.w3.org/1999/xhtml); #rhs_block {display:none;}");


    // results styling
    var hue = prefs.background_color;
    if (hue.length==0)
	hue = "transparent";

    var BGBorder;
    //if (UIL.Config.getBGBorder()=='background')
    if (!prefs.use_border)
	BGBorder = "background-color:";
    else
	BGBorder = "border: 1pt solid ";

    var border_radius = prefs.border_radius;
    var imagePreview = "";
    //if (this.imagePreview)
    //   imagePreview = "min-height:102px;";

    addStyle("@namespace url(http://www.w3.org/1999/xhtml); li.g, div.g { margin-top: 0.15em !important; margin-right: 0.25em !important; margin-bottom: 8px !important; margin-left: 0.25em; -moz-border-radius: "+border_radius+"px; border-radius: "+border_radius+"px; " + BGBorder + " "+ hue +" ! important; padding: 0.5em ! important; } li.g {list-style-image:none;list-style-position:outside;list-style-type:none;"+imagePreview+"};");    
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

/****************************************** menu ********************************************/

var menu;
function create_menu(link)
{
    var parent = link.parentNode;
    parent.style = "position:relative;";    
    addStyle(menu_style);	     

    menu = document.buildElement('div', {}, menu_html);
    parent.appendChild(menu);

    var links = menu.getElementsByTagName('a');
    links[0].onclick = show_options;    // google classic options
    links[1].href = link.url;          // normal search preferences    
    links[2].href = "/advanced_search";
}

function hide_menu()
{
    menu.style = 'display:none;';
    window.removeEventListener('click', hide_menu, false);
}

function show_menu(e)
{
    if (!menu)
	create_menu(this);
    menu.style = 'display:auto;';
    window.addEventListener('click', hide_menu, false);    
    e.preventDefault();
}

var menu_style =
"@namespace url(http://www.w3.org/1999/xhtml); "+
".menu_dropdown { background: #FFFFFF; border: 1px solid rgba(0, 0, 0, 0.196); box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.196); font-size: 13px; padding: 0px 0px 6px; position: absolute; right: 0px; top: 28px; transition: opacity 0.22s cubic-bezier(0.25, 0.1, 0.25, 1) 0; white-space: nowrap; z-index: 3; } " +
".menu_dropdown a { text-decoration:none; display: block; padding: 8px 20px 8px 16px; } " +
".menu_dropdown a, .menu_dropdown a:visited, .menu_dropdown a:hover { color: #333333;} " +
".menu_dropdown a:hover {background-color:#eee; text-decoration:none;} ";

// TODO use current page language !
var menu_html =
'<div class="menu_dropdown">'+
'  <ul>'+
'    <li><a>Google Classic</a></li>'+
'    <li><a>Search Settings</a></li>'+
'    <li><a href="/advanced_search?q=foo&hl=en">Advanced Search</a></li>'+
'    <li><a href="/history/optout?hl=en">Web History</a></li>'+
'    <li><a href="http://www.google.com/support/websearch/?source=g&hl=en">Search Help</a></li>'+
'  </ul>'+
'</div>';

function init_menu()
{
    var a = document.querySelector("#gbg5");
    if (!a)
	return;
    a.onclick = show_menu;
    a.url = a.href;
    a.href = "javascript:;";
}

/****************************************** menu end ********************************************/

function get_starting_number()
{
    var start = window.location.href.match(/start=(\d+)/);
    return ((start && to_int(start[1])) || 0);
}

function search_page_processor()
{
    current_number = get_starting_number();
    
    var div = document.getElementByXPath("//div/div[@class='g']/parent::div | //div[@id='res']/div | //div[@id='res']/span[@id='search']");
    if (div)
    {	
	var list = document.getElementsByXPath("//div[@id='ires']//li[starts-with(@class,'g')] | //div[@id='ires']//li/div[@class='g']");
	var length = list.length;
	for (var i = 0; i < list.length; i++)
	    process_result(list[i]);
    }

    if (prefs.autoload)
	autoload_init();
}

var last_result;
var current_number = 0;
function process_result(link)  // was resultsToTable()
{
    last_result = link;
    
    var div;
    if (prefs.numbers &&
	(div = document.getElementByXPath("./div/*[1] | ./h3[1]", link)))
    {
	var str = document.buildElement('strong', null, (1 + current_number++) + ' ');
	div.parentNode.insertBefore(str, div);
    }
    
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
}

/******************************************* autoload stuff ********************************************/

function add_page_number(item)
{
    autoload.pageno++;    
    item.style.position = 'relative';
    var d = document.buildElement('div', {style:"position:absolute; top:5px; left:-70px; color:#999; font-size:16px;"},
				  "Page " + autoload.pageno);
    item.appendChild(d);
}

function process_autoload_results(responseText)
{
    // alert("now process this stuf ...");

    var i, img;
    autoload.loadingImage.style.display = "none";
    var nextResult = document.buildElement('div', null, responseText);

    var imgs = document.getElementsByXPath(".//img[contains(@class,@id)]");
    for (i = 0; (img = imgs[i++]);)
	img.removeAttribute('id');
    
    var stats = document.getElementByXPath(".//div[@id='resultStats']", nextResult);
    if (autoload.resultStats && stats)
	autoload.resultStats.innerHTML = stats.innerHTML;
    
    var list = document.getElementsByXPath(".//div[@id='res']/div//li[starts-with(@class,'g')] | .//div[@id='res']/table//li[starts-with(@class,'g')] | .//div[@id='res']/div//li/div[@class='g']", nextResult);
    for (i = 0; i < list.length; i++)
    {
	//console.log("adding autoloaded result");
	var clone = list[i].cloneNode(true);
	last_result.parentNode.appendChild(clone);
	process_result(clone);
	if (i == 0)
	    add_page_number(clone);	
    }
    
    var isNextExist = document.getElementByXPath(".//table[@id='nav']//td[last()]/a[@href]", nextResult);
    if (isNextExist)
	autoload.startNumber += autoload.itemsQuantity;

    // update navbar in case we need it later
    var navbar = nextResult.querySelector('#nav');
    autoload.navbar.parentNode.replaceChild(navbar, autoload.navbar);
    navbar.style.display = 'none';    
    autoload.navbar = navbar;
    
    autoload.requestingMoreResults = false;
}

var autoload = {};
function autoload_init()
{
    autoload.pageno = 1;
    var nextLink = document.getElementByXPath("//table[@id='nav']//td[last()]/a[contains(@href,'start')]");
    if (nextLink)
    {
	var href = nextLink.href;
	autoload.startNumber = _matchNum(href, /start=(\d+)/, 10);
	autoload.itemsQuantity = _matchNum(href, /num=(\d+)/, 10);
	//console.log(this.startNumber+ ' ' +this.itemsQuantity);
	autoload.query = href;
	autoload.resultStats = document.getElementById('resultStats');
    }

    if (insert_loading_image())
    {
	//console.log('watchForScroll');
	watch_for_scroll();
    }
}

function request_more_results()
{
    if (autoload.requested == autoload.startNumber)
	return;
    autoload.requested = autoload.startNumber;
    autoload.loadingImage.style.display = "block";
    // alert("getting more, start=" + autoload.startNumber);
    getURL(autoload.query.replace(/start=\d*/,"start=" + autoload.startNumber),
	   process_autoload_results, autoload_error);
}

function remaining_scroll()
{
    var ret = (document.body.scrollHeight - window.pageYOffset - window.innerHeight);
    return ret;
}

function watch_for_scroll()
{
    if (remaining_scroll() < 300 && !autoload.requestingMoreResults)
    {
	//console.log('requestMoreResults '+this.remainingScroll());
	autoload.requestingMoreResults = true;	
	request_more_results();
    }
    setTimeout(watch_for_scroll, 100);
}

function autoload_error()
{
    autoload.navbar.style = 'display:auto;';
    var div = document.buildElement('div', {style:"width:250px;height:34px;background-repeat:no-repeat;margin:2em auto auto auto;padding:10px;display:block;"});
    var p = document.buildElement('p', {style:"font-size:130%;font-weight:bold;padding:5px 0 0 40px;margin:0"}, "Error loading results");
    div.appendChild(p);
    autoload.loadingImage.parentNode.replaceChild(div, autoload.loadingImage);
    autoload.loadingImage = div;
}

function insert_loading_image()
{
    //console.log('insertLoadingImage');
    var nextLink = document.getElementByXPath("//table[@id='nav']//td[last()]/a");
    var navbar = document.querySelector('#nav');   // why is he doing something so complicated:
    // var navbar = document.getElementByXPath("//table[@id='nav']//td/ancestor::table");
    if (navbar)
    {
	autoload.navbar = navbar;
	navbar.style.display = "none";
	if (!autoload.loadingImage)
	{
	    var div = document.buildElement('div', {style:"width:114px;height:34px;background-image:url(" + LOADING_GIF + ");background-repeat:no-repeat;margin:2em auto auto auto;padding:10px;display:none;"});
	    var p = document.buildElement('p', {style:"font-size:130%;font-weight:bold;padding:5px 0 0 40px;margin:0"}, "Loading");
	    div.appendChild(p);
	    navbar.parentNode.insertBefore(div, navbar)
	    autoload.loadingImage = div;
	}
    }
    
    //console.log('insertLoadingImage '+nextLink);
    return nextLink;
}

var LOADING_GIF =
"data:image/gif;base64,R0lGODlhIgAiAPQAADk5OVJSUlpaWmtra3t7e4SEhIyMjJSUlJycnKWlpa2trbW1tb29vcbGxs7Ozt"+
"bW1t7e3ufn5%2B%2Fv7%2Ff39%2F%2F%2F%2FwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAgFAAAAIf8LTkVU"+
"U0NBUEUyLjADAQAAACwAAAAAIgAiAAAFhiAljmRJLYmprqx4AG1cBgb5yjjVCDacxxKBYnT7lQoI0mBA9BlHEOToIYC4nE9RNCUa"+
"1CjFLLTAdQQmYKyYshUJkodAVhFBQwkpB2OtSygYEVMFVnwjDSh0hSwSDX6EiioOj5CUJRIPEJiamJATERESn6CflaWmp6ipqqus"+
"ra6vsLGys6ohACH5BAgFAAAALAAAAAAiACIAhCEhISkpKVpaWmNjY2tra3Nzc4SEhIyMjJSUlKWlpa2trbW1tb29vcbGxs7OztbW"+
"1t7e3ufn5%2B%2Fv7%2Ff39%2F%2F%2F%2FwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWTICWOZElJiqmuZkMqAi"+
"urUPHG4wNEM2ukIsWAJAj0SBPSwzASjiQA15HyUCRFEoPUKSIApqNF4kpBALkUwAIctoqWSW4BQGYv3BTDmhs4sEsKQAx%2BCjYJ"+
"ABBTDg91EwprKCQJBGwQixIjjg5%2FLBAPDhF1nCwRDw%2BJoz0SmKmtrq%2BwsbKztLW2t7i5uru8vb6%2FwL4hACH5BAgFAAAA"+
"LAAAAAAiACIAhCEhISkpKTk5OUJCQkpKSlJSUlpaWmNjY3Nzc4SEhIyMjJSUlJycnK2trbW1tb29vcbGxs7OztbW1t7e3ufn5%2B"+
"%2Fv7%2Ff39%2F%2F%2F%2FwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWT4CWOZCk6ZqqaFAkha5xSjJuQiiHHTTRCt1FBsltNGj"+
"%2BYaKEriiQTUoXRugBHB%2BSoEpBFoiMHRPQSPQqVEQUg2H3VNWswobxMAIOiBTrqXR43FQU%2BdnhOFxZvFxFIEAsXDE0SAASH"+
"IntRFYRmPpMFliOJVSkAn6BOQaeqq6ytrq%2BwsbKztLW2t7i5uru8vb6%2FwIchACH5BAgFAAAALAAAAAAiACIAhCEhIUJCQlJS"+
"UlpaWnNzc4SEhIyMjJSUlJycnKWlpa2trbW1tb29vcbGxs7OztbW1t7e3ufn5%2B%2Fv7%2Ff39%2F%2F%2F%2FwAAAAAAAAAAAA"+
"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWVICWOZCk2Zqqu4qOwcDk55JOQShGvTzS6JMNrl3o8frdWwUc0TR6T1pCCMJAag2YL0k"+
"pKCtyTYEqUHClASm6kGBy0I4fPJiqcGQOyFnKEvBYFUW0IcCQTTCIONHiEJBIMhSUSAo0iDAEAABKRJEwSCpkBBJwmDgKZBIikJA"+
"UBOquwsbKztLW2t7i5uru8vb6%2FwMHCsCEAIfkECAUAAAAsAAAAACIAIgCEISEhKSkpQkJCWlpaY2Nja2tre3t7hISEjIyMlJSU"+
"nJycra2ttbW1vb29xsbGzs7O1tbW3t7e5%2Bfn7%2B%2Fv9%2Ff3%2F%2F%2F%2FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"+
"AAAABYlgJY5kKU5mqq7nw76vBJGRAt%2FV5I4Ng8OyEWUh%2Bb0mM5FjQaIcjKWgSFE8GRJQkk70YJ4O2OxISrXaxKNJpNKlVCSH"+
"M7oUcbzjpQdhPsKfHAMDT3wVDVwGgQluhCIQBAMFcowiDAlrk5g4CZucnIt8AgEAogClAAiZqaqrrK2ur7CxsrO0tbavIQAh%2BQ"+
"QIBQAAACwAAAAAIgAiAIQhISEpKSlKSkpra2t7e3uEhISMjIyUlJScnJylpaWtra21tbW9vb3GxsbOzs7W1tbe3t7n5%2Bfv7%2B"+
"%2F39%2Ff%2F%2F%2F8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFjCAljmRpnmiqriwbPW1cOpJsS7AtQxA5KbqU"+
"YzL6LYInSI4iURyRpkeN6YSaIg6RJMGwmiTEZte3tHJJkAOh4BVlmY8CIVH2QhCFArBdYiQafIE6BwaFBgSIBGNehAYIj48Lb4KU"+
"IgkElSQKAAADPZkUCgEAAgagFAwCnAOnEQsARKeys7S1tre4uYEhACH5BAgFAAAALAAAAAAiACIAhCEhIUJCQkpKSlJSUlpaWmNj"+
"Y2tra4yMjJSUlJycnK2trbW1tb29vcbGxs7OztbW1t7e3ufn5%2B%2Fv7%2Ff39%2F%2F%2F%2FwAAAAAAAAAAAAAAAAAAAAAAAA"+
"AAAAAAAAAAAAAAAAAAAAWEICWOZGmeaKqubOu%2BcCzP6EOvk2Pf6PRAvN4vePIBiSVjMkIcjiILRYIoEU0gUsaRGGEkFI4JcvRg"+
"7MboVYOxbrjd1WDiQK%2FTGen8ArFNPwoDBVNoYhQPCQQDCExBCgANIzmJBkQEAA4lEINBlph5IgMAZ3mhfWkCAKZoAQCfrq%2Bw"+
"sS8hACH5BAgFAAAALAAAAAAiACIAhCEhIUJCQkpKSlJSUlpaWnNzc4SEhIyMjJSUlJycnKWlpa2trbW1tb29vcbGxs7OztbW1t7e"+
"3ufn5%2B%2Fv7%2Ff39%2F%2F%2F%2FwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWCYCWOZGmeaKqubOu%2BcCzPdG3f"+
"eK7T1D5SkcfDN4E8IhId0Jj0SZC%2BaCoCqVqrucVCse0qHNLdgxGuPAwFxoQoghgMCUhOMmiMIgjDYVEzgBMDfCMTDQY1AQMiCQ"+
"R2OggAaxWLgjkAlAuBOgUAJIAIcwCNIgsEOgIBZZuRUqFlPWUsIQAh%2BQQIBQAAACwAAAAAIgAiAIQxMTFSUlJaWlpjY2Nzc3OE"+
"hISMjIyUlJScnJylpaWtra21tbW9vb3GxsbOzs7W1tbe3t7n5%2Bfv7%2B%2F39%2Ff%2F%2F%2F8AAAAAAAAAAAAAAAAAAAAAAA"+
"AAAAAAAAAAAAAAAAAAAAAFgSAljmRpnmiqrmzrvnAsz3Rt33iu73zv%2F8DgSRIhGosTHOTBbDIjwhvEAYQkFI2kD6JIMCA5BwEq"+
"iiwU2BqDmiiARxKrLHCgHAQiRIFsA9QlAVQUenw0fiIFBCN6En11FA4BfAgEWjOHIgMIJHo1mHYCljefFIE6pAZ4OaQ8B28uIQAh"+
"%2BQQIBQAAACwAAAAAIgAiAIQhISEpKSlCQkJSUlJaWlpjY2Nra2tzc3N7e3uEhISMjIyUlJScnJylpaWtra21tbW9vb3GxsbW1t"+
"be3t7n5%2Bfv7%2B%2F39%2Ff%2F%2F%2F8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkOAljmRpnmiqrmzrvnAsz3Rt33iu73zv"+
"%2F8CgcEgcVShAS0QyqfwskigSR2k4RRaKJDJtRRqkyOQCcXSxkhfgcHEg2gpR%2BSqDAJAOw2WSmEKsMwIDInkiCg4jfxYxEwAP"+
"hAUiDwmLkg6VLgwBIw6RIglpIw9gamyQnAk1diSdIxYJYzMBnoQEJAsLOg62T4gvIQAh%2BQQIBQAAACwAAAAAIgAiAIQhISFaWl"+
"pjY2Nzc3N7e3uEhISMjIycnJylpaWtra21tbW9vb3GxsbOzs7W1tbe3t7n5%2Bfv7%2B%2F39%2Ff%2F%2F%2F8AAAAAAAAAAAAA"+
"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkeAkjmRpnmiqrmzrvnAsz3Rt33iu73zv%2F8CgcEgs2hpAAiCCkjQkM6Vi4kiQHJ"+
"DJw8GEDQDWycAwSSwmjKm20W19DyJIAHmYPhLdbVv1Hi0CIgdnZQ4jD2wrXwgkAXATCGoNYSJ6KgCOIg0BUBOCIwhZhkgvAgWfkw"+
"yTMhEBg2WuEqA0miQIqgqjOAquPQy5LSEAIfkECAUAAAAsAAAAACIAIgCEISEhMTExOTk5SkpKWlpaY2Nja2trc3Nze3t7hISEjI"+
"yMnJycra2ttbW1vb29xsbGzs7O1tbW3t7e5%2Bfn7%2B%2Fv9%2Ff3%2F%2F%2F%2FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"+
"AABY%2BgJY5kaZ5oqq5s675wLM90bd94ru987%2F%2FAoHCIexgWPUQAIHjoJgYAoAARVXADaeMqigwit2ZJQkhYJNURhTuTDMyW"+
"RMPiAEvAs0m5m7gywBURbC8TAwgjC0gWDXgREzEUBAdqCXh%2FIhNpL5IkEHCLeBYRFDYJDCOXInc1EocjjJ2DMAqnqKFntzapPo"+
"IwIQAh%2BQQIBQAAACwAAAAAIgAiAIQ5OTlSUlJaWlpra2t7e3uEhISMjIyUlJScnJylpaWtra29vb3GxsbOzs7W1tbe3t7n5%2B"+
"fv7%2B%2F39%2Ff%2F%2F%2F8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFguAkjmRpnmiqrmzrvnAsz3Rt33"+
"iu73zv%2F0DYAUAsEgO4xWHJZAaDEsSi9zAEBI7dYRAYNEQPnEEgIGRFiYLkJmhESOnsI6xLEOiK7%2BNtQxToDwkiDhB9fyMKDG"+
"CFNH50ExAKfA58M4cjCwojlDoSeZuMOBCCIw%2BhN4kknD%2BrPhGVLSEAIfkECAUAAAAsAAAAACIAIgCEISEhKSkpQkJCWlpaY2"+
"Nja2trc3Nze3t7hISEjIyMlJSUpaWlra2ttbW1vb29xsbG1tbW3t7e5%2Bfn7%2B%2Fv9%2Ff3%2F%2F%2F%2FAAAAAAAAAAAAAA"+
"AAAAAAAAAAAAAAAAAAAAAAAAAABYRgJY5kaZ5oqq5s675wLM90bd94HgMOpZcEAAAB%2BZEMAYDAYRw9BkJmszI5LKY%2FCmPL5e"+
"IYA4K4QC4ksOhRhCH9NRIIRUQ3YSAQDIloflPciyMODDhyJYJ6FBM%2FDguKFRB6OQ0MjhMPOow%2Be3w3k5oVFBCONwyfFRKAUw"+
"%2BRTaFoq2mxNyEAIfkECAUAAAAsAAAAACIAIgCEISEhWlpaY2Njc3Nze3t7hISEjIyMnJycpaWlra2ttbW1vb29xsbGzs7O1tbW"+
"3t7e5%2Bfn7%2B%2Fv9%2Ff3%2F%2F%2F%2FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYLgJI5kaZ5oqq5s"+
"675wLJPAMLdIfbOHvqsK3w%2B1ABCGokakFBQgAwFBgxRkIBcF6AIiWiJFEoMgMHB8TQ1D4swmOQ4IBFyOWA8bi8RCwc8v2oApDw"+
"xmbQ0JCQpcXxIMdQ5eEkiICYsiD4U%2FSiWYXm2dgaCAmJKjkIETDpaorK2ur4AhACH5BAgFAAAALAAAAAAiACIAhCEhITExMTk5"+
"OVJSUlpaWmNjY2tra3Nzc3t7e4SEhIyMjJycnKWlpa2trbW1tb29vcbGxs7OztbW1t7e3ufn5%2B%2Fv7%2Ff39%2F%2F%2F%2Fw"+
"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWM4CWOZGmeaKqurDCw8PkAVWyPgHGrRD06gF3qMKCMKgCEEHUgGEWFwBKFKIoggMj0VJ"+
"2IArqpwktKDCQXiGLLSCQivkuCYNmSGu4FOm03QdoJZH0mFQ5ag4gnEg4ODYyODQ%2BDFhKVlpaJmTAWFHGJFJaefRMSEROidqQR"+
"dZoXEqytsbKztLW2t7i5tCEAOw%3D%3D";


/***************************************** extension messaging ********************************************/

var bgproc;
function extension_message(e)
{
    var m = e.data;
    if (!bgproc)
	bgproc = e.source;
}

function show_options()
{
    bgproc.postMessage("show_options");
}


/************************************************** init *************************************************/

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

function startup_checks()
{
    if (get_setting("version_number") != version_number)
    {
	my_alert("It's now possible to customize look and feel "+
		 "through the extension's Preferences or Google's settings button, enjoy !");
	set_setting("version_number", version_number);
    }
}

function main()
{
    startup_checks();
    load_prefs();
    load_styles();
}

function dom_loaded()
{    
    remove_ads();
    init_menu();
    search_page_processor();
}

function setup_handlers()
{
    opera.extension.onmessage = extension_message;
    on_document_ready(main);
    document.addEventListener('DOMContentLoaded', dom_loaded, false);
}

setup_handlers();

})(window.document, window.location, window.navigator,
   window.setTimeout, window.clearTimeout);
