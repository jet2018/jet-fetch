import { Jet } from '../index';
const jet = new Jet({ baseUrl: 'https://jsonplaceholder.typicode.com/' });

test('headers', () => {
  expect(typeof jet._getHeaders()).toBe('object');
});

test('get', () => {
  expect(jet.get('todos/1')).toBeInstanceOf(Promise<{ res: object; response: object }>);
});

test('post request', () => {
  const body = {
    title: 'foo',
    body: 'bar',
    userId: 1,
  };
  const resp = jet.post('todos/1', body);
  expect(resp).toBeInstanceOf(Promise<{ res: object; response: object }>);
});

test('post request secured', () => {
  jet.token = 'thisismytesttokenthathastobeattachedintheheadersoftherequest';
  jet.interceptWithJWTAuth = true;
  const body = {
    title: 'foo',
    body: 'bar',
    userId: 1,
  };
  expect(jet.posts("/todos/1", body)).toBeInstanceOf(Promise<{ res: object; response: object }>);
});

/**
 * test if given a token, it gets added to the headers
 */
test('token is attached', () => {
  jet.token = 'mysampletokenhere';

  expect(jet.attachAuthorisation()).toBeInstanceOf(Object)
  expect(jet.token).toBeDefined();
});


/**
 * test if given a token, it gets added to the headers
 */
test('token header attaches', () => {
  expect(jet.generateAuthHeader("mysampletokenhere")).toBeInstanceOf(Object);
});

/**
 * test if given a token, it gets added to the headers
 */
test('Check that cors are removed well', () => {
  expect(jet._getHeaders()).not.toContain('Access-Control-Allow-Origin');
});

test('Check Authorization', () => {
  jet.token="thisismytesttokenthathastobeattachedintheheadersoftherequest";
  jet.interceptWithJWTAuth = true;
  expect(jet.__attach_auth()).toHaveProperty('Authorization');
});

test("Check if the url is set right", () => {
  expect(jet._setUrl("/v1/")).toBe("https://jsonplaceholder.typicode.com/v1");
})



// test('Check that secure sends token', async () => {
//   jet.baseUrl = 'http://localhost:8000/api/';
//   jet.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJQaW9uaWEiLCJpYXQiOjE3MjI5NTExNTQsImV4cCI6MTcyMjk1NDc1NCwic3ViIjoiZXpyYWpldDlAZ21haWwuY29tIn0.PhS_lrT0nxvJqoHoJtYyt-UED1rUCWLrDsrrxD5XaAE"
//   const res = await jet.secureMoonlightRequest({service: 'cart', action: 'list'}, "v1/");
//   expect(res.returnCode).toBe(0);
// });
