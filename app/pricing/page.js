import PricingPage from '@/components/PricingPage';
import { auth } from '@/auth';

export const metadata = {
  title: 'Pricing & Plans | AutoDock',
  description: 'Upgrade your AutoDock containerization workspace. Unlimited AI blueprint refinements, docker-compose generators, and secret shields.',
};

export default async function Page() {
  const session = await auth();
  return <PricingPage session={session} />;
}
