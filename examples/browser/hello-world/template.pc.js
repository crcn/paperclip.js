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
    }).html(" years old, therefore you ").nodeBinding("b", {
        attrs: {
            "data-bind": [ {
                style: {
                    fn: function() {
                        return {
                            color: this.ref("age").value() > 20 ? "green" : "red"
                        };
                    },
                    refs: [ "age" ]
                }
            } ]
        },
        children: paper.create().textBinding({
            fn: function() {
                return this.ref("age").value() > 20 ? "can" : "cannot";
            },
            refs: [ "age" ]
        })
    }).html(" drink! </span> <br/> ").nodeBinding("input", {
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
                        return this.call("addFriend", [ this.ref("currentFriend").value() ]).value() || this.ref("currentFriend").value("");
                    },
                    refs: [ "addFriend", "currentFriend" ]
                }
            } ],
            placeholder: [ "Add a friend" ]
        }
    }).html(" <br/> Your Friends (").textBinding({
        fn: function() {
            return this.ref("friends.length").value();
        },
        refs: [ "friends.length" ]
    }).html("): <br/> ").blockBinding({
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
                        refs: [ "friend.remove" ]
                    }
                } ],
                "class": [ "abc-", {
                    fn: function() {
                        return this.ref("friend.name").value();
                    },
                    refs: [ "friend.name" ]
                } ]
            },
            children: paper.create().html("x")
        }).html(" ").textBinding({
            fn: function() {
                return this.ref("friend.name").value();
            },
            refs: [ "friend.name" ]
        }).html(" <br/> ");
    }).html(" ").nodeBinding("input", {
        attrs: {
            type: [ "submit" ],
            "data-bind": [ {
                disable: {
                    fn: function() {
                        return this.ref("age").value() < 21;
                    },
                    refs: [ "age" ]
                },
                click: {
                    fn: function() {
                        return this.call("drinkBeer", []).value();
                    },
                    refs: [ "drinkBeer" ]
                }
            } ],
            value: [ "drink beer" ]
        }
    }).html("<br/> <select> <option>Select a friend</option> ").blockBinding({
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
        return paper.create().html(" ").nodeBinding("option", {
            attrs: {
                value: [ {
                    fn: function() {
                        return this.ref("friend.name").value();
                    },
                    refs: [ "friend.name" ]
                } ]
            },
            children: paper.create().textBinding({
                fn: function() {
                    return this.ref("friend.name").value();
                },
                refs: [ "friend.name" ]
            })
        }).html(" ");
    }).html(" </select> ").nodeBinding("div", {
        attrs: {
            "data-bind": [ {
                show: {
                    fn: function() {
                        return this.ref("age").value() > 21;
                    },
                    refs: [ "age" ]
                }
            } ]
        },
        children: paper.create().html(" You're over 20! (data-bind:show) ")
    }).html(" ").blockBinding({
        when: {
            fn: function() {
                return this.ref("age").value() > 20;
            },
            refs: [ "age" ]
        }
    }, function() {
        return paper.create().html(" Yippe! You're over 20! <br/> Beers drunk: ").textBinding({
            fn: function() {
                return this.ref("beersDrunk").value() || 0;
            },
            refs: [ "beersDrunk" ]
        }).html("<br/> ");
    }).html(" Current Address: <br/> ").blockBinding({
        "with": {
            fn: function() {
                return this.ref("address").value();
            },
            refs: [ "address" ]
        }
    }, function() {
        return paper.create().html(" ").textBinding({
            fn: function() {
                return this.ref("city").value();
            },
            refs: [ "city" ]
        }).html(" ").textBinding({
            fn: function() {
                return this.ref("zip").value();
            },
            refs: [ "zip" ]
        }).html(" ");
    }).html(" <br/> ").blockBinding({
        template: {
            fn: function() {
                return "test";
            },
            refs: []
        }
    }, function() {
        return paper.create().html(" hello view ").textBinding({
            fn: function() {
                return this.ref("name").value();
            },
            refs: [ "name" ]
        }).html(" <br/> ");
    }).html(" ").blockBinding({
        block: {
            fn: function() {
                return "blarg";
            },
            refs: []
        }
    }, function() {
        return paper.create().html(" Hello block! name = ").textBinding({
            fn: function() {
                return this.ref("name").value();
            },
            refs: [ "name" ]
        }).html("<br/> ");
    }).html(" ").blockBinding({
        view: {
            fn: function() {
                return {
                    name: "test",
                    model: this.ref("this").value()
                };
            },
            refs: [ "this" ]
        }
    }, function() {
        return paper.create().html(" ");
    }).html(" ").textBinding({
        view: {
            fn: function() {
                return {
                    name: "test",
                    model: {
                        name: "john"
                    }
                };
            },
            refs: []
        }
    }).html(" ").textBinding({
        html: {
            fn: function() {
                return this.ref("blarg").value();
            },
            refs: [ "blarg" ]
        }
    }).html(" ").textBinding({
        html: {
            fn: function() {
                return this.ref("blarg").value();
            },
            refs: [ "blarg" ]
        }
    }).html(" ").textBinding({
        html: {
            fn: function() {
                return this.ref("blarg").value();
            },
            refs: [ "blarg" ]
        }
    }).html(" ");
};