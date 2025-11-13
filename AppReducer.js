case 'CLEAR_PAYOUT_BALANCE':
  return {
    ...state,
    orders: state.orders.map(order => 
      order.vendor_id === action.payload.vendor_id && order.status === 'confirmed'
        ? { ...order, status: 'paid' }
        : order
    )
  };