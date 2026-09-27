import express from "express";
import cors from "cors";
import issueRoutes from "./routes/issueRoutes.js";
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
}));
app.use(express.json());
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        data: {
            status: "ok",
        },
        error: null,
    });
});
app.use("/api/issues", issueRoutes);
export default app;
//# sourceMappingURL=app.js.map