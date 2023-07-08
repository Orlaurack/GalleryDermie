<script lang="ts">
import { storage } from '../firebase'
import { ref as firebaseRef, list, getDownloadURL } from 'firebase/storage'

interface Animal {
  image: string,
  name: string
}

export default {
  data() {
    return {
      animals: [] as Animal[]
    } 
  },
  props: {
    search: String
  },
  async mounted() {
    this.animals = await this.getAnimals();
  },
  computed: {
    link() {
      return (value: string) => '/' + value.replace(' ', '_')
    },
    name() {
      return (value:string) => value.replace('-', ' ')
    },
    filterSearch(){
      return (animals: Animal[], search: string): Animal[] => {
        if(!search){ return animals }
        return animals.filter((animal) => {
          for(const searchWord of search.split(' ')){
            if(!animal.name.toLowerCase().includes(searchWord.toString().toLowerCase()))
            return false
          }
          return true
        })
      }
    }
  },
  methods: {
    async getAnimals(): Promise<Animal[]>{
      const rootRef = firebaseRef(storage, '/');
      const foldersResult = await list(rootRef);

      const imageList = [];

      for (const folderRef of foldersResult.prefixes) {
        const folderName = folderRef.name.replace('_', ' ');
        const filesResult = await list(folderRef);

        if (filesResult.items.length > 0) {
          const firstFile = filesResult.items[0];
          const downloadURL = await getDownloadURL(firstFile);

          imageList.push({
            image: downloadURL,
            name: folderName,
          });
        }
      }
      
      return imageList;
    }
  }
};
</script>

<template>
  <div class="gallery">
    <router-link 
      class="animal"
      v-for="animal of filterSearch(animals, search)" 
      :key="animal.name" 
      :to="link(animal.name)">
      
      <img
        :src="animal.image"
        :alt="animal.name"
      />
      <h2>{{ name(animal.name) }}</h2>

    </router-link>
    
  </div>
</template>

<style scoped>
.gallery{
  justify-content: space-around;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  padding: 16px;
  gap: 16px;
  height: 100%;
}
.animal {
  display: flex;
  justify-content: center;
  align-items: end;
  width: 256px;
  height: 256px;
  border-radius: 16px;
  overflow: hidden;
}
.animal h2 {
  z-index: 1;
  background: #00000088;
  transition: 200ms;
  padding: 4px 16px;
  border-radius: 8px;
  position: absolute;
}
.animal:hover h2{
  background: #000000DD;
}
.animal img {
  z-index: 0;
  width: 256px;
  height: 256px;
  object-fit:cover;
  object-position: center;
  filter: grayscale(40%) brightness(75%);
  transition: 1000ms ease-out;
}
.animal:hover img{
  transform: scale(120%);
  filter: none;
}
</style>
