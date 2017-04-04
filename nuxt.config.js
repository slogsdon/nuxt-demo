const fs = require('fs');

module.exports = {
  build: {
    loaders: [
      {
        test: /\.md$/,
        loaders: [
          'json-loader',
          'front-matter-loader',
        ],
      },
    ],
    vendor: ['marked','highlight.js'],
  },
  css: [
    'highlight.js/styles/github.css',
  ],
  generate: {
    dir: 'dist',
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
    },
  },
  router: {
    base: process.env.BASE_URL || '/'
  }
};
