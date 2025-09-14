import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const WarrenCounty = () => {
  const county = getCountyBySlug('warren');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default WarrenCounty;