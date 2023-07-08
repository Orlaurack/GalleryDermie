<script lang="ts">

import config from '../../config.json'
import { storage } from '../firebase'
import { ref as firebaseRef, uploadBytes, listAll } from 'firebase/storage'


interface Image {
  name: string;
  slug: string;
  tags: string[];
  path: string;
}

interface TagName{
  name: string;
  title: string;
}

interface TagNames {
  [key: number]: TagName;
}

export default {
	data() {
		return {
			tagNames: config.tags as TagNames,
			image: null,
			imageUrl: null,
			animalSuggestions: [] as string[],
			tagsSuggestions: [] as string[][],
			tags: [] as string[],
			animalName: '' as string,
			error: false,
			success: false,
			NOT_DEFINED_VALUE: config['undefined-tag-title']
		}
	},
	methods:{
		addImage(event){
			this.success = false;
			const file = event.target.files[0];
			if(file){
				this.image = file
				this.imageUrl = URL.createObjectURL(file)
			} 
			this.error = !file;
		},
		async validateImage(){
			const folder = this.formatText(this.animalName)
			const name = new Array(config.tags.length).fill('');

			for(const index in this.tags){
				name[index] = this.formatText(this.tags[index])
			}

			if(this.image && folder != ''){
				const extension = this.image.name.split('.').pop()
				this.uploadImage(this.image, folder, name.join('-'), extension)
			}else{
				this.error = true
			}
		},
		async uploadImage(image, folder, name, extension) {
			const maxAttempts = 1000;
			let refUrl = `${name}.${extension}`
			let attempt = 1
			const filesNames = (await listAll(firebaseRef(storage, `${folder}`))).items.map((item) => item.name);
			

			while (attempt <= maxAttempts) {
				if (filesNames.includes(refUrl)) {
					refUrl = `${name}-${attempt}.${extension}`;
					attempt ++;
				} else {
					try {
						const storageRef = firebaseRef(storage, `${folder}/${refUrl}`);
						const snapshot = await uploadBytes(storageRef, image);
						console.log('Image téléchargée avec succès :', refUrl, snapshot);
						this.success = true;
						this.imageUrl = '';
						this.image = null;
						break;
					} catch (error) {
						console.error('Erreur lors du téléchargement de l\'image :', error);
						break;
					}
				}
			}
		},
		async getAnimalSuggestions(){				
			const rootRef = firebaseRef(storage, '/');
			const allItems = await listAll(rootRef);

			const prefixNames = allItems.prefixes.map((item) => {
				return item.name.replace('_', ' ');
			});

			return prefixNames;
		},
		async getTagsSuggestions() {
			const rootRef = firebaseRef(storage, '/');
			let names = [];
			const allPrefixes = await listAll(rootRef);
			for(const prefix of allPrefixes.prefixes.map((prefix)=>prefix.name)){
				
				const prefixRef = firebaseRef(storage, `/${prefix}`);
				const allItems = await listAll(prefixRef);
				console.log(prefix, allItems)
				names = names.concat(allItems.items.map((item)=>item.name));
			}

			const result = [];

			for(const name of names){
				const removedExtension = name.split('.').slice(0, -1).join('.');
				const array = removedExtension.split('-');

				for(const [index, tag] of array.entries()){

					if(tag && index < Object.keys(this.tagNames).length){
						if(!(index in result)){
							result[index] = [tag];
						} else if (!result[index].includes(tag)) {
							result[index].push(tag)
						}
					}
				}
			}
			return result;
    },
	},
	async mounted(){
		this.animalSuggestions = await this.getAnimalSuggestions();
		this.tagsSuggestions = await this.getTagsSuggestions();
	},
	computed: {
    name() {
      return (value:string) => {
        return value.replace('-', ' ')
      }
    },
		formatText(){
      return (value:string) => {
				const sanitizedText = value.normalize("NFD").replace(/<[^>]+>/g, '');
				const replacedText = sanitizedText.replace(/(^[-_\s.,:;]+)|([-_\s.,:;]+$)/g, '').replace(/[-_\s.,:;]+/g, '_');
				const formattedText = replacedText.replace(/(^|-)(\w)/g, (_match, p1, p2) => p1 + p2.toUpperCase());
				return formattedText.trim();
			}
		},
		computedResult(){
			const folder = this.formatText(this.animalName)
			const name = new Array(config.tags.length).fill('');

			for(const index in this.tags){
				name[index] = this.formatText(this.tags[index])
			}

			let extension = 'png' 
			if(this.image){
				extension = this.image.name.split('.').pop()
			}
			return folder + '/' + name.join('-') + '.' + extension;

		}
	}
}
</script>

<template>
  <div class="import-image">
    <div class="image-input">
			<input @change="addImage" type="file" accept="image/*" name="image">
    </div>
		<img v-show="!!imageUrl" id="image" :src="imageUrl" :alt="image" />
		<span style="color:red" v-show="error">Il manque certaines informations, veuillez vérifier que l'image est correctement ajoutée et que le nom de l'animal est correctement rempli</span>
		<span style="color:green" v-show="success">l'image a bien été enregistrée</span>
		<datalist :id="'suggestions_animal'">
			<option v-for="animal of animalSuggestions" :key="animal" :value="animal"></option>
		</datalist>
		<label class="tag">
			<span> Animal : </span>
			<input type="text" :list="'suggestions_animal'" @input="error=false; success = false;" v-model="animalName">
		</label>
    <div 
			v-for="(tagName, tagKey) in this.tagNames"
			:key="tagKey"
    >
			<datalist :id="'suggestions_'+tagKey">
				
				<option v-for="suggestion of tagsSuggestions[tagKey]" :key="suggestion" :value="suggestion"></option>
			</datalist>
			<label class="tag">
				<span> {{ tagName.title }} : </span>
				<input :placeholder="NOT_DEFINED_VALUE" type="text" :list="'suggestions_'+tagKey" @input="success = false;" v-model="tags[tagKey]">
			</label>
    </div>
		<span>{{ computedResult }}</span>
		<div>
			<button @click="validateImage">Valider</button>
		</div>
  </div>
</template>

<style>
.import-image{
	display: flex;
	flex-direction: column;
	gap: 64px;
	justify-content: center;
	margin: 64px auto;
	max-width: 720px;
}
.import-image .image-input{
	padding: 20px;
	border: 2px white dashed;
	border-radius: 8px;
	text-align: center;
}
.import-image .tag{
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: space-between;
}

</style>