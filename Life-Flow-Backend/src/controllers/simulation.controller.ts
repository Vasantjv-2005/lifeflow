import {
    type Request,
    type Response,
    type NextFunction,
} from "express";

import {
    createSimulation as createSimulationService,
    getUserSimulations,
    getSimulationById,
    updateSimulation as updateSimulationService,
    deleteSimulation as deleteSimulationService,
    executeSimulation as executeSimulationService,
    runAdHocSimulation as runAdHocSimulationService,
} from "../services/simulation/simulation.service";

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

const getUserId = (req: Request): string | undefined => {
    return (req as AuthenticatedRequest).user?.userId;
};

const getStringParam = (value: unknown): string | undefined => {
    return typeof value === "string" ? value : undefined;
};

// POST /api/simulations
export const createSimulation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        const simulation = await createSimulationService(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Simulation created successfully.",
            data: { simulation },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// GET /api/simulations
export const getSimulations = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        const simulations = await getUserSimulations(userId);

        res.status(200).json({
            success: true,
            message: "Simulations retrieved successfully.",
            data: { simulations },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// GET /api/simulations/:id
export const getSimulation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const id = getStringParam(req.params.id);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Invalid simulation ID.",
            });
            return;
        }

        const simulation = await getSimulationById(userId, id);

        res.status(200).json({
            success: true,
            message: "Simulation retrieved successfully.",
            data: { simulation },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// PATCH /api/simulations/:id
export const updateSimulation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const id = getStringParam(req.params.id);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Invalid simulation ID.",
            });
            return;
        }

        const simulation = await updateSimulationService(
            userId,
            id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Simulation updated successfully.",
            data: { simulation },
        });
    } catch (error: unknown) {
        next(error);
    }
};

// DELETE /api/simulations/:id
export const deleteSimulation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const id = getStringParam(req.params.id);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Invalid simulation ID.",
            });
            return;
        }

        await deleteSimulationService(userId, id);

        res.status(200).json({
            success: true,
            message: "Simulation deleted successfully.",
        });
    } catch (error: unknown) {
        next(error);
    }
};

// POST /api/simulations/:id/run
export const runSimulationById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const id = getStringParam(req.params.id);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Invalid simulation ID.",
            });
            return;
        }

        const options = {
            maxPaths: req.body?.maxPaths ? Number(req.body.maxPaths) : undefined,
            maxDepth: req.body?.maxDepth ? Number(req.body.maxDepth) : undefined,
        };

        const result = await executeSimulationService(userId, id, options);

        res.status(200).json({
            success: true,
            message: "Simulation executed successfully.",
            data: result,
        });
    } catch (error: unknown) {
        next(error);
    }
};

// POST /api/simulations/run
export const runSimulationAdHoc = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }

        const { nodes, edges, maxPaths, maxDepth } = req.body;

        const options = {
            maxPaths: maxPaths ? Number(maxPaths) : undefined,
            maxDepth: maxDepth ? Number(maxDepth) : undefined,
        };

        const result = runAdHocSimulationService({ nodes, edges }, options);

        res.status(200).json({
            success: true,
            message: "Ad-hoc simulation executed successfully.",
            data: result,
        });
    } catch (error: unknown) {
        next(error);
    }
};
