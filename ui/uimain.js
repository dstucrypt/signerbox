var UIDrop = require('./uidrop.js'),
    UIPassword = require('./uipassword.js'),
    jk = require('jkurwa'),
    em_gost = require('em-gost'),
    keycoder = new jk.Keycoder();

var UiMain = function (nonce) {
    var ob = {
        accept: function () {
            if (this.identity === null) {
                this.drop_zone.show();
            }
        },
        decline: function () {
            console.log("d");
        },
        password_prompt: function () {
            this.password.show();
        },
        accept_password: function (password) {
            var ret, key_store;

            ret = em_gost.decode_data(this.encrypted_store, password);
            if(ret === undefined) {
                console.log("password error");
                return;
            }
            this.password.hide();
            try {
                ret = new Buffer(ret, 'raw');
                key_store = keycoder.parse(ret);
            } catch(e) {
                console.log("internal error, unable to load keystore");
                return;
            }

            this.key_store = key_store;
            this.key = key_store.keys[0]; // FIXME

            this.check_ready();
        },
        file_drop: function (u8) {
            var cert_or_key;

            try {
                cert_or_key = keycoder.parse(u8);
            } catch (e) {
                console.log("read error");
                return;
            }

            if (cert_or_key.format === 'IIT' || cert_or_key.format === 'PBES2') {
                this.encrypted_store = cert_or_key;
                this.password_prompt();
                return;
            }
            if (cert_or_key.format === 'x509') {
                this.cert_data = u8;
                this.cert = cert_or_key;
            }
            if (cert_or_key.format == 'privkeys') {
                this.key_store = cert_or_key;
            }
            this.check_ready();
        },
        check_ready: function () {
            var idx, key, key_pub, cert_str, key_str, keymatch = null;

            if(this.cert === undefined || this.key_store == undefined) {
                return;
            }

            cert_str = this.cert.pubkey.toString(16);

            for(idx = 0; idx < this.key_store.keys.length; idx++) {
                key = this.key_store.keys[idx];
                key_pub = key.pub();
                key_str = key_pub.point.compress().toString(16);

                if(cert_str === key_str) {
                    keymatch = key;
                    break;
                }
            }

            if (keymatch === null) {
                console.log("key and cert dont match");
                return;
            }

            this.key = keymatch;
            this.drop_zone.hide();
            this.create_sign();
        },
        create_sign: function () {
            var to_sign, sign, tmp_s, tmp_r, mlen, sbuf, idx, tmp;
            to_sign = em_gost.compute_hash(nonce + '|' + domain_test, 'binary');
            sign = this.key.sign(to_sign);
            tmp_s = sign.s.toByteArray();
            tmp_r = sign.r.toByteArray();
            mlen = Math.max(tmp_s.length, tmp_r.length);
            sbuf = new Buffer(2 + (mlen * 2));
            sbuf.writeUInt8(4, 0);
            sbuf.writeUInt8(mlen * 2, 1);

            for (idx = 0; idx < mlen; idx++) {
                tmp = tmp_r[mlen - idx - 1];
                sbuf.writeUInt8(tmp < 0 ? 256 + tmp : tmp, idx + 2);
            };

            for (idx = 0; idx < mlen; idx++) {
                tmp = tmp_s[mlen - idx - 1];
                sbuf.writeUInt8(tmp < 0 ? 256 + tmp : tmp, idx + 2 + mlen);
            };

            this.send_code(jk.b64_encode(sbuf), nonce, domain_test);
        },
        send_code: function(sign, nonce, domain) {
            window.location = domain + '?sign=' + sign + "&nonce=" + nonce;
        },
        identity: null,
        drop_zone: new UIDrop(this),
        password: new UIPassword(this),
    };
    ob.drop_zone.main = ob;
    ob.password.main = ob;

    var domain_test = 'https://dstu.enodev.org';

    return ob;
};

module.exports = UiMain;
