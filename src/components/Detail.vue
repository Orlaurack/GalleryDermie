<script lang="ts">
import config from '../../config.json'
import { storage } from '../firebase'
import { ref as firebaseRef, getDownloadURL, listAll } from 'firebase/storage'

interface Image {
  name: string;
  slug: string;
  tags: string[];
  path: string;
}

interface Tag {
  [key: string]: number;
}

interface ActiveTags {
  [tagName:string]: string | undefined;
}

interface TagName{
  name: string;
  title: string;
}
interface TagNames {
  [key: number]: TagName;
}

const NOT_DEFINED_VALUE = config['undefined-tag-title'];

export default {
  data() {
    return {
      animal: {} as Image[],
      slug: this.$route.params.animal as string,
      animalName: this.$route.params.animal as string,
      navBar: {},
      currentImages: [] as Image[],
      currentImage: 0 as number,
      activeTags: {} as ActiveTags,

      zoom: {} as any,
      clearSrc: {} as any,
      zoomImage: null as any,
      tagNames: config.tags as TagNames

    } 
  },
  props: {
    massonry: Boolean
  },
  async mounted() {
    for(const value of Object.values(this.tagNames as TagNames)){
      this.navBar[value.name] = {} as Tag;
    }
    this.animal = await this.getAnimalImages();

    for(let value of Object.values(this.tagNames as TagNames)){
      this.activeTags[value.name] = this.$route.query[value.name]?.toString();
    }

    for(const image of this.animal){   
      for(let [key, value] of Object.entries(this.tagNames as TagNames)){
        let keyName = image.tags[key];
        if(!keyName || keyName == ''){
          keyName = NOT_DEFINED_VALUE;
        }
        if (keyName in this.navBar[value.name]) {
          this.navBar[value.name][keyName] ++;
        } else{
          this.navBar[value.name][keyName] = 1;
        }
      }
    }

    this.filterImages();
    
    window.addEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    async getAnimalImages(): Promise<Image[]> {
      const rootRef = firebaseRef(storage, `/${this.animalName}/`);
      const foldersResult = await listAll(rootRef);
      const imageList = [];

      for (const item of foldersResult.items) {
        const downloadURL = await getDownloadURL(item);
        imageList.push({
          image: downloadURL,
          name: item.name,
        });
      }

      function getTags(name: string, length: number){      
        const removedExtension = name.split('.').slice(0, -1).join('.');
        const array = removedExtension.split('-');
        return array.length < length ? [...array, ...new Array(length - array.length).fill(null)] : array.slice(0, length);
      }
      const list = [];
      for(const image of imageList){
        list.push({
          name: image.name,
          slug: this.slugify(image.name),
          tags: getTags(image.name, Object.keys(this.tagNames).length),
          path: image.image
        })
      }

      return list;
    },
    handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        this.currentImage+=this.currentImage>=this.currentImages.length-1?0:1
      }else if(event.key === 'ArrowLeft'){
        this.currentImage-=this.currentImage<=0?0:1
      }
    },
    updateImages(key: number, value: string): void{
      this.currentImage = 0;
      if (this.activeTags[this.tagNames[key].name] == value) {
        this.activeTags[this.tagNames[key].name] = null;
      } else {
        this.activeTags[this.tagNames[key].name] = value;
      }

      this.filterImages();
      this.updateURL();
    },
    filterImages(){
      if (!this.animal || this.animal.length === 0) 
        this.currentImages = [];
      else
        this.currentImages = this.animal.filter((image: Image)=>{
          for (const [key, value] of Object.entries(this.tagNames as TagNames) ){
            if(this.activeTags[value.name] && this.slugify(image.tags[key]) != this.activeTags[value.name]) return false
          }

          return true;
        })
    },
    updateURL(){
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      for (const value of Object.values(this.tagNames as TagNames)){
        if (this.activeTags[value.name]) {
          searchParams.set(value.name, this.activeTags[value.name]);
        } else {
          searchParams.delete(value.name);
        }
      }

      const newUrl = `${url.pathname}?${searchParams.toString()}`;
      history.pushState(null, '', newUrl);
    }
  },
  created(){
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  
  computed: {
    relativeCount(){
      return (tagKey: number, tagValue: string):number => {
        return this.animal.filter((image)=>{
          for (const [key, value] of Object.entries(this.tagNames as TagNames) ){
            const tagName = image.tags[key] ? image.tags[key] : NOT_DEFINED_VALUE;
            if(key == tagKey.toString() && tagName != tagValue) return false;
            if(
                key != tagKey.toString() && 
                this.activeTags[value.name] && 
                this.slugify(tagName) != this.activeTags[value.name]
              )
              return false;
          }
          return true
        }).length;
      }
    },
    validTags(){
      return (tagNames: TagNames): TagNames => {
        const result = {};
        console.log(tagNames, this.navBar)
        for(const [key, tag] of Object.entries(tagNames)){
          if(tag.name in this.navBar && Object.keys(this.navBar[tag.name]).length > 1){
            
            result[key] = tagNames[key]; 
          }
        }
        
        return result;
      }
    },
    slugify() {
      return (value: string) => {
        if(!value) value = NOT_DEFINED_VALUE
        return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      }
    },
    name() {
      return (value:string) => {
        if(!value) value = NOT_DEFINED_VALUE
        return value.replace('-', ' ')
      }
    }
  }
};
</script>

