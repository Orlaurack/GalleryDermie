<script lang="ts">
export default {
  data() {
    return {
      searchMode: false,
      searchText: '',
      massonry: false
    }
  },
  emits: ['search', 'changeMode'],
}
</script>

<template>
  <div class="nav-bar">

    <router-link to="/">
      <svg class="icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.75 13.5279V28.5226H13.5V18.4356H18.5V28.5226H27.25V13.5598M4.75 13.5279L16 3L27.25 13.5598M4.75 13.5279L1 17.0373M27.25 13.5598L31 17.0562" stroke="currentColor" stroke-width="3"/>
      </svg>
    </router-link>
    <router-link v-if="$route.path !== '/add-image'" to="/add-image">
      <svg class="icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 16L28 20.6667M16 4H4.25V23M4.25 23L12 16L21.3333 24M4.25 23V28H28V20.6667M28 20.6667L22.75 16.5L18.6667 20.6667M20 8H28M24 4V12" stroke="currentColor" stroke-width="3"/>
      </svg>
    </router-link>
    <div v-if="$route.path === '/'" class="search-bar">
      <input id="search-input" v-model="searchText" @input="this.$emit('search', searchText)" class="search-input" type="text" :class="{enable: searchMode}">
      <label for="search-input" @click="searchText = ''; this.$emit('search', searchText)">
        <svg @click="searchMode =! searchMode" class="icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M28 28L19.2582 19.2582M19.2582 19.2582C20.9816 17.5347 22.0476 15.1537 22.0476 12.5238C22.0476 7.26395 17.7837 3 12.5238 3C7.26395 3 3 7.26395 3 12.5238C3 17.7837 7.26395 22.0476 12.5238 22.0476C15.1537 22.0476 17.5347 20.9816 19.2582 19.2582Z" stroke="currentColor" stroke-width="3"/>
        </svg>
      </label>
    </div>
    <div v-else-if="$route.path !== '/add-image'" class="detail-mode" @click="massonry =! massonry; this.$emit('changeMode', massonry)">
      <svg v-if="!massonry" class="icon massonry" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M29.3334 22.5V13.332H17.3334V22.5H29.3334ZM17.3334 25.25V28H28C28.3536 28 28.6928 27.8595 28.9428 27.6095C29.1929 27.3594 29.3334 27.0203 29.3334 26.6667V25.25H17.3334ZM14.6667 28V21.332H2.66669V26.6667C2.66669 27.0203 2.80716 27.3594 3.05721 27.6095C3.30726 27.8595 3.6464 28 4.00002 28H14.6667ZM14.6667 18.6653V4H4.00002C3.6464 4 3.30726 4.14048 3.05721 4.39052C2.80716 4.64057 2.66669 4.97971 2.66669 5.33333V18.6653H14.6667ZM28.9428 4.39052C28.6928 4.14048 28.3536 4 28 4H17.3334V10.6653H29.3334V5.33333C29.3334 4.97971 29.1929 4.64057 28.9428 4.39052Z" fill="currentColor"/>
      </svg>
      <svg v-else class="icon default" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4V28H4.00002C3.6464 28 3.30726 27.8595 3.05721 27.6095C2.80716 27.3594 2.66669 27.0203 2.66669 26.6667V5.33333C2.66669 4.97971 2.80716 4.64057 3.05721 4.39052C3.30726 4.14048 3.6464 4 4.00002 4H8Z" fill="currentColor"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M29 5.33333V8H10V4H27.6667C28.0203 4 28.3594 4.14048 28.6095 4.39052C28.8595 4.64057 29 4.97971 29 5.33333Z" fill="currentColor"/>
          <path d="M14 10V28H25V10H14Z" fill="currentColor"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12.6465 15.6464L13.3536 16.3536L10.7071 19L13.3536 21.6464L12.6465 22.3536L9.29291 19L12.6465 15.6464ZM28.2929 19L25.6465 16.3536L26.3536 15.6464L29.7071 19L26.3536 22.3536L25.6465 21.6464L28.2929 19Z" fill="currentColor"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.nav-bar {
  z-index: 100;
  position:fixed;
  top: 0;
  left:0;
  right: 0;
  height: 32px;
  display: flex;
  gap:16px;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  border: 4px solid var(--primary);
  background-color: var(--navbar-background);
}
.nav-bar .icon {
  color: var(--primary);
  cursor: pointer;
}
.nav-bar .search-bar{
  position: relative;
}
.nav-bar .search-input{
  position: absolute;
  right: 32px;
  bottom: 0;
  max-width: 0%;
  opacity: 0;
  transition: max-width 700ms ease-out, opacity 400ms ease-out;

  font-size: 16px;
  border: none;
  border-bottom: 1px solid white;
  background: none;
  color: white;
}
.nav-bar .search-input.enable{
  max-width: 500px;
  opacity: 1;
}
.nav-bar .search-input:focus{
  outline: transparent;
  
  border-bottom-color: var(--contrast);
}
</style>
