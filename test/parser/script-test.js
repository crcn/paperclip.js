var parser = require("../../lib/parser2/parser.js"),
expect     = require("expect.js");

describe("parser/script#", function () {


  describe("references", function () {

  });

  describe("scripts", function () {
    it("automatically assigns value script", function () {
        var ast = parser.parse("{{ a }}").childNodes[0];
        expect(ast.scripts.value.value).to.be("a");
    });

    it("properly parses scripts", function () {
        var ast = parser.parse("{{ a:b, c: d, e:f}}").childNodes[0];
        expect(ast.scripts.a.value).to.be("b");
        expect(ast.scripts.c.value).to.be("d");
        expect(ast.scripts.e.value).to.be("f");
    });

    it("can handle whitespace between keys", function () {
        var ast = parser.parse("{{ a : b, c: d, e:f}}");
    });

    it("can have no values", function () {
        var ast = parser.parse("{{a:}}").childNodes[0];
        expect(ast.scripts.a).to.be(void 0);
    });
    it("can be parsed with ws", function () {
        var ast = parser.parse("{{ a: }}").childNodes[0];
        expect(ast.scripts.a).to.be(void 0);
    });
  });

  describe("hashes", function () {
    it("can have different types of keys", function () {
        var ast = parser.parse("{{{ a:b, 'c':d, \"e\":'f'} }}").childNodes[0];
        expect(ast.scripts.value.value[0].key).to.be("a");
        expect(ast.scripts.value.value[1].key).to.be("c");
        expect(ast.scripts.value.value[2].key).to.be("e");
    });
  });

  describe("numbers", function () {
    it("can parse an integer", function () {
      expect((parser.parse("{{ 55 }}").childNodes[0].scripts.value.value)).to.be(55);
    });

    it("can parse a floating point", function () {
      expect((parser.parse("{{ .5 }}").childNodes[0].scripts.value.value)).to.be(.5);
      expect((parser.parse("{{ 333.509 }}").childNodes[0].scripts.value.value)).to.be(333.509);
    });

    it("can parse a negative values", function () {
      expect((parser.parse("{{ -.5 }}").childNodes[0].scripts.value.value)).to.be(-.5);
      expect((parser.parse("{{ -333.509 }}").childNodes[0].scripts.value.value)).to.be(-333.509);
    });

  });

  describe("reserved words", function () {
    it("can parse boolean values", function () {
      expect(parser.parse("{{ true }}").childNodes[0].scripts.value.value).to.be(true);
      expect(parser.parse("{{ false }}").childNodes[0].scripts.value.value).to.be(false);
    });
    it("can parse undefined values", function () {
      expect(parser.parse("{{ undefined }}").childNodes[0].scripts.value.value).to.be(void 0);
    });
    it("can parse NaN values", function () {
      var v = parser.parse("{{ NaN }}").childNodes[0].scripts.value;
      expect(v.type).to.be("literal");
    });
    it("can parse Infinity values", function () {
      var v = parser.parse("{{ Infinity }}").childNodes[0].scripts.value;
      expect(v.value).to.be(Infinity);
      expect(v.type).to.be("literal");
    });
    it("can parse null values", function () {
      expect(parser.parse("{{ null }}").childNodes[0].scripts.value.value).to.be(null);
    });
  });

  describe("conditions", function () {
    describe("ternery", function () {

      it("parses properly", function () {
        var ast = parser.parse("{{a?b:c}}").childNodes[0].scripts.value;

      });

      it("can nest ternery operations in the true arg", function () {
        var ast = parser.parse("{{a ? b ? c ? \nd : e : f : g }}").childNodes[0].scripts.value;
        expect(ast.condition.value).to.be("a"); 
        expect(ast.fExpression.value).to.be("g");
        expect(ast.tExpression.condition.value).to.be("b");
        expect(ast.tExpression.fExpression.value).to.be("f");
        expect(ast.tExpression.tExpression.condition.value).to.be("c");
        expect(ast.tExpression.tExpression.fExpression.value).to.be("e");
      });

      it("can nest ternery operations in the false arg", function () {

        var ast = parser.parse("{{a ? b : c ? d : e}}").childNodes[0].scripts.value;
        expect(ast.condition.value).to.be("a"); 
        expect(ast.tExpression.value).to.be("b");
        expect(ast.fExpression.condition.value).to.be("c");
        expect(ast.fExpression.tExpression.value).to.be("d");
        expect(ast.fExpression.fExpression.value).to.be("e");
      })

      it("can be parsed within a group expression", function () {
        parser.parse("{{(a.b.c?d:e)}}");
      })
    });
  });

  describe("operations", function () {

    describe("not", function () {
      it("can be parsed", function () {
        var ast = parser.parse("{{!!abcd}}").childNodes[0].scripts.value;
        expect(ast.type).to.be("!");
        expect(ast.value.type).to.be("!");
        expect(ast.value.value.value).to.be("abcd");
      });
    });

    describe("equations", function () {

      it("can add / subtract two numbers together", function () {
        var ast = parser.parse("{{ 5+6 }}").childNodes[0].scripts.value;
        expect(ast.left.value).to.be(5);
        expect(ast.right.value).to.be(6);
        ast = parser.parse("{{ 5-6 }}").childNodes[0].scripts.value;
        expect(ast.left.value).to.be(5);
        expect(ast.right.value).to.be(6);
      });

      it("gets the order of operations correct", function () {
        var ast = parser.parse("{{ 3+4*5/(6+7) }}").childNodes[0].scripts.value;
        expect(ast.left.value).to.be(3);
        expect(ast.right.left.value).to.be(4);
        expect(ast.right.right.left.value).to.be(5);
        expect(ast.right.right.right.left.value).to.be(6);
        expect(ast.right.right.right.right.value).to.be(7);
      });

      it("works with modulus", function () {
        var ast = parser.parse("{{ 3%4 }}").childNodes[0].scripts.value;
        expect(ast.left.value).to.be(3);
        expect(ast.right.value).to.be(4);
      });
    });
  
    describe("comparisons", function () {

      ["&&", "||", "==", "!=", "!==", "===", ">", ">=", ">==", "<", "<=", "<=="].forEach(function (op) {
         it("can parse " + op, function () {
          var ast = parser.parse("{{ true "+op+" false }}").childNodes[0].scripts.value;
          expect(ast.left.value).to.be(true);
          expect(ast.right.value).to.be(false);
        }); 
      });

      it("can parse multiple comparisons", function () {
        var ast = parser.parse("{{true && false >= true || undefined < null}}");
      });

      it("puts equations at a higher priority than comparisons", function () {
        var ast = parser.parse("{{scriptA:1>2+3}}").childNodes[0].scripts.scriptA;
        expect(ast.operator).to.be(">");
        expect(ast.left.value).to.be(1);
        expect(ast.right.left.value).to.be(2);
        expect(ast.right.right.value).to.be(3);
      });
    });

    describe("references", function () {
      it("can parse a path", function () {
        var ast = parser.parse("{{a.b.c.d}}").childNodes[0].scripts.value;
      });

      it("can parse vars with various characters", function () {
        parser.parse("a123$_.b123")
      })
    });

    describe("strings", function () {
      it("can be concatenated", function () {
        var ast = parser.parse("{{'a' + 'b'}}").childNodes[0].scripts.value;
        expect(ast.operator).to.be("+");
        expect(ast.left.value).to.be('a');
        expect(ast.right.value).to.be('b');
      })
    })


    describe("assigning", function () {

      it("can be parsed", function () {
        var ast = parser.parse("{{a=b}}").childNodes[0].scripts.value;
        expect(ast.reference.value).to.be("a");
        expect(ast.value.value).to.be("b");
      });

      it("can assign multiple values", function () {
        var ast = parser.parse("{{a=b=c = d= e}}").childNodes[0].scripts.value;
        expect(ast.reference.value).to.be("a");
        expect(ast.value.reference.value).to.be("b");
        expect(ast.value.value.reference.value).to.be("c");
        expect(ast.value.value.value.reference.value).to.be("d");
        expect(ast.value.value.value.value.value).to.be("e");
      });

      it("properly orders other operations", function () {
        var ast = parser.parse("{{a=5+c}}").childNodes[0].scripts.value;
        expect(ast.reference.value).to.be("a");
        expect(ast.value.left.value).to.be(5);
        expect(ast.value.right.value).to.be("c");
      });

      it("can assign with dot syntax", function () {
        var ast = parser.parse("{{a.b.c =d= e.f.g}}").childNodes[0].scripts.value;
        expect(ast.reference.context.value).to.be("a");
        expect(ast.reference.path[0]).to.be("b");
        expect(ast.reference.path[1]).to.be("c");
        expect(ast.value.reference.value).to.be("d");
      });

      it("breaks for an invalid left-hand side assignment", function () {
        var err;
        try {
          var ast = parser.parse("aa&&b=c");
        } catch (e) {
          err = e;
        }
      });
    });

    describe("bindings", function () {
      ["~", "<~", "<~>", "~>"].forEach(function (bindingType) {
        it("can parse the "+bindingType+" binding", function () {
          var ast = parser.parse("{{"+bindingType+" a}}").childNodes[0].scripts.value;
          expect(ast.bindingType).to.be(bindingType);
        });
      });
    });

    describe("function calls", function () {
      it("can be parsed", function () {
        var ast = parser.parse("{{a.b.c(1,2,3 + 4)}}").childNodes[0].scripts.value;
        expect(ast.type).to.be("call");
        expect(ast.parameters[0].value).to.be(1);
        expect(ast.parameters[1].value).to.be(2);
        expect(ast.parameters[2].left.value).to.be(3);
      }); 
      it("can be called from strings", function () {
        var ast = parser.parse("{{'a'.length}}").childNodes[0].scripts.value;
        expect(ast.type).to.be("property");
        expect(ast.path[0]).to.be("length");

      });
    });

    describe("modifiers", function () {
      it("can be parsed", function () {
        parser.parse("{{a|b|c}}");
        var ast = parser.parse("{{a| b |c(5,6 | d,7)|e}}").childNodes[0].scripts.value;
        expect(ast.type).to.be("modifier");
        expect(ast.reference.value).to.be("e");
        expect(ast.value.reference.value).to.be("c");
        expect(ast.value.value.reference.value).to.be("b");
        expect(ast.value.value.value.value).to.be("a");
      });
    });

    it("can parse various expression", function () {
      [
        "{{ html:~sections.pages }}",
        "{{ mobileBlocker: {} }}",
        "{{error.code == 604}}",
        "{{ onSubmit: signup() }}",
        "{{!showOtherInput}}",
        "{{#if: loading || !classrooms }}aff{{/else}}blarg{{/}}",
        "{{ loadingGif: { show: true } }}",
        "{{ model.demo ? 'demo-class' : '' }}",
        "{{model.nstudents.numConnected == 0  && !model.demo}}",
        "{{model: teacher, focus: true}}",
        "{{ clipboard: { text: link, onCopied: onCopiedLink } | varg() }}",
        '{{ a| t | e }}',
        '<h2>{{ "dojo.teacher_web:invite_page.someone_invited_you" | t() }}</h2>'
      ].forEach(function (expr) {
        parser.parse(expr);
      });
    });
    
  });
});
