// The Farmers' Classified Scraper Thingy (tm)
// by whiskers75 - whiskers75.com

var req = require('restless'); // Restler + callbacks = fun
var h = require('htmlparser'); // For node-soupselect
var s = require('soupselect').select; // Selects DOM elements nicely
var fs = require('fs');
var jsoncsv = require('jsoncsv');
var x = 0; // Page to get
var parsed = 0; // Parsed objects
var total = 0;
var result = [];
function handleResponse(err, response) {
    if (err) {
	throw err; // Balls to it! Restart it again! :P
    }
    var handler = new h.DefaultHandler(function(err, dom) {
        if (err) {
            throw err;
        }
        // Yay, we got the HTML, now let's parse it nicely
	s(dom, 'h1.pageTitle').forEach(function(title) {
            title.children[0].raw = title.children[0].raw.replace(')', ']');
            title.children[0].raw = title.children[0].raw.replace('(', '[');
            total = title.children[0].raw.match(/[^[\]]+(?=])/g)[0];
	});
	s(dom, 'a.fn').forEach(function(obj) {
	    result.push({title: obj.children[0].raw, href: obj.attribs.href});
	    parsed++;
	});
        s(dom, 'h2.item.listing-title a').forEach(function(obj) {
            result.push({title: obj.children[0].raw, href: obj.attribs.href});
            parsed++;
        });
        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);
        process.stdout.write('Fetching http://classified.fwi.co.uk/browse/page-' + (x + 1) + '.... (' + ((parsed / total) * 100).toFixed(2) + '% done)');
	if (parsed >= total) {
	    fs.writeFile('out.json', JSON.stringify(result), function(err) {
		if (err) {
		    throw err;
		}
                console.log('\nDone! JSON written to out.json :D\nThis aggregator was made by whiskers75 - whiskers75.com\nUse, modify, and change at will - no permission required.\nGathered data is subject to Farmers\' Classified Terms and Conditions, and any other regulations.\n');
                process.exit(0);
	    });
	}
	next();
    });
    
    var parser = new h.Parser(handler);
    parser.parseComplete(response);
}
function next() {
    x++;
    req.get('http://classified.fwi.co.uk/browse/page-' + x, handleResponse);
}
next();
