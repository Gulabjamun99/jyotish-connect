export const GANA_TABLE: Record<string, string> = {
    "Ashwini": "Deva", "Bharani": "Manushya", "Krittika": "Rakshasa", "Rohini": "Manushya", "Mrigashira": "Deva",
    "Ardra": "Manushya", "Punarvasu": "Deva", "Pushya": "Deva", "Ashlesha": "Rakshasa", "Magha": "Rakshasa",
    "Purva Phalguni": "Manushya", "Uttara Phalguni": "Manushya", "Hasta": "Deva", "Chitra": "Rakshasa", "Swati": "Deva",
    "Vishakha": "Rakshasa", "Anuradha": "Deva", "Jyeshtha": "Rakshasa", "Mula": "Rakshasa", "Purva Ashadha": "Manushya",
    "Uttara Ashadha": "Manushya", "Shravana": "Deva", "Dhanishta": "Rakshasa", "Shatabhisha": "Rakshasa", "Purva Bhadrapada": "Manushya",
    "Uttara Bhadrapada": "Manushya", "Revati": "Deva"
};

export const YONI_TABLE: Record<string, string> = {
    "Ashwini": "Horse", "Bharani": "Elephant", "Krittika": "Sheep", "Rohini": "Serpent", "Mrigashira": "Serpent",
    "Ardra": "Dog", "Punarvasu": "Cat", "Pushya": "Sheep", "Ashlesha": "Cat", "Magha": "Rat",
    "Purva Phalguni": "Rat", "Uttara Phalguni": "Cow", "Hasta": "Buffalo", "Chitra": "Tiger", "Swati": "Buffalo",
    "Vishakha": "Tiger", "Anuradha": "Deer", "Jyeshtha": "Deer", "Mula": "Dog", "Purva Ashadha": "Monkey",
    "Uttara Ashadha": "Monkey", "Shravana": "Monkey", "Dhanishta": "Lion", "Shatabhisha": "Horse", "Purva Bhadrapada": "Lion",
    "Uttara Bhadrapada": "Cow", "Revati": "Elephant"
};

export const NADI_TABLE: Record<string, string> = {
    "Ashwini": "Adi", "Bharani": "Madhya", "Krittika": "Antya", "Rohini": "Antya", "Mrigashira": "Madhya",
    "Ardra": "Adi", "Punarvasu": "Adi", "Pushya": "Madhya", "Ashlesha": "Antya", "Magha": "Antya",
    "Purva Phalguni": "Madhya", "Uttara Phalguni": "Adi", "Hasta": "Adi", "Chitra": "Madhya", "Swati": "Antya",
    "Vishakha": "Antya", "Anuradha": "Madhya", "Jyeshtha": "Adi", "Mula": "Adi", "Purva Ashadha": "Madhya",
    "Uttara Ashadha": "Antya", "Shravana": "Antya", "Dhanishta": "Madhya", "Shatabhisha": "Adi", "Purva Bhadrapada": "Adi",
    "Uttara Bhadrapada": "Madhya", "Revati": "Antya"
};

