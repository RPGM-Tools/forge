type Forgeable<T extends ForgeObject<unknown, unknown>> = { fromOptions(input: T["input"]): T, };

type ForgeableResponse<T extends ForgeObject<unknown, unknown>> = ForgeResponse<Required<T>["output"]>;

type QueueItem<T extends ForgeObject<unknown, unknown> = ForgeObject<unknown, unknown>> = {
	type: Forgeable<T>;
	options: T["input"];
	cb: (item: ForgeableResponse<T>) => void;
}[]

/**
 * A queue of ForgeObjects
 * @template T - The type of the ForgeObject
 */
export class ForgeQueue {
	// private queue: T[] = [];
	private queue: QueueItem = [];
	private processing = false;

	/**
	 * Creates a new ForgeQueue for a specific type of ForgeObject
	 * @param type - The type of the ForgeObject
	 */
	constructor(private genOptions: () => Parameters<ForgeObject<unknown, unknown>["generate"]>) { }

	generate<T extends ForgeObject<unknown, unknown>>(type: Forgeable<T>, item: T["input"]): Promise<ForgeableResponse<T>> {
		return new Promise<ForgeableResponse<T>>(resolve => {
			this.queue.push({ type, options: item, cb: resolve });
			this.process();
		});
	}

	private async process() {
		if (this.processing) return;
		this.processing = true;

		while (this.queue.length > 0) {
			const item = this.queue.shift()!;
			const forgeObject = item.type.fromOptions(item.options);
			const response = await forgeObject.generate(...this.genOptions() as Parameters<typeof forgeObject.generate>);
			item.cb(response);
		}

		this.processing = false;
	}
}
