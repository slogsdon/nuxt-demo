const https = require('https');

exports.posts = function posts() {
  const options = {
    host: 'slogsdon.azurewebsites.net',
    port: 443,
    path: '/wp-json/wp/v2/posts',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    var req = https.request(options, (res) => {
      var data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
};

exports.post = function post(slug) {
  const options = {
    host: 'slogsdon.azurewebsites.net',
    port: 443,
    path: '/wp-json/wp/v2/posts?slug=' + slug,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    var req = https.request(options, (res) => {
      var data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        var posts = JSON.parse(data);

        if (!posts.length) {
          reject(new Error('Not found'));
          return;
        }

        resolve(posts[0]);
      });
    });
    req.on('error', reject);
    req.end();
  });
};
