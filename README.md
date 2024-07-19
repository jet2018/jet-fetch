## About jet-fetch library

jet-fetch provides a wrapper class for the [fetch]("https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"). It can be somehow tricky to use fetch API especially for a beginner. However, this library provides a simple way to use fetch API. The package is fully customizable using its `custom` method that enables you customize the whole API

> Anouncing version 1.1.2 which came with a full migration to typescript, addition of tests, and support of caching for `get` and `gets` request.

The package ships with the five commonly used http methods but has room for expansion. It covers:-

```
GET
POST
PUT
DELETE
PATCH
```

The above are supported by default as they seem to be the commonly used methods.

The plugin is totally customizable and therefore can be simple to play with.

With a good knowledge of the fetch API, you can easily implement your own fashion of the library.

## Installation

With npm, simply run

```bash
npm i jet-fetch
```

or with yarn

```bash
yarn add jet-fetch
```

## Defaults

The library provides various defaults out of the box. All of which can also be overwritten.

Examples.

1. The library by default will allow `cors` if you do not manually set them.
   This can be overriden by setting `cors` to `true` and then defining your custom `Access-Control-Allow-Origin` which will also default to `*`.
2. Defaults to returning the response as a `JSON` object.

```JS
response  = {
    'response': response,
    'data': resData
}
```

On `response`, that's where you can find the `response` object. such as `status`, `statusText`, `headers`, `ok`, `redirected`, `type`, `url`, `body`, `bodyUsed`. For more about this, just read above above mentioned fetch API.

Whereas on `data`, that's where you can find the `data` object. which represents the actual data from your server.

### Class instatiation.

Previous versions did not have the `options`, but with TypeScript, an interface of the options has been added on class instatiation.

Options.

```ts
interface Configuration {
  baseUrl: string;
  interceptWithJWTAuth?: boolean;
  token?: any;
  tokenBearerKey?: string;
  sendTokenAs?: string;
  defaultHeaders?: HeadersInit;
  cachable?: boolean;
}
```

<table>
<thead>
<th>Param</th>
<th>Default</th>
<th>Required</th>
<th>Use</th>
</thead>
<tbody>
<tr>
  <td>baseUrl</td>
  <td>-</td>
  <td>false</td>
  <td>The base url the entire package will rely on.</td>
</tr>
<tr>
  <td>interceptWithJWTAuth</td>
  <td>false</td>
  <td>false</td>
  <td>If true, the package will attempt attaching the jwt token as explained in the following guide</td>
</tr>
<tr>
  <td>token</td>
  <td>-</td>
  <td>false</td>
  <td>This can be any source of token like a function to execute to obtain, a token itself, once provided, the package won't be checking localstorage for any token, but will always refer to it for the token, for every secure request, the value of this param will be used as the jwt</td>
</tr>
<tr>
  <td>sendTokenAs</td>
  <td>'Bearer'</td>
  <td>false</td>
  <td>This is how the token will be sent to the backend, in short, this is how your backend expects your token and it defaults to 'Bearer' and by convention, it should be one of Bearer, Jwt, Token, but you can pass it as anything you want or empty "" to send nothing in its position</td>
</tr>
<tr>
  <td>tokenBearerKey</td>
  <td>'SecretKey'</td>
  <td>false</td>
  <td>Defines how the token is stored in your localstorage, this will be the key to check for in the localstorage and defaults to 'SecretKey'. This assumes that you keep your key in localStorage and you want the library to pick it for you on secure requests</td>
</tr>
<tr>
  <td>defaultHeaders</td>
  <td>{}</td>
  <td>false</td>
  <td>These are headers you want to be common to all requests, you can override these by re-defining the same in the subsequent request, those will overrride what you had declared on initialisation. Defaults to an empty object. Any valid fetch is allowed heres</td>
</tr>
<tr>
  <td>cachable</td>
  <td>true</td>
  <td>false</td>
  <td>This makes requests cached thus improving the perfomance of the request. Once its on, it adds the {'cache': 'default'} to the headers, and once turned off, it turns the same to 'no-cache'. Still this can be overriden by passing the cache header on your subsequent request headers. To globally disable caching, turn this off. However, defining the header on subsequent will turn caching back on.</td>
