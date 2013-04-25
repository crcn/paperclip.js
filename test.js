module.exports = function() {
    return this.create().html('<div id="test">hello ').textBinding({
        fn: function() {
            return this.ref("first.name").value();
        },
        refs: [ "first.name" ]
    }).html(", how are you today? ").blockBinding({
        each: {
            fn: function() {
                return this.ref("people").value();
            },
            refs: [ "people" ]
        }
    }, this.create().html("hello ")).html("</div>");
};