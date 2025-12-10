/**
 * A seedable pseudo-random number generator using the Mulberry32 algorithm
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number | string) {
    this.seed = this.normalizeSeed(seed);
  }

  /**
   * Normalize different seed types to a number
   */
  private normalizeSeed(seed: number | string): number {
    if (typeof seed === 'number') {
      return Math.abs(Math.floor(seed));
    }
    
    // Convert string to a numeric hash
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate a random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    this.seed += 0x6D2B79F5;
    let t = this.seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Generate a random number between min (inclusive) and max (exclusive)
   */
  nextFloat(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /**
   * Generate a random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat(min, max));
  }

  /**
   * Generate a random boolean
   */
  nextBoolean(): boolean {
    return this.next() > 0.5;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Shuffle an array using the Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Get a daily seeded random number generator
 * @param date Optional date to use (defaults to today)
 * @param salt Optional salt to differentiate multiple generators for the same day
 */
export function getDailyRandom(date: Date = new Date(), salt: string = ''): SeededRandom {
  // Create a date string in YYYY-MM-DD format for consistency across timezones
  const dateString = date.toISOString().split('T')[0];
  
  // Combine date string with salt to create a unique seed
  const seed = `${dateString}${salt}`;
  
  return new SeededRandom(seed);
}

/**
 * Get a random number for today between 0 and 1
 */
export function getDailyRandomNumber(salt: string = ''): number {
  return getDailyRandom(new Date(), salt).next();
}

/**
 * Get a random integer for today within a range
 */
export function getDailyRandomInt(min: number, max: number, salt: string = ''): number {
  return getDailyRandom(new Date(), salt).nextInt(min, max);
}

/**
 * Get a random float for today within a range
 */
export function getDailyRandomFloat(min: number, max: number, salt: string = ''): number {
  return getDailyRandom(new Date(), salt).nextFloat(min, max);
}

/**
 * Pick a random element from an array for today
 */
export function getDailyPick<T>(array: T[], salt: string = ''): T {
  return getDailyRandom(new Date(), salt).pick(array);
}

/**
 * Shuffle an array randomly for today
 */
export function getDailyShuffle<T>(array: T[], salt: string = ''): T[] {
  return getDailyRandom(new Date(), salt).shuffle(array);
}

// Example usage:
/*
// Basic usage - same number all day
const dailyRandom = getDailyRandom();
console.log(dailyRandom.next()); // Same number all day, changes tomorrow

// Get a daily number between 0 and 100
const dailyNumber = getDailyRandomInt(0, 100);
console.log(dailyNumber);

// Get a daily pick from an array
const colors = ['red', 'green', 'blue', 'yellow'];
const dailyColor = getDailyPick(colors);
console.log(dailyColor);

// Get a shuffled array (same shuffle all day)
const numbers = [1, 2, 3, 4, 5];
const dailyShuffle = getDailyShuffle(numbers);
console.log(dailyShuffle);

// Use salt for different "streams" of randomness for the same day
const userRandom = getDailyRandom(new Date(), 'user-123');
const itemRandom = getDailyRandom(new Date(), 'item-456');
// These will be different from each other but consistent for each user/item per day

// To get a specific day's random number (useful for testing or historical data)
const pastDate = new Date('2024-01-15');
const pastRandom = getDailyRandom(pastDate);
console.log(pastRandom.next()); // Will always be the same for Jan 15, 2024
*/