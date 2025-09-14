import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const MiddlesexCounty = () => {
  const county = getCountyBySlug('middlesex');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default MiddlesexCounty;