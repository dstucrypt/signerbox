all: build

BUILD=debug

ifeq ($(BUILD),release)
BSIFY_OUT= | uglifyjs > 
else
BSIFY_OUT=-o 
endif


SRC=\
	ui/entry.js \
	ui/uimain.js \
	ui/uidrop.js \
	ui/uipassword.js \


NODE_PACKAGES = asn1.js jkurwa em-gost knockout zepto-browserify

NPM=$(patsubst %,node_modules/%/package.json,$(NODE_PACKAGES))

build: eusign/static/js/build.js

node_modules/%/package.json:
	npm install $*

node_modules/asn1.js/package.json:
	npm install  --no-optional asn1.js

node_modules/jkurwa/package.json:
	npm install https://github.com/muromec/jkurwa/tarball/master

node_modules/em-gost/package.json:
	npm install https://github.com/muromec/em-gost/tarball/master

eusign/static/js/build.js: $(SRC) $(NPM)
	cat ./node_modules/asn1.js/lib/asn1.js | sed 's,asn1.bignum = r,throw new Error();//,' > ./node_modules/asn1.js/lib/asn1.js_fix
	mv ./node_modules/asn1.js/lib/asn1.js_fix ./node_modules/asn1.js/lib/asn1.js
	browserify \
		--noparse=./node_modules/em-gost/lib/uadstu.js \
		-r em-gost \
		-r jkurwa \
		-r asn1.js \
		-r buffer \
		-r ./ui/entry.js:ui \
		$(BSIFY_OUT) $@
