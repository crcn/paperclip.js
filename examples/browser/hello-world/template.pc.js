module.exports = function() {
    return this.create().html("hello ").textBinding({
        fn: function() {
            return this.ref("name").value();
        },
        refs: [ "name" ]
    }).html(", you are ").textBinding({
        fn: function() {
            return this.ref("age").value() || 0;
        },
        refs: [ "age" ]
    }).html(" years old, therefore you ").textBinding({
        fn: function() {
            return this.ref("age").value() > 20 ? "can" : "cannot";
        },
        refs: [ "age" ]
    }).html(" drink!");
};