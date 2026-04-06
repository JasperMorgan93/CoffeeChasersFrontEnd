export const COFFEE_TYPES = [
    'Americano',
    'Cappuccino',
    'Cold Brew',
    'Cortado',
    'Espresso',
    'Filter Coffee',
    'Flat White',
    'Latte',
    'Long Black',
    'Macchiato',
    'Mocha',
    'Piccolo',
    'Pour Over',
] as const;

export type CoffeeType = (typeof COFFEE_TYPES)[number];
