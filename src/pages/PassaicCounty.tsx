import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const PassaicCounty = () => {
  const county = getCountyBySlug('passaic');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default PassaicCounty;