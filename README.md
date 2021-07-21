many-more-yt-extender
==========================

Extends youtube interface (tweak it using extension) to enable playing of 3rd party providers video! Basically borrows youtube UI to play other source videos :D!!

![preview](https://github.com/hari01584/many-more-yt-extender/blob/main/preview/manymoreytext.gif)
Youtube video [here](https://youtu.be/1T7WwMiXE34)


Why?
---

While watching *anime* from different sites i noticed something, the site where i used to watch never gave very nice and cozy interface, and they contained a tons of advertisement.. While at the same time i loved seeing random videos from youtube (even shorts and shits), I knew it was totally useless and I'd better off watching anime from those sites, but my laziness and the sheer amount of advertisements always prevented me from taking that step! So i coded *this* extension, to allow me watch anime content with the comfort of youtube!

How it works?
----

Made in pure javascript(+ lil html) this extension uses DOM elements and js content_scripts to parse and modify youtube page, It incorporate a lot of codes and web scraping to achieve this all, Plus i tried making this extension as much as extendable by exposing some endpoints and making separate scripts for each providers folders (although currently only gogoanime is there, you can check its code from *gogoanime/main.js* and perhaps make one for your own video-watching-site!

How to install?
----------------------------------------------

I will keep this quick and simple, first download this repo as zip and extract it, then use [this](https://ui.vision/howto/install-chrome-extension-from-file) or [this](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/) tutorials to install unpacked extension, Make sure to choose folder as the one which has *manifest.json*

How to use?
----------------------------------------------
First of all after installation you have to go to the top right of chrome (where your extensions are shown duhh) and then click on it, after that check the checkbox *Enable extension* and choose your video content provider (currently only gogoanime), after that click on save and reload your youtube page!! :D


Extend
-------

Check *rewrite_main.js* and *gogoanime/main.js* to see how the whole thing works, and similarly try to make another file in your respective folder *<providerName>/main.js*, also don't forget to add this in *popup.html* and *manifest.json* !

Enjoy!
------

Please enjoy! :D, Also you can contact me on discord(*Agent_Orange#9852*) for any queries and stuff!
