var parser = require("../../lib/parser/parser.js"),
expect     = require("expect.js");

describe(__filename + "#", function () {



  describe("scripts", function () {
    it("automatically assigns value script", function () {
        var ast = parser.parse("{{ a }}");
    });

    it("properly parses scripts", function () {
        var ast = parser.parse("{{ a:b, c: d, e:f}}")
    });

    it("can handle whitespace between keys", function () {
        var ast = parser.parse("{{ a : b, c: d, e:f}}");
    });

  });

  describe("hashes", function () {
    it("can have different types of keys", function () {
        var ast = parser.parse("{{{ a:b, 'c':d, \"e\":'f'} }}")
    });
  });

  describe("numbers", function () {
    it("can parse an integer", function () {
      parser.parse("{{ 55 }}");
    });

    it("can parse a floating point", function () {
      parser.parse("{{ .5 }}")
    });

    it("can parse a negative values", function () {
      parser.parse("{{ -.5 }}");
      parser.parse("{{ -333.509 }}")
    });

  });

  describe("reserved words", function () {
    it("can parse boolean values", function () {
      parser.parse("{{ true }}");
      parser.parse("{{ false }}")
    });
    it("can parse undefined values", function () {
      parser.parse("{{ undefined }}")

    });
    it("can parse NaN values", function () {
      var v = parser.parse("{{ NaN }}");
    });
    it("can parse Infinity values", function () {
      var v = parser.parse("{{ Infinity }}");
    });
    it("can parse null values", function () {
      parser.parse("{{ null }}");
    });
  });

  describe("conditions", function () {
    describe("ternery", function () {

      it("parses properly", function () {
        var ast = parser.parse("{{a?b:c}}")

      });

      it("can nest ternery operations in the true arg", function () {
        var ast = parser.parse("{{a ? b ? c ? \nd : e : f : g }}")
      });

      it("can nest ternery operations in the false arg", function () {

        var ast = parser.parse("{{a ? b : c ? d : e}}")
      })

      it("can be parsed within a group expression", function () {
        parser.parse("{{(a.b.c?d:e)}}");
      })
    });
  });

  describe("operations", function () {

    describe("not", function () {
      it("can be parsed", function () {
        var ast = parser.parse("{{!!abcd}}")
      });
    });

    describe("equations", function () {

      it("can add / subtract two numbers together", function () {
        var ast = parser.parse("{{ 5+6 }}");
        ast = parser.parse("{{ 5-6 }}")
      });

      it("gets the order of operations correct", function () {
        var ast = parser.parse("{{ 3+4*5/(6+7) }}")
      });

      it("works with modulus", function () {
        var ast = parser.parse("{{ 3%4 }}")
      });
    });

    describe("comparisons", function () {

      ["&&", "||", "==", "!=", "!==", "===", ">", ">=", ">==", "<", "<=", "<=="].forEach(function (op) {
         it("can parse " + op, function () {
          var ast = parser.parse("{{ true "+op+" false }}")
        });
      });

      it("can parse multiple comparisons", function () {
        var ast = parser.parse("{{true && false >= true || undefined < null}}");
      });

      it("puts equations at a higher priority than comparisons", function () {
        var ast = parser.parse("{{scriptA:1>2+3}}")
      });
    });

    describe("references", function () {
      it("can parse a path", function () {
        var ast = parser.parse("{{a.b.c.d}}")
      });

      it("can parse vars with various characters", function () {
        parser.parse("a123$_.b123")
      });
    });

    describe("strings", function () {
      it("can be concatenated", function () {
        var ast = parser.parse("{{'a' + 'b'}}")
      })
    })


    describe("assigning", function () {

      it("can be parsed", function () {
        var ast = parser.parse("{{a=b}}")
      });

      it("can assign multiple values", function () {
        var ast = parser.parse("{{a=b=c = d= e}}")
      });

      it("properly orders other operations", function () {
        var ast = parser.parse("{{a=5+c}}")
      });

      it("can assign with dot syntax", function () {
        var ast = parser.parse("{{a.b.c =d= e.f.g}}")
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
          var ast = parser.parse("{{"+bindingType+" a}}")
        });
      });
    });

    it("can parse the fast operator", function () {
      var ast = parser.parse("{{^a}}").childNodes.expressions.expressions[0].scripts;
      expect(ast.value.value.value.fast).to.be(true);
      // expect(ast.value.value.value.unbound).to.be(true);
    });

    describe("function calls", function () {
      it("can be parsed", function () {
        var ast = parser.parse("{{a.b.c(1,2,3 + 4)}}").childNodes.expressions.expressions[0];
        // expect(ast.toJavaScript()).to.be("block({'value':{run: function () { return this.call(this.get([\"a\",\"b\"]), \"c\", [1, 2, 3+4]); }, refs: []}}, void 0)")
      });
    });

    describe("modifiers", function () {
      it("can be parsed", function () {
        var ast = parser.parse("{{a| b |c(5,6 | d,7)|e}}")
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
