<script lang="ts">
	import type { NpmPackage } from "main";
	import { toHeaderCase } from "js-convert-case";

	export let data: NpmPackage;

	function getAuthors() {
		if (data.author?.name) {
			return data.author.name + (data.maintainers?.length ?? 0 > 1)
				? " Et al."
				: "";
		} else {
		}
	}
</script>

<article class="view">
	<div class="titleHolder">
		<h2 class="text">
			<a href="https://www.npmjs.com/package/{data.name}"
				>{toHeaderCase(data.name)}</a
			>
			<code>{data.name}</code>
		</h2>
		<div class="npm">npm</div>
	</div>
	<p class="text description">{data.description}</p>
	<p class="text info">
		{#if data.author?.name}
			By {data.author.name}{data.maintainers?.length ?? 0 > 1
				? " Et al."
				: ""} |
		{/if}
		Version: {data.version} |
		<a
			href="https://www.npmjs.com/package/{data.name}?activeTab=dependencies"
			>Dependencies: {Object.keys(data.dependencies ?? {}).length} (Dev: {Object.keys(
				data.devDependencies ?? {}
			).length})</a
		>
	</p>
</article>

<style>
	.view {
		border: 2px #00000033 solid;
		padding: 0.25em;
	}

	.text {
		margin: 0.25em;
	}

	.titleHolder {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.npm {
		background-color: #00000033;
		border-radius: 4px;
		margin: 0;
		padding: 0.25em;
	}

	.info {
		font-size: small;
		opacity: 0.8;
	}

	code {
		user-select: all;
		margin-left: 0.25em;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	a:visited {
		color: inherit;
	}
</style>
