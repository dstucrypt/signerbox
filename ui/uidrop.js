var ko = require('knockout');

var UIDrop = function (main) {
    var ob = {
        show: function () {
            this.visible(true);
        },
        hide: function () {
            this.visible(false);
        },
        visible: ko.observable(false),
        drag_over: function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy';
        },
        selected: function (evt) {
            var files, i, f, reader, u8;

            evt.stopPropagation();
            evt.preventDefault();

            files = evt.dataTransfer.files; // FileList object.
            for (i = 0, f; f = files[i]; i++) {
                reader = new FileReader();
                reader.onload = function(evt) {
                    u8 = new Buffer(new Uint8Array(evt.target.result), 'raw');
                    ob.main.file_drop(u8);
                }
                reader.readAsArrayBuffer(f);
            }

        },
        setup: function () {
            this.dom = document.getElementById('drop_zone');

            this.dom.addEventListener('dragover', this.drag_over, false);
            this.dom.addEventListener('drop', this.selected, false);
        },
        dom: null,
        main: main,
    };
    ob.setup();

    return ob;
};

module.exports = UIDrop;
