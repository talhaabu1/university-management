'use client';

import AuthForm from '@/components/AuthForm';
import { signUp } from '@/lib/actions/auth';
import { singUpSchema } from '@/lib/validations';

const Page = () => (
  <AuthForm
    type="SIGN_UP"
    schema={singUpSchema}
    defaultValues={{
      fullName: '',
      email: '',
      universityId: 0,
      password: '',
      universityCard: '',
    }}
    onSubmit={signUp}
  />
);

export default Page;
