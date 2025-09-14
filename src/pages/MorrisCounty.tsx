import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const MorrisCounty = () => {
  const county = getCountyBySlug('morris');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default MorrisCounty;