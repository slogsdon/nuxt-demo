<template>
  <div>
    <nuxt/>
    <app-menu></app-menu>
  </div>
</template>

<script>
import * as AppMenu from '~components/Menu';

export default {
  components: {
    AppMenu
  }
}
</script>