export const YONI_COMPATIBILITY: Record<string, Record<string, number>> = {
    "Horse": { "Horse": 4, "Elephant": 2, "Sheep": 2, "Serpent": 3, "Dog": 2, "Cat": 2, "Rat": 2, "Cow": 1, "Buffalo": 0, "Tiger": 1, "Deer": 3, "Monkey": 3, "Mongoose": 2, "Lion": 1 },
    "Elephant": { "Horse": 2, "Elephant": 4, "Sheep": 3, "Serpent": 3, "Dog": 2, "Cat": 2, "Rat": 3, "Cow": 2, "Buffalo": 3, "Tiger": 1, "Deer": 2, "Monkey": 3, "Mongoose": 2, "Lion": 0 },
    "Sheep": { "Horse": 2, "Elephant": 3, "Sheep": 4, "Serpent": 2, "Dog": 1, "Cat": 2, "Rat": 1, "Cow": 3, "Buffalo": 3, "Tiger": 1, "Deer": 2, "Monkey": 2, "Mongoose": 3, "Lion": 1 },
    "Serpent": { "Horse": 3, "Elephant": 3, "Sheep": 2, "Serpent": 4, "Dog": 2, "Cat": 1, "Rat": 1, "Cow": 2, "Buffalo": 2, "Tiger": 2, "Deer": 2, "Monkey": 2, "Mongoose": 0, "Lion": 2 },
    "Dog": { "Horse": 2, "Elephant": 2, "Sheep": 1, "Serpent": 2, "Dog": 4, "Cat": 2, "Rat": 1, "Cow": 2, "Buffalo": 2, "Tiger": 1, "Deer": 1, "Monkey": 2, "Mongoose": 1, "Lion": 2 },
    "Cat": { "Horse": 2, "Elephant": 2, "Sheep": 2, "Serpent": 1, "Dog": 2, "Cat": 4, "Rat": 0, "Cow": 2, "Buffalo": 2, "Tiger": 2, "Deer": 3, "Monkey": 2, "Mongoose": 1, "Lion": 2 },
    "Rat": { "Horse": 2, "Elephant": 3, "Sheep": 1, "Serpent": 1, "Dog": 1, "Cat": 0, "Rat": 4, "Cow": 2, "Buffalo": 2, "Tiger": 2, "Deer": 2, "Monkey": 2, "Mongoose": 1, "Lion": 2 },
    "Cow": { "Horse": 1, "Elephant": 2, "Sheep": 3, "Serpent": 2, "Dog": 2, "Cat": 2, "Rat": 2, "Cow": 4, "Buffalo": 3, "Tiger": 0, "Deer": 2, "Monkey": 1, "Mongoose": 2, "Lion": 1 },
    "Buffalo": { "Horse": 0, "Elephant": 3, "Sheep": 3, "Serpent": 2, "Dog": 2, "Cat": 2, "Rat": 2, "Cow": 3, "Buffalo": 4, "Tiger": 1, "Deer": 2, "Monkey": 2, "Mongoose": 2, "Lion": 1 },
    "Tiger": { "Horse": 1, "Elephant": 1, "Sheep": 1, "Serpent": 2, "Dog": 1, "Cat": 2, "Rat": 2, "Cow": 0, "Buffalo": 1, "Tiger": 4, "Deer": 1, "Monkey": 1, "Mongoose": 2, "Lion": 1 },
    "Deer": { "Horse": 3, "Elephant": 2, "Sheep": 2, "Serpent": 2, "Dog": 1, "Cat": 3, "Rat": 2, "Cow": 2, "Buffalo": 2, "Tiger": 1, "Deer": 4, "Monkey": 2, "Mongoose": 2, "Lion": 2 },
    "Monkey": { "Horse": 3, "Elephant": 3, "Sheep": 2, "Serpent": 2, "Dog": 2, "Cat": 2, "Rat": 2, "Cow": 1, "Buffalo": 2, "Tiger": 1, "Deer": 2, "Monkey": 4, "Mongoose": 3, "Lion": 2 },
    "Mongoose": { "Horse": 2, "Elephant": 2, "Sheep": 3, "Serpent": 0, "Dog": 1, "Cat": 1, "Rat": 1, "Cow": 2, "Buffalo": 2, "Tiger": 2, "Deer": 2, "Monkey": 3, "Mongoose": 4, "Lion": 2 },
    "Lion": { "Horse": 1, "Elephant": 0, "Sheep": 1, "Serpent": 2, "Dog": 2, "Cat": 2, "Rat": 2, "Cow": 1, "Buffalo": 1, "Tiger": 1, "Deer": 2, "Monkey": 2, "Mongoose": 2, "Lion": 4 }
};

export const LORD_FRIENDSHIP: Record<string, Record<string, number>> = {
    "Sun": { "Sun": 5, "Moon": 5, "Mars": 5, "Mercury": 4, "Jupiter": 5, "Venus": 0, "Saturn": 0 },
    "Moon": { "Sun": 5, "Moon": 5, "Mars": 4, "Mercury": 5, "Jupiter": 4, "Venus": 0.5, "Saturn": 0.5 },
    "Mars": { "Sun": 5, "Moon": 5, "Mars": 5, "Mercury": 0, "Jupiter": 5, "Venus": 3, "Saturn": 3 },
    "Mercury": { "Sun": 4, "Moon": 1, "Mars": 4, "Mercury": 5, "Jupiter": 4, "Venus": 5, "Saturn": 5 },
    "Jupiter": { "Sun": 5, "Moon": 5, "Mars": 5, "Mercury": 0.5, "Jupiter": 5, "Venus": 0.5, "Saturn": 3 },
    "Venus": { "Sun": 0, "Moon": 0.5, "Mars": 3, "Mercury": 5, "Jupiter": 0.5, "Venus": 5, "Saturn": 5 },
    "Saturn": { "Sun": 0, "Moon": 0, "Mars": 0, "Mercury": 5, "Jupiter": 3, "Venus": 5, "Saturn": 5 }
};

export const SIGN_LORDS = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];

