
// Run with: npm run demo
// A guided tour of our Build 1 ticketing system.

import {
  createStore,
  createEvent,
  addTier,
  bookTickets,
  cancelBooking,
  joinWaitlist,
  offerNextOnWaitlist,
  findBookingByReference
} from '../src/domain/inventory.js';

import { DomainError } from '../src/domain/errors.js';

// Create our store
const store = createStore();

// Create an event
const event = createEvent(store, "Lagos Tech Meetup");

// Create a ticket tier
const tier = addTier(store, event, "General", 5000, 3);
const vipTier = addTier(store, event, "VIP", 10000, 1);

console.log(`Created ${event.name} with ${tier.quantity} ${tier.name} tickets.\n`);

// A helper function for handling errors
function attempt(label, action) {
  try {
    const result = action();
    console.log(`OK: ${label}`);
    return result;
  } catch (error) {
    if (!(error instanceof DomainError)) {
      throw error;
    }

    console.log(`FAIL: ${label} -> ${error.code}: ${error.message}`);
    return undefined;
  }
}

// Ada books 2 tickets
const ada = attempt(
  "Ada books 2 tickets",
  () => bookTickets(store, event, tier, 2)
);

// Bayo tries to book 2 tickets, but only 1 remains
attempt(
  "Bayo tries to book 2 tickets",
  () => bookTickets(store, event, tier, 2)
);

// Bayo successfully books the last ticket
const bayo = attempt(
  "Bayo books the last ticket",
  () => bookTickets(store, event, tier, 1)
);

console.log(`\nSeats remaining: ${tier.remaining}\n`);

// Chidi joins the waitlist
attempt(
  "Chidi joins the waitlist for 2 tickets",
  () => joinWaitlist(store, event, tier, "Chidi", 2)
);

// Dayo joins after Chidi
attempt(
  "Dayo joins the waitlist for 1 ticket",
  () => joinWaitlist(store, event, tier, "Dayo", 1)
);

// Look up Ada's booking
console.log(`\nLooking up Ada's booking: ${ada.reference}`);

console.log(findBookingByReference(store, ada.reference));

// Ada cancels her booking
console.log();

attempt(
  "Ada cancels her booking",
  () => cancelBooking(store, ada.reference)
);

console.log(`Seats remaining after cancellation: ${tier.remaining}`);

// Offer the available tickets to the first person waiting
const offer = offerNextOnWaitlist(store, tier);

console.log("\nNext person offered tickets:");
console.log(offer);

console.log(`\nPeople still waiting: ${store.waitlist.get(tier.id).size()}`);

console.log(`Seats remaining: ${tier.remaining}`);
// Test that VIP has its own separate waitlist
joinWaitlist(store, event, vipTier, "Efe", 2);

console.log("\nTesting separate waitlists:");

console.log(
  "General waitlist:",
  store.waitlist.get(tier.id).size()
);

console.log(
  "VIP waitlist:",
  store.waitlist.get(vipTier.id).size()
);