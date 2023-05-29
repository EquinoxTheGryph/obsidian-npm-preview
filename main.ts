import { MarkdownRenderChild, Plugin } from "obsidian";
import ComponentMain from "./Components/Main.svelte";
import ComponentError from "./Components/Error.svelte";
import ComponentLoading from "./Components/Loading.svelte";
import type { ComponentProps, SvelteComponent } from "svelte";

export default class NpmPreviewPlugin extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((element, context) => {
			const regexPattern = /\{!npm (\S+)\}/gm;

			element.innerHTML = element.innerHTML.replace(
				regexPattern,
				(_, packageName) =>
					`<div class="npm-package" data-package="${packageName}"></div>`
			);

			element.querySelectorAll(`.npm-package`).forEach((_element) => {
				context.addChild(
					new NpmElement(
						_element as HTMLElement,
						_element.getAttribute("data-package") ?? ""
					)
				);
			});
		});
	}

	onunload() {}
}

export interface NpmPackage {
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
	currentComponent: SvelteComponent;
	componentTarget: HTMLElement;

	constructor(containerEl: HTMLElement, packageName: string) {
		super(containerEl);

		this.packageName = packageName;
	}

	async onload() {
		this.componentTarget = this.containerEl.createDiv();
		this.containerEl.replaceWith(this.componentTarget);

		// Validate Input
		const validation = this.validateInput(this.packageName);
		if (validation) {
			// Validation Error
			this.renderComponent(ComponentError, {
				packageName: this.packageName,
				error: validation,
			});
			return;
		}

		// Create element
		this.renderComponent(ComponentLoading, {
			packageName: this.packageName,
		});

		let data: NpmPackage;

		try {
			data = await this.getPackageInfo(this.packageName);
		} catch (error) {
			// Fetch Error
			this.renderComponent(ComponentError, {
				packageName: this.packageName,
				error: error?.message ?? error,
			});
			return;
		}

		// Show main component
		this.renderComponent(ComponentMain, { data });
	}

	onunload(): void {
		this.currentComponent.$destroy();
	}

	validateInput(input: string) {
		if (input.length <= 0) return "Input too short";
		if (input.length > 218) return "Input too long";
		if (!/^[a-zA-Z0-9-][a-zA-Z0-9_-]*$/.test(input))
			return "Invalid characters included";
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

	renderComponent<T extends typeof SvelteComponent>(
		component: T,
		props?: ComponentProps<InstanceType<T>>
	) {
		this.currentComponent?.$destroy?.();
		this.currentComponent = new component({
			target: this.componentTarget,
			props,
		});
	}
}
