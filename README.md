Google Classic
==============

Clean, Light and Fast Google Search !

Get the extension from Opera [addons](https://addons.opera.com/en/extensions/details/google-classic).

Makes Google snappy and removes all the distractions so you can concentrate on search results.
No ads, no side pictures, no annoying javascript, just clean uncluttered search results !
If you remember how good it was when google was only doing search, well this is pretty close.
It also gives direct links to websites, so they open faster and google can't track your clicks.

Also brings the classic Google Images interface back !
The standard image wall interface is nice the first 5 minutes, but if you've had to stare at it
for longer periods you know how tiring it can be. Classic interface gives space to breathe and
avoids epileptic seizures. The extension also adds an easy-on-the-eye black background mode =)

What it does:
- Blocks javascript on google search and images. This gives access to the lighter, non js version.
- Removes side, top and bottom ads (aka 'sponsored results')
- Search results pretty formatting
- Brings back the classic google images interface
- Adds a 'night mode' link on google images to switch colors.

Opera search engine setup
-------------------------

Use these to avoid the redirection with the default search settings, they'll take you straight to the right place.

- Better search results !
  By default google uses fuzzy search, which gives poor search results in many cases.
  Use google's `verbatim` mode so it searches for exactly what you typed.
  To have opera use it by default: 
  `Tools->Preferences->Search->Google, Edit, Details`, set `Address` to this and click `OK`:
  ```
  http://www.google.com/search?q=%s&hl=en&tbo=1&gbv=1&prmd=ivns&source=lnt&tbs=li:1&sa=X
  ```

- Google Images
  While you're at it also add the one for Google Images:
  `Add, Name: Google Images, Keyword: i, Address:`
  ```
  http://images.google.com/search?q=%s&hl=en&gbv=1&site=imghp&tbm=isch&num=20&sa=N
  ```
  Now you can just type `i calvin hobbes` in the address bar to find your favorite comics.


Link tracking
-------------

Google won't be able to track your clicks on Google Search and Images. This is useless however if Google Analytics can track you on all the sites you visit. Install [Ghostery](https://addons.opera.com/en/extensions/details/ghostery/?display=en) !

Credits
-------

Based on the fearfully awesome GoogleMonkeyR userscript by mungushume, and Google Images direct links by Dwoo.
Script blocking logic is from [scriptweeder](https://github.com/lemonsqueeze/scriptweeder/wiki).

