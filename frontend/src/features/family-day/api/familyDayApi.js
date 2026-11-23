import { mutate } from '../../../shared/lib/api.js';

export const REGISTRATION_PATH = '/family-day/registration';

// Reading the registration uses useResource(REGISTRATION_PATH) in the pages.
export const createRegistration = (payload) => mutate(REGISTRATION_PATH, payload, 'POST');
export const updateRegistration = (payload) => mutate(REGISTRATION_PATH, payload, 'PUT');
export const withdrawRegistration = () => mutate(REGISTRATION_PATH, undefined, 'DELETE');