</tr>
</tbody>
</table>

## Implementation

```js
import { Jet } from 'jet-fetch'; // get the right way for importing this, but remember it is an es5+ module.

let jet = new Jet({
  baseUrl: "http://mycooldomain.com/api/";
  interceptWithJWTAuth: true;
  token: null;
  tokenBearerKey: "SecretKey";
  sendTokenAs: "Bearer";
  defaultHeaders: {};
  cachable: true;
});
```

## With JWT Authentication in mind

The library comes with full support for JWT authentication.

## Interception with JWT Authentication

We understand that most modern platforms are using Bearer Tokens or JWT or OAuth for securing their platforms therefore, the library ships in with amazing and simple to use tools for this.

### Instantiating with JWT in mind

If your app is using JWT authentication, which in most cases will be stored in `localstorage` as `Bearer`, you can define your `Jet` class as below. If this is the case for you, then the code below is enough for you.

```JS

import {Jet} from 'jet-fetch';

const jet = new Jet({
  baseUrl = "https:your-cool-base-url.com",
  interceptWithJWTAuth = true // notice this.
})
```

With just the above, the library will try to load the JWT from the localstorage, send it to the backend as "Bearer \<token from the localstorage>" and add to your "Authorization" header attribute.

### Customising the above

If your backend, for example, does not expect the token as `Bearer`, maybe it expects it as `Token` or `JWT`, then your class should have an additional parameter `sendTokenAs` and if not defined, it will always default to `Bearer`.

Example:

```JS
import {Jet} from 'jet-fetch';

const jet = new Jet({
  baseUrl = "https:your-cool-base-url.com",
  interceptWithJWTAuth = true,
  sendTokenAs="Token" // notice this
})
```

If your token is not stored as `Bearer` in your localstorage, maybe you keep it as `secretkey`, then you call tell the package to look for that like this.

```JS
import {Jet} from 'jet-fetch';

const jet = new Jet({
  baseUrl = "https:your-cool-base-url.com",
  interceptWithJWTAuth = true,
  tokenBearerKey="secretkey" // notice this
})
```

**_NOTE:_** The above still expects your token to be stored in localstorage, but this is sometimes not the case, you can store you token anywhere!! The above may not help, read ahead to customise that.

### Full Customising of the above

The above will work well when your token is in your localstorage.

But imagine one who is keeping this token in maybe sessionStorage, realm db or anywhere!.

Then it is also possible to define your interception with your own source of code like below. Remember this should be done on class instatiation otherwise it may break.

As long as your functionality, once executed, returns the code, the below will work fine.

```JS
import { Jet } from 'jet-fetch';

// here the user is getting the token from the sessionStorage.
let my_token = null
try{
  my_token = sessionStorage.getItem("token")
}catch(err){
  // the token is not available
}

const jet = new Jet({
  baseUrl = "https:your-cool-base-url.com",
  interceptWithJWTAuth = true,
  token = my_token // notice this
})
```

NOTE: When `token` is defined in the class, it will take precendence of the rest of the parameters you pass except `interceptWithJWTAuth`. Which means, the library won't be checking in your localstorage at all.

But with this last one, Remember our token will be sent as `Bearer`, to customize that, just like as explained above, define your `sendTokenAs`. in the class instantiation.

```JS
import { Jet } from 'jet-fetch';

// here the user is getting the token from the sessionStorage.
let my_token = null
try{
  my_token = sessionStorage.getItem("token")
}catch(err){
  // the token is not available
}

const jet = new Jet({
  baseUrl: "https:your-cool-base-url.com"
  token: my_token
  sendTokenAs: "JWT" // notice this
})


```

## Turning on and off of caching.

NOTE:- Caching only works for `get` and `gets` requests and you should never any other requests.

To turn off caches, then this is enough. With this in place, for every `get` or `gets` request, then the browser will not check from the cache and won't also save the response it obtains back.

```JS
import { Jet } from 'jet-fetch';

const jet = new Jet({
 // ...
  cachable: false // notice this
})

```

