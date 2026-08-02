import { auth } from "@/auth";
import HomePage from '@/components/HomePage';

export default async function Home() {
  const session = await auth();
  return <HomePage session={session} />;
}
