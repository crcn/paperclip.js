module.exports = function() {
    return this.create().nodeBinding("div", {
        attrs: {
            id: [ "test" ],
            "class": [ "hello ", {
                fn: function() {
                    return this.ref("first.name").value();
                },
                refs: [ "first.name" ]
            } ]
        },
        children: this.create().blockBinding({
            each: {
                fn: function() {
                    return this.ref("people").value();
                },
                refs: [ "people" ]
            }
        }, this.create().html("hello ").textBinding({
            fn: function() {
                return this.ref("first.name").value();
            },
            refs: [ "first.name" ]
        }))
    });
};