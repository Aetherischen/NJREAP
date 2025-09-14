export interface County {
  name: string;
  slug: string;
  description: string;
  municipalities: string[];
  population: string;
  area: string;
  keyFeatures: string[];
}

export const counties: Record<string, County> = {
  hunterdon: {
    name: "Hunterdon",
    slug: "hunterdon",
    description: "Located in western New Jersey, Hunterdon County is known for its rolling hills, historic towns, and rural charm. Our certified appraisers provide comprehensive real estate valuation services throughout the county.",
    municipalities: [
      "Flemington", "Clinton", "Lambertville", "Stockton", "Frenchtown",
      "High Bridge", "Glen Gardner", "Califon", "Bloomsbury", "Hampton",
      "Lebanon", "Annandale", "Clinton Township", "Delaware Township",
      "East Amwell Township", "Flemington Borough", "Franklin Township",
      "Holland Township", "Kingwood Township", "Lambertville City",
      "Lebanon Borough", "Lebanon Township", "Milford Borough",
      "Raritan Township", "Readington Township", "Stockton Borough",
      "Tewksbury Township", "Union Township", "West Amwell Township"
    ],
    population: "128,947",
    area: "430 sq mi",
    keyFeatures: [
      "Historic Delaware River towns",
      "Rural and suburban properties",
      "High-value residential markets",
      "Agricultural and horse properties"
    ]
  },
  bergen: {
    name: "Bergen",
    slug: "bergen",
    description: "Bergen County is New Jersey's most populous county, featuring diverse communities from urban centers to suburban neighborhoods. Our experienced team provides professional appraisal services across all municipalities.",
    municipalities: [
      "Hackensack", "Paramus", "Fort Lee", "Englewood", "Teaneck", "Bergenfield",
      "Fair Lawn", "Garfield", "Lodi", "Mahwah", "Ridgewood", "Wyckoff",
      "Alpine", "Allendale", "Bogota", "Carlstadt", "Cliffside Park",
      "Closter", "Cresskill", "Demarest", "Dumont", "Elmwood Park",
      "Emerson", "East Rutherford", "Franklin Lakes", "Glen Rock",
      "Hasbrouck Heights", "Haworth", "Hillsdale", "Ho-Ho-Kus",
      "Leonia", "Little Ferry", "Lyndhurst", "Maywood", "Midland Park",
      "Montvale", "Moonachie", "New Milford", "North Arlington",
      "Northvale", "Norwood", "Oakland", "Old Tappan", "Oradell",
      "Palisades Park", "Park Ridge", "Ramsey", "Ridgefield", "Ridgefield Park",
      "River Edge", "River Vale", "Rochelle Park", "Rutherford",
      "Saddle Brook", "Saddle River", "South Hackensack", "Tenafly",
      "Teterboro", "Upper Saddle River", "Waldwick", "Wallington",
      "Washington Township", "Westwood", "Wood-Ridge", "Woodcliff Lake"
    ],
    population: "955,732",
    area: "247 sq mi",
    keyFeatures: [
      "Diverse property types",
      "High-end residential communities",
      "Commercial and industrial properties",
      "Proximity to New York City"
    ]
  },
  passaic: {
    name: "Passaic",
    slug: "passaic",
    description: "Passaic County offers a mix of urban, suburban, and rural properties throughout northern New Jersey. Our certified appraisers provide accurate valuations for all property types in the region.",
    municipalities: [
      "Paterson", "Clifton", "Passaic", "Wayne", "West Milford", "Wanaque",
      "Pompton Lakes", "Hawthorne", "North Haledon", "Prospect Park",
      "Haledon", "Totowa", "Little Falls", "Woodland Park", "Ringwood",
      "Bloomingdale", "West Paterson"
    ],
    population: "524,118",
    area: "192 sq mi",
    keyFeatures: [
      "Urban and suburban markets",
      "Industrial properties",
      "Waterfront communities",
      "Mountain and lake regions"
    ]
  },
  essex: {
    name: "Essex",
    slug: "essex",
    description: "Essex County is a diverse region in northern New Jersey, featuring everything from urban centers to affluent suburban communities. Our experienced appraisers provide comprehensive valuation services throughout the county.",
    municipalities: [
      "Newark", "East Orange", "Irvington", "Orange", "Bloomfield", "Montclair",
      "Belleville", "Nutley", "Livingston", "West Orange", "South Orange",
      "Maplewood", "Millburn", "Short Hills", "Glen Ridge", "Verona",
      "Cedar Grove", "Essex Fells", "Fairfield", "North Caldwell",
      "Caldwell", "Roseland", "West Caldwell"
    ],
    population: "863,728",
    area: "126 sq mi",
    keyFeatures: [
      "Urban renewal properties",
      "Historic neighborhoods",
      "Luxury residential markets",
      "Commercial developments"
    ]
  },
  hudson: {
    name: "Hudson",
    slug: "hudson",
    description: "Hudson County offers prime waterfront properties and urban developments with stunning Manhattan views. Our certified team specializes in the unique market dynamics of this densely populated region.",
    municipalities: [
      "Jersey City", "Hoboken", "Union City", "West New York", "North Bergen",
      "Bayonne", "Secaucus", "Weehawken", "Harrison", "Kearny",
      "Guttenberg", "East Newark", "North Bergen Township"
    ],
    population: "695,345",
    area: "46 sq mi",
    keyFeatures: [
      "Waterfront condominiums",
      "High-rise developments",
      "Manhattan proximity premium",
      "Transit-oriented properties"
    ]
  },
  mercer: {
    name: "Mercer",
    slug: "mercer",
    description: "Mercer County combines historic charm with modern development, serving as New Jersey's capital region. Our appraisers understand the unique characteristics of both government and residential sectors.",
    municipalities: [
      "Trenton", "Princeton", "Hamilton", "Lawrence", "Ewing", "Hopewell",
      "Pennington", "West Windsor", "East Windsor", "Robbinsville",
      "Hightstown", "Hopewell Borough", "Hopewell Township"
    ],
    population: "387,340",
    area: "226 sq mi",
    keyFeatures: [
      "Government properties",
      "University communities",
      "Historic districts",
      "Executive housing markets"
    ]
  },
  middlesex: {
    name: "Middlesex",
    slug: "middlesex",
    description: "Middlesex County is New Jersey's second most populous county, featuring diverse communities from college towns to corporate centers. Our team provides expert appraisal services across all property types.",
    municipalities: [
      "New Brunswick", "Edison", "Woodbridge", "Perth Amboy", "Old Bridge",
      "Sayreville", "East Brunswick", "South Brunswick", "North Brunswick",
      "Piscataway", "Monroe", "Plainsboro", "South Plainfield", "Metuchen",
      "Highland Park", "Dunellen", "South River", "Spotswood", "Milltown",
      "Cranbury", "Jamesburg", "Helmetta", "Dayton"
    ],
    population: "863,162",
    area: "309 sq mi",
    keyFeatures: [
      "Corporate headquarters",
      "University properties",
      "Pharmaceutical corridor",
      "Diverse residential markets"
    ]
  },
  monmouth: {
    name: "Monmouth",
    slug: "monmouth",
    description: "Monmouth County offers prestigious coastal properties and inland communities along the Jersey Shore. Our certified appraisers specialize in both luxury beachfront and suburban residential markets.",
    municipalities: [
      "Freehold", "Long Branch", "Asbury Park", "Red Bank", "Neptune",
      "Middletown", "Marlboro", "Manalapan", "Howell", "Wall", "Tinton Falls",
      "Eatontown", "Shrewsbury", "Fair Haven", "Rumson", "Sea Bright",
      "Monmouth Beach", "Deal", "Allenhurst", "Interlaken", "Avon-by-the-Sea",
      "Belmar", "Bradley Beach", "Ocean Grove", "Spring Lake", "Spring Lake Heights",
      "Sea Girt", "Manasquan", "Brielle", "Point Pleasant", "Bay Head",
      "Oceanport", "Little Silver", "Holmdel", "Hazlet", "Keansburg",
      "Union Beach", "Keyport", "Matawan", "Aberdeen", "Colts Neck",
      "Farmingdale", "Roosevelt", "Millstone", "Upper Freehold"
    ],
    population: "643,615",
    area: "472 sq mi",
    keyFeatures: [
      "Beachfront properties",
      "Luxury shore homes",
      "Equestrian estates",
      "Resort communities"
    ]
  },
  morris: {
    name: "Morris",
    slug: "morris",
    description: "Morris County is known for its affluent communities, corporate headquarters, and historic properties. Our experienced team provides premium appraisal services throughout this prestigious region.",
    municipalities: [
      "Morristown", "Dover", "Madison", "Chatham", "Florham Park", "Summit",
      "Bernardsville", "Mendham", "Chester", "Long Hill", "Harding",
      "Morris Plains", "Wharton", "Rockaway", "Denville", "Mountain Lakes",
      "Boonton", "Butler", "Kinnelon", "Lincoln Park", "Montville",
      "Parsippany-Troy Hills", "Randolph", "Roxbury", "Washington Township",
      "Mine Hill", "Victory Gardens", "Netcong", "Mount Arlington",
      "Hopatcong", "Stanhope"
    ],
    population: "509,285",
    area: "460 sq mi",
    keyFeatures: [
      "Executive properties",
      "Corporate real estate",
      "Historic estates",
      "Lake communities"
    ]
  },
  somerset: {
    name: "Somerset",
    slug: "somerset",
    description: "Somerset County combines rural charm with suburban sophistication in central New Jersey. Our certified appraisers provide expert valuations across diverse property types and price ranges.",
    municipalities: [
      "New Brunswick", "Somerville", "Bound Brook", "Manville", "North Plainfield",
      "Watchung", "Warren", "Bernards", "Bernardsville", "Peapack-Gladstone",
      "Far Hills", "Bedminster", "Basking Ridge", "Liberty Corner",
      "Lyons", "Millstone", "Rocky Hill", "Montgomery", "Skillman",
      "Princeton", "Hopewell", "Pennington", "Lawrenceville"
    ],
    population: "345,361",
    area: "305 sq mi",
    keyFeatures: [
      "Pharmaceutical corridor",
      "Equestrian properties",
      "Corporate campuses",
      "Planned communities"
    ]
  },
  sussex: {
    name: "Sussex",
    slug: "sussex",
    description: "Sussex County offers rural properties, lake communities, and mountain retreats in northwestern New Jersey. Our team specializes in unique property types including recreational and agricultural land.",
    municipalities: [
      "Newton", "Hopatcong", "Franklin", "Vernon", "Sparta", "Hamburg",
      "Ogdensburg", "Stanhope", "Netcong", "Andover Borough", "Andover Township",
      "Branchville", "Byram", "Fredon", "Green", "Hardyston", "Lafayette",
      "Montague", "Sandyston", "Stillwater", "Sussex", "Walpack", "Wantage"
    ],
    population: "144,221",
    area: "521 sq mi",
    keyFeatures: [
      "Lake properties",
      "Mountain retreats",
      "Agricultural land",
      "Recreational properties"
    ]
  },
  union: {
    name: "Union",
    slug: "union",
    description: "Union County provides diverse residential and commercial properties in central New Jersey. Our certified appraisers offer comprehensive valuation services across urban, suburban, and industrial markets.",
    municipalities: [
      "Elizabeth", "Union", "Plainfield", "Linden", "Rahway", "Westfield",
      "Cranford", "Summit", "Roselle", "Hillside", "Clark", "Scotch Plains",
      "Fanwood", "New Providence", "Berkeley Heights", "Garwood", "Kenilworth",
      "Mountainside", "Springfield", "Roselle Park", "Winfield"
    ],
    population: "575,345",
    area: "103 sq mi",
    keyFeatures: [
      "Transit accessibility",
      "Industrial properties",
      "Suburban communities",
      "Commercial corridors"
    ]
  },
  warren: {
    name: "Warren",
    slug: "warren",
    description: "Warren County features rural properties, historic towns, and scenic landscapes in northwestern New Jersey. Our team provides specialized appraisal services for agricultural, residential, and recreational properties.",
    municipalities: [
      "Phillipsburg", "Washington", "Hackettstown", "Belvidere", "Oxford",
      "Brass Castle", "Lopatcong", "Pohatcong", "Greenwich", "Franklin",
      "Harmony", "Liberty", "Independence", "Hardwick", "Blairstown",
      "Knowlton", "Columbia", "Delaware", "Frelinghuysen", "Hope", "White"
    ],
    population: "109,632",
    area: "358 sq mi",
    keyFeatures: [
      "Agricultural properties",
      "Historic villages",
      "Rural estates",
      "Delaware River access"
    ]
  }
};

export const getCountyBySlug = (slug: string): County | null => {
  return counties[slug] || null;
};

export const getAllCounties = (): County[] => {
  return Object.values(counties);
};