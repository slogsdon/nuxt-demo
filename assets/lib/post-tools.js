import marked from 'marked';
import hljs from 'highlight.js';

export function getPosts() {
  const context = require.context('~assets/posts', true, /\.md$/);
  const keys = context.keys();
  return keys
    .map(context)
    .map((p, i) => {
      const slug =
        keys[i]
        .split('/')
        .slice(1)
        .join()
        .split('.')
        .slice(0, -1)
        .join();
      return updatePostObject(p, slug);
    });
}

export function markdown(content) {
  marked.setOptions({
    langPrefix: 'hljs language-',
    gfm: true,
    highlight: (code, lang) => hljs.highlightAuto(code, [lang]).value
  });
  return marked(content);
}

export function updatePostObject(post, slug) {
  if (slug) {
    const re = /(\d{4})\-(\d{2})\-(\d{2})-(.*)/;

    if (re.test(slug)) {
      const matches = re.exec(slug);
      const year = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1;
      const day = parseInt(matches[3], 10);
      slug = matches[4];
      post.date = new Date(year, month, day);
    }

    post.slug = slug;
  }

  for (const prop in post.attributes) {
    if (post.attributes.hasOwnProperty(prop)) {
      post[prop] = post.attributes[prop];
    }
  }
  delete post.attributes;
  post.body = markdown(post.body);
  return post;
}
