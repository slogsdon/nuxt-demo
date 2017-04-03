const fs = require('fs');

module.exports = {
  build: {
    vendor: ['axios']
  },
  generate: {
    dir: 'docs',
    routes: function (callback) {
      fs.readFile('./static/api/posts.json', function (err, data) {
        if (err) {
          callback(err);
          return;
        }

        if (!data) {
          callback('no post data');
          return;
        }

        const posts = JSON.parse(data);
        const routes =
          posts.map(function (post) {
            return '/posts/' + post.slug;
          });

        callback(null, routes);
      });
    }
  }
};
