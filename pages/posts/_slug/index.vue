<template>
  <main>
    <h1>{{ title }}</h1>
    <section class="content" v-html="body"/>
  </main>
</template>

<script>
import {
  markdown,
  getPosts,
} from '~assets/lib/post-tools';

export default {
  asyncData({ params, error }) {
    const posts =
      getPosts()
      .filter((p) => p.slug === params.slug);

    if (posts.length === 1) {
      return posts[0];
    }

    error({ message: 'Post not found', statusCode: 404 });
  },
  head() {
    return {
      title: this.title
    };
  },
}
</script>
