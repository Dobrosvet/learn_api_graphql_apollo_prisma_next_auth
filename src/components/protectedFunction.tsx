import { sendAuthGraphQLRequest } from '../utils/auth';

/**
 * Защищаемая функция для обновления содержимого блока.
 */
export const protectedFunction = async (id: string, content: string) => {
  const query = `
    mutation UpdateBlockContent($id: ID!, $content: String!) {
      updateBlockContent(id: $id, content: $content) {
        id
        content
      }
    }
  `;
  const variables = { id, content };

  return await sendAuthGraphQLRequest(query, variables);
};
