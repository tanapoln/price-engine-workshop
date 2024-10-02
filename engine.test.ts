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
		// Task: buy 2 items in the same group, discount 10% of the least expensive item
		// Task: buy 2 items in the same group, discount $5 of the least expensive item
		// Task: buy 4 items in the same group, the least expensive item is free
		// Task: buy snacks more than $200, discount all items by 5%
		// Task: buy at least 5 snacks, get 1 soda for free.
		// Task: try to combine items with different promotions. Discounted items should be excluded from other promotions.
		// Task: same as the first case but discount must be weighted by the price of the item.
		// Task: buy lay*1 and soda*1, get a candy for free.
		// Task: buy [milk or juice] * 3, get [soda or milk] * 1 for free.
		// Task: buy milk*1 + juice*1 + soda*1, get [bento or lay] * 1 for free.
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
