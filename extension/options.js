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

function update_bool_setting()
{
    set_bool_setting(this.name, this.checked);
}

function init()
{
    var form = document.getElementById("preferences");
    
    form.elements.namedItem("favicon").checked = get_bool_setting("favicon");
    form.elements.namedItem("favicon").onclick = update_bool_setting;
}

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

init();
