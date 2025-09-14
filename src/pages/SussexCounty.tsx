import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const SussexCounty = () => {
  const county = getCountyBySlug('sussex');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default SussexCounty;