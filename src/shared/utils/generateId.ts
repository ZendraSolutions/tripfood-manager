/**
 * UUID Generator Utility
 * @module shared/utils/generateId
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique identifier using UUID v4
 * @returns A unique string identifier
 */
export const generateId = (): string => uuidv4();
