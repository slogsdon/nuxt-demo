const http = require('http');
module.exports = (req) => {
  console.log('get posts');
  return new Promise((resolve, reject) => {
    console.log('create promise');
    http.get('http://' + req.headers.host + '/api/posts', (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {console.log(data);resolve(data);});
    })
    .on('error', (err) => reject(err));
  });
};
