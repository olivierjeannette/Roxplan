'use client';

import { useRouter } from 'next/navigation';

// Redirect vers la page d'accueil qui contient deja la liste des plans
export default function PlansPage() {
  const router = useRouter();
  router.replace('/');
  return null;
}
