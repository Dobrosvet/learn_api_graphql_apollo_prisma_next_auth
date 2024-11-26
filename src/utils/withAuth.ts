import authorizationIsRequired from '@/app/authorizationIsRequired';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

type WithAuthOptions = {
  redirectTo?: string; // Куда перенаправить неавторизованных пользователей
};

export function withAuth<T extends { [key: string]: any; }>(
  getServerSidePropsFunc?: GetServerSideProps<T>,
  options: WithAuthOptions = { redirectTo: '/login' }
): GetServerSideProps<T> {
  return async (context: GetServerSidePropsContext) => {
    try {
      const user = await authorizationIsRequired(context.req)

      if (!user) {
        // Если авторизация не удалась, перенаправляем
        return {
          redirect: {
            destination: options.redirectTo,
            permanent: false,
          },
        };
      }

      // Если есть кастомная логика для getServerSideProps
      if (getServerSidePropsFunc) {
        const props = await getServerSidePropsFunc(context);
        return {
          ...props,
          props: {
            ...props.props,
            user, // Передаём пользователя в props
          },
        };
      }

      return {
        props: { user }, // Передаём пользователя в props
      };
    } catch (error) {
      console.error('Authorization error:', error);
      return {
        redirect: {
          destination: options.redirectTo,
          permanent: false,
        },
      };
    }
  };
}
