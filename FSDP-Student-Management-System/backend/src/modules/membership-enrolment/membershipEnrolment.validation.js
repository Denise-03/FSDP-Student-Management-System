import { z } from 'zod';
export const applicationDraft = z.object({
  phone: z.string().max(30).default(''),
  dateOfBirth: z.string().max(10).default(''),
  dojoId: z.string().max(50).default(''),
  experience: z.string().max(2000).default(''),
  claimedBelt: z.string().max(50).default('Beginner'),
  guardianName: z.string().max(120).default(''),
  waiver: z.boolean().default(false),
  selectedSessionId: z.string().max(50).default(''),
});
