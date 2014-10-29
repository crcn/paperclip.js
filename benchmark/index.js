var Benchmark = require("benchmark"),
suite = new Benchmark.Suite(),
pc = require(".."),
fs = require("fs");


var benchmarkTemplate = pc.template(fs.readFileSync(__dirname + "/benchmark.pc", "utf8"));

var view = benchmarkTemplate.bind({
    title: "title",
    text: "title"
  });


var i = 0;

var data = {
  title : 'Projects',
  text : '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam et vulputate lacus. Proin a lorem eget metus posuere tristique blandit eu magna. Mauris quis odio id augue sodales dictum. Fusce lectus eros, fermentum vitae semper vel, euismod egestas dui. Etiam vel diam quis tellus ultrices accumsan vitae at felis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas eu nisl tortor, sed placerat mi. In hac habitasse platea dictumst. Praesent hendrerit commodo ligula, sit amet porttitor metus dictum sit amet. Curabitur pellentesque cursus lectus, sit amet mollis diam dictum ac. Sed eleifend, massa ut egestas viverra, ante ante interdum ligula, sed ultricies turpis arcu vel dolor. Aenean rutrum dolor ut nunc adipiscing sollicitudin. Mauris ac est metus. Suspendisse vel augue odio.</p>\
<p>Morbi orci nulla, condimentum eu aliquam consectetur, tempus sit amet felis. Quisque quis ligula turpis. Fusce facilisis arcu massa, a tempor neque. Maecenas sodales quam eu mi interdum sit amet tincidunt turpis feugiat. Nulla quis neque non metus lacinia tempus. Fusce in neque vestibulum quam venenatis tempus vel id ipsum. Cras eget condimentum risus. Nunc pellentesque faucibus sem nec commodo. Nam eleifend lorem sit amet nulla luctus congue. Pellentesque fringilla ante turpis, non varius tellus. Nullam eget nisi odio. Mauris at dui purus, ac interdum eros.</p>\
<p>Phasellus rhoncus massa sit amet elit molestie nec dictum risus sodales. Vivamus blandit eros id dolor euismod lacinia. Integer massa orci, tincidunt sed pulvinar et, volutpat eu felis. Aliquam placerat erat in arcu elementum ut congue dolor tempor. Nunc a nulla et metus placerat consequat. Maecenas in rhoncus urna. Vestibulum quis elit lorem, ac facilisis dui. Etiam a commodo nunc. Nam viverra dictum est eu condimentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Proin vitae augue neque. In fermentum, elit vel rhoncus feugiat, felis ipsum suscipit augue, in suscipit enim elit ac lacus. Donec felis sapien, ultricies eget condimentum blandit, lobortis gravida sapien. Vestibulum pharetra, mi at varius cursus, elit est malesuada odio, sit amet sollicitudin tortor sem eget nisi.</p>\
<p>Praesent nec massa ut quam commodo euismod ac sollicitudin lorem. Aliquam tempus molestie orci, ac egestas urna imperdiet ut. Morbi rhoncus lacus in risus mattis et elementum elit placerat. Cras eget ante sit amet turpis tincidunt interdum. Suspendisse fermentum sollicitudin hendrerit. Sed in lectus id augue vestibulum suscipit. Nulla vulputate faucibus molestie. Pellentesque et leo aliquet nisl dignissim faucibus ac a leo. Quisque aliquet egestas tellus, nec euismod urna lacinia ac. Nunc risus velit, auctor eget interdum a, rhoncus commodo leo. Praesent nec congue lectus. Donec lacinia dictum tellus quis molestie. Vestibulum nec urna risus, at pellentesque ante. Sed eget magna lectus. Praesent in tortor elit.</p>\
<p>Aenean vulputate erat ut ligula commodo fermentum tincidunt augue rutrum. Curabitur volutpat, justo in tincidunt porttitor, enim massa bibendum mi, nec lacinia tortor ipsum non ligula. In commodo diam et ligula pharetra placerat. Donec hendrerit, nisi non fermentum pretium, leo mi elementum quam, non dictum erat ante in tortor. Fusce sagittis egestas metus a vulputate. Proin ac nisi a lacus egestas scelerisque. Morbi enim nulla, tristique vel placerat in, iaculis in turpis. Etiam lobortis, arcu et porttitor rhoncus, lorem nisl vestibulum ipsum, sed molestie felis augue ut tellus. Aenean rutrum leo vel ante tempus ultricies. Suspendisse nec eros eget lectus posuere consectetur tincidunt at tortor.</p>\
<p>In commodo placerat dapibus. Donec nunc nisi, pharetra ultrices tincidunt et, mollis a nisl. Phasellus sed lectus et massa eleifend adipiscing id sit amet augue. Nullam semper elementum feugiat. Phasellus leo nulla, tristique nec scelerisque vel, placerat ac nunc. Etiam sit amet neque eu erat suscipit tristique vel eu libero. Cras ullamcorper ultrices tempor. Nam tellus nulla, venenatis vel semper eu, varius ut ipsum. Vestibulum varius fermentum sem non porttitor.</p>\
<p>Nunc a risus non velit pretium faucibus. Fusce non nisi nec eros porta pharetra sed bibendum tellus. Nunc malesuada porta dolor ac dictum. Vestibulum tincidunt sodales rutrum. Quisque vel odio quam. Cras sit amet urna sed felis dictum volutpat. Sed est lectus, faucibus tempus pharetra at, mattis eu lorem. Sed vestibulum massa et nulla ultrices a cursus velit aliquam. Cras nulla libero, commodo eu faucibus vestibulum, pharetra eget lacus. Duis vehicula massa id felis ultricies eu ultrices ligula aliquet.</p>\
<p>Curabitur congue fermentum eros non iaculis. Aliquam erat volutpat. Phasellus scelerisque, nibh vitae aliquam gravida, dolor est tristique dui, mattis iaculis ligula nibh non nisi. Quisque vel arcu metus. Aliquam at elit non lorem cursus rhoncus. Quisque quam justo, feugiat hendrerit condimentum sed, tempus a nisl. Cras ultrices placerat rhoncus. Nam convallis posuere.</p>\
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam et vulputate lacus. Proin a lorem eget metus posuere tristique blandit eu magna. Mauris quis odio id augue sodales dictum. Fusce lectus eros, fermentum vitae semper vel, euismod egestas dui. Etiam vel diam quis tellus ultrices accumsan vitae at felis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas eu nisl tortor, sed placerat mi. In hac habitasse platea dictumst. Praesent hendrerit commodo ligula, sit amet porttitor metus dictum sit amet. Curabitur pellentesque cursus lectus, sit amet mollis diam dictum ac. Sed eleifend, massa ut egestas viverra, ante ante interdum ligula, sed ultricies turpis arcu vel dolor. Aenean rutrum dolor ut nunc adipiscing sollicitudin. Mauris ac est metus. Suspendisse vel augue odio.</p>\
<p>Morbi orci nulla, condimentum eu aliquam consectetur, tempus sit amet felis. Quisque quis ligula turpis. Fusce facilisis arcu massa, a tempor neque. Maecenas sodales quam eu mi interdum sit amet tincidunt turpis feugiat. Nulla quis neque non metus lacinia tempus. Fusce in neque vestibulum quam venenatis tempus vel id ipsum. Cras eget condimentum risus. Nunc pellentesque faucibus sem nec commodo. Nam eleifend lorem sit amet nulla luctus congue. Pellentesque fringilla ante turpis, non varius tellus. Nullam eget nisi odio. Mauris at dui purus, ac interdum eros.</p>\
<p>Phasellus rhoncus massa sit amet elit molestie nec dictum risus sodales. Vivamus blandit eros id dolor euismod lacinia. Integer massa orci, tincidunt sed pulvinar et, volutpat eu felis. Aliquam placerat erat in arcu elementum ut congue dolor tempor. Nunc a nulla et metus placerat consequat. Maecenas in rhoncus urna. Vestibulum quis elit lorem, ac facilisis dui. Etiam a commodo nunc. Nam viverra dictum est eu condimentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Proin vitae augue neque. In fermentum, elit vel rhoncus feugiat, felis ipsum suscipit augue, in suscipit enim elit ac lacus. Donec felis sapien, ultricies eget condimentum blandit, lobortis gravida sapien. Vestibulum pharetra, mi at varius cursus, elit est malesuada odio, sit amet sollicitudin tortor sem eget nisi.</p>\
<p>Praesent nec massa ut quam commodo euismod ac sollicitudin lorem. Aliquam tempus molestie orci, ac egestas urna imperdiet ut. Morbi rhoncus lacus in risus mattis et elementum elit placerat. Cras eget ante sit amet turpis tincidunt interdum. Suspendisse fermentum sollicitudin hendrerit. Sed in lectus id augue vestibulum suscipit. Nulla vulputate faucibus molestie. Pellentesque et leo aliquet nisl dignissim faucibus ac a leo. Quisque aliquet egestas tellus, nec euismod urna lacinia ac. Nunc risus velit, auctor eget interdum a, rhoncus commodo leo. Praesent nec congue lectus. Donec lacinia dictum tellus quis molestie. Vestibulum nec urna risus, at pellentesque ante. Sed eget magna lectus. Praesent in tortor elit.</p>\
<p>Aenean vulputate erat ut ligula commodo fermentum tincidunt augue rutrum. Curabitur volutpat, justo in tincidunt porttitor, enim massa bibendum mi, nec lacinia tortor ipsum non ligula. In commodo diam et ligula pharetra placerat. Donec hendrerit, nisi non fermentum pretium, leo mi elementum quam, non dictum erat ante in tortor. Fusce sagittis egestas metus a vulputate. Proin ac nisi a lacus egestas scelerisque. Morbi enim nulla, tristique vel placerat in, iaculis in turpis. Etiam lobortis, arcu et porttitor rhoncus, lorem nisl vestibulum ipsum, sed molestie felis augue ut tellus. Aenean rutrum leo vel ante tempus ultricies. Suspendisse nec eros eget lectus posuere consectetur tincidunt at tortor.</p>\
<p>In commodo placerat dapibus. Donec nunc nisi, pharetra ultrices tincidunt et, mollis a nisl. Phasellus sed lectus et massa eleifend adipiscing id sit amet augue. Nullam semper elementum feugiat. Phasellus leo nulla, tristique nec scelerisque vel, placerat ac nunc. Etiam sit amet neque eu erat suscipit tristique vel eu libero. Cras ullamcorper ultrices tempor. Nam tellus nulla, venenatis vel semper eu, varius ut ipsum. Vestibulum varius fermentum sem non porttitor.</p>\
<p>Nunc a risus non velit pretium faucibus. Fusce non nisi nec eros porta pharetra sed bibendum tellus. Nunc malesuada porta dolor ac dictum. Vestibulum tincidunt sodales rutrum. Quisque vel odio quam. Cras sit amet urna sed felis dictum volutpat. Sed est lectus, faucibus tempus pharetra at, mattis eu lorem. Sed vestibulum massa et nulla ultrices a cursus velit aliquam. Cras nulla libero, commodo eu faucibus vestibulum, pharetra eget lacus. Duis vehicula massa id felis ultricies eu ultrices ligula aliquet.</p>\
<p>Curabitur congue fermentum eros non iaculis. Aliquam erat volutpat. Phasellus scelerisque, nibh vitae aliquam gravida, dolor est tristique dui, mattis iaculis ligula nibh non nisi. Quisque vel arcu metus. Aliquam at elit non lorem cursus rhoncus. Quisque quam justo, feugiat hendrerit condimentum sed, tempus a nisl. Cras ultrices placerat rhoncus. Nam convallis posuere.</p>',
projects : [
    { name : '<strong>Facebook</strong>', url : 'http://facebook.com', description : 'Social network' },
    { name : '<strong>Google</strong>', url : 'http://google.com', description : 'Search engine' },
    { name : '<strong>Twitter</strong>', url : 'http://twitter.com', description : 'Microblogging service' },
    { name : '<strong>Amazon</strong>', url : 'http://amazon.com', description : 'Online retailer' },
    { name : '<strong>eBay</strong>', url : 'http://ebay.com', description : 'Online auction' },
    { name : '<strong>Wikipedia</strong>', url : 'http://wikipedia.org', description : 'A free encyclopedia' },
    { name : '<strong>LiveJournal</strong>', url : 'http://livejournal.com', description : 'Blogging platform' }
  ]
};

// console.log(view.bind(data).render().toString());

suite.add("pc.template('./benchmark.pc').bind({title:title})", function () {
  view.bind(data).render().toString();
});

suite.add("pc.template('hello')", function () {
  pc.template('hello');
});

suite.add("pc.template('hello').bind()", function () {
  pc.template('hello').bind();
});

suite.add("pc.template('hello').bind()", function () {
  pc.template('hello').bind();
});


suite.on("cycle", function (event) {
  console.log(String(event.target));
});


suite.on("complete", function() {
  console.log("Fastest is '%s'", this.filter("fastest").pluck("name"));
});

suite.run({ async: true });