
import { newId, newReference } from './ids.js';
import { DomainError } from './errors.js';
import { WaitlistQueue } from './waitlistQueue.js';

export const MAX_TICKETS_PER_BOOKING = 10;

export function createStore() {
  const bookingInfo = {
    events: [],
    bookings: [],
    bookingsByReference: new Map(),
    waitlist: new Map()
  };

  return bookingInfo;
}

export function createEvent(store, name) {
  const eventId = newId();

  const event = {
    id: eventId,
    name: name,
    tiers: []
  };

  store.events.push(event);
  return event;
}

export function addTier(store, event, tierName, price, quantity) {
  const tier = {
    id: newId(),
    name: tierName,
    price: price,
    quantity: quantity,
    remaining: quantity
  };

  event.tiers.push(tier);

  // Create a separate queue for this tier
  store.waitlist.set(tier.id, new WaitlistQueue());

  return tier;
}

export function bookTickets(store, event, tier, requestedQuantity) {

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1 ||
    requestedQuantity > MAX_TICKETS_PER_BOOKING
  ) {
    throw new DomainError(
      "The quantity you entered is not valid",
      'VALIDATION',
      { requestedQuantity: requestedQuantity }
    );
  }

  if (requestedQuantity > tier.remaining) {
    throw new DomainError(
      `The ${tier.name} tickets for ${event.name} is sold out`,
      "SOLD_OUT",
      {
        requestedQuantity: requestedQuantity,
        available: tier.remaining
      }
    );
  }

  const booking = {
    id: newId(),
    name: event.name,
    tier: tier,
    quantity: requestedQuantity,
    reference: newReference(),
    status: "confirmed"
  };

  store.bookings.push(booking);
  store.bookingsByReference.set(booking.reference, booking);

  tier.remaining = tier.remaining - requestedQuantity;

  return booking;
}

export function findBookingByReference(store, reference) {
  return store.bookingsByReference.get(reference);
}

export function cancelBooking(store, reference) {
  const booking = findBookingByReference(store, reference);

  if (!booking) {
    throw new DomainError(
      "Booking not found",
      "BOOKING_NOT_FOUND"
    );
  }

  if (booking.status === "cancelled") {
    throw new DomainError(
      "This booking has already been cancelled",
      "BOOKING_ALREADY_CANCELLED"
    );
  }

  booking.tier.remaining += booking.quantity;
  booking.status = "cancelled";

  return booking;
}

export function joinWaitlist(store, event, tier, person, quantity) {

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_TICKETS_PER_BOOKING
  ) {
    throw new DomainError(
      "The quantity you entered is not valid",
      'VALIDATION',
    );
  }

  if (quantity <= tier.remaining) {
    throw new DomainError(
      "Tickets are still available. Please book instead",
      "TICKETS_AVAILABLE"
    );
  }

  const personInfo = {
    id: newId(),
    quantity: quantity,
    tier: tier,
    person: person
  };

  const queue = store.waitlist.get(tier.id);

  if (!queue) {
    throw new DomainError(
      "Waitlist not found for this ticket tier",
      "WAITLIST_NOT_FOUND"
    );
  }

  queue.enqueue(personInfo);

  return queue.size();
}

export function offerNextOnWaitlist(store, tier) {

  const queue = store.waitlist.get(tier.id);

  if (!queue) {
    throw new DomainError(
      "Waitlist not found for this ticket tier",
      "WAITLIST_NOT_FOUND"
    );
  }

  const nextPerson = queue.peek();

  if (nextPerson === null) {
    return null;
  }

  if (nextPerson.quantity > tier.remaining) {
    return null;
  }

  const person = queue.dequeue();

  return person;
}
