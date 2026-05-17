import { Redirect } from 'expo-router';

export default function Index() {
  // Root layout handles redirect logic based on auth state
  return <Redirect href="/auth" />;
}
