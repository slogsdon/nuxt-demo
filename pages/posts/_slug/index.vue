<template>
  <div>
    <h1>{{ title.rendered }}</h1>
    <p>{{ content.rendered }}</p>
  </div>
</template>

<script>
import posts from '~static/api/posts.json';

export default {
  asyncData({ params, error }) {
    const filteredPosts = posts
      .filter((post) => post.slug === params.slug);

    if (filteredPosts.length !== 1) {
      error({ message: `Error retrieving post ${params.slug}`, statusCode: 404 });
    }

    return filteredPosts[0];
  },
  head() {
    return {
      title: 'Posts'
    };
  }
}
</script>
