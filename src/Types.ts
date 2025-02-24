// Not-null assertment (!) is used because we're using Object.assign.

export class NamesOptions {
	public quantity!: number
	public method!: "ai" | "simple"
	public type!: string
	public genre!: string
	public gender!: string

	constructor(options: NamesOptions) {
		Object.assign(this, options)
	}
}

export class DescriptionOptions {
	public name!: string
	public type!: string
	public style!: string
	public length!: "short" | "medium" | "extensive"
	public notes!: string

	constructor(options: DescriptionOptions) {
		Object.assign(this, options)
	}
}

export class ImageOptions {
	public subject!: string
	public style!: string
	public perspective!: string
	public palette!: string
	public background!: string

	constructor(options: ImageOptions) {
		Object.assign(this, options)
	}
}

