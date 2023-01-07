# woomp
there it is


Controls
--------

* W - move up
* A - move left
* S - move down
* D - move right
* SPACE - woomp


How to Run
----------

woomp runs in web browsers and needs to be hosted by a webserver.  To host it, start up a webserver that gives access to the index.html file within the woomp top-level directory.  For example, if you have python (>=3) installed, navigate to the woomp directory and run

```
> python -m http.server 8000
```

This will start a server exposing that directory on port 8000.  You can then access the program by pointing your web browser to the URL `http://localhost:8000`.


Dependencies
------------

Dependencies are included.

* phaser
