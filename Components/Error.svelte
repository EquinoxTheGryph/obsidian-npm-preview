<script lang="ts">
	export let packageName: string;
	export let error: string;
</script>

<span>Error loading package "{packageName}": {error}</span>

<style>
	span {
		color: red;
	}
</style>
