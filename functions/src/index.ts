// This file is the main entry point for your Cloud Functions.
// It exports the functions from other files.

import * as shifts from './shifts.js';
export const { apiShifts } = shifts;
