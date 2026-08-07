import { auth } from "@/auth";
import dynamic from 'next/dynamic';

const AutoDockApp = dynamic(() => import('@/components/AutoDockApp'), {
  loading: () => (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      🚀 Loading Workspace Engine...
    </div>
  ),
});

export const metadata = {
  title: '🔧 Workspace — AutoDock',
  description: 'Upload your project archive and generate AI-powered Docker deployment blueprints.',
};

export default async function WorkspacePage() {
  const session = await auth();
  return <AutoDockApp session={session} />;
}
