export const getHealth = (req, res) => {
    res.json({
        status: "ok",
        message: "ThreadCraft backend is running"
    });
};

export const getRoot = (req, res) => {
    res.send("ThreadCraft backend is running");
};
