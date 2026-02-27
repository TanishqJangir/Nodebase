import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onCheckoutCreated: async (payload) => {
    console.log("[Polar] checkout.created", payload.data.id);
  },

  onCheckoutUpdated: async (payload) => {
    console.log("[Polar] checkout.updated", payload.data.id, payload.data.status);
  },

  onOrderCreated: async (payload) => {
    console.log("[Polar] order.created", payload.data.id);
  },

  onOrderPaid: async (payload) => {
    console.log("[Polar] order.paid", payload.data.id, payload.data.customer?.email);
  },

  onSubscriptionCreated: async (payload) => {
    console.log("[Polar] subscription.created", payload.data.id, payload.data.customer?.email);
  },

  onSubscriptionActive: async (payload) => {
    console.log("[Polar] subscription.active", payload.data.id, payload.data.customer?.email);
  },

  onSubscriptionUpdated: async (payload) => {
    console.log("[Polar] subscription.updated", payload.data.id, payload.data.status);
  },

  onSubscriptionCanceled: async (payload) => {
    console.log("[Polar] subscription.canceled", payload.data.id, payload.data.customer?.email);
  },

  onSubscriptionRevoked: async (payload) => {
    console.log("[Polar] subscription.revoked", payload.data.id, payload.data.customer?.email);
  },

  onSubscriptionUncanceled: async (payload) => {
    console.log("[Polar] subscription.uncanceled", payload.data.id);
  },

  onCustomerCreated: async (payload) => {
    console.log("[Polar] customer.created", payload.data.id, payload.data.email);
  },

  onCustomerStateChanged: async (payload) => {
    console.log("[Polar] customer.state_changed", payload.data.id);
  },

  onBenefitGrantCreated: async (payload) => {
    console.log("[Polar] benefit_grant.created", payload.data.customerId);
  },

  onBenefitGrantRevoked: async (payload) => {
    console.log("[Polar] benefit_grant.revoked", payload.data.customerId);
  },
});