## Angie

### About
Angie is an MVC that runs in NodeJS designed with AngularJS in mind. It allows you to create web applications by routing requests to controllers and directives and referencing data models in a fashion similar to how you would using AngularJS. Although the naming and providers are different, the goals and best practices are the same.

Angie is simple to use, flexible, and lightweight and offers a holistic approach to JavaScript across the stack.

For more details on how to get started, please see the quickstart section.

AngularJS is in no way used or affiliated with this project.

### News

#### Second Developer Preview: June 15<sup>th</sup>, 2015
I will tentatively be launching the second developer preview on June 15<sup>th</sup>. This preview will include full ORM support, better templating support, and both Template and API style views. The preview will not include the full range of possible serializers or renderers.

#### Angie Module Dependencies
I was considering not including application dependencies, but they are the best way to include plugins or extensions on to the Angie code. I've added a way to add dependencies at the AngieFile level. Adding root folders of other Angie projects to the "dependencies" object within the AngieFile
will then extend all of the providers from that project on to the target project. Enjoy!

#### First Developer Preview: May 15<sup>th</sup>, 2015
I am happy to announce that I will be releasing the first developer preview of Angie and my vision for it's development on May 15<sup>th</sup>. I will also be doing an open call for contributors at this time. You will be able to use some of the functionality by following the quickstart guide.

### Quickstart
Angie will work with any version of npm 0.10.0+, however, I recommend using nvm. It cannot be downloaded via npm:
[nvm](https://github.com/creationix/nvm)
Please visit this link and follow the instructions listed for iojs-2.0.1

#### First, we're going to need some packages!
In the directory you would like your project to live, please run the following command:
```bash
    npm install -g babel gulp-cli angie
    angie createProject <name>
```
Where npm installs the babel, gulp, and angie packages globally and where this angie command creates a project in your current directory by the name entered. To see a full list of angie commands, use one of the following:
```bash
    angie
    angie help
```
Hopefully by now, you've got a scaffolded project. If so, it's possible to start building our app.

We can test that the application runs successfully by running the following command at the root of our application.
```bash
    angie s 3000
```
Once your server is running, you should visit
[localhost:3000/](http://localhost:3000) in your browser. If you see the text "Angie Test Page," all is well.

### Now we can write some code!
I like to encourage proper developer behavior whenever possible. Therefore, for the time being, it is not possible to load modules outside of the folders which have been scaffolded. That is to say that modules outside of these folders will not be loaded. However, any type of module can live in any of the prescribed folders.

Let's start by setting up some routes! In the configs directory, create a file called `routes.config.js` or `routes.config.es6`. Add the following code to that file:
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
    echo test >> test.html
```
This should have created a file called test.html in your templates folder. Because the templates directory is already included in our AngieFile, we do not need to tell the application where to find this template file. However, if we were to add the file in "templates/html", we would need to specify this directory under "templateDirs" in the scaffolded AngieFile.

If you visit [localhost:3000/test](http://localhost:3000/test) in your browser, you should now see the file you created. Simple webserver: check. Now, let's get a little fancy... just a little.

Open the test.html file you just created and triple bracket "test":
```bash
    {{{test}}}
```
In Angie templates triple brackets are compiled. Default directives are prefaced with "ngie". We can now configure a scope with which to compile this template. We will first need a controller. From the application root, navigate to the "src/controllers" folder. Once there, create a file called `test.ctrl.js` or `test.ctrl.es6` to which we will add the following:
```javascript
    app.Controller('testCtrl', function($scope, $request) {
        $scope.test = $request.query.test || 'test';
    });
```
Now that we have a Controller, we can update our route to reference it.
```javascript
    app.config(function($routeProvider) {
        $routeProvider.when('/test', {
            templatePath: 'index.html'
            Controller: 'testCtrl'
        });
    });
```
With that in place, if you visit [localhost:3000/test](http://localhost:3000/test) you should see the text "test," but if you visit [localhost:3000/test?test=angie](http://localhost:3000/test?test=angie) you should see the text "angie". We have modified our scope to reflect the scope property "test," which is subsequently compiled into the template before a response is returned.

This concludes the quickstart through the first developer preview. Thanks for following along. On June 15<sup>th</sup>, there will be further instructions on database setup, and both template and API directive rendering.
