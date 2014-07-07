var ko = require('knockout');

var UIPassword = function (main) {
    var ob = {
        visible: ko.observable(false),
        password: ko.observable(""),
        show: function () {
            this.visible(true);
        },
        hide: function () {
            this.visible(false);
            this.password("");
        },
        accept: function () {
            this.main.accept_password(this.password());
        },
        main: main,
    };

    return ob;
};

module.exports = UIPassword;