By default caches are turned on, which implies the browser will check if there is any fresh cache (will dispose off slate caches) and return that otherwise, it will make the request to the server, obtain the response and add it to the cache for future use.

If it is not so much necessary, please leave this feature turned to true for performance enhancements.

Now, after fully defining your `Jet` instance, you can then export it and start using it in the rest of your application.

```JS
import { Jet } from 'jet-fetch';


//.....

export default jet;
```

## Performing Requests --with examples

The following examples assume you have already initailized the library. For all the examples below, `headers` and `config` is optional.

### GET

#### NOTE: `GET` requests do not support passing in the body

```JS
jet.
  get(url="users")
  .then(res => console.log(res.data))
  .catch(err => console.debug(res.response.statusText))
```

### POST

```JS
let data = {username: "jet", password:12345}

jet.
  post("users", data,)
  .then(res => res.data)

```

The plugin support by default `GET`, `PUT`, `POST`, `DELETE`, `PATCH`
as illustrated above.

## Defining custom request methods

If the request method you are looking for is not provided among the top five, you can define your own request method.

```js
/**
 * @param url is your request url to use, can be absolute or relative to the baseUrl, it will only depend on if you defined your baseUrl.
 * @param type is the request type, can be GET, HEAD etc
 * @param body is the body of your request
 * @param headers are the headers specific to this request.
 * @param configs any other fetch config options you would like to pass
 */
jet
  .custom(url, type, body?, headers?, configs?)
  .then((res) => {
    // do something with the response
  })
  .catch((err) => {
    // do something with the error
  });
```

> All the above mentioned methods won't trigger any checking of the JWT token according to your settings, however, secure counterparts of each method have also been added. Calling these with the same data will actually trigger checking for the token and passing it in the headers as Authorization header.

The seperation is to improve the performance so that those endpoints that don't require the token should not even check for it at all.

Use the following to enable the JWT functionalities:-

```js
import { Jet } from 'jet-fetch';
const jet = new Jet(...options);
jet.gets();
jet.posts();
jet.patchs();
jet.puts();
jet.deletes();
```

Note: You only pluralize the previous method by adding s -- for secure to start checking for JWT token.

This is still available on the `custom` method.

```js
jet.custom(url, type, body, headers, configs, secure);
```

Note: The new param `secure` added to make a custom request that will actually check for the token. Pass this as true, omit it or pass it as false to omit checking.

### Moonlight Pattern Developers.

If you're using Moonlight powered backend, the following assumptions are made.
1. The backend will always define a `returnCode`. 
2. By default, this the `returnCode` will be 0.
3. The Server will always return a `returnMessage` which will be a string or null.
4. The Server will always return a `returnData` object which will be an object or null.
5. All requests that hit your backend will return a 200 OK status code.
6. Each request will define both the service and action or SERVICE and ACTION in the request body. 
7. The backend will always return a `returnCode` which will be a number.
8. All requests are `POST` or `GET` requests.
9. Get requests are only meant to check the api availability, take no data and return a 200 OK status code.
10. Everything is pointing to the same endpoint.

Assuming your api runs on http://localhost:8000/api/:-

You can initialise your Jet instance like this:-

```js
import { Jet } from 'jet-fetch';
const jet = new Jet({
  baseUrl: 'http://localhost:8000/api/'
});
```

To check the availability of your api, you can run:-
```js
const res = await jet.checkPioniaStatusForVersion('v1/');
```

To make a request to your backend, you can run:-

```js
try {
  const res = await jet.moonlightRequest({ service: 'yourService', action: 'yourAction', ...anyOtherData });
} catch (error: MoonlightError) {
  console.log(error.message);
}
```

For details about this, you can check the cause of the exception in the `error.cause` property.
```js
console.log(JSON.parse(error.cause));
```

It will look like this:-
 ```ts
 {
 returnCode: number,
 returnMessage: string,
 ...anyOtherData
 }
 ```

You can then throw the error to the user or handle it in any way you want.

## Customization.

This method is fully customisable and you can define your own way of handling the requests.

