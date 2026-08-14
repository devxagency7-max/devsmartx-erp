import { AuthLayout } from '../layout/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
