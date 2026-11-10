import type { Metadata } from 'next';
import ConfiguratorClient from '@/components/configurator/ConfiguratorClient';

export const metadata: Metadata = {
  title: 'Design your sign',
  description: 'Type your text or upload your logo, pick a finish and lighting, and see your 3D sign with a live price.',
};

export default function DesignPage({ searchParams }: { searchParams: { preset?: string | string[] } }) {
  const preset = typeof searchParams.preset === 'string' ? searchParams.preset : undefined;
  return <ConfiguratorClient presetId={preset} />;
}
