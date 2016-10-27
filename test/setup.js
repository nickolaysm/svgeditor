/**
 * Created by nsmirnov on 06.06.2016.
 */

var jsdom = require('jsdom-no-contextify');

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.parentWindow;