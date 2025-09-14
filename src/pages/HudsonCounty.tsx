import { getCountyBySlug } from '@/data/counties';
import CountyPage from '@/components/CountyPage';

const HudsonCounty = () => {
  const county = getCountyBySlug('hudson');
  
  if (!county) {
    return <div>County not found</div>;
  }

  return <CountyPage county={county} />;
};

export default HudsonCounty;