import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

export async function POST() {
  const checkout = await polar.checkouts.create({
    products: ["e3684b44-161e-4c0f-9808-6a3786f60db0"], //producton wali product id h
    successUrl: `${process.env.POLAR_SUCCESS_URL}/success`,
  });

  return Response.json({ url: checkout.url });
}