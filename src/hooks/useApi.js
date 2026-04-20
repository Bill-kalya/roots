// useApi.js — Reusable async hook for Roots API calls

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic async data-fetching hook.
 *
 * @param {Function} fetchFn  - An async function that returns data (from api.js)
 * @param {Array}    deps     - Dependency array — re-fetches when these change
 * @param {Object}   options
 * @param {boolean}  options.immediate - Fetch on mount (default true)
 * @param {*}        options.initialData - Initial value before first fetch
 *
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data: products, loading, error } = useApi(getFeaturedProducts, []);
 * const { data, loading, refetch } = useApi(() => getProducts({ page }), [page]);
 */
export function useApi(fetchFn, deps = [], { immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const execute = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(controller.signal);
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (err.name !== "AbortError" && !controller.signal.aborted) {
        // AxiosError handling
        const isAxiosError = err.response !== undefined || err.request;
        const isNetworkFailure = isAxiosError && !err.response;
        const status = err.response?.status;

        console.error(
          isNetworkFailure
            ? "[useApi] Network failure — server unreachable or CORS blocked"
            : isAxiosError
              ? `[useApi] HTTP ${status} from server`
              : "[useApi] Unknown fetch error",
          err
        );

        setError(
          isNetworkFailure
            ? new Error("Unable to reach the server. Check your connection or API URL.")
            : err
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
}

/**
 * Hook for mutation-style API calls (POST, DELETE, etc.)
 * Does not fire automatically — call `mutate(args)` manually.
 *
 * @param {Function} mutationFn - Async function accepting arguments
 * @returns {{ mutate, loading, error, data, reset }}
 *
 * @example
 * const { mutate: subscribe, loading } = useMutation(subscribeNewsletter);
 * await subscribe("user@example.com");
 */
export function useMutation(mutationFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
}