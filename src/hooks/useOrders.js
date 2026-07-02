/**
 * Custom hook for managing user orders state and operations.
 * Follows the same pattern as useProfile.js and useSettings.js
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from './useApi.js';
import { useMutation } from './useApi.js';
import {
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  trackOrder,
  reorder,
} from '../services/ordersService.js';
import { getErrorMessage } from '../utils/errorUtils.js';

const DEFAULT_FILTER = 'All';
const VALID_FILTERS = ['All', 'Delivered', 'In Transit', 'Processing'];

/**
 * Custom hook for managing user orders
 *
 * @returns {Object} Orders state and operations
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [returningOrderId, setReturningOrderId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const aliveRef = useRef(true);

  // Fetch orders on mount
  const { refetch: refetchOrders } = useApi(
    useCallback(
      (signal) => getMyOrders({}, signal),
      []
    ),
    [],
    { immediate: false, initialData: null }
  );

  // Manual fetch with filter support
  const fetchOrders = useCallback(
    async (statusFilter = DEFAULT_FILTER) => {
      if (!aliveRef.current) return;

      setLoading(true);
      setError(null);
      setActionError(null);

      try {
        const params = statusFilter !== DEFAULT_FILTER ? { status: statusFilter } : {};
        const data = await getMyOrders(params);

        if (!aliveRef.current) return;

        // Handle different response formats
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : [];

        setOrders(list);
      } catch (err) {
        if (!aliveRef.current) return;
        setError(getErrorMessage(err));
      } finally {
        if (aliveRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchOrders(filter);

    return () => {
      aliveRef.current = false;
    };
  }, [filter, fetchOrders]);

  // Update filter
  const updateFilter = useCallback((newFilter) => {
    if (VALID_FILTERS.includes(newFilter)) {
      setFilter(newFilter);
    }
  }, []);

  // Get visible orders based on filter
  const visibleOrders = filter === DEFAULT_FILTER
    ? orders
    : orders.filter((o) => o.status === filter);

  // Cancel order
  const { mutate: cancelOrderMutation, loading: cancelling } = useMutation(cancelOrder);

  const handleCancelOrder = useCallback(
    async (orderId, reason = '') => {
      setCancellingOrderId(orderId);
      setActionError(null);

      try {
        await cancelOrderMutation(orderId, reason);
        // Remove cancelled order from list or update its status
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId || order.order_id === orderId
              ? { ...order, status: 'Cancelled' }
              : order
          )
        );
      } catch (err) {
        setActionError(getErrorMessage(err));
      } finally {
        setCancellingOrderId(null);
      }
    },
    [cancelOrderMutation]
  );

  // Request return
  const { mutate: requestReturnMutation, loading: returning } = useMutation(requestReturn);

  const handleRequestReturn = useCallback(
    async (orderId, reason = '') => {
      setReturningOrderId(orderId);
      setActionError(null);

      try {
        await requestReturnMutation(orderId, reason);
        // Update order status or show success
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId || order.order_id === orderId
              ? { ...order, status: 'Return Requested' }
              : order
          )
        );
      } catch (err) {
        setActionError(getErrorMessage(err));
      } finally {
        setReturningOrderId(null);
      }
    },
    [requestReturnMutation]
  );

  // Track order
  const { mutate: trackOrderMutation, loading: tracking } = useMutation(trackOrder);

  const handleTrackOrder = useCallback(
    async (orderId) => {
      try {
        const trackingInfo = await trackOrderMutation(orderId);
        return trackingInfo;
      } catch (err) {
        throw err;
      }
    },
    [trackOrderMutation]
  );

  // Reorder
  const { mutate: reorderMutation, loading: reordering } = useMutation(reorder);

  const handleReorder = useCallback(
    async (orderId) => {
      try {
        const result = await reorderMutation(orderId);
        return result;
      } catch (err) {
        throw err;
      }
    },
    [reorderMutation]
  );

  // Refresh orders
  const refresh = useCallback(() => {
    fetchOrders(filter);
  }, [fetchOrders, filter]);

  // Clear action error
  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

  return {
    // State
    orders,
    visibleOrders,
    filter,
    loading,
    error,
    actionError,
    cancellingOrderId,
    returningOrderId,

    // Loading states
    cancelling,
    returning,
    tracking,
    reordering,

    // Actions
    updateFilter,
    handleCancelOrder,
    handleRequestReturn,
    handleTrackOrder,
    handleReorder,
    refresh,
    clearActionError,
    refetchOrders,
  };
}