module.exports = function() {
    return this.node("root", {
        children: [ this.text([ {
            fn: function() {
                return this.ref("name").value();
            },
            refs: [ "name" ]
        } ]) ]
    });
};