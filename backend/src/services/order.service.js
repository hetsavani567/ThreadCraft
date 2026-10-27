import * as orderModel from "../models/order.model.js";

export const fetchOrders = async (filters) => {
    return await orderModel.getAllOrders(filters);
};

export const fetchOrderById = async (orderId) => {
    return await orderModel.getOrderById(orderId);
};

export const placeOrder = async (orderData) => {
    return await orderModel.createOrder(orderData);
};

export const updateStatus = async (orderId, status) => {
    return await orderModel.updateOrderStatus(orderId, status);
};
