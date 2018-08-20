Development workflow:

 1. Run `server/bin/simple.js -d .` in the dist directory of your project
 2. Run a web server that serves index.html
 3. Include this code:

 ```js
 <script 
      async
      type='text/javascript' 
      src='http://localhost:3000/turbo.js' 
      id='turbojs' 
      data-scripts='bundle.js'>
    </script>
  ```


The server will run on localhost:3000.

It will set a cookie equal to the version of the bundle it's delivered to the client.
If the client has the old version, it will send the new one down and update it.

The version is currently equivalent to the hash of the most recent build.
If there is a new version, it includes the bootstrap code which will simutaneously 1) download it and 2) store it as the new version. 

Then, it will run the client, which will likely make another request to the bundle. This is where I am trying to optimise it.

Maybe you can also send a binary AST down the line 
Don't forget parsing times as the biggest factor
the client has to reparse the AST, why? 

they should just trust it already

we can make a trusted and non trusted client

https://github.com/tc39/proposal-dynamic-import

