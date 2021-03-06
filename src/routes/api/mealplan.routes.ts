import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { 
    Res, 
    NotFound, 
    validationErrorFormatter, 
    BadRequest,
    DataResult
} from '../../shared';
import {
    MealPlanDAO,
    createMealPlanValidator,
    CreateMealPlanDTO,
    updateMealPlanValidator,
    UpdateMealPlanDTO,
    MealPlanDTO
} from '../../domain';

/**
 * The mealplans-module router that handles all routes
 */
export const mealPlansRouter = Router();

export const mealPlansRoute = 'mealplans';

interface IMealPlanDAO {
    fetch(page: number, pageSize: number): Promise<DataResult<MealPlanDTO[]>>;
    search(column: any, keyword: any, columnOrder: any, order: any, page: number, pageSize: number): Promise<DataResult<MealPlanDTO[]>>;
    findById(id: string): Promise<DataResult<MealPlanDTO>>;
    create(data: CreateMealPlanDTO): Promise<DataResult<MealPlanDTO>>;
    update(data: UpdateMealPlanDTO): Promise<DataResult<MealPlanDTO>>;
    delete(id: string): Promise<DataResult<MealPlanDTO>>;
}

const mealPlanDAO: IMealPlanDAO = new MealPlanDAO();

/**
 * @method GET
 * @url /api/mealplans
 * @description Get a list of mealplans
 * @dao func fetch()
 */
mealPlansRouter.get('', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationErrors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .array({ onlyFirstError: true });

        if (validationErrors.length) {
            return BadRequest(res, { errors: validationErrors, success: false });
        } 

        const result = await mealPlanDAO.fetch(parseInt(req.query.page as string), parseInt(req.query.limit as string));

        if (result.error) {
            next(result.error);
        } else if (result.data) {
            Res(res, {
                code: 200,
                message: 'Fetched data successfully', 
                data: result.data,
                meta: { ...result.pagination },
                success: true,
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @method POST
 * @url /api/search/mealplans
 * @description Search & filter mealplans
 * @dao func search()
 */
mealPlansRouter.post('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationErrors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .array({ onlyFirstError: true });

        if (validationErrors.length) {
            return BadRequest(res, { errors: validationErrors, success: false });
        } 

        const result = await mealPlanDAO.search(
            req.query.column,
            req.query.q,
            req.query.order_column,
            req.query.order,
            parseInt(req.query.page as string), 
            parseInt(req.query.limit as string)
        );

        if (result.error) {
            next(result.error);
        } else if (result.data) {
            Res(res, {
                code: 200,
                message: 'Filtered data successfully', 
                data: result.data,
                meta: { ...result.pagination },
                success: true,
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @method GET
 * @url /api/mealplans/:id
 * @description Find mealplan by id
 * @dao func findById()
 */
mealPlansRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationErrors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .array({ onlyFirstError: true });

        if (validationErrors.length) {
            return BadRequest(res, { errors: validationErrors, success: false });
        }
        
        const result = await mealPlanDAO.findById(req.params.id);

        if (result.error) {
            next(result.error);
        } else if (result.isNotFound) {
            NotFound(res, { success: false });
        } else if (result.data) {
            Res(res, {
                code: 200,
                message: 'Fetched data successfully',  
                data: result.data,
                success: true 
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @method POST
 * @url /api/mealplans
 * @description Create a new mealplan
 * @dao func create()
 */
mealPlansRouter.post('', createMealPlanValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationErrors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .array({ onlyFirstError: true });

        if (validationErrors.length) {
            return BadRequest(res, { errors: validationErrors, success: false });
        }

        const data: CreateMealPlanDTO = req.body;
        const result = await mealPlanDAO.create(data);

        if (result.error) {
            next(result.error);
        } else if (result.validationErrors && result.validationErrors.length) {
            BadRequest(res, { errors: result.validationErrors, success: false });
        } else if (result.data) {
            Res(res, {
                code: 201,
                message: 'Mealplan created successfully',  
                data: result.data,
                success: true 
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @method PUT
 * @url /api/mealplans
 * @description Update existing mealplan by id
 * @dao func update()
 */
mealPlansRouter.put('', updateMealPlanValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationErrors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .array({ onlyFirstError: true });

        if (validationErrors.length) {
            return BadRequest(res, { errors: validationErrors, success: false });
        }

        const data: UpdateMealPlanDTO = req.body;
        const result = await mealPlanDAO.update(data);

        if (result.error) {
            next(result.error);
        } else if (result.isNotFound) {
            NotFound(res);
        } else if (result.validationErrors && result.validationErrors.length) {
            BadRequest(res, { errors: result.validationErrors, success: false });
        } else if (result.data) {
            Res(res, {
                code: 200,
                message: 'Mealplan updated successfully',   
                data: result.data,
                success: true 
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @method DELETE
 * @url /api/mealplans/:id
 * @description Delete mealplan by id
 * @dao func delete()
 */
mealPlansRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationErrors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .array({ onlyFirstError: true });

        if (validationErrors.length) {
            return BadRequest(res, { errors: validationErrors, success: false });
        }
        
        const result = await mealPlanDAO.delete(req.params.id);

        if (result.error) {
            next(result.error);
        } else if (result.isNotFound) {
            NotFound(res);
        } else if (result.validationErrors && result.validationErrors.length) {
            BadRequest(res, { errors: result.validationErrors, success: false });
        } else if (result.data) {
            Res(res, { 
                code: 200,
                message: 'Mealplan deleted successfully',  
                data: result.data,
                success: true 
            });
        }
    } catch (error) {
        next(error);
    }
});