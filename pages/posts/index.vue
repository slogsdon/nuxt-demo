<template>
  <main>
    <h1>All Posts</h1>
    <article v-for="post in posts">
      <h2>{{ post.title }}</h2>
      <nuxt-link :to="{ name: 'posts-slug', params: post }">Read more...</nuxt-link>
    </article>
  </main>
</template>

<script>
import { getPosts } from '~assets/lib/post-tools';

export default {
  data() {
    return { posts: getPosts() };
  },
  head() {
    return {
      title: 'All Posts'
    };
  }
}
</script>