<template>
  <div class="detail massonry" v-if="massonry">
    <img
      class="image grid-item"
      v-for="image in animal"
      :key="image.name"
      :src="image.path"
      :alt="image.name"
    />
  </div>
  <div class="detail" v-else>
    <div class="nav-bar">
      <h2>{{ animal.length }} Images :</h2>
      <div 
        v-for="(tagName, tagKey) in validTags(this.tagNames)"
        :key="tagKey"
      >
        <h3>{{ tagName.title }}</h3>
        <ul>
          <li 
            v-for="(count, tag) in navBar[tagName.name]"
            :key="tag"
            @click="updateImages(tagKey, slugify(tag.toString()))"
          >
            <span :class="{active: activeTags[tagName.name] == slugify(tag.toString()) }">
              {{ tag }} 
              <span class="count">
                {{ relativeCount(tagKey, tag.toString()) }} / {{ count }}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="screen" v-if="currentImages.length > 0">
      <!--img
        v-for="image of currentImages"
        :key="image.slug"
        :src="image.path"
        :alt="animalName"
      /-->
      <h3 :style="{ opacity: currentImages.length>1?1:0 }">{{ currentImage+1 }} / {{ currentImages.length }}</h3>
      <div class="carousel-controller">
        <svg v-show="currentImages.length>1" @click="currentImage-=currentImage<=0?0:1" :class="{disable: currentImage<=0}" class="arrow left" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.226 10.722L41.296 8L19 32L41.266 56L44.196 53.278L24.46 32L44.226 10.722Z" fill="currentColor"/>
        </svg>

        <img
          class="image"
          v-if="currentImage in currentImages"
          :src="currentImages[currentImage].path"
          :alt="currentImages[currentImage].name"
        />
        <svg v-show="currentImages.length>1" @click="currentImage+=currentImage>=currentImages.length-1?0:1" :class="{disable: currentImage>=currentImages.length-1}" class="arrow right" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 53.278L21.93 56L44.226 32L21.96 8L19.03 10.722L38.766 32L19 53.278Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: row;
  padding: 16px;
  gap: 16px;
  min-height: calc(100vh - 136px);
}
.detail.massonry{
  display: block;
  min-height: none;
  max-height: none;
  direction: column;
  position: relative;
  column-count: 3;
}

.detail.massonry .image{
  break-inside: avoid-column;
  margin: 8px 0;
  width: 100%;
  max-height: none;
  height: auto;
  border-radius: 16px;
}
.nav-bar {
  width: 300px;
}
.nav-bar h3{
  padding-left: 8px;
}
.nav-bar ul {
  list-style-type: none;
  padding-left: 20px;
  cursor: pointer;
}
.nav-bar ul li span.active{
  color: var(--primary);
}
.nav-bar ul li span>span.count{
  opacity: 0.4;
  float:right;
}
.screen {
  width: calc(100vw - 365px);
  height: auto;
  display: flex;
  align-items: start;
  flex-direction: column;
  align-items: center;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  overflow: visible;
}
.screen .carousel-controller {
  overflow: visible;
  width: calc(100% - 128px);
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
}
.screen .carousel-controller .image{
  border-radius: 16px;
  z-index: 0;
  position: absolute;
  max-width: 100%;
  width: auto;
  max-height: 100%;
  height: auto;
  margin: auto;
  min-width: 128;
  min-height: 128px;
  color: transparent;

  background-color: var(--secondary);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' fill='none' viewBox='0 0 128 128'%3e%3cg stroke='%23333745' stroke-linecap='round' stroke-linejoin='round' stroke-width='5.34'%3e%3cpath d='M89.667 31H36.333A5.333 5.333 0 0 0 31 36.333v53.334A5.333 5.333 0 0 0 36.333 95h53.334A5.333 5.333 0 0 0 95 89.667V36.333A5.333 5.333 0 0 0 89.667 31Z'/%3e%3cpath d='M95 84.333 75.444 66.555l-17.777 16L45.222 71.89 31 82.555m21.333-21.333a8.889 8.889 0 1 0 0-17.778 8.889 8.889 0 0 0 0 17.778Z'/%3e%3c/g%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: center;
}
.screen .carousel-controller .arrow{
  display: block;
  position: absolute;
  z-index: 3;
  user-select: none;
  cursor: pointer;
}
.screen .carousel-controller .arrow.left{
  left:-64px;
  padding: 100px 20vw 100px 0;
}
.screen .carousel-controller .arrow.right{
  right:-64px;
  padding: 100px 0 100px 20vw;
}
.screen .carousel-controller .arrow.disable{
  opacity: 0.2;
}

@media only screen and (max-width: 1200px) {
  .detail.massonry{
    column-count: 2;
    gap: 8px;
  }
  .detail.massonry .image{
    border-radius: 8px;
    margin: 4px 0;
  }
  .detail {
    flex-direction: column;
    max-height: calc(100vh - 136px);
    max-width: calc(100vw - 32px);
  }
  .screen{
    width: 100%;
    max-width: calc(100% - 64px);
    min-height: 0;
    margin: 0 auto;
    flex: 1;
  }
  .screen .carousel-controller{
    width: 100%;
    flex: 1;
    min-height: 0;
  }
  .screen .carousel-controller .image{
    border-radius: 8px;
  }
  .screen .carousel-controller .arrow{  
    height: 48px;
    width: 48px;
  }
  .screen .carousel-controller .arrow.left{
    left: -48px;
  }
  .screen .carousel-controller .arrow.right{
    right: -48px;
  }
  .nav-bar{
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 8px;
    padding: 0 8px;
    justify-content: space-around;
  }
  .nav-bar h2{
    width: 100vw;
    text-align: center;
  }
}

</style>
