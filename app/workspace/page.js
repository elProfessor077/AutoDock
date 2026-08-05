import { auth } from "@/auth";
import dynamic from 'next/dynamic';

const DockeryzeApp = dynamic(() => import('@/components/DockeryzeApp'), {
  loading: () => (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      🚀 Loading Workspace Engine...
    </div>
  ),
});

export const metadata = {
  title: '🔧 Workspace — Dockeryze',
  description: 'Upload your project archive and generate AI-powered Docker deployment blueprints.',
};

export default async function WorkspacePage() {
  const session = await auth();
  return <DockeryzeApp session={session} />;
}
