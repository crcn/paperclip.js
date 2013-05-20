
all: lib examples

clean:
	for FILE in `find ./ -name template.js`; do rm $$FILE; done;


lib:
	cd ../../; make all browser; cp build/paperclip.js examples/browser/paperclip.js

examples: 
	for DIR in `ls -d */ | grep -v tpl`; do cp tpl/template.js $$DIR/template.js; done;
	for FILE in `find ./ -name "template.pc"`; do paperclip -i $$FILE -o "$$FILE.js" -p;  DIRNAME=`dirname $$FILE`; sardines $$DIRNAME/template.js -o $$DIRNAME/paper.js -p browser; done;


