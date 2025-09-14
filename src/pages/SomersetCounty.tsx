import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const SomersetCounty = () => {
  const county = getCountyBySlug('somerset');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default SomersetCounty;