module.exports = function() {
    return this.create().html("hello ").textBinding({
        fn: function() {
            return this.ref("name").value();
        },
        refs: [ "name" ]
    }).html("!");
};