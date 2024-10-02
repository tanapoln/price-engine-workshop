import { expect, test } from "bun:test";
import _ from "lodash";
import { price, type Cart } from "./engine";

test("simple price engine", () => {
	const cases = [
		{ input: ["lay", "lay", "bento"], expectedTotalPrice: 50 },
		{ input: ["lay", "lay", "bento", "bento"], expectedTotalPrice: 60 },
		{ input: ["lay", "lay", "bento", "bento", "candy"], expectedTotalPrice: 62 },
	];

	function buildCart(items: string[]): Cart {
		return {
			items: _.chain(items)
				.groupBy((item) => item)
				.map((group, id) => ({
					id,
					quantity: group.length,
				}))
				.value(),
		};
	}
	for (const c of cases) {
		const result = price(buildCart(c.input));
		expect(result.totalPrice).toBe(c.expectedTotalPrice);
	}
});

test("promotion engine", () => {
	const cases = [
		{
			items: ["lay", "soda"],
			promotions: ["bundle-5"],
			expected: {
				totalPrice: 30,
				totalDiscount: 5,
				lineItems: sort([
					["lay", 1, 18.5, 2.5],
					["soda", 1, 12.5, 2.5],
				]),
			},
		},
		{
			items: ["lay", "lay", "bento", "bento"],
			promotions: [],
			expected: { totalPrice: 60, totalDiscount: 0, lineItems: [] },
		},
		{
			items: ["lay", "lay", "bento", "bento", "candy"],
			promotions: [],
			expected: { totalPrice: 62, totalDiscount: 0, lineItems: [] },
		},
	];

	function buildCart(items: string[], promotions: string[]): Cart {
		return {
			items: _.chain(items)
				.groupBy((item) => item)
				.map((group, id) => ({
					id,
					quantity: group.length,
				}))
				.value(),
		};
	}
	for (const c of cases) {
		const result = price(buildCart(c.items, c.promotions));
		expect(result.totalPrice).toBe(c.expected.totalPrice);
		expect(result.totalDiscount).toBe(c.expected.totalDiscount);
		expect(
			sort(_.map(result.items, (i) => [i.id, i.quantity, i.effectivePrice, i.effectiveDiscount]))
		).toEqual(c.expected.lineItems);
	}
});

// ExpectedLine is array of [id, quantity, effectivePrice, effectiveDiscount].
type ExpectedLine = [string, number, number, number];
function sort(lines: ExpectedLine[]): ExpectedLine[] {
	const comparator = (a: ExpectedLine, b: ExpectedLine) => {
		const id = a[0].localeCompare(b[0]);
		if (id !== 0) return id;

		const quantity = a[1] - b[1];
		if (quantity !== 0) return quantity;

		const effectivePrice = a[2] - b[2];
		if (effectivePrice !== 0) return effectivePrice;

		return a[3] - b[3];
	};
	return [...lines].sort(comparator);
}
