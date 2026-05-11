import type { Group } from '../types';

export const EXECUTION_GROUPS: Group[] = [
  { id: 'alberto', name: 'Team Alberto', description: 'Núcleo de execução liderado por Alberto' },
  { id: 'darlan', name: 'Team Darlan', description: 'Núcleo de execução liderado por Darlan' },
  { id: 'homaile', name: 'Team Homaile', description: 'Núcleo de execução liderado por Homaile' },
  { id: 'jonatan', name: 'Team Jonatan', description: 'Núcleo de execução liderado por Jonatan' },
  { id: 'branco', name: 'Team Branco', description: 'Núcleo de execução liderado por Branco' },
  { id: 'samera', name: 'Team Samera', description: 'Núcleo de execução liderado por Samera' },
];

export const getGroupName = (id?: string) => {
  if (!id) return 'A definir';
  return EXECUTION_GROUPS.find(g => g.id === id)?.name || 'Desconhecido';
};
