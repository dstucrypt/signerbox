var ko = require('knockout'),
    UiMain = require('./uimain.js'),
    ui_main;

var setup = function (root_node, nonce) {
    ui_main = new UiMain(nonce); 
    ko.applyBindings(ui_main, root_node);
};

module.exports = {
    setup: setup
};
