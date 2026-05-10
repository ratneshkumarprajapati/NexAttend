export const errorHandler = (error: unknown): void => {
  console.error('[Redux Error]', error);
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    if ('data' in error) {
      const data = (error as { data?: { message?: unknown } }).data;
      if (typeof data?.message === 'string') return data.message;
    }

    if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }

  return fallback;
}
