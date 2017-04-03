<template>
  <div>
    <h1>Posts</h1>
    <article v-for="post in posts">
      <h2>{{ post.title.rendered }}</h2>
      <nuxt-link :to="{ name: 'posts-slug', params: post }">Read more...</nuxt-link>
    </article>
  </div>
</template>

<script>
import posts from '~static/api/posts.json';

export default {
  data() {
    return { posts };
  },
  head() {
    return {
      title: 'Posts'
    };
  }
}
</script>
