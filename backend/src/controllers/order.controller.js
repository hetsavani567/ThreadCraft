import * as orderService from "../services/order.service.js";

export const getOrders = async (req, res) => {
    try {
        const { cust_id, email, status } = req.query;
        const orders = await orderService.fetchOrders({ cust_id, email, status });
        res.json(orders);
    } catch (error) {
        console.error("Database error in getOrders:", error);
        res.status(500).json({
            message: "Failed to fetch orders from database",
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderService.fetchOrderById(Number(id));
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        console.error("Database error in getOrderById:", error);
        res.status(500).json({
            message: "Failed to fetch order details",
            error: error.message
        });
    }
};

export const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item." });
        }

        const newOrder = await orderService.placeOrder(orderData);
        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder
        });
    } catch (error) {
        console.error("Database error in createOrder:", error);
        res.status(500).json({
            message: "Failed to place order in database",
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required." });
        }

        const updatedOrder = await orderService.updateStatus(Number(id), status);
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.error("Database error in updateOrderStatus:", error);
        res.status(500).json({
            message: "Failed to update order status",
            error: error.message
        });
    }
};
