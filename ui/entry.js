var ko = require('knockout'),
    UiMain = require('./uimain.js'),
    ui_main;

var setup = function (root_node, nonce, csrf, domain) {
    ui_main = new UiMain(nonce, csrf, domain);
    ko.applyBindings(ui_main, root_node);
};

module.exports = {
    setup: setup
};
