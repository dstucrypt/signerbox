var ko = require('knockout'),
    UiMain = require('./uimain.js'),
    ui_main;

var setup = function (root_node, nonce, state, csrf, domain) {
    ui_main = new UiMain(nonce, state, csrf, domain);
    ko.applyBindings(ui_main, root_node);
};

module.exports = {
    setup: setup
};
