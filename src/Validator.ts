/**
 * This module is used for sanitization of strings and numbers (int & float).
 *
 * Run ValidateString() or ValidateNumber() on an input and then chain various validation functions together.
 *
 * Finally, call v() to receive the sanitized input.
 */

export class StringValidator {
	value: string;
	error: Error | null;

	constructor(value: string) {
		this.value = value;
		this.error = null;
	}

	// Returns [defaultValue] if string is empty
	default(defaultValue: string): this {
		if (this.value === "") {
			this.value = defaultValue;
		}
		return this;
	}

	// Clips a string to the given [maxLength]
	// Sets error if validation fails
	clip(maxLength: number): this {
		if (this.value.length > maxLength) {
			this.error = new Error("Too long!");
			this.value = this.value.slice(0, maxLength);
		}
		return this;
	}

	// Makes a string all lowercase
	toLower(): this {
		this.value = this.value.toLowerCase();
		return this;
	}

	// Makes a string all uppercase
	toUpper(): this {
		this.value = this.value.toUpperCase();
		return this;
	}

	// Ensures a string is in [choices], equal to [d] if not
	// Sets error if validation fails
	choices(choices: string[], d: string): this {
		if (!choices.includes(this.value)) {
			this.error = new Error("String not in choices!");
			this.value = d;
		}
		return this;
	}

	// Returns the validated string
	v(): string {
		return this.value;
	}
}

export function ValidateString(value: string): StringValidator {
	return new StringValidator(value);
}

export class NumberValidator {
	value: number;
	error: Error | null;

	constructor(value: number) {
		this.value = value;
		this.error = null;
	}

	// Make a number at least [min]
	min(min: number): this {
		if (this.value < min) {
			this.error = new Error("Number too small!");
			this.value = min;
		}
		return this;
	}

	// Make a number at most [max]
	max(max: number): this {
		if (this.value > max) {
			this.error = new Error("Number too large!");
			this.value = max;
		}
		return this;
	}

	// Clamp between [min] and [max]
	minMax(min: number, max: number): this {
		if (this.value < min) {
			this.error = new Error("Number too small!");
			this.value = min;
		} else if (this.value > max) {
			this.error = new Error("Number too large!");
			this.value = max;
		}
		return this;
	}

	// Returns the validated number
	v(): number {
		return this.value;
	}
}

export function ValidateNumber(value: number): NumberValidator {
	return new NumberValidator(value);
}
