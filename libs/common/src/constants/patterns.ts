export const USER_PATTERNS = {
  CREATE: 'user.create',
  FIND_ALL: 'user.find_all',
  FIND_ONE: 'user.find_one',
  UPDATE: 'user.update',
  REMOVE: 'user.remove',
  VALIDATE_CREDENTIALS: 'user.validate_credentials',
} as const;

export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  VERIFY_TOKEN: 'auth.verify_token',
} as const;

export const EVENT_PATTERNS = {
  CREATE: 'event.create',
  FIND_ALL: 'event.find_all',
  FIND_ONE: 'event.find_one',
  UPDATE: 'event.update',
  REMOVE: 'event.remove',
  RESERVE_TICKETS: 'event.reserve_tickets',
  RELEASE_TICKETS: 'event.release_tickets',
} as const;

export const BOOKING_PATTERNS = {
  CREATE: 'booking.create',
  FIND_BY_USER: 'booking.find_by_user',
  FIND_ONE: 'booking.find_one',
  CANCEL: 'booking.cancel',
  CONFIRM: 'booking.confirm',
} as const;

export const PAYMENT_PATTERNS = {
  CREATE: 'payment.create',
  FIND_BY_USER: 'payment.find_by_user',
  FIND_ONE: 'payment.find_one',
} as const;

export const TICKET_PATTERNS = {
  ISSUE: 'ticket.issue',
  FIND_BY_USER: 'ticket.find_by_user',
  FIND_ONE: 'ticket.find_one',
  USE: 'ticket.use',
} as const;

export const CHECKIN_PATTERNS = {
  CHECK_IN: 'checkin.check_in',
  FIND_BY_EVENT: 'checkin.find_by_event',
} as const;
