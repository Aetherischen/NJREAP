import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const UnionCounty = () => {
  const county = getCountyBySlug('union');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default UnionCounty;