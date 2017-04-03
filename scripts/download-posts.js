const posts = require('../lib/wordpress').posts;
const fs = require('fs');

try {
  fs.mkdirSync('./static');
  fs.mkdirSync('./static/api');
} catch (e) {
  //
}

posts()
  .then((posts) => {
    fs.writeFile('./static/api/posts.json', JSON.stringify(posts), (err) => {
      if (err) throw err;
      console.log('Posts downloaded to ./static/api/posts.json');
    });
  })
  .catch(() => {
    console.log('Could not download posts');
  });
