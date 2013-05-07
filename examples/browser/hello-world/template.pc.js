module.exports = function(paper) {
    return paper.create().html("Name: ").nodeBinding("input", {
        attrs: {
            type: [ "text" ],
            "data-bind": [ {
                value: {
                    fn: function() {
                        return this.ref("name").value();
                    },
                    refs: [ "name" ]
                },
                bothWays: {
                    fn: function() {
                        return true;
                    },
                    refs: []
                }
            } ]
        }
    }).html(" <br/> Age: ").nodeBinding("input", {
        attrs: {
            type: [ "text" ],
            "data-bind": [ {
                value: {
                    fn: function() {
                        return this.ref("age").value();
                    },
                    refs: [ "age" ]
                },
                bothWays: {
                    fn: function() {
                        return true;
                    },
                    refs: []
                }
            } ]
        }
    }).html(" <br/> <span> hello ").textBinding({
        fn: function() {
            return this.ref("name").value();
        },
        refs: [ "name" ]
    }).html(", you are ").textBinding({
        fn: function() {
            return this.ref("age").value() || 0;
        },
        refs: [ "age" ]
    }).html(" years old, therefore you <b>").textBinding({
        fn: function() {
            return this.ref("age").value() > 20 ? "can" : "cannot";
        },
        refs: [ "age" ]
    }).html("</b> drink! </span> <br/> ").nodeBinding("input", {
        attrs: {
            type: [ "text" ],
            "data-bind": [ {
                value: {
                    fn: function() {
                        return this.ref("currentFriend").value() || "";
                    },
                    refs: [ "currentFriend" ]
                },
                bothWays: {
                    fn: function() {
                        return true;
                    },
                    refs: []
                },
                enter: {
                    fn: function() {
                        return this.ref("currentFriend").value("" || this.call("addFriend", [ this.ref("currentFriend").value() ]).value());
                    },
                    refs: [ "currentFriend" ]
                }
            } ],
            placeholder: [ "Add a friend" ]
        }
    }).html(" <br/> Your Friends: <br/> ").blockBinding({
        each: {
            fn: function() {
                return this.ref("friends").value();
            },
            refs: [ "friends" ]
        },
        as: {
            fn: function() {
                return "friend";
            },
            refs: []
        }
    }, function() {
        return paper.create().html(" ").nodeBinding("a", {
            attrs: {
                href: [ "#" ],
                "data-bind": [ {
                    click: {
                        fn: function() {
                            return this.ref("friend").call("remove", []).value();
                        },
                        refs: [ "friend.[object Object]" ]
                    }
                } ]
            },
            children: paper.create().html("x")
        }).html(" ").textBinding({
            fn: function() {
                return this.ref("friend.name").value();
            },
            refs: [ "friend.name" ]
        }).html(" <br/> ");
    }).html(" ").blockBinding({
        when: {
            fn: function() {
                return this.ref("age").value() > 21;
            },
            refs: [ "age" ]
        }
    }, function() {
        return paper.create().html(" Yippe! You're over 21! ");
    }).html(" ");
};