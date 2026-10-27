import * as customerModel from "../models/customer.model.js";

export const lookupCustomer = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            const customers = await customerModel.getAllCustomers();
            return res.json(customers);
        }
        const customer = await customerModel.getCustomerByEmail(email);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        console.error("Error looking up customer:", error);
        res.status(500).json({ message: "Failed to lookup customer", error: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const customerData = req.body;
        if (!customerData?.email) {
            return res.status(400).json({ message: "Customer email is required" });
        }
        const customer = await customerModel.createOrUpdateCustomer(customerData);
        res.status(201).json({ message: "Customer resolved successfully", customer });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Failed to create/resolve customer", error: error.message });
    }
};
