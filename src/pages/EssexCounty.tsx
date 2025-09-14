import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const EssexCounty = () => {
  const county = getCountyBySlug('essex');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default EssexCounty;