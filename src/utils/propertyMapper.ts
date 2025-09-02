
export interface PropertyData {
  address: string;
  cityStateZip: string;
  owner: string;
  mailingAddress: string;
  salePrice: string;
  saleDate: string;
  livingSquareFeet: string;
  ownerFor: string;
  absentee: string;
  corporateOwned: string;
  blockLot: string;
  acreage: string;
  beds: string;
  baths: string;
  yearBuilt: string;
  imageUrl: string;
  additionalImages: string[];
}

export const mapPropertyData = (rawData: any): PropertyData => {
  // Handle different property data structures from API
  const getNestedValue = (obj: any, path: string, defaultValue: string = 'N/A') => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  };

  // Extract basic property info
  const address = rawData.address || getNestedValue(rawData, 'property.address') || 'N/A';
  const city = rawData.city || getNestedValue(rawData, 'property.city') || '';
  const state = rawData.state || getNestedValue(rawData, 'property.state') || '';
  const zip = rawData.zip || getNestedValue(rawData, 'property.zip') || '';
  
  const cityStateZip = [city, state, zip].filter(Boolean).join(', ') || 'N/A';

  // Extract owner information
  const owner = rawData.owner || getNestedValue(rawData, 'owner.name') || 'N/A';
  const mailingAddress = rawData.mailingAddress || getNestedValue(rawData, 'owner.mailingAddress') || 'N/A';

  // Extract sale information
  const salePrice = rawData.salePrice || getNestedValue(rawData, 'sale.price') || 'N/A';
  const saleDate = rawData.saleDate || getNestedValue(rawData, 'sale.date') || 'N/A';

  // Extract property details
  const sqft = rawData.sqft || rawData.square_footage || getNestedValue(rawData, 'property.sqft') || 'N/A';
  const livingSquareFeet = sqft !== 'N/A' ? `${sqft} sq ft` : 'N/A';
  
  const beds = rawData.bedrooms || rawData.beds || getNestedValue(rawData, 'property.beds') || 'N/A';
  const baths = rawData.bathrooms || rawData.baths || getNestedValue(rawData, 'property.baths') || 'N/A';
  const yearBuilt = rawData.year_built || rawData.built || getNestedValue(rawData, 'property.yearBuilt') || 'N/A';
  
  // Extract lot information
  const lotSize = rawData.lot_size || rawData.lot || getNestedValue(rawData, 'property.lotSize') || 'N/A';
  const acreage = lotSize !== 'N/A' ? `${lotSize} ac` : 'N/A';
  
  // Extract block/lot information
  const blockLot = rawData.blockLot || getNestedValue(rawData, 'property.blockLot') || 'N/A';
  
  // Extract ownership flags
  const absentee = rawData.absentee || getNestedValue(rawData, 'owner.absentee') || 'N/A';
  const corporateOwned = rawData.corporateOwned || getNestedValue(rawData, 'owner.corporateOwned') || 'N/A';

  // Extract images - fix the undefined array issue
  const imageUrl = rawData.imageUrl || getNestedValue(rawData, 'images.primary') || '';
  const additionalImagesRaw = rawData.additionalImages || getNestedValue(rawData, 'images.additional') || [];
  const additionalImages = Array.isArray(additionalImagesRaw) ? additionalImagesRaw : [];

  return {
    address,
    cityStateZip,
    owner,
    mailingAddress,
    salePrice,
    saleDate,
    livingSquareFeet,
    ownerFor: 'N/A', // This will be calculated in the component
    absentee,
    corporateOwned,
    blockLot,
    acreage,
    beds: beds.toString(),
    baths: baths.toString(),
    yearBuilt: yearBuilt.toString(),
    imageUrl,
    additionalImages
  };
};
