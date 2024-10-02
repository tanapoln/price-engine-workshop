import _ from "lodash";

//===================================================//
//                   PRODUCT DATA                    //
//===================================================//

export type ProductGroup = "snack" | "drink" | "food";
export type ProductTag = "sweet" | "double-digit" | "bundle";

export type Product = {
	id: string;
	price: number;
	groups: ProductGroup[];
	tags: ProductTag[];
};

export type Promotion = {
	id: string;
	//TODO: try to define promotion type
};

//===================================================//
//                   CART DATA                       //
//===================================================//

export type PaymentMethod = "cash" | "card";

export type CartItem = {
	id: string;
	quantity: number;
};

export type Cart = {
	items: CartItem[];
	//TODO: try to define cart type
};

//===================================================//
//                   PRICE ENGINE                    //
//===================================================//

export type LineItem = CartItem & {
	effectiveDiscount: number; // total discount in this line
	effectivePrice: number; // total price after discount
};

export type PriceResult = {
	items: LineItem[];
	totalDiscount: number;
	totalPrice: number;
};

export const Products = _.keyBy<Product>(
	[
		{
			id: "lay",
			price: 20,
			groups: ["snack"],
			tags: ["bundle"],
		},
		{
			id: "bento",
			price: 10,
			groups: ["snack"],
			tags: ["double-digit"],
		},
		{
			id: "soda",
			price: 15,
			groups: ["drink"],
			tags: ["double-digit", "bundle"],
		},
		{
			id: "candy",
			price: 2,
			groups: ["snack"],
			tags: ["sweet"],
		},
		{
			id: "milk",
			price: 24,
			groups: ["food"],
			tags: ["sweet"],
		},
		{
			id: "juice",
			price: 30,
			groups: ["drink"],
			tags: ["sweet", "double-digit"],
		},
	],
	(p) => p.id
);

export const Promotions = _.keyBy<Promotion>(
	[
		{
			id: "bundle-5", // buy bundle, get 5 off
		},
	],
	(p) => p.id
);

export function price(cart: Cart): PriceResult {
	return {
		items: [],
		totalDiscount: 0,
		totalPrice: 0,
	};
}
