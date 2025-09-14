import CountyPage from '@/components/CountyPage';
import { getCountyBySlug } from '@/data/counties';
import NotFound from '@/pages/NotFound';

const HunterdonCounty = () => {
  const county = getCountyBySlug('hunterdon');
  
  if (!county) {
    return <NotFound />;
  }

  return <CountyPage county={county} />;
};

export default HunterdonCounty;