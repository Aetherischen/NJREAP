import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const BergenCounty = () => {
  const county = getCountyBySlug('bergen');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default BergenCounty;