import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const MercerCounty = () => {
  const county = getCountyBySlug('mercer');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default MercerCounty;