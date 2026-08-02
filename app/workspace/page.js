import { auth } from "@/auth";
import DockeryzeApp from '@/components/DockeryzeApp';

export const metadata = {
  title: '🔧 Workspace — Dockeryze',
  description: 'Upload your project archive and generate AI-powered Docker deployment blueprints.',
};

export default async function WorkspacePage() {
  const session = await auth();
  return <DockeryzeApp session={session} />;
}