### Defining custom error handler.

In normal cases, the helper above will just throw an error, but you can define your own error handler.

```js
import { Jet } from 'jet-fetch';
const jet = new Jet({
  baseUrl: 'http://localhost:8000/api/', 
  moonlightErrorhandler: (error) => { // not this is a callback
    console.log(error);
  }
});
```
We will pass the error to this handler and the exception won't be thrown at all.

### Overriding the custom success code.

In moonlight, the success code is 0, but you can override this by defining your own success code.

```js
import { Jet } from 'jet-fetch';
const jet = new Jet({
  baseUrl: 'http://localhost:8000/api/',
  moonlightSuccessCode: 200 // not this is a number
});
```

### Overriding internal error code.

Using this helper, when an error is raised before the request say when there is no internet connection or the server 
is unreachable, the library will throw an error with a cause that defines a `returnCode` that is equivalent to 
`moonlightSuccessCode + 1000`. This implies that the default value of `moonlightSuccessCode` is 0, therefore the
default value of the internal error code is 1000, if you change it to 200, then the internal error code will be 1200.

However, you can define the code to be anything you want on the class instantiation.
```js
import { Jet } from 'jet-fetch';
const jet = new Jet({
  baseUrl: 'http://localhost:8000/api/',
   internalErrorCode: 500 // not this is a number
});
```
Note that this won't affect the request that fail from the server as these already define their own `returnCode`.

### Overriding the default api version targeted.

By default, the helper targets version 1 as `v1/`, but you can override this by defining your own version.

```js
import { Jet } from 'jet-fetch';
const jet = new Jet({
  baseUrl: 'http://localhost:8000/api/',
});

const res = await jet.moonlightRequest({ service: 'yourService', action: 'yourAction', ...anyOtherData }, 'v2/');
```

### Attaching extra headers to the request.

However much this can done on the class instance as already discussed above, you can also do it on the request level
by defining the 3rd parameter of the `moonlightRequest` method.

```js
const res = await jet.moonlightRequest({ service: 'yourService', action: 'yourAction', ...anyOtherData }, 'v2/', { 'Content-Type': 'application/json' });
```

## Response Subscription.

In normal circumstances, the response is returned as a promise, but you can also subscribe to the response by defining the 
callback which will be called immediately the response is obtained as the 4th parameter of the `moonlightRequest` method.

```js
const res = await jet.moonlightRequest({ service: 'yourService', action: 'yourAction', ...anyOtherData }, 'v2/', { 'Content-Type': 'application/json' }, (res) => {
        setState(res?.returnData) // you can do anything with the response here.
      });
```

We shall pass the response `data` to this callback.

## Securing Moonlight Requests.

If you are using this package, they already know that it auto attaches the authentication token to the request. Usually
this is done by calling same method as the normal request but with an `s` at the end. 

However with moonlight, you can secure your request by calling the `secureMoonlightRequest` method.

secureMoonlightRequest takes the same parameters as the `moonlightRequest` method but with the ability to attach the token.
```js
const res = await jet.secureMoonlightRequest({ service: 'yourService', action: 'yourAction', ...anyOtherData }, 'v2/', { 'Content-Type': 'application/json' }, (res) => {
        setState(res?.returnData) // you can do anything with the response here.
      });
```

If you're using the [Pionia Framework](https://pionia.netlify.app) or any other framework that uses the `Moonlight` pattern, then the last part of this package is for you.

## Tests.

From version 1.1.2, Jest-powered tests were added to the package and to run them, just run :-

```shell
yarn test
```
or 
```shell
npm run test
```

Good luck with the new way of having fun with `APIs`.

Most of the scenarios are summarised in 7 tests, which by end will have run every single line of the package thus being bug-free.

## Contributing

Thanks to those that have tested the Plugin and contributed and we still welcome more..!

Please get started by reading through our [contributing guide](https://github.com/OSCA-Kampala-Chapter/jet-fetch/blob/jet/CONTRIBUTING.md)

To contribute, fork this repo, make your changes, test them and then make a pull request.

## License

[MIT LICENSE](LICENSE)
