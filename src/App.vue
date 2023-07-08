<script lang="ts">
import NavBar from './components/NavBar.vue';
export default {
  name: 'App',
  components:{
    NavBar
  },
  data(){
    return {
      searchText: '',
      massonry: false
    }
  },
  methods: {
    search(value: string) {
      this.searchText = value;
    },
    changeMode(newMode: boolean){
      this.massonry = newMode;
    }
  },
}   

</script>

<template>
  <div class="app">
    <NavBar @search="search" @changeMode="changeMode"/>
    <router-view :search="searchText" :massonry="massonry"></router-view>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  margin-top: 104px;
}
</style>
