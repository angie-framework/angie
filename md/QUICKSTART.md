## Quickstart

Angie is designed predominately to be used with versions of iojs-2.0.0+. I recommend using nvm. to manage your NodeJS versions. It cannot be downloaded via NPM: [nvm](https://github.com/creationix/nvm "nvm"). It will also work with all 0.12.x versions of NodeJS, but I am advising using these versions with caution, predominately as a byproduct of NPM package version installation dependencies. You can also try it with the newest NodeJS, but many packages are broken, so I'm not recommending it at this point. Switching in between versions after an Angie installation will cause module dependency mismatches. Future versions of Angie will run *exclusively* on NodeJS 4.x+.

It is also worth mentioning beforehand that Angie supports writing all of the syntax in this document in an ES6 fashion as well. Models can be instantiated as classes, and imports can be performed instead of references to the `global.app` object.

This tutorial should take about 15 minutes in its entirety.

* [Now We Can Write Some Code!](#now-we-can-write-some-code)
* [Getting Started with Models!](#getting-started-with-models)
* [Adding Template Complexity with Directives](#adding-template-complexity-with-directives)

### First, We're Going to Need Some Packages!
In the directory you would like your project to live, please run the following command:
```bash
npm install -g babel gulp-cli angie
angie createProject [name] [location]
```
Where NPM installs the Babel, Gulp, and Angie packages globally and where this Angie command creates a project in your current directory or passed (location) directory by the name entered. Not specifying a project name or specifying a location that is invalid will throw an error. To see a full list of Angie commands, use the following:
```bash
angie help
```
Hopefully by now, you've got a scaffolded project. If so, it's possible to start building our app.

We can test that the application runs successfully by running the following command at the root of our application.
```bash
angie watch 3000
```
Once your server is running, you should visit the webserver started at [localhost](http://localhost:3000 "default") (provided you used port 3000 as opposed to another port). If you see the text "Angie Test Page," all is well.

### Now We Can Write Some Code!
I like to encourage developer behavior whenever possible. Therefore, for the time being, it is not possible to load modules outside of the folders which have been scaffolded. That is to say that modules outside of these folders will not be loaded. However, any type of module can live in any of the prescribed folders.

Let's start by setting up some routes! In the configs directory, "src/configs", create a file called `routes.config.js`. Add the following code to that file:

```javascript
app.config(function($routeProvider) {
    $routeProvider.when('/test', {
        templatePath: 'index.html'
    });
});
```
This block should look somewhat familiar to you if you have written an AngularJS application. If you have not, I recommend looking into AngularJS. What we have just done is set up a custom route in our Angie application. To make sure that Angie knows where to find this route let's also add a file to our "template" directory. This directory was automatically added to your application when it was scaffolded.
```bash
cd templates
echo test >> index.html
```
This should have created a file called index.html in your templates folder. Because the templates directory is already included in our `AngieFile.json`, we do not need to tell the application where to find this template file. However, if we were to add the file in `templates/html`, we would need to specify this directory under `templateDirs` in the scaffolded `AngieFile.json`.

If you visit [that route](http://localhost:3000/test "route") in your browser, you should now see the file you created. Simple web server: check. Now, let's get a little fancy... just a little. Open the index.html file you just created and triple bracket "test":
```html
{{{foo}}}
```
In Angie templates triple brackets are compiled. We can now configure a scope with which to compile this template. We will first need a controller. From the application root, navigate to the `src/controllers` folder. Once there, create a file called `test.ctrl.js` to which we will add the following:
```javascript
app.Controller('TestCtrl', function($scope, $request) {
    $scope.foo = $request.query.test || 'test';
});
```
Now that we have a Controller, we can update our route to reference it.
```javascript
app.config(function($routeProvider) {
    $routeProvider.when('/test', {
        templatePath: 'index.html'
        Controller: 'TestCtrl'
    });
});
```
With that in place, if you visit the same route as before you should see the text "test," but if you visit [the route with an added query param, `test=angie`](http://localhost:3000/test?test=angie "modified route") you should see the text "angie". We have modified our scope to reflect the scope property "test," which is subsequently compiled into the template before a response is returned.

Angie will parse any expression included in triple brackets. If your expression is not interpreted, most likely because you referenced a property that did not actually exist on your scope, the triple bracketed expression will be replaced by an empty string.

It is worth noting that deep routes and RegExp routes can also be written! Each deep property that is not a `$routeProvider` keyword will be added as a route:
```javascript
app.config(function($routeProvider) {
    $routeProvider.when('/test', {
        templatePath: 'index.html'
        Controller: 'testCtrl',
        '/([A-Za-z0-9])/': {
            templatePath: 'nextIndex.html'
        }
    });
});
```
In this context, the route matching the RegExp `/test\/([A-Za-z0-9])\/` will be followed and the match pattern (the RegExp clause of the route) will be passed to the `request.query` of the request as params with keys 0-4 (up to five patterns will be matched). More details on this are available in the [documentation](https://doc.esdoc.org/github.com/angie-framework/angie/ "documentation").

### Adding Template Complexity with Directives
Directives can be used to modify the content of your routed controller in many ways. Whether you provide a template via `template` or `templatePath` to a Controller, post process compilation will occur on that template in the context of the Controller provided `$scope`. Default directives are prefaced with "ngie".

In the example above, we used a very simple compilation to replace a single triple bracketed statement with a value. Let us now define a directive to do a little bit more work in our template. For this, we will define a directive.

First, let us create a sub template, `directive.html`, to which we will add the following html:
```html
{{{bar}}}
```

Ok, we now have two templates and one endpoint. It can be useful to have many templates which feed into the context of a single route for the sake of reuse (reduce, reuse, recycle)! Let's do something with the template we just created.

From the application root, navigate to the `src/directives` folder. Once there, create a file called `test.directive.js` to which we will add the following:
```javascript
app.directive('TestDir', function() {
    return {
        restrict: 'C',
        templatePath: 'directive.html'
    };
});
```

This is a very simple directive which will compile and load the contents of the `directive.html` into any element on which it is specified. Note that this is a function, but one could declare a class to perform the same task. Back in our `index.html` file, let's add the following code:

```html
<div class='test-dir'>
```

We've declared the directive as "C" or "Class restrictive" which implies that we can only declare it as a class. If we wanted, we could also declare it as "A" or "Attribute restrictive", "E or Element restrictive", or any combination of the three (I never understood why anyone would want to conflate HTML comments with parsed HTML content and therefore the "M" functionality of AngularJS is not supported in Angie directives).

This is great, you should be able to load the same route as before without any issues. However, you will quickly notice that our addition of the `TestDir` directive did nothing. Why? `$scope.bar` is `undefined`. To demonstrate the functionality of directive link functions, I will define the `$scope.bar` property as a byproduct of the directives associated link function. The directive link function is a function that fires every time a directive is referenced and loaded into the template, but before it is compiled.

Back in our `test.directive.js` file, add the following to the directive we just defined:
```javascript
app.directive('TestDir', function() {
    return {
        restrict: 'C',
        templatePath: 'directive.html',
        link: function($scope) {
            $scope.bar = 'bar';
        }
    };
});
```
Bear in mind two things here:
- Angie preserves whitespace in all template rendering
- Directives inject dependencies in the same fashion as any other Module, so at the top level, one would declare all of the required dependencies, however, the link function is always provided the same arguments:
    - $scope
    - The element upon which the link function is firing as a jqLite style element (Cheerio provides their own jQuery like API on top of parsed DOM elements)
    - The attributes of the element upon which the link function is firing, parsed to camelCase

Opening the very same endpoint as before, you should now see the text `foo bar`.

### Getting Started with Models!
Communicating with data models is a quintessential part of using an MVC. Nevertheless, the Angie ORM is not included by default. To use the ORM, simply install it:
```bash
npm install angie-orm
```
anf include `angie-orm` as a dependency in your `AngieFile.json`.

Next we will set up a very simple Model. Angie Models are very different from AngularJS models in the sense that they are actually database objects as opposed to front end data models. The databases which communicate with the Angie ORM are all configured in the `AngieFile.json`.

All of the following code is required into the Angie project from the [Angie ORM Repository](https://github.com/angie-framework/angie-orm "angie-orm") and outlined in additional detail on that repository's site.

To create a new database connection, we add an object to our `AngieFile.json` under the "databases" property under a key that represents the database name. One should already exist as a result of the scaffold.
```json
"testCtrl": {
  "type": "sqlite3",
  "name": "projectName.db"
}
```
However, no database is created until it is synced. For more information about what options are required by a specific database type or whether a database is supported, please see the [documentation](https://doc.esdoc.org/github.com/angie-framework/angie/ "documentation").

Now let's create our database by running the "sync" command:
```bash
angie syncdb [database name]
```
Note that the command above takes an optional database option. This is not required if we are syncing our default database. Also, note that we haven't actually created any models. Let's create one now. In the scaffolded folder `src/Models` create a file called `test.model.js`. In this file, we will create our model.
```javascript
app.Model('TestAngie', function($fields) {
    let obj = {};

    obj.name = 'test_angie';
    obj.username = new $fields.CharField({
        minLength: 1,
        maxLength: 50,
        unique: true
    });

    return obj;
});
```
If you run the "syncdb" command once more, it will add a model to our database with the name "test_angie", which is a horrible naming convention, but we are using it for demonstratory purposes. Feel free to change this at your leisure. Without the "name" property, this model would be named "TestAngie". The `$fields` service is automatically passed into the model. It gives the model access to all the available field types We've added a CharField to our model. The `$fields` service supports all of the fields you may want to use in your project. See the [documentation](https://doc.esdoc.org/github.com/angie-framework/angie/ "documentation") for a full list.

Now for the fun part, we are going to create a record in our database and then get that record to render in our previously created template. Open up a sqlite shell using the following command:
```bash
sqlite3 < [database name] # Do not forget the .db!
```
After the database shell opens, run the following command and then quit the shell.
```sql
INSERT INTO test_angie (username) VALUES ('blah');
```
We are finally ready to revisit our Controller. In the `test.ctrl.js` we created before replace the `$scope` assignment of "test" with the following code:
```javascript
AngieUserModel.filter({
    rows: 1,
    head: true,
    username: 'blah',
    database: 'default'
}).then(function(queryset) {
    $scope.test = queryset[0].username;
    app.Controller.done();
});
```
Now, if you revisit our former [test page](http://localhost:3000/test) you should see the text "blah." Note that our Controller can be asynchronous or synchronous, but if it operates in an async fashion, it must resolve. It can resolve based on the very last argument passed to the Controller, or the
done method on `app.Controller` or `$response.Controller`.

This concludes the Angie Quickstart! I hope you enjoyed building your very own backend app with Angie. Feel free to let me know what you think about the library or any [issues](https://github.com/angie-framework/angie/issues) in this repository.