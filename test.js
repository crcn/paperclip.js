module.exports = function() {
    return this.nodeBinding("div", {
        attrs: {
            id: [ "test" ],
            "class": [ this.textBinding({
                fn: function() {
                    return this.ref("class").value();
                },
                refs: [ "class" ]
            }) ]
        },
        children: this.html("hello! ")
    });
};