(function() {
    var modules = {}, definitions = {};
    var _require = function(path) {
        if (modules[path]) return modules[path];
        var module = {
            exports: {}
        }, definition = definitions[path];
        if (!definition) {
            try {
                return require(path);
            } catch (e) {}
            throw new Error("unable to load " + path);
        }
        return modules[path] = module.exports = definition(_require, module, module.exports, path);
    };
    var define = function(path, definition) {
        definitions[path] = definition;
    };
    if (typeof global == "undefined") {
        global = window;
    }
    if (typeof window == "undefined") {
        global.window = global;
    }
    if (typeof window.process == "undefined") {
        window.process = {};
    }
    if (typeof document == "undefined") {
        global.document = global;
    }
    if (typeof document.documentElement == "undefined") {
        document.documentElement = {};
    }
    if (typeof document.documentElement.style == "undefined") {
        document.documentElement.style = {};
    }
    if (typeof navigator == "undefined") {
        global.navigator = global;
    }
    if (typeof navigator.userAgent == "undefined") {
        navigator.userAgent = "sardines";
    }
    if (typeof navigator.platform == "undefined") {
        navigator.platform = "sardines";
    }
    define("paperclip/lib/translate/index.js", function(require, module, exports, __dirname, __filename) {
        var parse, scripts, templateParser;
        templateParser = require("paperclip/lib/translate/template/parser.js");
        exports.parse = parse = function(content, options) {
            if (options == null) {
                options = {};
            }
            content = templateParser.parse(content);
            return String(content);
        };
        scripts = {};
        exports.compile = function(nameOrContent) {
            var content, module;
            module = {
                exports: {}
            };
            if (scripts[nameOrContent]) {
                return scripts[nameOrContent];
            }
            if (typeof $ !== "undefined") {
                content = $("script[data-template-name='" + nameOrContent + "']").html();
            }
            if (!content) {
                content = nameOrContent;
            }
            eval(parse(content));
            return scripts[nameOrContent] = module.exports;
        };
        if (typeof (typeof window !== "undefined" && window !== null ? window.paperclip : void 0) !== "undefined") {
            window.paperclip.compile = exports.compile;
            window.paperclip.script = exports.script;
            window.paperclip.template.compiler = exports;
        }
        return module.exports;
    });
    define("paperclip/lib/translate/template/parser.js", function(require, module, exports, __dirname, __filename) {
        var AttributeExpression, AttributesExpression, BaseParser, BindingExpression, ChildrenExpression, CollectionExpression, NodeExpression, Parser, RootExpression, StringExpression, StringNodeExpression, TextBindingExpression, TextStringExpression, TokenCodes, Tokenizer, bindingParser, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BaseParser = require("paperclip/lib/translate/base/parser.js");
        Tokenizer = require("paperclip/lib/translate/template/tokenizer.js");
        TokenCodes = Tokenizer.Codes;
        bindingParser = require("paperclip/lib/translate/binding/parser.js");
        RootExpression = require("paperclip/lib/translate/template/expressions/root.js");
        NodeExpression = require("paperclip/lib/translate/template/expressions/node.js");
        StringExpression = require("paperclip/lib/translate/template/expressions/string.js");
        BindingExpression = require("paperclip/lib/translate/template/expressions/binding.js");
        ChildrenExpression = require("paperclip/lib/translate/template/expressions/children.js");
        AttributeExpression = require("paperclip/lib/translate/template/expressions/attribute.js");
        AttributesExpression = require("paperclip/lib/translate/template/expressions/attributes.js");
        CollectionExpression = require("paperclip/lib/translate/template/expressions/collection.js");
        TextStringExpression = require("paperclip/lib/translate/template/expressions/textString.js");
        TextBindingExpression = require("paperclip/lib/translate/template/expressions/textBinding.js");
        StringNodeExpression = require("paperclip/lib/translate/template/expressions/stringNode.js");
        Parser = function(_super) {
            __extends(Parser, _super);
            function Parser() {
                Parser.__super__.constructor.call(this);
                this._t = new Tokenizer;
            }
            Parser.prototype._parse = function() {
                var expr, expressions, i;
                expressions = [];
                i = 0;
                this._nextCode();
                while (this._t.current) {
                    expr = this._parseExpression();
                    if (expr) {
                        expressions.push(expr);
                    }
                }
                return new RootExpression(new CollectionExpression(expressions));
            };
            Parser.prototype._parseExpression = function() {
                var ccode;
                if (!(ccode = this._currentCode())) {
                    return null;
                }
                if (ccode === TokenCodes.LT) {
                    return this._parseNode();
                } else if (ccode === TokenCodes.SBLOCK) {
                    return this._parseBindingBlock();
                } else if (ccode === TokenCodes.SN) {
                    return this._parseStringNode();
                } else {
                    return this._parseText();
                }
            };
            Parser.prototype._parseStringNode = function() {
                var cs;
                cs = this._currentString();
                this._nextCode();
                return new StringNodeExpression(cs);
            };
            Parser.prototype._parseNode = function() {
                var attributes, cchar, children, name;
                name = this._nextString();
                this._nextCode();
                attributes = this._parseAttributes();
                while ((cchar = this._currentCode()) && cchar) {
                    if (cchar === TokenCodes.GT) {
                        this._nextCode();
                        children = this._parseChildren(name);
                        break;
                    } else if (cchar === TokenCodes.ETNC) {
                        this._nextCode();
                        break;
                    } else {
                        this._nextCode();
                    }
                }
                return new NodeExpression(name, attributes, children);
            };
            Parser.prototype._parseAttributes = function() {
                var attrs, ccode;
                attrs = [];
                while (ccode = this._currentCode()) {
                    if ((TokenCodes.GT | TokenCodes.ETNC) & ccode) {
                        break;
                    }
                    if (ccode === TokenCodes.WS) {
                        this._nextCode();
                        continue;
                    }
                    attrs.push(this._parseAttribute());
                }
                if (!attrs.length) {
                    return null;
                }
                return new AttributesExpression(attrs);
            };
            Parser.prototype._parseChildren = function(nodeName) {
                var ccode, children, ended;
                children = [];
                ended = false;
                while ((ccode = this._currentCode()) && ccode) {
                    if ((TokenCodes.GT | TokenCodes.EBLOCK) & ccode) {
                        break;
                    }
                    if (ccode === TokenCodes.ETAG) {
                        ended = true;
                        this._nextCode();
                        break;
                    }
                    children.push(this._parseExpression());
                }
                if (!ended) {
                    throw new Error("tag <" + nodeName + "> has no ending tag </" + nodeName + ">");
                }
                if (!children.length) {
                    return null;
                }
                return new CollectionExpression(children);
            };
            Parser.prototype._parseAttribute = function() {
                var name, value;
                name = this._currentString();
                if (this._nextCode() === TokenCodes.EQ) {
                    this._nextCodeSkipWs();
                    value = this._parseAttributeValue();
                }
                return new AttributeExpression(name, value);
            };
            Parser.prototype._parseAttributeValue = function() {
                var quoteCode, ret;
                quoteCode = this._currentCode();
                this._nextCode();
                ret = this._parseAttrTextUntil(quoteCode);
                this._nextCodeSkipWs();
                return ret;
            };
            Parser.prototype._parseText = function() {
                return this._parseTextUntil(TokenCodes.EBLOCK | TokenCodes.SBLOCK | TokenCodes.LT | TokenCodes.ETAG);
            };
            Parser.prototype._parseTextUntil = function(scode) {
                var ccode, items, str;
                items = [];
                while (!((ccode = this._currentCode()) & scode) && ccode) {
                    if (ccode === TokenCodes.LM) {
                        items.push(this._parseTextBinding());
                    } else {
                        str = this._parseTextString(TokenCodes.LM | scode);
                        if (str) {
                            items.push(str);
                        }
                    }
                }
                return new CollectionExpression(items);
            };
            Parser.prototype._parseAttrTextUntil = function(scode) {
                var ccode, items, str;
                items = [];
                while (!((ccode = this._currentCode()) & scode) && ccode) {
                    if (ccode === TokenCodes.LM) {
                        items.push(this._parseScript());
                    } else {
                        str = this._parseString(TokenCodes.LM | scode);
                        if (str) {
                            items.push(str);
                        }
                    }
                }
                return new CollectionExpression(items);
            };
            Parser.prototype._parseString = function(scode) {
                var buffer, ccode;
                buffer = [];
                while (!((ccode = this._currentCode()) & scode) && ccode) {
                    buffer.push(this._currentString());
                    this._nextCode();
                }
                return new StringExpression(buffer.join(""));
            };
            Parser.prototype._parseTextString = function(scode) {
                return new TextStringExpression(this._parseString(scode));
            };
            Parser.prototype._parseBindingBlock = function(isChild) {
                var ccode, child, children, script;
                script = this._parseScript(isChild);
                children = [];
                while ((ccode = this._currentCode()) !== TokenCodes.EBLOCK && ccode) {
                    children.push(this._parseExpression());
                }
                this._nextCode();
                if (this._currentCode() !== TokenCodes.RM) {
                    this._t.putBack();
                    child = this._parseBindingBlock(true);
                } else {
                    this._nextCode();
                }
                return new BindingExpression(script, new CollectionExpression(children), child);
            };
            Parser.prototype._parseTextBinding = function() {
                return new TextBindingExpression(this._parseScript());
            };
            Parser.prototype._parseScript = function(isChild) {
                var buffer, ccode, script;
                this._nextCode();
                buffer = [];
                while ((ccode = this._currentCode()) !== TokenCodes.RM && ccode) {
                    buffer.push(this._currentString());
                    this._nextCode();
                }
                if (isChild) {
                    buffer.unshift("/");
                }
                script = bindingParser.parse(buffer.join(""));
                this._nextCode();
                return script;
            };
            return Parser;
        }(BaseParser);
        module.exports = new Parser;
        return module.exports;
    });
    define("paperclip/lib/translate/base/parser.js", function(require, module, exports, __dirname, __filename) {
        var Parser;
        Parser = function() {
            function Parser(_t) {
                this._t = _t;
            }
            Parser.prototype.parse = function(source) {
                this._source = source;
                this._t.source(source);
                return this._parse();
            };
            Parser.prototype._parse = function() {};
            Parser.prototype._expectNextCode = function(code) {
                if (this._nextCode() !== code) {
                    return this._error();
                }
            };
            Parser.prototype._expectCurrentCode = function(code) {
                if (this._currentCode() !== code) {
                    return this._error();
                }
            };
            Parser.prototype._nextCode = function() {
                var _ref;
                return (_ref = this._t.next()) != null ? _ref[0] : void 0;
            };
            Parser.prototype._nextCodeSkipWs = function() {
                while (/[\r\n\s\t]+/.test(this._nextString())) {
                    true;
                }
                return this._currentCode();
            };
            Parser.prototype.skipWhitespace = function() {
                var _ref;
                return (_ref = this._t).skipWhitespace.apply(_ref, arguments);
            };
            Parser.prototype._nextString = function() {
                var _ref;
                return (_ref = this._t.next()) != null ? _ref[1] : void 0;
            };
            Parser.prototype._currentCode = function() {
                var _ref;
                return (_ref = this._t.current) != null ? _ref[0] : void 0;
            };
            Parser.prototype._currentString = function() {
                var _ref;
                return (_ref = this._t.current) != null ? _ref[1] : void 0;
            };
            Parser.prototype._error = function() {
                var buffer;
                if (!this._t.current) {
                    throw new Error("\n\nUnexpected End Of File\n\n");
                }
                buffer = "\n\nUnexpected Token: " + this._t.current[1] + "\n\n";
                buffer += this._bufferPosInfo();
                throw new Error(buffer);
            };
            Parser.prototype._bufferPosInfo = function() {
                var buffer, char, epos, n, spos, _i, _ref;
                buffer = this._source + "\n";
                epos = this._t.current[2];
                spos = epos - this._t.current[1].length - 1;
                for (n = _i = 0, _ref = this._source.length; 0 <= _ref ? _i <= _ref : _i >= _ref; n = 0 <= _ref ? ++_i : --_i) {
                    if (n > spos && n < epos) {
                        char = "^";
                    } else {
                        char = "-";
                    }
                    buffer += char;
                }
                buffer += "\n\n";
                return buffer;
            };
            return Parser;
        }();
        module.exports = Parser;
        return module.exports;
    });
    define("paperclip/lib/translate/template/tokenizer.js", function(require, module, exports, __dirname, __filename) {
        var BaseTokenizer, Codes, Tokenizer, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BaseTokenizer = require("paperclip/lib/translate/base/tokenizer.js");
        Codes = function() {
            function Codes() {}
            Codes.OTHER = -1;
            Codes.WORD = 2;
            Codes.LT = Codes.WORD << 1;
            Codes.GT = Codes.LT << 1;
            Codes.ETNC = Codes.GT << 1;
            Codes.BS = Codes.ETNC << 1;
            Codes.EQ = Codes.BS << 1;
            Codes.STRING = Codes.EQ << 1;
            Codes.LM = Codes.STRING << 1;
            Codes.RM = Codes.LM << 1;
            Codes.SBLOCK = Codes.RM << 1;
            Codes.EBLOCK = Codes.SBLOCK << 1;
            Codes.QUOTE = Codes.EBLOCK << 1;
            Codes.SQUOTE = Codes.QUOTE << 1;
            Codes.ETAG = Codes.SQUOTE << 1;
            Codes.BLOCK = Codes.ETAG << 1;
            Codes.CHAR = Codes.BLOCK << 1;
            Codes.COMMENT = Codes.CHAR << 1;
            Codes.HASH = Codes.COMMENT << 1;
            Codes.WS = Codes.HASH << 1;
            Codes.SN = Codes.WS << 1;
            return Codes;
        }();
        Tokenizer = function(_super) {
            __extends(Tokenizer, _super);
            Tokenizer.Codes = Codes;
            function Tokenizer() {
                Tokenizer.__super__.constructor.call(this);
                this._s.skipWhitespace(false);
            }
            Tokenizer.prototype._next = function() {
                var buffer, cchar, word;
                if (this._s.isAZ()) {
                    return this._t(Codes.WORD, this._s.next(/[$_\-a-zA-Z0-9]+/));
                }
                if ((cchar = this._s.cchar()) === "<") {
                    if (this._s.peek(4) === "<!--") {
                        this._s.skip(4);
                        buffer = [ "<!--" ];
                        while ((cchar = this._s.cchar()) && cchar) {
                            if (cchar === "-") {
                                if (this._s.peek(2) === "->") {
                                    this._s.skip(2);
                                    buffer.push("->");
                                    break;
                                }
                            }
                            buffer.push(cchar);
                            this._s.nextChar();
                        }
                        return this._next();
                    }
                    if (this._s.peek(2) === "<!") {
                        buffer = [];
                        while ((cchar = this._s.cchar()) && cchar) {
                            buffer.push(cchar);
                            if (cchar === ">") {
                                break;
                            }
                            this._s.nextChar();
                        }
                        return this._t(Codes.SN, buffer.join(""));
                    } else {
                        if (this._s.peek(2) === "</") {
                            word = this._s.next(/[a-zA-Z0-9]+/);
                            this._s.skip(1);
                            return this._t(Codes.ETAG, word);
                        }
                        return this._t(Codes.LT, "<");
                    }
                } else if (cchar === "/") {
                    if (this._s.peek(2) === "/>") {
                        this._s.skip(1);
                        return this._t(Codes.ETNC, "/>");
                    }
                    return this._t(Codes.BS, "/");
                } else if (cchar === ">") {
                    return this._t(Codes.GT, ">");
                } else if (this._s.isWs()) {
                    this._s.next(/[\s\r\n\t]+/);
                    return this._t(Codes.WS, " ");
                } else if (cchar === "{") {
                    if (this._s.peek(3) === "{{/") {
                        this._s.skip(2);
                        return this._t(Codes.EBLOCK, "{{/");
                    }
                    if (this._s.peek(3) === "{{#") {
                        this._s.skip(2);
                        return this._t(Codes.SBLOCK, "{{#");
                    }
                    if (this._s.peek(2) === "{{") {
                        this._s.nextChar();
                        return this._t(Codes.LM, "{{");
                    }
                } else if (cchar === "}") {
                    if (this._s.peek(2) === "}}" && this._s.peek(3) !== "}}}") {
                        this._s.nextChar();
                        return this._t(Codes.RM, "}}");
                    }
                } else if (cchar === "=") {
                    return this._t(Codes.EQ, "=");
                } else if (cchar === '"') {
                    return this._t(Codes.QUOTE, '"');
                } else if (cchar === "'") {
                    return this._t(Codes.SQUOTE, "'");
                } else if (cchar === "#") {
                    return this._t(Codes.HASH, "#");
                }
                return this._t(Codes.CHAR, this._s.cchar());
            };
            return Tokenizer;
        }(BaseTokenizer);
        module.exports = Tokenizer;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/parser.js", function(require, module, exports, __dirname, __filename) {
        var BaseParser, CollectionExpression, FnExpression, GroupExpression, JsExpression, ModifierExpression, OptionExpression, OptionsExpression, ParamsExpression, Parser, RefExpression, RefPathExpression, ScriptExpression, ScriptsExpression, StringExpression, TokenCodes, Tokenizer, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        Tokenizer = require("paperclip/lib/translate/binding/tokenizer.js");
        TokenCodes = Tokenizer.codes;
        BaseParser = require("paperclip/lib/translate/base/parser.js");
        FnExpression = require("paperclip/lib/translate/binding/expressions/fn.js");
        JsExpression = require("paperclip/lib/translate/binding/expressions/js.js");
        RefExpression = require("paperclip/lib/translate/binding/expressions/ref.js");
        GroupExpression = require("paperclip/lib/translate/binding/expressions/group.js");
        ParamsExpression = require("paperclip/lib/translate/binding/expressions/params.js");
        StringExpression = require("paperclip/lib/translate/binding/expressions/string.js");
        ScriptExpression = require("paperclip/lib/translate/binding/expressions/script.js");
        OptionExpression = require("paperclip/lib/translate/binding/expressions/option.js");
        ScriptsExpression = require("paperclip/lib/translate/binding/expressions/scripts.js");
        OptionsExpression = require("paperclip/lib/translate/binding/expressions/options.js");
        RefPathExpression = require("paperclip/lib/translate/binding/expressions/refPath.js");
        ModifierExpression = require("paperclip/lib/translate/binding/expressions/modifier.js");
        CollectionExpression = require("paperclip/lib/translate/base/collectionExpression.js");
        Parser = function(_super) {
            __extends(Parser, _super);
            function Parser() {
                Parser.__super__.constructor.call(this, new Tokenizer);
            }
            Parser.prototype._parse = function() {
                this._nextCode();
                return this._parseActionsOrOptions();
            };
            Parser.prototype._parseActionsOrOptions = function() {
                var actions, isExpr, pn;
                actions = [];
                isExpr = !(pn = this._t.peekNext()) || pn[0] !== TokenCodes.COLON;
                if (this._t.current[0] === TokenCodes.BS) {
                    this._nextCode();
                    isExpr = false;
                }
                if (isExpr) {
                    return new ScriptExpression(void 0, this._parseActionOptions());
                }
                while (this._t.current) {
                    actions.push(this._parseAction());
                    if (this._currentCode() === TokenCodes.COMA) {
                        this._nextCode();
                    }
                }
                return new ScriptsExpression(actions);
            };
            Parser.prototype._parseAction = function() {
                var name;
                name = this._currentString();
                this._nextCode();
                this._nextCode();
                return new ScriptExpression(name, this._parseActionOptions());
            };
            Parser.prototype._parseActionOptions = function() {
                switch (this._currentCode()) {
                  case TokenCodes.LB:
                    return this._parseMultiOptions();
                  default:
                    return this._parseReference();
                }
            };
            Parser.prototype._parseMultiOptions = function() {
                var c, name, options;
                options = [];
                this._nextCode();
                while ((c = this._currentCode()) !== TokenCodes.RB) {
                    name = this._currentString();
                    this._expectNextCode(TokenCodes.COLON);
                    this._nextCode();
                    options.push(new OptionExpression(name, this._parseActionOptions()));
                    if (this._currentCode() === TokenCodes.COMA) {
                        this._nextCode();
                    }
                }
                this._nextCode();
                return new OptionsExpression(options);
            };
            Parser.prototype._parseReference = function() {
                var c, expressions, modifiers;
                expressions = [];
                modifiers = [];
                while (c = this._currentCode()) {
                    if (c === TokenCodes.VAR) {
                        expressions.push(this._parseRef());
                        c = this._currentCode();
                    }
                    if (c === TokenCodes.LP) {
                        expressions.push(this._parseGroup());
                        c = this._currentCode();
                    }
                    if (c === TokenCodes.LB) {
                        expressions.push(this._parseActionOptions());
                        c = this._currentCode();
                    }
                    if (c === TokenCodes.STRING) {
                        expressions.push(new StringExpression(this._currentString()));
                        c = this._nextCode();
                    }
                    while (c === TokenCodes.PIPE) {
                        expressions.push(this._parsePipe(expressions.pop()));
                        c = this._currentCode();
                    }
                    if (~[ TokenCodes.RP, TokenCodes.RB ].indexOf(c)) {
                        break;
                    }
                    if (!c || ~[ TokenCodes.COMA ].indexOf(c)) {
                        break;
                    }
                    expressions.push(new JsExpression(this._currentString()));
                    this._nextCode();
                }
                if (!expressions.length) {
                    return void 0;
                }
                return new CollectionExpression(expressions);
            };
            Parser.prototype._parsePipe = function(expressions) {
                var name, params;
                this._nextCode();
                name = this._currentString();
                params = [];
                this._nextCode();
                return new ModifierExpression(name, this._parseParams(), expressions);
            };
            Parser.prototype._parseParams = function() {
                return new ParamsExpression(this._parseParams2());
            };
            Parser.prototype._parseParams2 = function() {
                var c, params;
                this._expectCurrentCode(TokenCodes.LP);
                params = [];
                while (c = this._nextCode()) {
                    if (c === TokenCodes.RP) {
                        break;
                    }
                    params.push(this._parseReference());
                    c = this._currentCode();
                    if (c !== TokenCodes.COMA) {
                        break;
                    }
                }
                this._nextCode();
                return params;
            };
            Parser.prototype._parseGroup = function() {
                return new GroupExpression(this._parseParams2());
            };
            Parser.prototype._parseRef = function() {
                var assign, c, castAs, name, refs;
                c = this._currentCode();
                refs = [];
                assign = null;
                while (c === TokenCodes.VAR) {
                    name = this._currentString();
                    if ((c = this._nextCode()) === TokenCodes.LP) {
                        refs.push(new FnExpression(name, this._parseParams()));
                        c = this._currentCode();
                    } else {
                        refs.push(new RefExpression(name));
                    }
                    if (c === TokenCodes.DOT) {
                        c = this._nextCode();
                    }
                }
                if (c === TokenCodes.AS) {
                    this._nextCode();
                    castAs = this._currentString();
                    this._nextCode();
                }
                if (c === TokenCodes.ASSIGN) {
                    this._nextCode();
                    assign = this._parseReference();
                }
                return new RefPathExpression(refs, castAs, assign);
            };
            return Parser;
        }(BaseParser);
        module.exports = new Parser;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/root.js", function(require, module, exports, __dirname, __filename) {
        var RootExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        RootExpression = function(_super) {
            __extends(RootExpression, _super);
            RootExpression.prototype._method = "html";
            function RootExpression(children, modExports) {
                this.children = children;
                this.modExports = modExports != null ? modExports : true;
                RootExpression.__super__.constructor.call(this);
                this.addChild(children);
            }
            RootExpression.prototype.toString = function() {
                var buffer;
                buffer = [];
                if (this.modExports) {
                    buffer.push("module.exports = ");
                }
                buffer.push("function(fragment, block, element, text, parse, modifiers){ return fragment([ " + this.children + " ]) }");
                return buffer.join(" ");
            };
            return RootExpression;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = RootExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/node.js", function(require, module, exports, __dirname, __filename) {
        var NodeExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        NodeExpression = function(_super) {
            __extends(NodeExpression, _super);
            NodeExpression.prototype._type = "node";
            function NodeExpression(name, attributes, children) {
                this.name = name;
                this.attributes = attributes;
                this.children = children;
                NodeExpression.__super__.constructor.call(this);
                if (attributes) {
                    this.addChild(this.attributes);
                }
                if (children) {
                    this.addChild(this.children);
                }
            }
            NodeExpression.prototype.toJsString = function() {
                var buffer, options;
                buffer = [ "element('" + this.name + "'" ];
                options = [];
                if (this.attributes) {
                    buffer.push(", " + this.attributes.toString() + " ");
                } else {
                    buffer.push(", {}");
                }
                if (this.children) {
                    buffer.push(", [ " + this.children.toString() + " ] ");
                }
                buffer.push(")");
                return buffer.join("");
            };
            NodeExpression.prototype.toString = function() {
                return this.toJsString();
            };
            return NodeExpression;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = NodeExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/string.js", function(require, module, exports, __dirname, __filename) {
        var StringExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        StringExpression = function(_super) {
            __extends(StringExpression, _super);
            StringExpression.prototype._type = "string";
            function StringExpression(value) {
                this.value = value;
                StringExpression.__super__.constructor.call(this);
            }
            StringExpression.prototype.toString = function() {
                return "'" + this.value.replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'";
            };
            StringExpression.prototype.toJsString = function() {
                return "'" + this.toString() + "'";
            };
            return StringExpression;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = StringExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/binding.js", function(require, module, exports, __dirname, __filename) {
        var Binding, RootExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        RootExpression = require("paperclip/lib/translate/template/expressions/root.js");
        Binding = function(_super) {
            __extends(Binding, _super);
            Binding.prototype._type = "binding";
            function Binding(script, children, childBinding) {
                this.script = script;
                Binding.__super__.constructor.call(this);
                this.children = new RootExpression(children, false);
                if (childBinding) {
                    this.childBinding = new RootExpression(childBinding, false);
                }
                this.addChild(this.children);
            }
            Binding.prototype.toJsString = function() {
                return "this." + this.toMethodString();
            };
            Binding.prototype.toString = function() {
                return "" + this.toMethodString();
            };
            Binding.prototype.toMethodString = function() {
                var buffer;
                buffer = [ "block(" + this.script + ", " + this.children.toString() ];
                if (this.childBinding) {
                    buffer.push(", " + this.childBinding.toString());
                }
                buffer.push(")");
                return buffer.join("");
            };
            return Binding;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = Binding;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/children.js", function(require, module, exports, __dirname, __filename) {
        var ChildrenExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        ChildrenExpression = function(_super) {
            __extends(ChildrenExpression, _super);
            ChildrenExpression.prototype._type = "children";
            function ChildrenExpression(items) {
                ChildrenExpression.__super__.constructor.call(this, items);
            }
            ChildrenExpression.prototype.toJsString = function() {
                return "{ children: " + ChildrenExpression.__super__.toJsString.call(this) + " }";
            };
            ChildrenExpression.prototype.toString = function() {
                return this.items.join("");
            };
            return ChildrenExpression;
        }(require("paperclip/lib/translate/template/expressions/collection.js"));
        module.exports = ChildrenExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/attribute.js", function(require, module, exports, __dirname, __filename) {
        var AttributeExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        AttributeExpression = function(_super) {
            __extends(AttributeExpression, _super);
            AttributeExpression.prototype._type = "attribute";
            function AttributeExpression(name, value) {
                this.name = name;
                this.value = value;
                AttributeExpression.__super__.constructor.call(this);
                if (this.value) {
                    this.addChild(this.value);
                }
            }
            AttributeExpression.prototype.hasBinding = function() {
                var part, _i, _len, _ref;
                if (!this.value) {
                    return false;
                }
                _ref = this.value.items;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    part = _ref[_i];
                    if (part._binding) {
                        return true;
                    }
                }
                return false;
            };
            AttributeExpression.prototype.toJsString = function() {
                return this.value;
            };
            return AttributeExpression;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = AttributeExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/attributes.js", function(require, module, exports, __dirname, __filename) {
        var AttributesExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        AttributesExpression = function(_super) {
            __extends(AttributesExpression, _super);
            function AttributesExpression(items) {
                AttributesExpression.__super__.constructor.call(this, items);
            }
            AttributesExpression.prototype.hasBinding = function() {
                var attr, _i, _len, _ref;
                _ref = this._children;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    attr = _ref[_i];
                    if (attr.hasBinding()) {
                        return true;
                    }
                }
                return false;
            };
            AttributesExpression.prototype.toString = function() {
                var attr, params, _i, _len, _ref;
                params = [];
                _ref = this._children;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    attr = _ref[_i];
                    params.push("'" + attr.name + "':[" + (attr.value ? attr.value.toString() : "true") + "]");
                }
                return "{" + params.join(",") + "}";
            };
            return AttributesExpression;
        }(require("paperclip/lib/translate/template/expressions/collection.js"));
        module.exports = AttributesExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/collection.js", function(require, module, exports, __dirname, __filename) {
        var Expression, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        Expression = function(_super) {
            __extends(Expression, _super);
            function Expression() {
                _ref = Expression.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            Expression.prototype.toString = function() {
                return "" + this.map("toString", ",");
            };
            return Expression;
        }(require("paperclip/lib/translate/base/collectionExpression.js"));
        module.exports = Expression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/textString.js", function(require, module, exports, __dirname, __filename) {
        var TextStringExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        TextStringExpression = function(_super) {
            __extends(TextStringExpression, _super);
            TextStringExpression.prototype._type = "textString";
            function TextStringExpression(value) {
                this.value = value;
                TextStringExpression.__super__.constructor.call(this);
            }
            TextStringExpression.prototype.toString = function() {
                return "text(" + this.value + ")";
            };
            return TextStringExpression;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = TextStringExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/textBinding.js", function(require, module, exports, __dirname, __filename) {
        var TextBindingExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        TextBindingExpression = function(_super) {
            __extends(TextBindingExpression, _super);
            TextBindingExpression.prototype._type = "textBinding";
            TextBindingExpression.prototype._method = "textBinding";
            TextBindingExpression.prototype._binding = true;
            function TextBindingExpression(binding) {
                this.binding = binding;
                TextBindingExpression.__super__.constructor.call(this);
            }
            TextBindingExpression.prototype.toString = function() {
                return "block(" + this.binding + ")";
            };
            return TextBindingExpression;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = TextBindingExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/stringNode.js", function(require, module, exports, __dirname, __filename) {
        var StringExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        StringExpression = function(_super) {
            __extends(StringExpression, _super);
            StringExpression.prototype._type = "string";
            function StringExpression(value) {
                this.value = value;
                StringExpression.__super__.constructor.call(this);
            }
            StringExpression.prototype.toString = function() {
                return "parse('" + this.value.replace(/'/g, "\\'").replace(/\n/g, "\\n") + "')";
            };
            return StringExpression;
        }(require("paperclip/lib/translate/template/expressions/base.js"));
        module.exports = StringExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/base/tokenizer.js", function(require, module, exports, __dirname, __filename) {
        var Tokenizer, strscan;
        strscan = require("strscanner/lib/index.js");
        Tokenizer = function() {
            function Tokenizer() {
                this._s = strscan("", {
                    skipWhitespace: true
                });
                this._pool = [];
            }
            Tokenizer.prototype.peekNext = function() {
                var c, next;
                c = this.current;
                next = this.next();
                this.putBack();
                this.current = c;
                return next;
            };
            Tokenizer.prototype.source = function(value) {
                if (!arguments.length) {
                    return this._source;
                }
                this._s.source(this._source = value);
                return this;
            };
            Tokenizer.prototype.skipWhitespace = function(value) {
                if (!arguments.length) {
                    return this._s.skipWhitespace();
                }
                return this._s.skipWhitespace(value);
            };
            Tokenizer.prototype.putBack = function() {
                if (this.current) {
                    return this._pool.push(this.current);
                }
            };
            Tokenizer.prototype.next = function() {
                if (this._pool.length) {
                    return this.current = this._pool.pop();
                }
                if (this._s.eof()) {
                    return this.current = null;
                }
                return this._next() || this._t(-1, this._s.cchar());
            };
            Tokenizer.prototype._tstring = function(code) {
                var buffer, c, ccode, cscode, skip;
                ccode = this._s.ccode();
                if (ccode === 39 || ccode === 34) {
                    skip = this._s.skipWhitespace();
                    this._s.skipWhitespace(false);
                    buffer = [];
                    while ((c = this._s.nextChar()) && !this._s.eof()) {
                        cscode = this._s.ccode();
                        if (cscode === 92) {
                            buffer.push(this._s.nextChar());
                            continue;
                        }
                        if (cscode === ccode) {
                            break;
                        }
                        buffer.push(c);
                    }
                    this._s.skipWhitespace(skip);
                    return this._t(code, buffer.join(""));
                }
                return false;
            };
            Tokenizer.prototype._next = function() {};
            Tokenizer.prototype._t = function(code, value) {
                var p;
                p = this._s.pos();
                this._s.nextChar();
                return this.current = [ code, value, p ];
            };
            return Tokenizer;
        }();
        module.exports = Tokenizer;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/tokenizer.js", function(require, module, exports, __dirname, __filename) {
        var BaseTokenizer, Codes, Tokenizer, key, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        BaseTokenizer = require("paperclip/lib/translate/base/tokenizer.js");
        Codes = function() {
            function Codes() {}
            Codes.OTHER = -1;
            Codes.WORD = 256;
            Codes.STRING = Codes.WORD + 1;
            Codes.VAR = Codes.STRING + 1;
            Codes.WS = Codes.VAR + 1;
            Codes.NUMBER = Codes.WS + 1;
            Codes.BOOL = Codes.NUMBER + 1;
            Codes.UNDEF = Codes.BOOL + 1;
            Codes.AS = Codes.UNDEF + 1;
            Codes.OR = Codes.AS + 1;
            Codes.ASSIGN = Codes.OR + 1;
            Codes.EQ = Codes.ASSIGN + 1;
            Codes.NEQ = Codes.EQ + 1;
            Codes.NOT = Codes.NEQ + 1;
            Codes.DOLLAR = 36;
            Codes.LP = 40;
            Codes.RP = 41;
            Codes.COMA = 44;
            Codes.DOT = 46;
            Codes.BS = 47;
            Codes.COLON = 58;
            Codes.SEMI_COLON = 59;
            Codes.AT = 64;
            Codes.LB = 123;
            Codes.PIPE = 124;
            Codes.RB = 125;
            Codes.byCodes = {};
            Codes.key = function(code) {
                var key;
                for (key in Codes) {
                    if (Codes[key] === code) {
                        return key;
                    }
                }
            };
            return Codes;
        }();
        for (key in Codes) {
            Codes.byCodes[Codes[key]] = Codes[key];
        }
        Tokenizer = function(_super) {
            __extends(Tokenizer, _super);
            function Tokenizer() {
                _ref = Tokenizer.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            Tokenizer.prototype.codes = Codes;
            Tokenizer.codes = Codes;
            Tokenizer.prototype._next = function() {
                var ccode, t, word;
                if (this._s.isAZ() || (ccode = this._s.ccode()) === 36 || ccode === 95 || ccode === 64) {
                    word = this._s.next(/[_$@a-zA-Z0-9]+/);
                    if (/true|false/.test(word)) {
                        return this._t(Codes.BOOL, word);
                    }
                    if (/undefined|null/.test(word)) {
                        return this._t(Codes.UNDEF, word);
                    }
                    if (word === "as") {
                        return this._t(Codes.AS, word);
                    }
                    return this._t(Codes.VAR, word);
                } else if (t = this._tstring(Codes.STRING)) {
                    return t;
                } else if (this._s.is09()) {
                    return this._t(Codes.NUMBER, this._s.nextNumber());
                } else if (ccode === 33) {
                    if (this._s.peek(2) === "!=") {
                        this._s.skip(1);
                        return this._t(Codes.NEQ, "!=");
                    } else {
                        return this._t(Codes.NOT, "!");
                    }
                } else if (ccode === 61) {
                    if (this._s.peek(2) === "==") {
                        this._s.skip(1);
                        return this._t(Codes.EQ, "==");
                    } else {
                        return this._t(Codes.ASSIGN, "=");
                    }
                } else if (ccode === 124 && this._s.peek(2) === "||") {
                    this._s.nextChar();
                    return this._t(Codes.OR, "||");
                } else if (Codes.byCodes[ccode]) {
                    return this._t(Codes.byCodes[ccode], this._s.cchar());
                }
            };
            return Tokenizer;
        }(BaseTokenizer);
        module.exports = Tokenizer;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/fn.js", function(require, module, exports, __dirname, __filename) {
        var FnExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        base = require("paperclip/lib/translate/base/expression.js");
        FnExpression = function(_super) {
            __extends(FnExpression, _super);
            FnExpression.prototype._type = "fn";
            function FnExpression(name, params) {
                this.name = name;
                this.params = params;
                FnExpression.__super__.constructor.call(this);
                this.addChild(this.params);
            }
            FnExpression.prototype.toString = function() {
                return this.name;
            };
            return FnExpression;
        }(base.Expression);
        module.exports = FnExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/js.js", function(require, module, exports, __dirname, __filename) {
        var JSExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        base = require("paperclip/lib/translate/base/expression.js");
        JSExpression = function(_super) {
            __extends(JSExpression, _super);
            JSExpression.prototype._type = "js";
            function JSExpression(value) {
                this.value = value;
                JSExpression.__super__.constructor.call(this);
            }
            JSExpression.prototype.toString = function() {
                return this.value;
            };
            return JSExpression;
        }(base.Expression);
        module.exports = JSExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/ref.js", function(require, module, exports, __dirname, __filename) {
        var RefExpression;
        RefExpression = function() {
            RefExpression.prototype._type = "ref";
            function RefExpression(name) {
                this._children = [];
                if (name.substr(0, 1) === "@") {
                    this.self = true;
                    this.name = name.substr(1);
                } else {
                    this.name = name;
                }
            }
            RefExpression.prototype.toString = function() {
                return this.name;
            };
            return RefExpression;
        }();
        module.exports = RefExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/group.js", function(require, module, exports, __dirname, __filename) {
        var GroupExpresion, ParamsExpression, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        ParamsExpression = require("paperclip/lib/translate/binding/expressions/params.js");
        GroupExpresion = function(_super) {
            __extends(GroupExpresion, _super);
            function GroupExpresion() {
                _ref = GroupExpresion.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            GroupExpresion.prototype._type = "group";
            GroupExpresion.prototype.toString = function() {
                return "(" + GroupExpresion.__super__.toString.call(this) + ")";
            };
            return GroupExpresion;
        }(ParamsExpression);
        module.exports = GroupExpresion;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/params.js", function(require, module, exports, __dirname, __filename) {
        var CollectionExpression, ParamsExpression, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        CollectionExpression = require("paperclip/lib/translate/base/collectionExpression.js");
        ParamsExpression = function(_super) {
            __extends(ParamsExpression, _super);
            function ParamsExpression() {
                _ref = ParamsExpression.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            ParamsExpression.prototype._type = "params";
            ParamsExpression.prototype.toString = function() {
                return this.items.map(function(item) {
                    return item.toString();
                }).join(",");
            };
            return ParamsExpression;
        }(CollectionExpression);
        module.exports = ParamsExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/string.js", function(require, module, exports, __dirname, __filename) {
        var StringExpression, base;
        base = require("paperclip/lib/translate/base/expression.js");
        StringExpression = function() {
            StringExpression.prototype._type = "string";
            function StringExpression(value) {
                this.value = value;
                this._children = [];
            }
            StringExpression.prototype.toString = function() {
                return "'" + this.value.replace(/\'/g, "\\'").replace(/\n/g, "\\n") + "'";
            };
            return StringExpression;
        }();
        module.exports = StringExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/script.js", function(require, module, exports, __dirname, __filename) {
        var ActionExpression, base, findRefs, _, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        base = require("paperclip/lib/translate/base/expression.js");
        _ = require("underscore/underscore.js");
        findRefs = function(expr, refs) {
            var child, _i, _len, _ref;
            if (refs == null) {
                refs = [];
            }
            if (!expr) {
                return [];
            }
            if (expr._type === "refPath") {
                refs.push(expr);
            }
            _ref = expr._children;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                findRefs(child, refs);
            }
            return refs;
        };
        ActionExpression = function(_super) {
            __extends(ActionExpression, _super);
            ActionExpression.prototype._type = "script";
            function ActionExpression(name, options) {
                this.name = name;
                this.options = options;
                ActionExpression.__super__.constructor.call(this);
            }
            ActionExpression.prototype.toString = function() {
                var refBuffer, refs;
                refs = _.uniq(findRefs(this.options).map(function(ref) {
                    return "'" + ref.toPathString() + "'";
                }));
                refBuffer = [ "[", refs.join(","), "]" ].join("");
                return "{ fn: function(){ return " + (this.options ? this.options.toString() : "true") + "; }, refs: " + refBuffer + " }";
            };
            return ActionExpression;
        }(base.Expression);
        module.exports = ActionExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/option.js", function(require, module, exports, __dirname, __filename) {
        var OptionExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        base = require("paperclip/lib/translate/base/expression.js");
        OptionExpression = function(_super) {
            __extends(OptionExpression, _super);
            OptionExpression.prototype._type = "option";
            function OptionExpression(name, expression) {
                this.name = name;
                this.expression = expression;
                OptionExpression.__super__.constructor.call(this);
                this.addChild(expression);
            }
            OptionExpression.prototype.toString = function() {
                return "'" + this.name + "':" + this.expression;
            };
            return OptionExpression;
        }(base.Expression);
        module.exports = OptionExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/scripts.js", function(require, module, exports, __dirname, __filename) {
        var ActionsExpression, CollectionExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        CollectionExpression = require("paperclip/lib/translate/base/collectionExpression.js");
        ActionsExpression = function(_super) {
            __extends(ActionsExpression, _super);
            ActionsExpression.prototype._type = "scripts";
            function ActionsExpression(items) {
                ActionsExpression.__super__.constructor.call(this, items);
                this.actions = items;
            }
            ActionsExpression.prototype.toString = function() {
                var action, buffer, params, _i, _len, _ref;
                buffer = [ "{" ];
                params = [];
                _ref = this.actions;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    action = _ref[_i];
                    params.push("'" + action.name + "': " + action.toString());
                }
                buffer.push(params.join(","), "}");
                return buffer.join("");
            };
            return ActionsExpression;
        }(CollectionExpression);
        module.exports = ActionsExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/options.js", function(require, module, exports, __dirname, __filename) {
        var OptionsExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        base = require("paperclip/lib/translate/base/expression.js");
        OptionsExpression = function(_super) {
            __extends(OptionsExpression, _super);
            OptionsExpression.prototype._type = "options";
            function OptionsExpression(items) {
                this.items = items;
                OptionsExpression.__super__.constructor.call(this);
                this.addChild.apply(this, items);
            }
            OptionsExpression.prototype.toString = function() {
                return "{" + this.items.join(",") + "}";
            };
            return OptionsExpression;
        }(base.Expression);
        module.exports = OptionsExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/refPath.js", function(require, module, exports, __dirname, __filename) {
        var CollectionExpression, RefPathExpression, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        CollectionExpression = require("paperclip/lib/translate/base/collectionExpression.js");
        RefPathExpression = function(_super) {
            __extends(RefPathExpression, _super);
            RefPathExpression.prototype._type = "refPath";
            function RefPathExpression(items, castAs, assign) {
                this.castAs = castAs;
                this.assign = assign != null ? assign : "";
                RefPathExpression.__super__.constructor.call(this, items);
            }
            RefPathExpression.prototype.toPathString = function() {
                return this.items.join(".");
            };
            RefPathExpression.prototype.toString = function() {
                var buffer, currentChain, part, self, _i, _len, _ref;
                buffer = [ "this" ];
                currentChain = [];
                self = false;
                if (this.castAs) {
                    buffer.push(".castAs('" + this.castAs + "')");
                }
                _ref = this.items;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    part = _ref[_i];
                    if (part._type === "fn") {
                        this._pushRef(buffer, currentChain, self);
                        buffer.push(".call('", part.name, "', [");
                        buffer.push(part.params.toString(), "])");
                        currentChain = [];
                        self = false;
                    } else {
                        currentChain.push(part.name);
                        self = self || part.self;
                    }
                }
                this._pushRef(buffer, currentChain, self);
                buffer.push(".value(" + this.assign + ")");
                return buffer.join("");
            };
            RefPathExpression.prototype._pushRef = function(buffer, chain, self) {
                var command;
                if (chain.length) {
                    command = self ? "self" : "ref";
                    return buffer.push("." + command + "('", chain.join("."), "')");
                }
            };
            return RefPathExpression;
        }(CollectionExpression);
        module.exports = RefPathExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/binding/expressions/modifier.js", function(require, module, exports, __dirname, __filename) {
        var ModifierExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        base = require("paperclip/lib/translate/base/expression.js");
        ModifierExpression = function(_super) {
            __extends(ModifierExpression, _super);
            ModifierExpression.prototype._type = "modifier";
            function ModifierExpression(name, params, expression) {
                this.name = name;
                this.params = params;
                this.expression = expression;
                ModifierExpression.__super__.constructor.call(this);
                this.addChild(this.params, this.expression);
            }
            ModifierExpression.prototype.toString = function() {
                var buffer, p, params, _i, _len, _ref;
                buffer = [];
                buffer.push("modifiers");
                buffer.push("." + this.name + "(");
                params = [ this.expression.toString() ];
                _ref = this.params.items;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    p = _ref[_i];
                    params.push(p.toString());
                }
                buffer.push(params.join(","), ")");
                return buffer.join("");
            };
            return ModifierExpression;
        }(base.Expression);
        module.exports = ModifierExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/base/collectionExpression.js", function(require, module, exports, __dirname, __filename) {
        var CollectionExpression, base, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        base = require("paperclip/lib/translate/base/expression.js");
        CollectionExpression = function(_super) {
            __extends(CollectionExpression, _super);
            CollectionExpression.prototype._type = "collection";
            function CollectionExpression(items) {
                this.items = items;
                CollectionExpression.__super__.constructor.call(this);
                this.addChild.apply(this, this.items);
            }
            CollectionExpression.prototype.toString = function() {
                return this.map("toString", "");
            };
            CollectionExpression.prototype.map = function(method, join) {
                if (join == null) {
                    join = "";
                }
                return this.items.map(function(item) {
                    return item[method].call(item);
                }).join(join);
            };
            return CollectionExpression;
        }(base.Expression);
        module.exports = CollectionExpression;
        return module.exports;
    });
    define("paperclip/lib/translate/template/expressions/base.js", function(require, module, exports, __dirname, __filename) {
        var Base, _ref, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor;
            child.__super__ = parent.prototype;
            return child;
        };
        Base = function(_super) {
            __extends(Base, _super);
            function Base() {
                _ref = Base.__super__.constructor.apply(this, arguments);
                return _ref;
            }
            return Base;
        }(require("paperclip/lib/translate/base/expression.js").Expression);
        module.exports = Base;
        return module.exports;
    });
    define("strscanner/lib/index.js", function(require, module, exports, __dirname, __filename) {
        module.exports = function(source, options) {
            if (!options) {
                options = {
                    skipWhitespace: true
                };
            }
            var _cchar = "", _ccode = 0, _pos = 0, _len = 0, _src = source;
            var self = {
                source: function(value) {
                    _src = value;
                    _len = value.length;
                    self.pos(0);
                },
                skipWhitespace: function(value) {
                    if (!arguments.length) {
                        return options.skipWhitespace;
                    }
                    options.skipWhitespace = value;
                },
                eof: function() {
                    return _pos >= _len;
                },
                pos: function(value) {
                    if (!arguments.length) return _pos;
                    _pos = value;
                    _cchar = _src.charAt(value);
                    _ccode = _cchar.charCodeAt(0);
                    self.skipWs();
                },
                skip: function(count) {
                    return self.pos(Math.min(_pos + count, _len));
                },
                rewind: function(count) {
                    _pos = Math.max(_pos - count || 1, 0);
                    return _pos;
                },
                peek: function(count) {
                    return _src.substr(_pos, count || 1);
                },
                nextChar: function() {
                    self.pos(_pos + 1);
                    self.skipWs();
                    return _cchar;
                },
                skipWs: function() {
                    if (options.skipWhitespace) {
                        if (self.isWs()) {
                            self.nextChar();
                        }
                    }
                },
                cchar: function() {
                    return _cchar;
                },
                ccode: function() {
                    return _ccode;
                },
                isAZ: function() {
                    return _ccode > 64 && _ccode < 91 || _ccode > 96 && _ccode < 123;
                },
                is09: function() {
                    return _ccode > 47 && _ccode < 58;
                },
                isWs: function() {
                    return _ccode === 9 || _ccode === 10 || _ccode === 13 || _ccode === 32;
                },
                isAlpha: function() {
                    return self.isAZ() || self.is09();
                },
                matches: function(search) {
                    return !!_src.substr(_pos).match(search);
                },
                next: function(search) {
                    var buffer = _src.substr(_pos), match = buffer.match(search);
                    _pos += match.index + Math.max(0, match[0].length - 1);
                    return match[0];
                },
                nextWord: function() {
                    if (self.isAZ()) return self.next(/[a-zA-Z]+/);
                },
                nextNumber: function() {
                    if (self.is09()) return self.next(/[0-9]+/);
                },
                nextAlpha: function() {
                    if (self.isAlpha()) return self.next(/[a-zA-Z0-9]+/);
                },
                nextNonAlpha: function() {
                    if (!self.isAlpha()) return self.next(/[^a-zA-Z0-9]+/);
                },
                nextWs: function() {
                    if (self.isWs()) return self.next(/[\s\r\n\t]+/);
                },
                nextUntil: function(match) {
                    var buffer = "";
                    while (!self.eof() && !_cchar.match(match)) {
                        buffer += _cchar;
                        self.nextChar();
                    }
                    return buffer;
                },
                to: function(count) {
                    var buffer = _src.substr(_pos, count);
                    _pos += count;
                    return buffer;
                }
            };
            self.source(source);
            return self;
        };
        return module.exports;
    });
    define("paperclip/lib/translate/base/expression.js", function(require, module, exports, __dirname, __filename) {
        var Expression;
        Expression = function() {
            function Expression() {
                this._children = [];
            }
            Expression.prototype.addChild = function() {
                var child, _i, _len, _results;
                _results = [];
                for (_i = 0, _len = arguments.length; _i < _len; _i++) {
                    child = arguments[_i];
                    child._parent = this;
                    _results.push(this._children.push(child));
                }
                return _results;
            };
            return Expression;
        }();
        exports.Expression = Expression;
        return module.exports;
    });
    define("underscore/underscore.js", function(require, module, exports, __dirname, __filename) {
        (function() {
            var root = this;
            var previousUnderscore = root._;
            var breaker = {};
            var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
            var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
            var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
            var _ = function(obj) {
                if (obj instanceof _) return obj;
                if (!(this instanceof _)) return new _(obj);
                this._wrapped = obj;
            };
            if (typeof exports !== "undefined") {
                if (typeof module !== "undefined" && module.exports) {
                    exports = module.exports = _;
                }
                exports._ = _;
            } else {
                root._ = _;
            }
            _.VERSION = "1.4.4";
            var each = _.each = _.forEach = function(obj, iterator, context) {
                if (obj == null) return;
                if (nativeForEach && obj.forEach === nativeForEach) {
                    obj.forEach(iterator, context);
                } else if (obj.length === +obj.length) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        if (iterator.call(context, obj[i], i, obj) === breaker) return;
                    }
                } else {
                    for (var key in obj) {
                        if (_.has(obj, key)) {
                            if (iterator.call(context, obj[key], key, obj) === breaker) return;
                        }
                    }
                }
            };
            _.map = _.collect = function(obj, iterator, context) {
                var results = [];
                if (obj == null) return results;
                if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
                each(obj, function(value, index, list) {
                    results[results.length] = iterator.call(context, value, index, list);
                });
                return results;
            };
            var reduceError = "Reduce of empty array with no initial value";
            _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
                var initial = arguments.length > 2;
                if (obj == null) obj = [];
                if (nativeReduce && obj.reduce === nativeReduce) {
                    if (context) iterator = _.bind(iterator, context);
                    return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
                }
                each(obj, function(value, index, list) {
                    if (!initial) {
                        memo = value;
                        initial = true;
                    } else {
                        memo = iterator.call(context, memo, value, index, list);
                    }
                });
                if (!initial) throw new TypeError(reduceError);
                return memo;
            };
            _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
                var initial = arguments.length > 2;
                if (obj == null) obj = [];
                if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
                    if (context) iterator = _.bind(iterator, context);
                    return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
                }
                var length = obj.length;
                if (length !== +length) {
                    var keys = _.keys(obj);
                    length = keys.length;
                }
                each(obj, function(value, index, list) {
                    index = keys ? keys[--length] : --length;
                    if (!initial) {
                        memo = obj[index];
                        initial = true;
                    } else {
                        memo = iterator.call(context, memo, obj[index], index, list);
                    }
                });
                if (!initial) throw new TypeError(reduceError);
                return memo;
            };
            _.find = _.detect = function(obj, iterator, context) {
                var result;
                any(obj, function(value, index, list) {
                    if (iterator.call(context, value, index, list)) {
                        result = value;
                        return true;
                    }
                });
                return result;
            };
            _.filter = _.select = function(obj, iterator, context) {
                var results = [];
                if (obj == null) return results;
                if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
                each(obj, function(value, index, list) {
                    if (iterator.call(context, value, index, list)) results[results.length] = value;
                });
                return results;
            };
            _.reject = function(obj, iterator, context) {
                return _.filter(obj, function(value, index, list) {
                    return !iterator.call(context, value, index, list);
                }, context);
            };
            _.every = _.all = function(obj, iterator, context) {
                iterator || (iterator = _.identity);
                var result = true;
                if (obj == null) return result;
                if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
                each(obj, function(value, index, list) {
                    if (!(result = result && iterator.call(context, value, index, list))) return breaker;
                });
                return !!result;
            };
            var any = _.some = _.any = function(obj, iterator, context) {
                iterator || (iterator = _.identity);
                var result = false;
                if (obj == null) return result;
                if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
                each(obj, function(value, index, list) {
                    if (result || (result = iterator.call(context, value, index, list))) return breaker;
                });
                return !!result;
            };
            _.contains = _.include = function(obj, target) {
                if (obj == null) return false;
                if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
                return any(obj, function(value) {
                    return value === target;
                });
            };
            _.invoke = function(obj, method) {
                var args = slice.call(arguments, 2);
                var isFunc = _.isFunction(method);
                return _.map(obj, function(value) {
                    return (isFunc ? method : value[method]).apply(value, args);
                });
            };
            _.pluck = function(obj, key) {
                return _.map(obj, function(value) {
                    return value[key];
                });
            };
            _.where = function(obj, attrs, first) {
                if (_.isEmpty(attrs)) return first ? null : [];
                return _[first ? "find" : "filter"](obj, function(value) {
                    for (var key in attrs) {
                        if (attrs[key] !== value[key]) return false;
                    }
                    return true;
                });
            };
            _.findWhere = function(obj, attrs) {
                return _.where(obj, attrs, true);
            };
            _.max = function(obj, iterator, context) {
                if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                    return Math.max.apply(Math, obj);
                }
                if (!iterator && _.isEmpty(obj)) return -Infinity;
                var result = {
                    computed: -Infinity,
                    value: -Infinity
                };
                each(obj, function(value, index, list) {
                    var computed = iterator ? iterator.call(context, value, index, list) : value;
                    computed >= result.computed && (result = {
                        value: value,
                        computed: computed
                    });
                });
                return result.value;
            };
            _.min = function(obj, iterator, context) {
                if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                    return Math.min.apply(Math, obj);
                }
                if (!iterator && _.isEmpty(obj)) return Infinity;
                var result = {
                    computed: Infinity,
                    value: Infinity
                };
                each(obj, function(value, index, list) {
                    var computed = iterator ? iterator.call(context, value, index, list) : value;
                    computed < result.computed && (result = {
                        value: value,
                        computed: computed
                    });
                });
                return result.value;
            };
            _.shuffle = function(obj) {
                var rand;
                var index = 0;
                var shuffled = [];
                each(obj, function(value) {
                    rand = _.random(index++);
                    shuffled[index - 1] = shuffled[rand];
                    shuffled[rand] = value;
                });
                return shuffled;
            };
            var lookupIterator = function(value) {
                return _.isFunction(value) ? value : function(obj) {
                    return obj[value];
                };
            };
            _.sortBy = function(obj, value, context) {
                var iterator = lookupIterator(value);
                return _.pluck(_.map(obj, function(value, index, list) {
                    return {
                        value: value,
                        index: index,
                        criteria: iterator.call(context, value, index, list)
                    };
                }).sort(function(left, right) {
                    var a = left.criteria;
                    var b = right.criteria;
                    if (a !== b) {
                        if (a > b || a === void 0) return 1;
                        if (a < b || b === void 0) return -1;
                    }
                    return left.index < right.index ? -1 : 1;
                }), "value");
            };
            var group = function(obj, value, context, behavior) {
                var result = {};
                var iterator = lookupIterator(value || _.identity);
                each(obj, function(value, index) {
                    var key = iterator.call(context, value, index, obj);
                    behavior(result, key, value);
                });
                return result;
            };
            _.groupBy = function(obj, value, context) {
                return group(obj, value, context, function(result, key, value) {
                    (_.has(result, key) ? result[key] : result[key] = []).push(value);
                });
            };
            _.countBy = function(obj, value, context) {
                return group(obj, value, context, function(result, key) {
                    if (!_.has(result, key)) result[key] = 0;
                    result[key]++;
                });
            };
            _.sortedIndex = function(array, obj, iterator, context) {
                iterator = iterator == null ? _.identity : lookupIterator(iterator);
                var value = iterator.call(context, obj);
                var low = 0, high = array.length;
                while (low < high) {
                    var mid = low + high >>> 1;
                    iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
                }
                return low;
            };
            _.toArray = function(obj) {
                if (!obj) return [];
                if (_.isArray(obj)) return slice.call(obj);
                if (obj.length === +obj.length) return _.map(obj, _.identity);
                return _.values(obj);
            };
            _.size = function(obj) {
                if (obj == null) return 0;
                return obj.length === +obj.length ? obj.length : _.keys(obj).length;
            };
            _.first = _.head = _.take = function(array, n, guard) {
                if (array == null) return void 0;
                return n != null && !guard ? slice.call(array, 0, n) : array[0];
            };
            _.initial = function(array, n, guard) {
                return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
            };
            _.last = function(array, n, guard) {
                if (array == null) return void 0;
                if (n != null && !guard) {
                    return slice.call(array, Math.max(array.length - n, 0));
                } else {
                    return array[array.length - 1];
                }
            };
            _.rest = _.tail = _.drop = function(array, n, guard) {
                return slice.call(array, n == null || guard ? 1 : n);
            };
            _.compact = function(array) {
                return _.filter(array, _.identity);
            };
            var flatten = function(input, shallow, output) {
                each(input, function(value) {
                    if (_.isArray(value)) {
                        shallow ? push.apply(output, value) : flatten(value, shallow, output);
                    } else {
                        output.push(value);
                    }
                });
                return output;
            };
            _.flatten = function(array, shallow) {
                return flatten(array, shallow, []);
            };
            _.without = function(array) {
                return _.difference(array, slice.call(arguments, 1));
            };
            _.uniq = _.unique = function(array, isSorted, iterator, context) {
                if (_.isFunction(isSorted)) {
                    context = iterator;
                    iterator = isSorted;
                    isSorted = false;
                }
                var initial = iterator ? _.map(array, iterator, context) : array;
                var results = [];
                var seen = [];
                each(initial, function(value, index) {
                    if (isSorted ? !index || seen[seen.length - 1] !== value : !_.contains(seen, value)) {
                        seen.push(value);
                        results.push(array[index]);
                    }
                });
                return results;
            };
            _.union = function() {
                return _.uniq(concat.apply(ArrayProto, arguments));
            };
            _.intersection = function(array) {
                var rest = slice.call(arguments, 1);
                return _.filter(_.uniq(array), function(item) {
                    return _.every(rest, function(other) {
                        return _.indexOf(other, item) >= 0;
                    });
                });
            };
            _.difference = function(array) {
                var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
                return _.filter(array, function(value) {
                    return !_.contains(rest, value);
                });
            };
            _.zip = function() {
                var args = slice.call(arguments);
                var length = _.max(_.pluck(args, "length"));
                var results = new Array(length);
                for (var i = 0; i < length; i++) {
                    results[i] = _.pluck(args, "" + i);
                }
                return results;
            };
            _.object = function(list, values) {
                if (list == null) return {};
                var result = {};
                for (var i = 0, l = list.length; i < l; i++) {
                    if (values) {
                        result[list[i]] = values[i];
                    } else {
                        result[list[i][0]] = list[i][1];
                    }
                }
                return result;
            };
            _.indexOf = function(array, item, isSorted) {
                if (array == null) return -1;
                var i = 0, l = array.length;
                if (isSorted) {
                    if (typeof isSorted == "number") {
                        i = isSorted < 0 ? Math.max(0, l + isSorted) : isSorted;
                    } else {
                        i = _.sortedIndex(array, item);
                        return array[i] === item ? i : -1;
                    }
                }
                if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
                for (; i < l; i++) if (array[i] === item) return i;
                return -1;
            };
            _.lastIndexOf = function(array, item, from) {
                if (array == null) return -1;
                var hasIndex = from != null;
                if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
                    return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
                }
                var i = hasIndex ? from : array.length;
                while (i--) if (array[i] === item) return i;
                return -1;
            };
            _.range = function(start, stop, step) {
                if (arguments.length <= 1) {
                    stop = start || 0;
                    start = 0;
                }
                step = arguments[2] || 1;
                var len = Math.max(Math.ceil((stop - start) / step), 0);
                var idx = 0;
                var range = new Array(len);
                while (idx < len) {
                    range[idx++] = start;
                    start += step;
                }
                return range;
            };
            _.bind = function(func, context) {
                if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
                var args = slice.call(arguments, 2);
                return function() {
                    return func.apply(context, args.concat(slice.call(arguments)));
                };
            };
            _.partial = function(func) {
                var args = slice.call(arguments, 1);
                return function() {
                    return func.apply(this, args.concat(slice.call(arguments)));
                };
            };
            _.bindAll = function(obj) {
                var funcs = slice.call(arguments, 1);
                if (funcs.length === 0) funcs = _.functions(obj);
                each(funcs, function(f) {
                    obj[f] = _.bind(obj[f], obj);
                });
                return obj;
            };
            _.memoize = function(func, hasher) {
                var memo = {};
                hasher || (hasher = _.identity);
                return function() {
                    var key = hasher.apply(this, arguments);
                    return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
                };
            };
            _.delay = function(func, wait) {
                var args = slice.call(arguments, 2);
                return setTimeout(function() {
                    return func.apply(null, args);
                }, wait);
            };
            _.defer = function(func) {
                return _.delay.apply(_, [ func, 1 ].concat(slice.call(arguments, 1)));
            };
            _.throttle = function(func, wait) {
                var context, args, timeout, result;
                var previous = 0;
                var later = function() {
                    previous = new Date;
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date;
                    var remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            };
            _.debounce = function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) result = func.apply(context, args);
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) result = func.apply(context, args);
                    return result;
                };
            };
            _.once = function(func) {
                var ran = false, memo;
                return function() {
                    if (ran) return memo;
                    ran = true;
                    memo = func.apply(this, arguments);
                    func = null;
                    return memo;
                };
            };
            _.wrap = function(func, wrapper) {
                return function() {
                    var args = [ func ];
                    push.apply(args, arguments);
                    return wrapper.apply(this, args);
                };
            };
            _.compose = function() {
                var funcs = arguments;
                return function() {
                    var args = arguments;
                    for (var i = funcs.length - 1; i >= 0; i--) {
                        args = [ funcs[i].apply(this, args) ];
                    }
                    return args[0];
                };
            };
            _.after = function(times, func) {
                if (times <= 0) return func();
                return function() {
                    if (--times < 1) {
                        return func.apply(this, arguments);
                    }
                };
            };
            _.keys = nativeKeys || function(obj) {
                if (obj !== Object(obj)) throw new TypeError("Invalid object");
                var keys = [];
                for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
                return keys;
            };
            _.values = function(obj) {
                var values = [];
                for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
                return values;
            };
            _.pairs = function(obj) {
                var pairs = [];
                for (var key in obj) if (_.has(obj, key)) pairs.push([ key, obj[key] ]);
                return pairs;
            };
            _.invert = function(obj) {
                var result = {};
                for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
                return result;
            };
            _.functions = _.methods = function(obj) {
                var names = [];
                for (var key in obj) {
                    if (_.isFunction(obj[key])) names.push(key);
                }
                return names.sort();
            };
            _.extend = function(obj) {
                each(slice.call(arguments, 1), function(source) {
                    if (source) {
                        for (var prop in source) {
                            obj[prop] = source[prop];
                        }
                    }
                });
                return obj;
            };
            _.pick = function(obj) {
                var copy = {};
                var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                each(keys, function(key) {
                    if (key in obj) copy[key] = obj[key];
                });
                return copy;
            };
            _.omit = function(obj) {
                var copy = {};
                var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
                for (var key in obj) {
                    if (!_.contains(keys, key)) copy[key] = obj[key];
                }
                return copy;
            };
            _.defaults = function(obj) {
                each(slice.call(arguments, 1), function(source) {
                    if (source) {
                        for (var prop in source) {
                            if (obj[prop] == null) obj[prop] = source[prop];
                        }
                    }
                });
                return obj;
            };
            _.clone = function(obj) {
                if (!_.isObject(obj)) return obj;
                return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
            };
            _.tap = function(obj, interceptor) {
                interceptor(obj);
                return obj;
            };
            var eq = function(a, b, aStack, bStack) {
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                if (a == null || b == null) return a === b;
                if (a instanceof _) a = a._wrapped;
                if (b instanceof _) b = b._wrapped;
                var className = toString.call(a);
                if (className != toString.call(b)) return false;
                switch (className) {
                  case "[object String]":
                    return a == String(b);
                  case "[object Number]":
                    return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
                  case "[object Date]":
                  case "[object Boolean]":
                    return +a == +b;
                  case "[object RegExp]":
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
                if (typeof a != "object" || typeof b != "object") return false;
                var length = aStack.length;
                while (length--) {
                    if (aStack[length] == a) return bStack[length] == b;
                }
                aStack.push(a);
                bStack.push(b);
                var size = 0, result = true;
                if (className == "[object Array]") {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                        }
                    }
                } else {
                    var aCtor = a.constructor, bCtor = b.constructor;
                    if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                        return false;
                    }
                    for (var key in a) {
                        if (_.has(a, key)) {
                            size++;
                            if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                        }
                    }
                    if (result) {
                        for (key in b) {
                            if (_.has(b, key) && !(size--)) break;
                        }
                        result = !size;
                    }
                }
                aStack.pop();
                bStack.pop();
                return result;
            };
            _.isEqual = function(a, b) {
                return eq(a, b, [], []);
            };
            _.isEmpty = function(obj) {
                if (obj == null) return true;
                if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
                for (var key in obj) if (_.has(obj, key)) return false;
                return true;
            };
            _.isElement = function(obj) {
                return !!(obj && obj.nodeType === 1);
            };
            _.isArray = nativeIsArray || function(obj) {
                return toString.call(obj) == "[object Array]";
            };
            _.isObject = function(obj) {
                return obj === Object(obj);
            };
            each([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(name) {
                _["is" + name] = function(obj) {
                    return toString.call(obj) == "[object " + name + "]";
                };
            });
            if (!_.isArguments(arguments)) {
                _.isArguments = function(obj) {
                    return !!(obj && _.has(obj, "callee"));
                };
            }
            if (typeof /./ !== "function") {
                _.isFunction = function(obj) {
                    return typeof obj === "function";
                };
            }
            _.isFinite = function(obj) {
                return isFinite(obj) && !isNaN(parseFloat(obj));
            };
            _.isNaN = function(obj) {
                return _.isNumber(obj) && obj != +obj;
            };
            _.isBoolean = function(obj) {
                return obj === true || obj === false || toString.call(obj) == "[object Boolean]";
            };
            _.isNull = function(obj) {
                return obj === null;
            };
            _.isUndefined = function(obj) {
                return obj === void 0;
            };
            _.has = function(obj, key) {
                return hasOwnProperty.call(obj, key);
            };
            _.noConflict = function() {
                root._ = previousUnderscore;
                return this;
            };
            _.identity = function(value) {
                return value;
            };
            _.times = function(n, iterator, context) {
                var accum = Array(n);
                for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
                return accum;
            };
            _.random = function(min, max) {
                if (max == null) {
                    max = min;
                    min = 0;
                }
                return min + Math.floor(Math.random() * (max - min + 1));
            };
            var entityMap = {
                escape: {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#x27;",
                    "/": "&#x2F;"
                }
            };
            entityMap.unescape = _.invert(entityMap.escape);
            var entityRegexes = {
                escape: new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"),
                unescape: new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g")
            };
            _.each([ "escape", "unescape" ], function(method) {
                _[method] = function(string) {
                    if (string == null) return "";
                    return ("" + string).replace(entityRegexes[method], function(match) {
                        return entityMap[method][match];
                    });
                };
            });
            _.result = function(object, property) {
                if (object == null) return null;
                var value = object[property];
                return _.isFunction(value) ? value.call(object) : value;
            };
            _.mixin = function(obj) {
                each(_.functions(obj), function(name) {
                    var func = _[name] = obj[name];
                    _.prototype[name] = function() {
                        var args = [ this._wrapped ];
                        push.apply(args, arguments);
                        return result.call(this, func.apply(_, args));
                    };
                });
            };
            var idCounter = 0;
            _.uniqueId = function(prefix) {
                var id = ++idCounter + "";
                return prefix ? prefix + id : id;
            };
            _.templateSettings = {
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: /<%=([\s\S]+?)%>/g,
                escape: /<%-([\s\S]+?)%>/g
            };
            var noMatch = /(.)^/;
            var escapes = {
                "'": "'",
                "\\": "\\",
                "\r": "r",
                "\n": "n",
                "	": "t",
                "\u2028": "u2028",
                "\u2029": "u2029"
            };
            var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
            _.template = function(text, data, settings) {
                var render;
                settings = _.defaults({}, settings, _.templateSettings);
                var matcher = new RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g");
                var index = 0;
                var source = "__p+='";
                text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
                    source += text.slice(index, offset).replace(escaper, function(match) {
                        return "\\" + escapes[match];
                    });
                    if (escape) {
                        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                    }
                    if (interpolate) {
                        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                    }
                    if (evaluate) {
                        source += "';\n" + evaluate + "\n__p+='";
                    }
                    index = offset + match.length;
                    return match;
                });
                source += "';\n";
                if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";
                source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
                try {
                    render = new Function(settings.variable || "obj", "_", source);
                } catch (e) {
                    e.source = source;
                    throw e;
                }
                if (data) return render(data, _);
                var template = function(data) {
                    return render.call(this, data, _);
                };
                template.source = "function(" + (settings.variable || "obj") + "){\n" + source + "}";
                return template;
            };
            _.chain = function(obj) {
                return _(obj).chain();
            };
            var result = function(obj) {
                return this._chain ? _(obj).chain() : obj;
            };
            _.mixin(_);
            each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(name) {
                var method = ArrayProto[name];
                _.prototype[name] = function() {
                    var obj = this._wrapped;
                    method.apply(obj, arguments);
                    if ((name == "shift" || name == "splice") && obj.length === 0) delete obj[0];
                    return result.call(this, obj);
                };
            });
            each([ "concat", "join", "slice" ], function(name) {
                var method = ArrayProto[name];
                _.prototype[name] = function() {
                    return result.call(this, method.apply(this._wrapped, arguments));
                };
            });
            _.extend(_.prototype, {
                chain: function() {
                    this._chain = true;
                    return this;
                },
                value: function() {
                    return this._wrapped;
                }
            });
        }).call(this);
        return module.exports;
    });
    var entries = [ "paperclip/lib/translate/index.js" ];
    for (var i = entries.length; i--; ) {
        _require(entries[i]);
    }
})();