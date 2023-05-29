import { MarkdownRenderChild, Plugin } from "obsidian";

// Remember to rename these classes and interfaces!

export default class NpmPreviewPlugin extends Plugin {
	async onload() {
		console.log("load");
		this.registerMarkdownPostProcessor((element, context) => {
			console.log("register");
			element.querySelectorAll("code").forEach((element) => {
				console.log(element);
				context.addChild(
					new NpmElement(element, element.innerText.trim())
				);
			});
		});
	}

	onunload() {}
}

interface NpmPackage {
	name: string;
	version: string;
	description: string;
	homepage?: string;
	author: {
		name: string;
		email?: string;
	};
	deprecated?: string;
	dependencies?: string[];
	devDependencies?: string[];
	keywords?: string[];
	license: string;
}

export class NpmElement extends MarkdownRenderChild {
	packageName: string;

	constructor(containerEl: HTMLElement, packageName: string) {
		super(containerEl);

		this.packageName = packageName;
	}

	async onload() {
		// Validate Input
		const validation = this.validateInput(this.packageName);
		if (validation) {
			const span = this.containerEl.createSpan({
				text: validation,
			});
			this.containerEl.replaceWith(span);
			return;
		}

		// Create element
		const span = this.containerEl.createSpan({
			text: `Loading package info for "${this.packageName}"...`,
		});
		this.containerEl.replaceWith(span);

		let data: NpmPackage;

		try {
			data = await this.getPackageInfo(this.packageName);
		} catch (error) {
			span.setText(`Error getting package: ${error?.message ?? error}`);
			return;
		}

		span.setText(data.description);
	}

	validateInput(input: string) {
		if (input.length <= 0) return "Error Validating Input: Input too short";
		if (input.length > 218) return "Error Validating Input: Input too long";
		if (!/^[a-zA-Z0-9-][a-zA-Z0-9_-]*$/.test(input))
			return "Error Validating Input: Invalid characters included";
		return null;
	}

	async getPackageInfo(packageName: string): Promise<NpmPackage> {
		const headers = new Headers();

		headers.set(
			"Accept",
			"application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*"
		);

		const data = await fetch(
			`https://registry.npmjs.com/${packageName}/latest`,
			{
				headers,
			}
		);

		if (!data.ok) {
			throw new Error(await data.text());
		}

		return await data.json();
	}
}
